/**
 * Live demo with LLM-backed agents. Same loop as demo/run.ts, but the Gamemaster
 * and Continuity *reason* via an LLM instead of scripted intents — proving the
 * agents make judgments, not rule-engine triggers.
 *
 * Run: node --env-file=.env --experimental-strip-types src/demo/llm-run.ts
 * Backends are in-memory (no Walrus/Sui cost per event); swap as in demo/run.ts.
 */
import { OpenAICompatLLM } from "../agents/llm.ts";
import { llmGamemasterReasoner, llmReconcilePolicy } from "../agents/reasoners.ts";
import { Ed25519Signer } from "../core/identity.ts";
import { InMemoryStore } from "../core/memory.ts";
import { InMemoryPointerStore } from "../core/pointer.ts";
import { InMemoryBlobStore } from "../core/walrus.ts";
import { Blackboard } from "../core/blackboard.ts";
import { Gamemaster, type Stage } from "../agents/gamemaster.ts";
import { Continuity } from "../agents/continuity.ts";
import type { CanonSchema } from "../core/canon.ts";

const UNIVERSE = "worldline-demo";
const ACTOR = "soul:player-001";

const schema: CanonSchema = {
  standings: {
    eastern_faction: { min: -100, max: 100, default: 0 },
    western_faction: { min: -100, max: 100, default: 0 },
  },
  flags: {
    marked_oathbreaker: { values: "boolean", default: false },
  },
};

async function main() {
  const llm = new OpenAICompatLLM({
    baseUrl: process.env.LLM_BASE_URL!,
    apiKey: process.env.LLM_API_KEY!,
    model: process.env.LLM_MODEL!,
  });

  const bb = new Blackboard(new InMemoryBlobStore(), new InMemoryPointerStore(), new InMemoryStore());
  const signer = Ed25519Signer.generate();
  const stage: Stage = { blackboard: bb, universe: UNIVERSE, schema, signer };
  const continuity = new Continuity(llmReconcilePolicy(llm));

  // Two DIFFERENT games, different reasoning personas.
  const stealthGame = new Gamemaster(
    "nightfall",
    llmGamemasterReasoner(llm, {
      source: "nightfall",
      description: "A dark stealth-assassin game of betrayal, oaths, and faction intrigue.",
    }),
  );
  const tradeGame = new Gamemaster(
    "freeports",
    llmGamemasterReasoner(llm, {
      source: "freeports",
      description: "A mercantile trading game where faction reputation decides who deals with you.",
    }),
  );

  // Pre-seed a little soul history so the agents have something to reason over.
  await bb.appendEvent(
    UNIVERSE,
    await (async () => {
      const { createEvent } = await import("../core/event.ts");
      return createEvent(signer, {
        actor: ACTOR,
        source: "seed",
        type: "history.seed",
        payload: {},
        parents: [],
      });
    })(),
    "Long ago the player swore a blood-oath of loyalty to the eastern faction.",
  );

  console.log("1) player acts in 'nightfall' (stealth game) — GM reasons\n");
  const xs = await stealthGame.act(stage, ACTOR, "I sneak into the eastern faction's vault and steal their relic.");
  for (const e of xs) console.log(`   ${e.type}: ${(e.payload as any).canon ? JSON.stringify((e.payload as any).canon) : "—"}`);
  const xMemos = await bb.recallSoul(ACTOR, "eastern faction", { topK: 3 });
  console.log("   memo written:", xMemos[0]?.text ?? "(none)");

  console.log("\n2) Continuity reasons a reconciled canon");
  const r1 = await continuity.tick(bb, UNIVERSE, schema);
  console.log("   canon:", JSON.stringify(r1.canon));

  console.log("\n3) player enters 'freeports' (a DIFFERENT game) — its GM reads canon + history and reacts\n");
  const ys = await tradeGame.act(stage, ACTOR, "I approach the eastern faction's trading post to buy supplies.");
  for (const e of ys) console.log(`   ${e.type}:`, JSON.stringify(e.payload));
  const yMemos = await bb.recallSoul(ACTOR, "trading post reaction", { topK: 1 });
  console.log("   memo written:", yMemos[0]?.text ?? "(none)");

  console.log("\n4) Continuity folds the reaction back");
  const r2 = await continuity.tick(bb, UNIVERSE, schema);
  console.log("   canon:", JSON.stringify(r2.canon));

  console.log("\n--- INSPECTOR ---");
  const log = await bb.eventsSince(UNIVERSE, null);
  console.log(`event log (${log.length}): ${log.map((e) => `${e.source}/${e.type}`).join(" → ")}`);
  console.log("final canon:", JSON.stringify(await bb.getCanon(UNIVERSE, schema)));
  console.log("\nThe agents reasoned over shared memory; same soul, two games, one canon.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

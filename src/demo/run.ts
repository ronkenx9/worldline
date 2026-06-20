/**
 * Smoke harness for the core loop. The two "games" here are PLACEHOLDERS
 * (game-x / game-y) — generic, not the real game titles, which are still
 * undecided. The point is to exercise the architecture end-to-end, free and
 * offline (in-memory backends), proving: act in one game → Continuity reconciles
 * canon → a *different* game reacts to it through shared state.
 *
 * Swap InMemory* for WalrusClient / MemWalStore / SuiPointerStore to run on real
 * infra. Swap the scripted Reasoners for LLM calls to make the agents reason.
 */
import { Ed25519Signer } from "../core/identity.ts";
import { InMemoryStore } from "../core/memory.ts";
import { InMemoryPointerStore } from "../core/pointer.ts";
import { InMemoryBlobStore } from "../core/walrus.ts";
import { Blackboard } from "../core/blackboard.ts";
import { Gamemaster, type Stage, type Intent } from "../agents/gamemaster.ts";
import { Continuity } from "../agents/continuity.ts";
import { AdapterRegistry } from "../adapter.ts";
import { verifyEvent } from "../core/event.ts";
import type { CanonSchema } from "../core/canon.ts";

const UNIVERSE = "demo-universe";
const ACTOR = "soul:player-001";

// A universe declares its own bounded canon schema.
const schema: CanonSchema = {
  standings: { faction_alpha: { min: -100, max: 100, default: 0 } },
  flags: { alpha_alert: { values: "boolean", default: false } },
};

// --- placeholder game-x: the actor does something consequential -------------
const gameX = new Gamemaster("game-x", (): Intent[] => [
  {
    type: "world.act",
    payload: { canon: { standings: { faction_alpha: -40 }, flags: { alpha_alert: true } } },
    memo: "In game-x the player betrayed faction_alpha and triggered an alert.",
  },
]);

// --- placeholder game-y: a DIFFERENT game reacts to shared canon ------------
const gameY = new Gamemaster("game-y", (ctx): Intent[] => {
  const standing = ctx.canon.standings.faction_alpha ?? 0;
  const hostile = standing < 0;
  console.log(
    `   [game-y GM] recalled ${ctx.soul.length} soul memories; faction_alpha standing=${standing} → ` +
      (hostile ? "NPCs turn HOSTILE" : "NPCs neutral"),
  );
  return [
    {
      type: "npc.react",
      payload: { hostile, basis: "faction_alpha", standing },
      memo: hostile
        ? `In game-y, faction_alpha NPCs treated the player with hostility (standing ${standing}).`
        : `In game-y, faction_alpha NPCs were indifferent to the player.`,
    },
  ];
});

async function main() {
  const bb = new Blackboard(new InMemoryBlobStore(), new InMemoryPointerStore(), new InMemoryStore());
  const signer = Ed25519Signer.generate(); // stands in for the player's delegate key
  const stage: Stage = { blackboard: bb, universe: UNIVERSE, schema, signer };
  const continuity = new Continuity();

  const registry = new AdapterRegistry()
    .register({ source: "game-x", eventTypes: ["world.act"], gamemaster: gameX })
    .register({ source: "game-y", eventTypes: ["npc.react"], gamemaster: gameY });

  console.log("registered games:", registry.list().map((a) => a.source).join(", "));
  console.log(`\n1) ${ACTOR} acts in game-x`);
  const xEvents = await registry.get("game-x").gamemaster.act(stage, ACTOR, "enter game-x");
  for (const e of xEvents) console.log(`   emitted ${e.type}  id=${e.id.slice(0, 12)}…  verified=${await verifyEvent(e)}`);

  console.log("\n2) Continuity reconciles new events into canon");
  const r1 = await continuity.tick(bb, UNIVERSE, schema);
  console.log(`   reconciled ${r1.reconciled} event(s) → canon:`, r1.canon);

  console.log(`\n3) ${ACTOR} enters game-y (a different game) — it reacts to shared canon`);
  const yEvents = await registry.get("game-y").gamemaster.act(stage, ACTOR, "how do faction_alpha NPCs treat me?");
  for (const e of yEvents) console.log(`   emitted ${e.type}  hostile=${(e.payload as any).hostile}`);

  console.log("\n4) Continuity folds game-y's reaction back in");
  const r2 = await continuity.tick(bb, UNIVERSE, schema);
  console.log(`   reconciled ${r2.reconciled} event(s) → canon:`, r2.canon);

  console.log("\n--- INSPECTOR ---");
  const log = await bb.eventsSince(UNIVERSE, null);
  console.log(`event log (${log.length}) — coordination happened only through shared state:`);
  for (const e of log) console.log(`   ${e.source.padEnd(7)} ${e.type.padEnd(11)} actor=${e.actor}`);
  console.log("current canon:", await bb.getCanon(UNIVERSE, schema));
  const recalled = await bb.recallSoul(ACTOR, "what happened with faction_alpha?", { topK: 3 });
  console.log("soul recall 'faction_alpha':");
  for (const h of recalled) console.log(`   [${h.distance.toFixed(2)}] ${h.text}`);

  console.log("\nOK — one identity, two games, shared canon, zero agent-to-agent calls.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

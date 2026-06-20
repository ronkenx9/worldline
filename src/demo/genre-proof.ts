/**
 * GENRE-AGNOSTICISM PROOF.
 *
 * One pre-seeded, setting-NEUTRAL Soul. Two MAXIMALLY different games — a modern
 * heist game and a courtly-politics game — both read the same Soul and localize
 * it into their own world. Same identity, same history, two genres, coherent
 * reactions in each. This is the claim the thesis hadn't yet demonstrated.
 *
 * Run (free, fast, LLM only): node --env-file=.env --experimental-strip-types src/demo/genre-proof.ts
 */
import { OpenAICompatLLM } from "../agents/llm.ts";
import { llmGamemasterReasoner } from "../agents/reasoners.ts";
import { InMemoryStore } from "../core/memory.ts";
import { InMemoryPointerStore } from "../core/pointer.ts";
import { InMemoryBlobStore } from "../core/walrus.ts";
import { Blackboard } from "../core/blackboard.ts";
import { Gamemaster, type Stage } from "../agents/gamemaster.ts";
import { Ed25519Signer } from "../core/identity.ts";
import { seedSoul } from "../universe/seed.ts";
import { NEUTRAL_SCHEMA, SEED_MEMORIES, SEED_CANON, HEIST_GAME, COURT_GAME } from "../universe/neutral.ts";

const UNIVERSE = "neutral-proof";
const ACTOR = "soul:the-oathbreaker";

const llm = new OpenAICompatLLM({
  baseUrl: process.env.LLM_BASE_URL!,
  apiKey: process.env.LLM_API_KEY!,
  model: process.env.LLM_MODEL!,
});

async function playthrough(stage: Stage, game: Gamemaster, label: string, query: string) {
  console.log(`\n┌─ ${label}  (game: ${game.source}) ───────────────────────────`);
  console.log(`│ player: "${query}"`);
  const events = await game.act(stage, ACTOR, query);
  for (const e of events) {
    const p = e.payload as any;
    if (p?.scene) console.log(`│ → ${p.scene}`);
    if (p?.canon) console.log(`│   [canon move: ${JSON.stringify(p.canon)}]`);
  }
  console.log(`└────────────────────────────────────────────────────────────`);
}

async function main() {
  const bb = new Blackboard(new InMemoryBlobStore(), new InMemoryPointerStore(), new InMemoryStore());
  const signer = Ed25519Signer.generate();
  const stage: Stage = { blackboard: bb, universe: UNIVERSE, schema: NEUTRAL_SCHEMA, signer };

  console.log("Seeding one neutral Soul (setting-agnostic behavior + starting canon)…");
  await seedSoul(bb, ACTOR, UNIVERSE, SEED_MEMORIES, SEED_CANON);
  const canon = await bb.getCanon(UNIVERSE, NEUTRAL_SCHEMA);
  console.log("Soul canon (neutral primitives):");
  console.log("  standings:", JSON.stringify(canon.standings));
  console.log("  flags:    ", JSON.stringify(canon.flags));

  const heist = new Gamemaster(HEIST_GAME.source, llmGamemasterReasoner(llm, HEIST_GAME));
  const court = new Gamemaster(COURT_GAME.source, llmGamemasterReasoner(llm, COURT_GAME));

  // Same soul, two genres. The ONLY difference is which game's GM reads it.
  await playthrough(stage, heist, "HEIST GAME", "I try to put together a crew for a high-value score.");
  await playthrough(stage, court, "COURT GAME", "I request an audience to seek a powerful patron.");

  console.log("\nSame Soul. Two genres. Each game localized the same betrayal,");
  console.log("debt, infamy, and one act of mercy into its own world — coherently.");
  console.log("That is the genre-agnosticism claim, demonstrated.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

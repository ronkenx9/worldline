/**
 * FULL-STACK CONVERGENCE RUN — every backend real, nothing in-memory:
 *   Walrus (event + canon blobs) + Sui (mutable pointers, CAS) +
 *   MemWal (semantic recall) + LLM (Gamemaster + Continuity reasoning).
 *
 * Run: node --env-file=.env --experimental-strip-types src/demo/fullstack-run.ts
 *
 * Deliberately minimal (pre-seed + 2 acts) to bound gas/WAL cost. Slow by nature:
 * Walrus store ~6s, Sui txns ~2s each, MemWal index ~20-30s. Budget a few minutes.
 *
 * NOTE: routing every pointer (incl. write-once eventblob/logprev) through Sui is
 * wasteful — in production only mutable cells (canon/loghead/cursor) need on-chain
 * CAS; write-once mappings belong in a cheaper store. Done here to prove the path.
 */
import { WalrusClient } from "../core/walrus.ts";
import { SuiPointerStore } from "../core/pointer.ts";
import { MemWalStore } from "../core/memory.ts";
import { Blackboard } from "../core/blackboard.ts";
import { Gamemaster, type Stage } from "../agents/gamemaster.ts";
import { Continuity } from "../agents/continuity.ts";
import { OpenAICompatLLM } from "../agents/llm.ts";
import { llmGamemasterReasoner, llmReconcilePolicy } from "../agents/reasoners.ts";
import { Ed25519Signer } from "../core/identity.ts";
import { createEvent } from "../core/event.ts";
import type { CanonSchema } from "../core/canon.ts";

const STAMP = Date.now();
const UNIVERSE = `conv-${STAMP}`; // fresh universe → clean pointer chain on the shared object
const ACTOR = `soul:conv-${STAMP}`; // fresh MemWal namespace

const schema: CanonSchema = {
  standings: { eastern_faction: { min: -100, max: 100, default: 0 } },
  flags: { marked_oathbreaker: { values: "boolean", default: false } },
};

const t = (label: string, ms: number) => `${label} ${(ms / 1000).toFixed(1)}s`;

async function main() {
  const blobs = new WalrusClient({ epochs: 1 }); // Walrus testnet
  const pointers = new SuiPointerStore({
    packageId: process.env.BLACKBOARD_PACKAGE_ID!,
    objectId: process.env.BLACKBOARD_OBJECT_ID!,
    privateKey: process.env.SUI_PRIVATE_KEY!,
  });
  const memory = new MemWalStore({
    key: process.env.MEMWAL_KEY!,
    accountId: process.env.MEMWAL_ACCOUNT!,
    serverUrl: process.env.MEMWAL_RELAYER,
  });
  const bb = new Blackboard(blobs, pointers, memory);

  // The player's signing authority is their MemWal delegate key (ed25519) — same
  // self-sovereign identity across the stack.
  const signer = new Ed25519Signer(process.env.MEMWAL_KEY!);
  const stage: Stage = { blackboard: bb, universe: UNIVERSE, schema, signer };

  const llm = new OpenAICompatLLM({
    baseUrl: process.env.LLM_BASE_URL!,
    apiKey: process.env.LLM_API_KEY!,
    model: process.env.LLM_MODEL!,
  });
  const continuity = new Continuity(llmReconcilePolicy(llm));
  const gmA = new Gamemaster(
    "nightfall",
    llmGamemasterReasoner(llm, { source: "nightfall", description: "A dark stealth game of oaths and betrayal." }),
  );
  const gmB = new Gamemaster(
    "freeports",
    llmGamemasterReasoner(llm, { source: "freeports", description: "A trading game where faction reputation gates deals." }),
  );

  console.log(`universe=${UNIVERSE}\nactor=${ACTOR}\n(all backends live: Walrus + Sui + MemWal + LLM)\n`);

  // 0) pre-seed history through the REAL stack, then wait for MemWal to index it.
  let s = Date.now();
  const seed = await createEvent(signer, { actor: ACTOR, source: "seed", type: "history.seed", payload: {}, parents: [] });
  await bb.appendEvent(UNIVERSE, seed, "The player once swore a blood-oath of loyalty to the eastern faction.");
  console.log(t("0) seeded (Walrus+Sui+MemWal):", Date.now() - s));
  process.stdout.write("   waiting for MemWal to index the seed");
  let indexed = false;
  for (let i = 0; i < 20 && !indexed; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    process.stdout.write(".");
    const hits = await bb.recallSoul(ACTOR, "blood oath eastern faction", { topK: 1 });
    indexed = hits.length > 0;
  }
  console.log(indexed ? " indexed" : " (not indexed yet, continuing)");

  // 1) act in game A
  s = Date.now();
  const a = await gmA.act(stage, ACTOR, "I break into the eastern faction's vault and steal their sacred relic.");
  console.log(`\n${t("1) nightfall acted:", Date.now() - s)}`);
  for (const e of a) console.log(`   ${e.type} id=${e.id.slice(0, 10)}… canon=${JSON.stringify((e.payload as any).canon ?? {})}`);

  // 2) Continuity reconciles
  s = Date.now();
  const r1 = await continuity.tick(bb, UNIVERSE, schema);
  console.log(`${t("2) continuity reconciled:", Date.now() - s)} →`, JSON.stringify(r1.canon));

  // 3) act in game B (reads canon from Sui+Walrus, history from MemWal)
  s = Date.now();
  const b = await gmB.act(stage, ACTOR, "I approach the eastern faction's trading post to barter.");
  console.log(`${t("3) freeports acted:", Date.now() - s)}`);
  for (const e of b) console.log(`   ${e.type}: ${JSON.stringify(e.payload)}`);

  // 4) Continuity folds it back
  s = Date.now();
  const r2 = await continuity.tick(bb, UNIVERSE, schema);
  console.log(`${t("4) continuity reconciled:", Date.now() - s)} →`, JSON.stringify(r2.canon));

  // 5) inspector — read it all back from real storage
  console.log("\n--- INSPECTOR (read back from live storage) ---");
  const log = await bb.eventsSince(UNIVERSE, null);
  console.log(`event log from Walrus+Sui (${log.length}): ${log.map((e) => `${e.source}/${e.type}`).join(" → ")}`);
  console.log("canon (Sui pointer → Walrus blob):", JSON.stringify(await bb.getCanon(UNIVERSE, schema)));
  const recalled = await bb.recallSoul(ACTOR, "what did the player do to the eastern faction?", { topK: 3 });
  console.log("MemWal recall:");
  for (const h of recalled) console.log(`   [${h.distance.toFixed(3)}] ${h.text}`);

  console.log("\nOK — one soul, two games, one canon, fully on Walrus + Sui + MemWal.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

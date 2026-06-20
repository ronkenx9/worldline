/**
 * MemWal retrieval probe.
 *
 * Validates the load-bearing assumption of the architecture: that MemWal's
 * `recall` returns *relevant* history by semantic query (top-k + distance),
 * so agents never read the full event log.
 *
 * Measures: remember latency, recall latency, and whether ranking is sane.
 *
 * To run:
 *   1. Get accountId + delegate key from https://memory.walrus.xyz (wallet-gated).
 *   2. Put them in .env (see .env.example) or export them.
 *   3. npm install && npm run probe
 */
import { MemWal } from "@mysten-incubation/memwal";

const KEY = process.env.MEMWAL_KEY!;          // ed25519 private key hex
const ACCOUNT = process.env.MEMWAL_ACCOUNT!;  // MemWalAccount object id
const RELAYER =
  process.env.MEMWAL_RELAYER ?? "https://relayer-staging.memory.walrus.xyz"; // testnet
const NS = "probe-" + Date.now(); // isolate this run

if (!KEY || !ACCOUNT) {
  console.error("Set MEMWAL_KEY and MEMWAL_ACCOUNT (from memory.walrus.xyz).");
  process.exit(1);
}

// Synthetic "events" standing in for a soul's cross-game history.
const memories = [
  "In game A the player betrayed the eastern faction and stole their relic.",
  "In game A the player helped a western merchant repair a broken bridge.",
  "In game B the player won three races and earned a reputation for recklessness.",
  "In game C the player negotiated a truce between two rival guilds.",
  "The player's favorite weapon is a plasma saber gifted by a northern ally.",
  "In game A the player spared a wounded enemy who later became an informant.",
];

const ms = (t: number) => `${(t).toFixed(0)}ms`;

async function main() {
  const memwal = MemWal.create({ key: KEY, accountId: ACCOUNT, serverUrl: RELAYER, namespace: NS });

  console.log(`namespace=${NS}\nrelayer=${RELAYER}\n`);
  console.log("== WRITE (rememberAndWait) ==");
  for (const m of memories) {
    const t0 = performance.now();
    const r = await memwal.rememberAndWait(m);
    console.log(`  ${ms(performance.now() - t0)}  blob=${(r.blob_id ?? "").slice(0, 12)}…  "${m.slice(0, 40)}…"`);
  }

  // The real test: does a natural-language query pull back the RELEVANT events,
  // ranked, without us reading the whole log?
  const queries = [
    "What did the player do to the eastern faction?",
    "Is the player good at racing?",
    "Has the player ever shown mercy?",
  ];

  console.log("\n== RECALL (semantic, top-k) ==");
  for (const q of queries) {
    const t0 = performance.now();
    const res: any = await memwal.recall({ query: q, topK: 3 });
    const dt = performance.now() - t0;
    const hits = res.results ?? res.memories ?? res ?? [];
    console.log(`\nQ: ${q}   (${ms(dt)})`);
    for (const h of hits) {
      const text = h.text ?? h.content ?? JSON.stringify(h).slice(0, 80);
      const dist = h.distance ?? h.score ?? "?";
      console.log(`   [${dist}] ${String(text).slice(0, 70)}`);
    }
  }

  console.log("\nDone. Judge: did each query surface the right memory at the top?");
}

main().catch((e) => {
  console.error("probe failed:", e?.message ?? e);
  process.exit(1);
});

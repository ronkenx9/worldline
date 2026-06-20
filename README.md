# WORLDLINE

### Every world remembers.

Cross-game memory layer for AI worlds. A player's actions in one game become
portable, verified **Canon** that other games read and react to. Self-sovereign
**Souls** + a multi-agent gamemaster on Walrus / Sui / MemWal / Seal.
Game-agnostic core; games are pluggable adapters. Brand: [BRAND.md](./BRAND.md).

- **Concept + design:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Infra probe results (latency, gotchas, the Sui-pointer finding):** [PROBE-FINDINGS.md](./PROBE-FINDINGS.md)

## Run the smoke demo (free, offline)

```bash
npm install
npm run demo
```

Proves the loop with in-memory backends and **placeholder** games: act in one
game → Continuity reconciles canon → a *different* game reacts to shared state,
with signed/verified events and zero agent-to-agent calls.

## Genre-agnosticism proof (`npm run demo:genre`)

One pre-seeded, **setting-neutral** Soul (`src/universe/neutral.ts`) read by two
maximally different games — a modern heist game and a courtly-politics game.
Both localize the *same* betrayal, debt, infamy, and trait profile into their own
world, coherently. Demonstrates the layer is game-agnostic, not fantasy-bound.

```bash
npm run typecheck     # tsc --noEmit
npm run demo:llm      # LLM agents reason over shared canon (needs .env LLM_*)
npm run demo:genre    # genre-agnosticism proof (needs .env LLM_*)
npm run demo:fullstack# all real backends: Walrus + Sui + MemWal + LLM
npm run test:sui      # live Sui pointer CAS test
```

## Layout

```
src/
  core/
    canonical.ts   deterministic JSON + content hashing
    event.ts       signed, content-addressed Event (the only thing stored)
    identity.ts    Ed25519 delegate-key signer/verify
    memory.ts      MemoryStore: InMemoryStore (offline) | MemWalStore (semantic recall)
    pointer.ts     PointerStore: InMemory | SuiPointerStore (mutable cell — stub)
    walrus.ts      BlobStore: WalrusClient (UA-fixed) | InMemoryBlobStore
    canon.ts       bounded universe canon + ReconcilePolicy seam
    blackboard.ts  coordination surface (events + canon + recall) over the above
  agents/
    gamemaster.ts  per-game agent: recall soul + read canon → reason → emit events
    continuity.ts  sole writer of canon; reconciles new events (reasoned)
  adapter.ts       GameAdapter contract + registry (the SDK seam)
  index.ts         public exports
  demo/run.ts      placeholder smoke harness
```

## Run the live LLM demo (reasoning agents)

```bash
node --env-file=.env --experimental-strip-types src/demo/llm-run.ts
```

GM + Continuity reason via an LLM over shared memory + canon. Needs `.env` with
`LLM_BASE_URL` / `LLM_MODEL` / `LLM_API_KEY` (any OpenAI-compatible endpoint).

## Live integration test (Sui pointer)

```bash
node --env-file=.env --experimental-strip-types src/integration/sui-pointer.ts
```

Exercises the deployed Blackboard object on Sui testnet, incl. CAS rejection.

## Swapping in real infra

| Dev (default) | Production | Status |
|---|---|---|
| `InMemoryBlobStore` | `WalrusClient` | ✅ implemented (UA fix); probed live |
| `InMemoryPointerStore` | `SuiPointerStore` | ✅ implemented + **deployed & tested on testnet** |
| `InMemoryStore` | `MemWalStore` | ✅ implemented; recall probed live |
| scripted `Reasoner` | `llmGamemasterReasoner` / `llmReconcilePolicy` | ✅ implemented; run live |

### Deployed (Sui testnet)

- Blackboard package: `0xf7954ab3f832d2b609a828653a62ab22f5eb1953713f54e311e3c8a1fc7d8470`
- Blackboard object: `0x77b0b5077fc3705f19085bbaa441aa48f18619cf8931b7eb141a2e8d5980d0b8`

## Full-stack convergence (all real backends)

```bash
node --env-file=.env --experimental-strip-types src/demo/fullstack-run.ts
```

One loop — seed → game A → Continuity → game B → Continuity — with **every**
backend live: Walrus (event+canon blobs), Sui (mutable pointers w/ CAS), MemWal
(semantic recall), LLM (both agents reasoning). Proven working end-to-end.
Slow by nature (~2-3 min): Walrus store ~6s, each Sui txn waits for finality,
MemWal indexes ~20-30s — which is exactly why interaction needs a hot layer and
durable writes stay off the critical path.

## Known next steps

1. **Pre-seed** a synthetic soul + canon for a live demo (rich first-touch).
2. **Decide the actual games** and write their adapters.
3. **Seal/Keeper agent** for encrypted soul attributes (privacy track points).
4. **Optimize pointer writes**: only mutable cells (canon/loghead/cursor) need
   on-chain CAS; route write-once mappings (eventblob/logprev) to a cheaper store.

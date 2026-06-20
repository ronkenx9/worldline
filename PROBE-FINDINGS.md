# Walrus Testnet Latency Probe — Findings

Date: 2026-06-17. Public testnet publisher/aggregator, HTTP API.

## Numbers

| Operation | Latency | Notes |
|---|---|---|
| **Store (write)** | **~5–8s** | Flat across 1KB / 50KB / 200KB → fixed per-write overhead, not size-bound |
| **Read (cold)** | ~0.5–2.3s | First aggregator hit |
| **Read (cached)** | ~0.5s | Cloudflare CDN, `cache-control: max-age=86400` (24h), keyed by blobId |
| **Propagation** | ≤3s | Blob readable ~3s after store returns |

## Confirmed gotchas

1. **Cloudflare WAF blocks non-browser user-agents (403).** `urllib`/default
   clients get `403` on reads; a browser-like `User-Agent` returns `200`.
   → The client/SDK **must set a browser-like UA** (or use the official SDK).
   Symptom is a fast, constant ~0.6s 403 — looks like "not ready," is actually a
   WAF block. Don't mistake it for propagation delay.

2. **Store overhead is fixed and high (~5–8s).** Batching helps nothing on a
   per-call basis — every PUT pays ~5–8s. → **Never put a store on the
   interactive critical path.** Confirms the hot/cold split is mandatory.

## The architectural finding (bigger than latency)

Walrus blobs are **immutable + content-addressed + edge-cached (24h)**.
There is no "overwrite canon." Each canon write is a **new blob with a new
blobId**. Caching-by-blobId is therefore safe (content never changes per id) —
but it means:

> The blackboard needs a **mutable pointer** to "which blobId is current canon."
> That pointer **cannot be a Walrus blob** (immutable) and cannot rely on the CDN
> (24h cache). It must live in a mutable store — a **Sui on-chain object** (right
> answer, keeps verifiability + ownership) or a thin coordination service.

So the coordination model splits cleanly:

- **Walrus** = immutable content (events, each canon *version*). Cheap, verifiable, cached.
- **Sui object** = the mutable cell holding current pointers (latest canon blobId,
  per-soul head event). This is the actual blackboard's mutable surface.
- Agents read the Sui pointer (fast, cheap, mutable) → fetch the blob it points to
  (Walrus, cached). Agents write content to Walrus → update the Sui pointer.

This *strengthens* the thesis: the mutable coordination cell being a Sui object
means ownership and tamper-evidence extend to the pointer, not just the content.

## Implications for the build

- **Hot/cold split is non-negotiable.** Live interaction served from in-memory /
  Sui-pointer state; Walrus writes happen async, off the critical path.
- **Event-per-blob is fine latency-wise** but each costs ~5–8s to land — so emit
  events async and let the GM/UI proceed optimistically before the store certifies.
- **Canon updates are versioned blobs + a pointer flip**, not in-place edits.
  Continuity writes a new canon blob, then advances the Sui pointer.
- **Set a browser UA** in every Walrus HTTP client, or use the official SDK.

## Verdict (Walrus)

Buildable. Walrus is viable as the durable, verifiable substrate. It is **not**
a low-latency mutable store — treat it as an immutable content log behind a
mutable Sui pointer and a hot in-memory layer. The blackboard coordination model
works, but its mutable cell lives on Sui, not Walrus.

---

# MemWal Probe — Findings (docs validated; live run blocked on credentials)

## The load-bearing assumption is validated by the API design

The architecture claims agents retrieve *relevant* history, not the whole log.
MemWal's API confirms this is a first-class operation:

- `recall({ query, limit?, topK?, namespace?, maxDistance? })` — natural-language
  **semantic search**, top-k ranked, with a `maxDistance` relevance threshold and
  `namespace` scoping. This is exactly the "don't read the full log" primitive.
- Writes: `remember(text)` (async job) / `rememberAndWait` (returns `blob_id`,
  `owner`, `namespace`). Memories are embedded → Seal-encrypted → Walrus-stored →
  vector-indexed, all async behind a **relayer**.
- `rememberBulk` (up to 20/call) for batching writes — matches the "emit events
  async, off the critical path" constraint from the Walrus findings.

So MemWal *is* the memory layer the spec assumed, and it bundles Seal encryption
(covers the Keeper/privacy story) and Walrus storage under one SDK.

## Integration facts (for the build)

- SDK: `@mysten-incubation/memwal` (TypeScript; Node 18+/Bun). Python SDK exists too.
- `MemWal.create({ key, accountId, serverUrl, namespace })`.
  - `key` = ed25519 delegate **private** key (hex).
  - `accountId` = MemWalAccount object id on Sui.
- Relayers (public good): testnet `https://relayer-staging.memory.walrus.xyz`,
  mainnet `https://relayer.memory.walrus.xyz`. Self-hosting possible (needs a
  wallet funded with WAL + SUI).
- There's also an **MCP server** and **OpenClaw/NemoClaw** + Vercel AI SDK
  middleware — i.e. an agent can be given memory tools directly.
- `namespace` gives memory isolation → maps cleanly to per-soul / per-game scoping.

## Blocker (the wall flagged before the probe)

Credentials are **wallet-gated**: account id + delegate key are minted at the
playground **https://memory.walrus.xyz** by connecting a Sui wallet. I cannot do
that autonomously. Probe is written and ready; it needs two pasted values.

### To unblock (2 min)
1. Go to https://memory.walrus.xyz, connect a Sui wallet, create an account,
   generate a delegate key.
2. Copy `accountId` + delegate private key into
   `memwal-probe/.env` (template in `.env.example`).
3. `cd memwal-probe && npm install && npm run probe`.

The probe writes 6 synthetic cross-game "events" then runs 3 natural-language
`recall` queries and prints ranked hits + distances + latency. Success = each
query surfaces the right memory at the top. That's the last assumption to verify
before scaffolding the core.

## LIVE RUN (mainnet relayer, creds from BOUND project)

Ran the probe: 6 synthetic cross-game events written, 3 natural-language recalls.

**Recall — correct ranking, 1.1–4.4s:**

| Query | Top hit (distance) | Runner-up | Verdict |
|---|---|---|---|
| "what did the player do to the eastern faction?" | betrayed eastern faction (0.28) | 0.48 | ✓ clean gap |
| "is the player good at racing?" | won three races (0.45) | 0.75 | ✓ big gap |
| "has the player ever shown mercy?" | spared a wounded enemy (0.52) | 0.62 | ✓ correct top |

Every query surfaced the right memory at the top. The "retrieve relevant, don't
read the full log" assumption is **validated live**. Recall latency (1–4s) is
fine for an agent *reasoning* cycle, but still not twitch-fast → reasoning runs
behind the hot layer, not on the input path.

**Writes — 18–33s via `rememberAndWait`** (embed + Seal + Walrus upload + vector
index, polled to completion). Slower than raw Walrus store. → In the hot loop use
`remember`/`rememberBulk` (returns a job id immediately); **never block on
`rememberAndWait`.** Writes are strictly async/off the critical path.

## Verdict (MemWal)

**Validated live.** `recall` semantic top-k is real, ranks correctly, ~1–4s.
MemWal collapses three spec pieces (memory + Seal + Walrus) into one SDK. Writes
are slow (~20–33s) and must be async. Both load-bearing assumptions now hold;
nothing blocks scaffolding the core.

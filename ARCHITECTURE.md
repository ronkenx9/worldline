# Agentic State Layer — Architecture Spec

> Working codename: **Continuum** (name TBD).
> A self-sovereign, interoperable game-state layer with a multi-agent gamemaster
> on top, built on Walrus / MemWal / Seal.

This document defines the **game-agnostic core** and the **adapter boundary**.
No specific games are wired in. Games are pluggable adapters; the core never
knows what any game *means*.

---

## 1. Thesis

State that is simultaneously **yours** (self-sovereign — lives on Walrus keyed to
the player, no studio can revoke or alter it) and **shared** (interoperable —
many games read and append to it, and trust each other's writes without trusting
each other's servers, because the history is verifiable).

On top of that state sits a **multi-agent gamemaster**: long-running agents that
read accumulated history and author the world's response. The agents coordinate
*only through Walrus* — the memory layer is the message bus. Remove Walrus and
neither the state nor the coordination exists. That is the load-bearing claim.

---

## 2. Design principles

1. **Game-agnostic core.** The core stores signed events and derives state. It
   never interprets game meaning. Meaning lives in opaque `type` + `payload`.
2. **Event-sourced.** The atomic unit is a signed, appendable **event**. Souls
   and canon are *projections* derived by replaying events — never authored
   documents. This is more verifiable and more SDK-shaped than soul-as-document.
3. **Zero agent-to-agent coupling.** No agent holds another agent's address.
   They coordinate via a **blackboard**: reads/writes on shared Walrus state.
   Agent A's write *is* the message to Agent B.
4. **Pluggable adapters.** A game is a module that implements a small contract:
   how it reads shared state, and what events it emits. Swap games freely; the
   core, the continuity agent, and the coordination layer never change.
5. **Universe-defined schema with a sane default.** The shape of canon is
   declared per-universe, not baked into the core. The core ships a default
   schema so you can start in one line.

---

## 3. Core data model

### 3.1 Event envelope (universal — the only thing the core stores)

```ts
interface Event {
  id: string;            // content hash of the envelope
  actor: ActorId;        // whose soul this belongs to (player or agent identity)
  source: SourceId;      // which game or agent emitted it
  type: string;          // opaque to the core; meaning lives in the adapter
  payload: unknown;      // opaque to the core; adapter-defined shape
  parents: string[];     // event ids this causally follows (ordering / replay)
  timestamp: number;
  signature: string;     // signed by the source's delegate key
}
```

The core can validate signatures and ordering. It **cannot** and **must not**
interpret `type`/`payload`. That opacity is what keeps it game-agnostic.

### 3.2 Soul (projection — derived, never stored as a document)

```ts
// A Soul is whatever you fold an actor's event stream into.
// Each game supplies its own reducer over the parts it cares about.
type SoulProjection<V> = (events: Event[]) => V;
```

The "Character Soul" is not a file — it's the result of replaying an actor's
events through a game's projection. A racing game projects vehicles + rep; a
story game projects relationships + history. Same events, different views.

### 3.3 Canon (universe-defined shared state)

```ts
// A universe registers its canon schema. The core ships a default.
interface CanonSchema {
  standings: Record<string, NumericRange>; // e.g. faction -> [-100, 100]
  flags: Record<string, FlagSpec>;         // booleans / enums
  // extendable per universe
}

// Default schema (used if none registered):
const DEFAULT_CANON: CanonSchema = {
  standings: { /* up to ~5 numeric standings */ },
  flags: {     /* up to ~5 world flags */ },
};
```

Canon is intentionally small and bounded. It is the *reconciled truth* of the
universe, derived from events by the Continuity agent (§4.2). Keeping it tiny is
what makes reconciliation real but demoable.

---

## 4. Agent contracts (signatures, not logic)

Agents are clients of the core. Each owns a decision no other agent may make.

### 4.1 Gamemaster (N — one per game)

Authors a single game's local experience. Reads soul + canon, runs the scene,
emits events. **Does not** decide global truth — only what happened in its game.

```ts
interface Gamemaster<Ctx, V> {
  readonly source: SourceId;
  view: SoulProjection<V>;                 // how this game reads a soul
  buildContext(soul: V, canon: Canon): Ctx; // assemble reasoning context
  authorResponse(ctx: Ctx): Promise<Event[]>; // reason -> emit events
}
```

### 4.2 Continuity (1 — the only writer of canon)

Consumes events from all sources, reconciles contradictions into coherent canon.
This is the negotiation / conflict-resolution surface — reasoned, not
last-write-wins, but bounded to the small canon schema.

```ts
interface Continuity {
  reconcile(events: Event[], current: Canon): Promise<Canon>;
}
```

Reconciliation reasons over the bounded schema only. Example shape (not a rule):
two games emit conflicting standing changes → Continuity judges a net standing +
sets a flag, rather than blindly taking the latest write.

### 4.3 Keeper (1 — stretch / Seal)

Guards Seal-encrypted soul or canon attributes; decrypts when conditions are met.
Adds the privacy layer and a fourth agentic surface cheaply. Optional for v1.

```ts
interface Keeper {
  guard(attr: SealedAttr, condition: Condition): void;
  tryUnlock(attr: SealedAttr, ctx: unknown): Promise<Plaintext | null>;
}
```

---

## 5. Coordination model — blackboard over Walrus

No direct agent-to-agent calls. The shared state is the bus.

```
  GM-A ──emits events──▶  [ Walrus event log ]  ◀──reads events── Continuity
  GM-B ──emits events──▶          │                                   │
                                  │                            writes canon
  GM-A ──reads canon───▶  [ Walrus canon blob ] ◀──────────────────────┘
  GM-B ──reads canon───▶
```

- A GM writing an event is implicitly a message to Continuity.
- Continuity writing canon is implicitly a message to every GM.
- Agents never know how many other agents exist. This is exactly how a
  third-party studio would plug into the universe: integrate with the memory,
  not with other studios.

> **Mutable-pointer requirement (from the latency probe — see PROBE-FINDINGS.md).**
> Walrus blobs are immutable and content-addressed: there is no "overwrite canon."
> Each canon write is a *new* blob with a new blobId. So the blackboard's mutable
> cell — "which blobId is current canon," "the head event of a soul" — **cannot
> live on Walrus**. It lives in a **Sui on-chain object**. Read path: read the Sui
> pointer (mutable, cheap) → fetch the blob it names (Walrus, cached, ~0.5s).
> Write path: store content to Walrus (~5–8s, off the critical path) → advance the
> Sui pointer. This keeps ownership + tamper-evidence on the pointer too, and is
> why the interactive layer must be hot (in-memory / Sui), with Walrus writes async.

---

## 6. Storage mapping

| Concern | Layer | Why |
|---|---|---|
| Event log (durable record) | **Walrus** | Verifiable, content-addressed, tamper-evident |
| Relevant-history retrieval for agent context | **MemWal** | Retrieve *relevant* events, not the whole log — scales reasoning |
| Reconciled canon | **Walrus** | Small blob, frequently overwritten, publicly verifiable |
| Hidden / locked attributes | **Seal** | Cryptographically hidden until conditions met (Keeper) |
| Identity / delegate keys | MemWal playground delegate keys | Per-agent signing |

Agents read context via MemWal (relevance), but the canonical durable artifacts
live as Walrus blobs anyone can inspect and replay.

---

## 7. Adapter contract — what a game supplies to plug in

A game implements exactly this and nothing more:

```ts
interface GameAdapter<Ctx, V> {
  source: SourceId;                 // unique id for this game
  eventTypes: string[];             // vocabulary it emits / cares about
  view: SoulProjection<V>;          // which slice of soul it reads
  gamemaster: Gamemaster<Ctx, V>;   // its authoring agent
  // rendering is entirely outside the core
}
```

Register an adapter → it's in the universe. The core, Continuity, and the
coordination layer are untouched. That registration surface *is* the SDK.

---

## 8. Lifecycle (abstract — no demo wired)

**Write path (a player acts in some game):**
1. Game's GM builds context from soul projection + current canon.
2. GM reasons, emits signed events to the Walrus event log.

**Reconcile path (continuously / on new events):**
3. Continuity reads new events (via MemWal relevance), reconciles into canon,
   writes the updated canon blob to Walrus.

**Read path (a player enters another game):**
4. That game's GM projects the actor's full event stream into its view and reads
   current canon → authors a context-aware response.

The loop closes on itself: every output is durable and becomes the next cycle's
input. That is the long-running, state-tracking, artifact-driven workflow.

---

## 9. Deferred / open (intentionally not decided here)

- **The actual games.** Adapters are pluggable; pick them later. Nothing in the
  core depends on which games exist.
- **Pre-seed strategy.** A synthetic actor with prior history + populated canon,
  so the world is alive on first touch. Build when wiring a demo.
- **Universe name / canon schema for the first real universe.** Default schema
  works until a universe declares its own.
- **Single vs. multiple Continuity instances** if the event volume ever needs
  sharding. v1 = one Continuity.

---

## 10. Track mapping (why this fits the Walrus brief)

- Self-sovereign, portable, persistent, not platform-locked → core thesis ✓
- Long-running agents tracking state over time → GMs + Continuity loop ✓
- Multi-agent coordination + negotiation → Continuity reconciling contradictory
  writes through the blackboard ✓
- Artifact-driven workflow → events + canon are the stored, reused artifacts ✓
- Tooling / framework integration → the adapter contract is a Walrus-backed SDK ✓
- Privacy → Seal via the Keeper agent ✓

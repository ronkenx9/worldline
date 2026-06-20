// Public SDK surface.

// Core data model
export { type Event, type EventBody, type ActorId, type SourceId, createEvent, verifyEvent } from "./core/event.ts";
export { type Signer, Ed25519Signer, verifySignature } from "./core/identity.ts";
export { canonicalJSON, contentHash } from "./core/canonical.ts";
export {
  type Canon,
  type CanonSchema,
  type NumericRange,
  type FlagSpec,
  type ReconcilePolicy,
  DEFAULT_CANON_SCHEMA,
  emptyCanon,
  defaultReconcile,
} from "./core/canon.ts";

// Storage backends (interfaces + in-memory + production impls)
export { type MemoryStore, type RecallHit, type RecallOpts, InMemoryStore, MemWalStore } from "./core/memory.ts";
export { type PointerStore, InMemoryPointerStore, SuiPointerStore, PointerConflictError } from "./core/pointer.ts";
export {
  type BlobStore,
  type WalrusConfig,
  WalrusClient,
  InMemoryBlobStore,
  encodeJSON,
  decodeJSON,
} from "./core/walrus.ts";

// Coordination + agents
export { Blackboard } from "./core/blackboard.ts";
export { Gamemaster, type Stage, type GameContext, type Intent, type Reasoner } from "./agents/gamemaster.ts";
export { Continuity, type ContinuityResult } from "./agents/continuity.ts";

// Adapter seam (the SDK)
export { type GameAdapter, AdapterRegistry } from "./adapter.ts";

// LLM reasoning seams
export { type LLM, type LLMMessage, OpenAICompatLLM, extractJSON } from "./agents/llm.ts";
export { type GamePersona, llmGamemasterReasoner, llmReconcilePolicy } from "./agents/reasoners.ts";

import { contentHash } from "./canonical.ts";
import type { Signer } from "./identity.ts";
import { verifySignature } from "./identity.ts";

export type ActorId = string; // whose soul this belongs to
export type SourceId = string; // which game/agent emitted it

/** The signed body of an event, minus its id+signature. This is what gets hashed. */
export interface EventBody<P = unknown> {
  actor: ActorId;
  source: SourceId;
  type: string; // OPAQUE to the core — meaning lives in the adapter
  payload: P; // OPAQUE to the core
  parents: string[]; // event ids this causally follows
  timestamp: number;
}

/** A signed, content-addressed event. The only thing the core stores. */
export interface Event<P = unknown> extends EventBody<P> {
  id: string; // contentHash(body)
  signerPubKey: string; // hex ed25519 public key that signed
  signature: string; // hex signature over id
}

/** Build + sign an event. `id` is the content hash of the body; signature covers the id. */
export async function createEvent<P>(
  signer: Signer,
  body: Omit<EventBody<P>, "timestamp"> & { timestamp?: number },
): Promise<Event<P>> {
  const full: EventBody<P> = {
    actor: body.actor,
    source: body.source,
    type: body.type,
    payload: body.payload,
    parents: body.parents ?? [],
    timestamp: body.timestamp ?? Date.now(),
  };
  const id = contentHash(full);
  const signature = await signer.sign(id);
  return { ...full, id, signerPubKey: signer.publicKeyHex, signature };
}

/** Verify an event's id matches its body and the signature is valid for the body's claims. */
export async function verifyEvent(event: Event): Promise<boolean> {
  const { id, signerPubKey, signature, ...body } = event;
  if (contentHash(body) !== id) return false;
  return verifySignature(id, signature, signerPubKey);
}

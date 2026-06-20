import type { Event } from "./event.ts";
import type { MemoryStore, RecallHit, RecallOpts } from "./memory.ts";
import type { PointerStore } from "./pointer.ts";
import { type BlobStore, encodeJSON, decodeJSON } from "./walrus.ts";
import { type Canon, type CanonSchema, emptyCanon } from "./canon.ts";

/**
 * The coordination surface. Agents never call each other — they read and write
 * here, and the shared state IS the message bus (stigmergy / blackboard).
 *
 * Split per the probe findings:
 *  - immutable content (events, each canon version) → BlobStore (Walrus)
 *  - mutable cells (current canon blobId, log head) → PointerStore (Sui)
 *  - relevant-history retrieval → MemoryStore (MemWal)
 */
export class Blackboard {
  private blobs: BlobStore;
  private pointers: PointerStore;
  private memory: MemoryStore;

  constructor(blobs: BlobStore, pointers: PointerStore, memory: MemoryStore) {
    this.blobs = blobs;
    this.pointers = pointers;
    this.memory = memory;
  }

  // ---- events (immutable, content-addressed) --------------------------------

  /**
   * Persist a signed event and link it into the universe's append-only log so
   * Continuity can consume "events since cursor". `memo` is the human-readable
   * summary the emitting agent supplies for semantic recall (the core never
   * interprets payloads itself).
   */
  async appendEvent(universe: string, event: Event, memo?: string): Promise<void> {
    const blobId = await this.blobs.store(encodeJSON(event));
    await this.pointers.set(`eventblob:${event.id}`, blobId);

    // link into the per-universe log: logprev:<id> -> previous head
    const prevHead = await this.pointers.get(`loghead:${universe}`);
    await this.pointers.set(`logprev:${event.id}`, prevHead ?? "");
    await this.pointers.set(`loghead:${universe}`, event.id, prevHead);

    if (memo) await this.memory.remember(memo, `soul:${event.actor}`);
  }

  async getEvent(eventId: string): Promise<Event> {
    const blobId = await this.pointers.get(`eventblob:${eventId}`);
    if (!blobId) throw new Error(`unknown event ${eventId}`);
    return decodeJSON<Event>(await this.blobs.read(blobId));
  }

  /** Events appended after `cursor` (exclusive), oldest-first. */
  async eventsSince(universe: string, cursor: string | null): Promise<Event[]> {
    const chain: string[] = [];
    let id = await this.pointers.get(`loghead:${universe}`);
    while (id && id !== cursor && id !== "") {
      chain.push(id);
      id = await this.pointers.get(`logprev:${id}`);
    }
    chain.reverse();
    return Promise.all(chain.map((eid) => this.getEvent(eid)));
  }

  async logHead(universe: string): Promise<string | null> {
    return this.pointers.get(`loghead:${universe}`);
  }

  // ---- canon (immutable versions behind a mutable pointer) -------------------

  async getCanon(universe: string, schema: CanonSchema): Promise<Canon> {
    const blobId = await this.pointers.get(`canon:${universe}`);
    if (!blobId) return emptyCanon(schema);
    return decodeJSON<Canon>(await this.blobs.read(blobId));
  }

  /** Write a new canon *version* (new blob) and flip the pointer with CAS. */
  async setCanon(universe: string, canon: Canon): Promise<void> {
    const prev = await this.pointers.get(`canon:${universe}`);
    const blobId = await this.blobs.store(encodeJSON(canon));
    await this.pointers.set(`canon:${universe}`, blobId, prev);
  }

  // ---- memory (relevant-history retrieval) ----------------------------------

  async recallSoul(actor: string, query: string, opts?: RecallOpts): Promise<RecallHit[]> {
    return this.memory.recall(query, `soul:${actor}`, opts);
  }

  /** Write a memory directly to a soul's namespace (used for pre-seeding). */
  async rememberSoul(actor: string, text: string): Promise<void> {
    await this.memory.remember(text, `soul:${actor}`);
  }

  // ---- continuity cursor ----------------------------------------------------

  async getCursor(universe: string): Promise<string | null> {
    return this.pointers.get(`continuity-cursor:${universe}`);
  }
  async setCursor(universe: string, eventId: string): Promise<void> {
    await this.pointers.set(`continuity-cursor:${universe}`, eventId);
  }
}

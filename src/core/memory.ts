/**
 * Memory layer: semantic store + recall. The agent loop retrieves *relevant*
 * history by query, never the whole log. Validated live against MemWal
 * (recall top-k, ~1-4s). MemWal writes are slow (~20-33s) → always async.
 */
export interface RecallHit {
  text: string;
  distance: number; // lower = more relevant
}

export interface RecallOpts {
  topK?: number;
  maxDistance?: number;
}

export interface MemoryStore {
  /** Fire-and-forget by contract: returns when accepted, indexing continues async. */
  remember(text: string, namespace: string): Promise<void>;
  /** Semantic search scoped to a namespace (soul / game / universe). */
  recall(query: string, namespace: string, opts?: RecallOpts): Promise<RecallHit[]>;
}

/**
 * Offline, free, dependency-free MemoryStore for local dev and tests.
 * Lexical-overlap ranking — NOT semantic, but good enough to exercise the loop
 * without touching the network or spending WAL. Swap for MemWalStore in prod.
 */
export class InMemoryStore implements MemoryStore {
  #byNs = new Map<string, string[]>();

  async remember(text: string, namespace: string): Promise<void> {
    const arr = this.#byNs.get(namespace) ?? [];
    arr.push(text);
    this.#byNs.set(namespace, arr);
  }

  async recall(query: string, namespace: string, opts: RecallOpts = {}): Promise<RecallHit[]> {
    const topK = opts.topK ?? 10;
    const qTokens = tokenize(query);
    const hits = (this.#byNs.get(namespace) ?? []).map((text) => {
      const tTokens = tokenize(text);
      const overlap = qTokens.filter((t) => tTokens.includes(t)).length;
      const distance = 1 - overlap / Math.max(1, qTokens.length); // 0 = perfect overlap
      return { text, distance };
    });
    hits.sort((a, b) => a.distance - b.distance);
    const filtered = opts.maxDistance != null ? hits.filter((h) => h.distance <= opts.maxDistance!) : hits;
    return filtered.slice(0, topK);
  }
}

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
}

/**
 * MemWal-backed MemoryStore. Lazy-imports the SDK so the optional dep isn't
 * required for in-memory runs. `remember` uses the non-blocking job API.
 */
export class MemWalStore implements MemoryStore {
  #client: any;
  #ready: Promise<void>;

  constructor(cfg: { key: string; accountId: string; serverUrl?: string }) {
    this.#ready = (async () => {
      const { MemWal } = await import("@mysten-incubation/memwal");
      this.#client = MemWal.create({
        key: cfg.key,
        accountId: cfg.accountId,
        serverUrl: cfg.serverUrl ?? "https://relayer.memory.walrus.xyz",
      });
    })();
  }

  async remember(text: string, namespace: string): Promise<void> {
    await this.#ready;
    // Non-blocking: returns a job id; embedding/Seal/Walrus/index continue async.
    await this.#client.remember(text, namespace);
  }

  async recall(query: string, namespace: string, opts: RecallOpts = {}): Promise<RecallHit[]> {
    await this.#ready;
    const res: any = await this.#client.recall({
      query,
      namespace,
      topK: opts.topK ?? 10,
      maxDistance: opts.maxDistance,
    });
    const raw = res?.results ?? res?.memories ?? res ?? [];
    return raw.map((h: any) => ({
      text: h.text ?? h.content ?? "",
      distance: h.distance ?? h.score ?? 1,
    }));
  }
}

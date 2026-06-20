/**
 * Walrus blob client (immutable content store). Probe findings baked in:
 *  - store ~5-8s (size-independent up to 200KB) → callers must keep writes off
 *    the interactive path.
 *  - aggregator is behind Cloudflare; a non-browser User-Agent gets a 403 that
 *    looks like "not ready". We set a browser-like UA to avoid it.
 *  - reads ~0.5s cached, blob readable ~3s after store.
 */
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export interface WalrusConfig {
  publisher?: string;
  aggregator?: string;
  epochs?: number;
}

export interface BlobStore {
  store(bytes: Uint8Array): Promise<string>; // returns blobId
  read(blobId: string): Promise<Uint8Array>;
}

export class WalrusClient implements BlobStore {
  #publisher: string;
  #aggregator: string;
  #epochs: number;

  constructor(cfg: WalrusConfig = {}) {
    this.#publisher = cfg.publisher ?? "https://publisher.walrus-testnet.walrus.space";
    this.#aggregator = cfg.aggregator ?? "https://aggregator.walrus-testnet.walrus.space";
    this.#epochs = cfg.epochs ?? 1;
  }

  async store(bytes: Uint8Array): Promise<string> {
    const res = await fetch(`${this.#publisher}/v1/blobs?epochs=${this.#epochs}`, {
      method: "PUT",
      headers: { "User-Agent": BROWSER_UA },
      body: bytes,
    });
    if (!res.ok) throw new Error(`walrus store failed: ${res.status}`);
    const body: any = await res.json();
    const obj = body.newlyCreated?.blobObject ?? body.alreadyCertified;
    const blobId = obj?.blobId;
    if (!blobId) throw new Error(`walrus store: no blobId in response`);
    return blobId;
  }

  async read(blobId: string): Promise<Uint8Array> {
    // Newly-stored blobs can take a few seconds to propagate to the aggregator;
    // retry with backoff so reads soon after a store don't flake.
    let lastStatus = 0;
    for (let attempt = 0; attempt < 5; attempt++) {
      const res = await fetch(`${this.#aggregator}/v1/blobs/${blobId}`, {
        headers: { "User-Agent": BROWSER_UA },
      });
      if (res.ok) return new Uint8Array(await res.arrayBuffer());
      lastStatus = res.status;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
    throw new Error(`walrus read failed: ${lastStatus}`);
  }
}

/** In-memory blob store mirroring Walrus semantics (immutable, content-addressed). */
export class InMemoryBlobStore implements BlobStore {
  #m = new Map<string, Uint8Array>();
  async store(bytes: Uint8Array): Promise<string> {
    const { createHash } = await import("node:crypto");
    const id = createHash("sha256").update(bytes).digest("base64url");
    this.#m.set(id, bytes);
    return id;
  }
  async read(blobId: string): Promise<Uint8Array> {
    const b = this.#m.get(blobId);
    if (!b) throw new Error(`blob ${blobId} not found`);
    return b;
  }
}

export const encodeJSON = (v: unknown): Uint8Array => new TextEncoder().encode(JSON.stringify(v));
export const decodeJSON = <T>(b: Uint8Array): T => JSON.parse(new TextDecoder().decode(b)) as T;

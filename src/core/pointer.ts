/**
 * The mutable cell the blackboard needs. Walrus blobs are immutable +
 * content-addressed (probe finding), so "which blobId is current canon" / "the
 * head event of a soul" cannot live on Walrus. It lives here — backed by a Sui
 * on-chain object in production, so ownership + tamper-evidence extend to the
 * pointer too.
 */
export interface PointerStore {
  get(key: string): Promise<string | null>;
  /** Optimistic-concurrency set. If `expected` is given and doesn't match, throw. */
  set(key: string, value: string, expected?: string | null): Promise<void>;
}

export class PointerConflictError extends Error {
  constructor(key: string) {
    super(`pointer ${key} changed under us (CAS failed)`);
    this.name = "PointerConflictError";
  }
}

/** In-process pointer cell for local dev/tests. */
export class InMemoryPointerStore implements PointerStore {
  #m = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.#m.get(key) ?? null;
  }

  async set(key: string, value: string, expected?: string | null): Promise<void> {
    if (expected !== undefined) {
      const cur = this.#m.get(key) ?? null;
      if (cur !== expected) throw new PointerConflictError(key);
    }
    this.#m.set(key, value);
  }
}

export interface SuiPointerConfig {
  packageId: string; // published blackboard package
  objectId: string; // the shared Blackboard object
  rpcUrl?: string; // defaults to testnet fullnode
  privateKey: string; // suiprivkey1... bech32 (the authority key)
}

/**
 * Sui-backed pointer cell. Reads via devInspect (no gas); writes are Move calls
 * to `blackboard::set`, which enforces compare-and-swap on-chain. This is the
 * mutable surface the blackboard needs (current canon blobId, log head, cursor)
 * that cannot live on immutable Walrus. Lazy-imports @mysten/sui so the optional
 * dep isn't required for in-memory runs.
 */
export class SuiPointerStore implements PointerStore {
  #cfg: SuiPointerConfig;
  #ready: Promise<{ client: any; keypair: any; bcs: any; sender: string }>;

  constructor(cfg: SuiPointerConfig) {
    this.#cfg = cfg;
    this.#ready = (async () => {
      const { SuiJsonRpcClient, getJsonRpcFullnodeUrl } = await import("@mysten/sui/jsonRpc");
      const { Ed25519Keypair } = await import("@mysten/sui/keypairs/ed25519");
      const { bcs } = await import("@mysten/sui/bcs");
      const client = new SuiJsonRpcClient({
        network: "testnet",
        url: cfg.rpcUrl ?? getJsonRpcFullnodeUrl("testnet"),
      });
      const keypair = Ed25519Keypair.fromSecretKey(cfg.privateKey);
      return { client, keypair, bcs, sender: keypair.getPublicKey().toSuiAddress() };
    })();
  }

  async get(key: string): Promise<string | null> {
    const { client, bcs, sender } = await this.#ready;
    const { Transaction } = await import("@mysten/sui/transactions");
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.#cfg.packageId}::blackboard::get`,
      arguments: [tx.object(this.#cfg.objectId), tx.pure.string(key)],
    });
    const res = await client.devInspectTransactionBlock({ sender, transactionBlock: tx });
    const rv = res?.results?.[0]?.returnValues?.[0];
    if (!rv) return null;
    const bytes = Uint8Array.from(rv[0] as number[]);
    const opt = bcs.option(bcs.string()).parse(bytes); // Option<String>
    return opt ?? null;
  }

  async set(key: string, value: string, expected?: string | null): Promise<void> {
    const { client, keypair } = await this.#ready;
    const { Transaction } = await import("@mysten/sui/transactions");
    // undefined → unconditional; null → expect absent (empty); string → expect that value.
    const hasExpected = expected !== undefined;
    const expectedStr = expected == null ? "" : expected;

    const tx = new Transaction();
    tx.moveCall({
      target: `${this.#cfg.packageId}::blackboard::set`,
      arguments: [
        tx.object(this.#cfg.objectId),
        tx.pure.string(key),
        tx.pure.string(value),
        tx.pure.bool(hasExpected),
        tx.pure.string(expectedStr),
      ],
    });
    let res: any;
    try {
      res = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options: { showEffects: true },
      });
      // Block until the fullnode has indexed this txn so the next txn doesn't
      // build on a stale gas-coin / shared-object version (sequential safety).
      if (res?.digest) await client.waitForTransaction({ digest: res.digest });
    } catch (e) {
      // The Move CAS guard aborts with E_CAS (code 1); 2.x throws on execution failure.
      if (/MoveAbort.*abort code: 1\b/.test(String((e as Error).message))) {
        throw new PointerConflictError(key);
      }
      throw e;
    }
    if (res?.effects?.status?.status !== "success") {
      throw new PointerConflictError(key);
    }
  }
}

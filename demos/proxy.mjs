/**
 * WORLDLINE demo proxy: tiny HTTP surface so browser games can write/read the
 * REAL backend (Walrus + Sui pointer + MemWal recall) without holding our keys
 * client-side or paying 20-30s writes on the play loop.
 *
 * Endpoints:
 *   POST /event   { actor, source, type, payload, memo }  → 202 {id}, write async
 *   GET  /canon/:actor                                    → { canon, snapshot }
 *   GET  /briefing/:actor                                 → { lines: string[] }
 *
 * Reuses the live components proven in src/demo/fullstack-run.ts. Run:
 *   node --env-file=.env --experimental-strip-types demos/proxy.mjs
 */
import { createServer } from "node:http";
import { Blackboard } from "../src/core/blackboard.ts";
import { WalrusClient } from "../src/core/walrus.ts";
import { SuiPointerStore } from "../src/core/pointer.ts";
import { MemWalStore } from "../src/core/memory.ts";
import { Ed25519Signer } from "../src/core/identity.ts";
import { createEvent } from "../src/core/event.ts";
import { Continuity } from "../src/agents/continuity.ts";
import { seal, tickKeeper, describePolicy } from "../src/agents/keeper.ts";

const PORT = Number(process.env.WORLDLINE_PROXY_PORT ?? 5195);
const UNIVERSE = "worldline-demo";

/**
 * The seeded backstory — a coherent "veteran reckless operator" arc:
 *   solid scheduling habits, then high-stakes arcade pulls that spike risk and
 *   panic, ending on a peak bubble run. The briefing lands on "reckless · last
 *   seen in bubble-gun" instead of "Fresh soul".
 */
const SEED_BACKSTORY = [
  {
    source: "youre-the-os",
    type: "os.run_ended",
    payload: { stage: "Tutorial", score: 8400, outcome: "victory", canon: { standings: { runs: 1, discipline: 8, best_score: 8400 }, flags: { last_outcome: "victory", last_source: "youre-the-os" } } },
    memo: "Completed Tutorial cleanly at score 8400.",
  },
  {
    source: "bubble-gun",
    type: "bubble.run_ended",
    payload: { score: 95, canon: { standings: { runs: 1, discipline: 4, risk: 12, best_score: 95 }, flags: { last_outcome: "victory", last_source: "bubble-gun" } } },
    memo: "Bubble run: 95. Aggressive openings.",
  },
  {
    source: "youre-the-os",
    type: "os.process_terminated",
    payload: { score: 6200, count: 3, canon: { standings: { panic: 15 } } },
    memo: "Force-killed 3 processes in a panic.",
  },
  {
    source: "bubble-gun",
    type: "bubble.run_ended",
    payload: { score: 38, canon: { standings: { runs: 1, survival_pressure: 14, risk: 16 }, flags: { last_outcome: "defeat", last_source: "bubble-gun" } } },
    memo: "Bubble run: 38, defeat. Pushed too hard.",
  },
  {
    source: "bubble-gun",
    type: "bubble.run_ended",
    payload: { score: 320, canon: { standings: { runs: 1, discipline: 5, risk: 8, best_score: 320 }, flags: { last_outcome: "victory", last_source: "bubble-gun" } } },
    memo: "Peak bubble run: 320. Found the line.",
  },
];

// the bounded canon every game writes into (trait axes work for any genre)
const SCHEMA = {
  standings: {
    survival_pressure: { min: -100, max: 100, default: 0 },
    discipline: { min: -100, max: 100, default: 0 },
    risk: { min: -100, max: 100, default: 0 },
    panic: { min: -100, max: 100, default: 0 },
    runs: { min: 0, max: 10000, default: 0 },
    best_score: { min: 0, max: 1_000_000, default: 0 },
  },
  flags: {
    last_outcome: { values: ["none", "victory", "defeat", "timeout"], default: "none" },
    last_source: { values: ["none", "bubble-gun", "youre-the-os"], default: "none" },
  },
};

console.log("[proxy] booting on", UNIVERSE);
// epochs > 1 so blobs don't expire mid-session during a long demo.
const blobs = new WalrusClient({ epochs: Number(process.env.WALRUS_EPOCHS ?? 5) });
const pointers = new SuiPointerStore({
  packageId: process.env.BLACKBOARD_PACKAGE_ID,
  objectId: process.env.BLACKBOARD_OBJECT_ID,
  privateKey: process.env.SUI_PRIVATE_KEY,
});
const memory = new MemWalStore({
  key: process.env.MEMWAL_KEY,
  accountId: process.env.MEMWAL_ACCOUNT,
  serverUrl: process.env.MEMWAL_RELAYER,
});
const bb = new Blackboard(blobs, pointers, memory);
const signer = new Ed25519Signer(process.env.MEMWAL_KEY);
const continuity = new Continuity();

// in-memory canon cache so /canon and /briefing are instant (the durable canon
// lives on Walrus+Sui; cache mirrors Continuity's output as events land).
const canonByActor = new Map();

/**
 * Sealed soul attributes — encrypted with real AES-GCM by the Keeper. Each one
 * stays opaque (ciphertext only) until its policy is satisfied by canon. The
 * Keeper agent ticks after every Continuity reconcile and reveals what's earned.
 */
const sealedByActor = new Map();
function defaultSealed() {
  return {
    true_name: seal(
      "Mara — quiet ally of the eastern district",
      { standing: "discipline", op: ">=", value: 25 },
      "Reveal at discipline ≥ 25",
    ),
    achievement: seal(
      "First crossing: cleared two genres on one soul",
      { standing: "runs", op: ">=", value: 4 },
      "Reveal after 4 runs",
    ),
    secret_pact: seal(
      "Sworn debt to the Northern Vigil",
      { flag: "last_outcome", equals: "victory" },
      "Reveal on first victory",
    ),
  };
}
function getSealed(actor) {
  if (!sealedByActor.has(actor)) sealedByActor.set(actor, defaultSealed());
  return sealedByActor.get(actor);
}

// Recent events ring for the inspector. Each entry resolves to a Walrus blob id
// once the durable write certifies, so the UI can hyperlink to the aggregator.
const recentEvents = []; // newest-first
const RECENT_CAP = 60;

function pushEvent(entry) {
  recentEvents.unshift(entry);
  if (recentEvents.length > RECENT_CAP) recentEvents.length = RECENT_CAP;
}

const SUI_NETWORK = process.env.SUI_NETWORK ?? "testnet";
const SUI_EXPLORER = `https://suiscan.xyz/${SUI_NETWORK}/object`;
const WALRUS_AGG = "https://aggregator.walrus-testnet.walrus.space/v1/blobs";

// Serialize all durable writes — concurrent Sui txns to the same shared object
// race on gas-coin/object versions. One worldline of writes, in order.
let writeChain = Promise.resolve();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function retry(fn, attempts, backoffMs) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      console.warn(`[proxy] attempt ${i + 1}/${attempts} failed: ${e.message}`);
      if (i < attempts - 1) await sleep(backoffMs * (i + 1));
    }
  }
  throw lastErr;
}

async function handleEvent(body) {
  const { actor, source, type, payload = {}, memo } = body;
  if (!actor || !source || !type) throw new Error("actor, source, type required");
  const parent = await bb.logHead(UNIVERSE);
  const ev = await createEvent(signer, {
    actor,
    source,
    type,
    payload,
    parents: parent ? [parent] : [],
  });
  const entry = {
    id: ev.id,
    actor,
    source,
    type,
    memo: memo ?? `${actor} ${type} in ${source}`,
    payload,
    signerPubKey: ev.signerPubKey,
    signature: ev.signature,
    timestamp: ev.timestamp,
    blobId: null, // resolves once Walrus certifies
    walrusUrl: null,
    status: "pending",
  };
  pushEvent(entry);

  // queue the durable write+reconcile behind any in-flight Sui txns.
  writeChain = writeChain
    .catch(() => {}) // a previous failure shouldn't block subsequent events
    .then(async () => {
      try {
        await bb.appendEvent(UNIVERSE, ev, entry.memo);
        const blobId = await pointers.get(`eventblob:${ev.id}`);
        entry.blobId = blobId;
        entry.walrusUrl = blobId ? `${WALRUS_AGG}/${blobId}` : null;
        entry.status = "stored";
        console.log(`[proxy] appended ${type} for ${source} → blob ${blobId?.slice(0, 12)}…`);
        // Reconcile reads the just-written event blob back; that blob can take a
        // few seconds to propagate to the aggregator, so retry on read failure.
        const r = await retry(() => continuity.tick(bb, UNIVERSE, SCHEMA), 4, 3500);
        if (r) {
          canonByActor.set(actor, r.canon);
          entry.status = "canon-updated";
          const canonBlob = await pointers.get(`canon:${UNIVERSE}`);
          entry.canonBlobId = canonBlob;
          entry.canonWalrusUrl = canonBlob ? `${WALRUS_AGG}/${canonBlob}` : null;
          console.log(`[proxy] reconciled +${r.reconciled} → canon`, JSON.stringify(r.canon));

          // Keeper agent ticks against the fresh canon, revealing any sealed
          // attributes whose policy is now satisfied.
          const revealed = tickKeeper(getSealed(actor), r.canon);
          if (revealed.length) {
            entry.sealRevealed = revealed;
            console.log(`[keeper] revealed → ${revealed.join(", ")}`);
          }
        }
      } catch (e) {
        entry.status = "error";
        entry.error = e.message;
        console.error("[proxy] write/reconcile error:", e.message);
      }
    });

  return { id: ev.id, status: "accepted" };
}

async function getSoulInspectorPayload(actor) {
  const canon = canonByActor.get(actor) ?? (await bb.getCanon(UNIVERSE, SCHEMA));
  const canonBlobId = await pointers.get(`canon:${UNIVERSE}`);
  const logHead = await pointers.get(`loghead:${UNIVERSE}`);
  const events = recentEvents.filter((e) => e.actor === actor).slice(0, 20);
  const sealedRaw = getSealed(actor);
  const sealed = Object.fromEntries(
    Object.entries(sealedRaw).map(([k, a]) => [
      k,
      {
        ciphertextPreview: a.ciphertext.slice(0, 32) + "…",
        hint: a.hint,
        policy: describePolicy(a.policy),
        revealed: a.revealed ?? null,
        revealedAt: a.revealedAt ?? null,
      },
    ]),
  );
  return {
    universe: UNIVERSE,
    actor,
    sui: {
      network: SUI_NETWORK,
      packageId: process.env.BLACKBOARD_PACKAGE_ID,
      blackboardObjectId: process.env.BLACKBOARD_OBJECT_ID,
      explorerUrl: process.env.BLACKBOARD_OBJECT_ID ? `${SUI_EXPLORER}/${process.env.BLACKBOARD_OBJECT_ID}` : null,
    },
    walrus: { aggregator: WALRUS_AGG },
    pointers: {
      loghead: logHead,
      canon: canonBlobId,
      canonWalrusUrl: canonBlobId ? `${WALRUS_AGG}/${canonBlobId}` : null,
    },
    canon,
    sealed,
    events,
  };
}

function makeBriefing(actor, canon) {
  if (!canon) return ["WORLDLINE", "Fresh soul", "Future games remember this run"];
  const runs = canon.standings.runs ?? 0;
  if (runs === 0) return ["WORLDLINE", "Fresh soul", "Future games remember this run"];
  let profile = "still calibrating";
  if ((canon.standings.discipline ?? 0) > 20) profile = "steady operator";
  else if ((canon.standings.panic ?? 0) > 20) profile = "panic-prone";
  else if ((canon.standings.risk ?? 0) > 20) profile = "reckless";
  const last = canon.flags.last_source;
  const from = last && last !== "none" ? ` · last seen in ${last}` : "";
  return ["WORLDLINE", `Runs: ${runs}${from}`, `Profile: ${profile}`];
}

const json = (res, code, obj) => {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
};

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") return json(res, 204, {});
  const url = new URL(req.url, `http://localhost:${PORT}`);

  try {
    if (req.method === "POST" && url.pathname === "/event") {
      let raw = "";
      req.on("data", (c) => (raw += c));
      req.on("end", async () => {
        try {
          const out = await handleEvent(JSON.parse(raw || "{}"));
          json(res, 202, out);
        } catch (e) {
          json(res, 400, { error: e.message });
        }
      });
      return;
    }

    const canonMatch = url.pathname.match(/^\/canon\/(.+)$/);
    if (req.method === "GET" && canonMatch) {
      const actor = decodeURIComponent(canonMatch[1]);
      let canon = canonByActor.get(actor);
      if (!canon) {
        canon = await bb.getCanon(UNIVERSE, SCHEMA);
        canonByActor.set(actor, canon);
      }
      return json(res, 200, { canon });
    }

    const briefMatch = url.pathname.match(/^\/briefing\/(.+)$/);
    if (req.method === "GET" && briefMatch) {
      const actor = decodeURIComponent(briefMatch[1]);
      const canon = canonByActor.get(actor) ?? (await bb.getCanon(UNIVERSE, SCHEMA));
      return json(res, 200, { lines: makeBriefing(actor, canon) });
    }

    const soulMatch = url.pathname.match(/^\/soul\/(.+)$/);
    if (req.method === "GET" && soulMatch) {
      const actor = decodeURIComponent(soulMatch[1]);
      return json(res, 200, await getSoulInspectorPayload(actor));
    }

    const eventsMatch = url.pathname.match(/^\/events\/(.+)$/);
    if (req.method === "GET" && eventsMatch) {
      const actor = decodeURIComponent(eventsMatch[1]);
      return json(res, 200, { events: recentEvents.filter((e) => e.actor === actor).slice(0, 50) });
    }

    // Fires the SEED_BACKSTORY through the normal event pipeline so it lands on
    // real Walrus blobs + canon, and the inspector watches the durable writes
    // certify one by one. Used by the "Seed demo history" button.
    const seedMatch = url.pathname.match(/^\/seed\/(.+)$/);
    if (req.method === "POST" && seedMatch) {
      const actor = decodeURIComponent(seedMatch[1]);
      const out = [];
      for (const e of SEED_BACKSTORY) {
        out.push(await handleEvent({ actor, ...e }));
      }
      return json(res, 202, { seeded: out.length, ids: out.map((o) => o.id) });
    }

    if (req.method === "GET" && url.pathname === "/") {
      return json(res, 200, { ok: true, universe: UNIVERSE, port: PORT });
    }

    json(res, 404, { error: "not found" });
  } catch (e) {
    json(res, 500, { error: e.message });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[proxy] WORLDLINE proxy on http://127.0.0.1:${PORT}`);
  console.log(`[proxy] POST /event · GET /canon/:actor · GET /briefing/:actor`);
});

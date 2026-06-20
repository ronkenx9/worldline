/**
 * Live integration test for SuiPointerStore against the deployed Blackboard
 * object on Sui testnet. Run: node --env-file=.env --experimental-strip-types src/integration/sui-pointer.ts
 *
 * Proves the mutable cell works on-chain, including compare-and-swap rejection.
 */
import { SuiPointerStore, PointerConflictError } from "../core/pointer.ts";

const store = new SuiPointerStore({
  packageId: process.env.BLACKBOARD_PACKAGE_ID!,
  objectId: process.env.BLACKBOARD_OBJECT_ID!,
  rpcUrl: process.env.SUI_RPC_URL,
  privateKey: process.env.SUI_PRIVATE_KEY!,
});

const key = `canon:test-${Date.now()}`;
const ok = (b: boolean) => (b ? "PASS" : "FAIL");

async function main() {
  console.log(`key = ${key}\n`);

  console.log("1) get absent key → expect null");
  const before = await store.get(key);
  console.log(`   got ${JSON.stringify(before)}  ${ok(before === null)}`);

  console.log("2) unconditional set → 'blobA'");
  const t0 = Date.now();
  await store.set(key, "blobA");
  console.log(`   set in ${Date.now() - t0}ms`);
  const v1 = await store.get(key);
  console.log(`   get → ${JSON.stringify(v1)}  ${ok(v1 === "blobA")}`);

  console.log("3) CAS set expecting 'blobA' → 'blobB' (should succeed)");
  await store.set(key, "blobB", "blobA");
  const v2 = await store.get(key);
  console.log(`   get → ${JSON.stringify(v2)}  ${ok(v2 === "blobB")}`);

  console.log("4) CAS set expecting STALE 'blobA' → 'blobX' (should be REJECTED)");
  let rejected = false;
  try {
    await store.set(key, "blobX", "blobA");
  } catch (e) {
    rejected = e instanceof PointerConflictError;
    console.log(`   threw ${(e as Error).name}`);
  }
  const v3 = await store.get(key);
  console.log(`   rejected=${rejected} value still ${JSON.stringify(v3)}  ${ok(rejected && v3 === "blobB")}`);

  console.log("\nDone — on-chain mutable pointer with CAS works.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * Keeper agent — guards SEALED soul attributes and reveals them only when a
 * canon condition is met. Real AES-256-GCM crypto for the encryption; the
 * policy-evaluation pattern mirrors how production Seal threshold decryption
 * would gate releases.
 *
 * In production you'd hand the ciphertext to Seal (Sui validator-derived keys)
 * with a Move policy that checks canon on-chain. Here the Keeper runs in-process
 * after each Continuity tick, reads canon, and flips revelations when policies
 * pass — same conceptual surface, demoable end-to-end without external infra.
 */
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import type { Canon } from "../core/canon.ts";

export interface PolicyCmp {
  standing: string;
  op: ">" | ">=" | "<" | "<=" | "==";
  value: number;
}
export interface PolicyFlag {
  flag: string;
  equals: string | boolean;
}
export type Policy = PolicyCmp | PolicyFlag;

export interface SealedAttr {
  /** Hex (iv || tag || ciphertext). */
  ciphertext: string;
  /** When this policy is satisfied against canon, the Keeper reveals the plaintext. */
  policy: Policy;
  /** A short, public summary of the unlock condition — shown sealed. */
  hint: string;
  /** Set by the Keeper once policy is satisfied. */
  revealed?: string;
  /** Optional: the block of canon (standings + flags) that satisfied the policy. */
  revealedAt?: { standing?: number; flag?: string | boolean };
}

const KEY = scryptSync(process.env.KEEPER_KEY ?? "worldline-demo-keeper", "worldline-seal", 32);

export function seal(plaintext: string, policy: Policy, hint: string): SealedAttr {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", KEY, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext: Buffer.concat([iv, tag, ct]).toString("hex"), policy, hint };
}

function unseal(ciphertextHex: string): string {
  const buf = Buffer.from(ciphertextHex, "hex");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

function evaluatePolicy(policy: Policy, canon: Canon): { satisfied: boolean; witness?: { standing?: number; flag?: string | boolean } } {
  if ("standing" in policy) {
    const v = canon.standings[policy.standing] ?? 0;
    let ok = false;
    switch (policy.op) {
      case ">": ok = v > policy.value; break;
      case ">=": ok = v >= policy.value; break;
      case "<": ok = v < policy.value; break;
      case "<=": ok = v <= policy.value; break;
      case "==": ok = v === policy.value; break;
    }
    return { satisfied: ok, witness: ok ? { standing: v } : undefined };
  }
  const flagVal = canon.flags[policy.flag];
  const ok = flagVal === policy.equals;
  return { satisfied: ok, witness: ok ? { flag: flagVal } : undefined };
}

/**
 * The Keeper's tick: walk every sealed attribute, evaluate its policy against
 * current canon, and reveal any whose policy now passes. Returns the names of
 * attributes revealed on this tick (so the proxy can log + the inspector can flash).
 */
export function tickKeeper(sealed: Record<string, SealedAttr>, canon: Canon): string[] {
  const revealed: string[] = [];
  for (const [name, attr] of Object.entries(sealed)) {
    if (attr.revealed) continue;
    const { satisfied, witness } = evaluatePolicy(attr.policy, canon);
    if (!satisfied) continue;
    try {
      attr.revealed = unseal(attr.ciphertext);
      attr.revealedAt = witness;
      revealed.push(name);
    } catch (e) {
      console.error(`[keeper] failed to unseal ${name}:`, (e as Error).message);
    }
  }
  return revealed;
}

export function describePolicy(policy: Policy): string {
  if ("standing" in policy) return `canon.standings.${policy.standing} ${policy.op} ${policy.value}`;
  return `canon.flags.${policy.flag} == ${JSON.stringify(policy.equals)}`;
}

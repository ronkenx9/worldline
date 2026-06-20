import { createHash } from "node:crypto";

/**
 * Deterministic JSON: object keys sorted recursively, so the same logical value
 * always serializes to the same bytes. Required for content-addressed event ids
 * and signatures to be stable across machines.
 */
export function canonicalJSON(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      out[k] = sortKeys((value as Record<string, unknown>)[k]);
    }
    return out;
  }
  return value;
}

/** sha256 hex of the canonical encoding of `value`. */
export function contentHash(value: unknown): string {
  return createHash("sha256").update(canonicalJSON(value)).digest("hex");
}

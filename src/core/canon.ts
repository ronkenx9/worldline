import type { Event } from "./event.ts";

/**
 * Canon = the reconciled shared truth of a universe. Deliberately small and
 * bounded so reconciliation is real (reasoned, not last-write-wins) yet
 * demoable. Schema is universe-defined; a default is provided.
 */
export interface NumericRange {
  min: number;
  max: number;
  default: number;
}
export interface FlagSpec {
  values: string[] | "boolean";
  default: string | boolean;
}

export interface CanonSchema {
  standings: Record<string, NumericRange>;
  flags: Record<string, FlagSpec>;
}

export interface Canon {
  standings: Record<string, number>;
  flags: Record<string, string | boolean>;
}

/** Illustrative default — universes should declare their own and override this. */
export const DEFAULT_CANON_SCHEMA: CanonSchema = {
  standings: {},
  flags: {},
};

export function emptyCanon(schema: CanonSchema): Canon {
  const standings: Record<string, number> = {};
  for (const [k, r] of Object.entries(schema.standings)) standings[k] = r.default;
  const flags: Record<string, string | boolean> = {};
  for (const [k, f] of Object.entries(schema.flags)) flags[k] = f.default;
  return { standings, flags };
}

const clamp = (n: number, r: NumericRange) => Math.max(r.min, Math.min(r.max, n));

/**
 * Reconciles a batch of new events into the next canon. The ONLY writer of canon
 * is the Continuity agent, which calls a policy of this shape. Replaceable with
 * an LLM-backed reasoner; the default interprets a conventional payload shape:
 *
 *   payload.canon = { standings?: { <key>: <delta> }, flags?: { <key>: <value> } }
 *
 * This is more than last-write-wins (standing deltas accumulate and clamp), and
 * is the seam where DM-style judgment plugs in.
 */
export type ReconcilePolicy = (
  events: Event[],
  current: Canon,
  schema: CanonSchema,
) => Canon | Promise<Canon>;

export const defaultReconcile: ReconcilePolicy = (events, current, schema) => {
  const next: Canon = {
    standings: { ...current.standings },
    flags: { ...current.flags },
  };
  for (const ev of events) {
    const patch = (ev.payload as any)?.canon;
    if (!patch) continue;
    for (const [k, delta] of Object.entries(patch.standings ?? {})) {
      const range = schema.standings[k];
      if (!range || typeof delta !== "number") continue;
      next.standings[k] = clamp((next.standings[k] ?? range.default) + delta, range);
    }
    for (const [k, value] of Object.entries(patch.flags ?? {})) {
      if (!(k in schema.flags)) continue;
      next.flags[k] = value as string | boolean;
    }
  }
  return next;
};

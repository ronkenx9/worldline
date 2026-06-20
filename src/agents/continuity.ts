import type { Blackboard } from "../core/blackboard.ts";
import { type Canon, type CanonSchema, type ReconcilePolicy, defaultReconcile } from "../core/canon.ts";

export interface ContinuityResult {
  reconciled: number; // events consumed this tick
  canon: Canon;
}

/**
 * The only writer of canon. Consumes new events from the blackboard, reconciles
 * contradictions into coherent world-truth via a policy (reasoned, not
 * last-write-wins), and advances its cursor. Coordinates with the GMs only
 * through the shared state — it holds no reference to them.
 */
export class Continuity {
  private policy: ReconcilePolicy;

  constructor(policy: ReconcilePolicy = defaultReconcile) {
    this.policy = policy;
  }

  async tick(bb: Blackboard, universe: string, schema: CanonSchema): Promise<ContinuityResult> {
    const cursor = await bb.getCursor(universe);
    const events = await bb.eventsSince(universe, cursor);
    const current = await bb.getCanon(universe, schema);
    if (events.length === 0) return { reconciled: 0, canon: current };

    const next = await this.policy(events, current, schema);
    await bb.setCanon(universe, next);
    await bb.setCursor(universe, events[events.length - 1]!.id);
    return { reconciled: events.length, canon: next };
  }
}

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
    const head = await bb.logHead(universe);
    const current = await bb.getCanon(universe, schema);
    if (!head || head === cursor) return { reconciled: 0, canon: current };

    const events = await bb.eventsSince(universe, cursor);
    let canon = current;
    if (events.length > 0) {
      canon = await this.policy(events, current, schema);
      await bb.setCanon(universe, canon);
    }
    // Advance to the log tip even if some events were unreadable/skipped, so an
    // expired or slow-to-propagate blob can't poison the cursor and stall every
    // future tick. (Writes are serialized upstream, so `head` is stable here.)
    await bb.setCursor(universe, head);
    return { reconciled: events.length, canon };
  }
}

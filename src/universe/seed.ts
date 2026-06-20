/**
 * Pre-seed a Soul so a universe is alive on first touch. Seeds the DERIVED state
 * cheaply — bulk memories for recall + one starting canon — rather than
 * event-sourcing every historical beat on-chain (which would be dozens of slow
 * txns). Live play layers real signed events on top of this baseline.
 */
import type { Blackboard } from "../core/blackboard.ts";
import type { Canon } from "../core/canon.ts";

export async function seedSoul(
  bb: Blackboard,
  actor: string,
  universe: string,
  memories: string[],
  canon: Canon,
): Promise<void> {
  // Memories → semantic recall (MemWal bulk-friendly; here sequential is fine).
  for (const m of memories) await bb.rememberSoul(actor, m);
  // Starting canon baseline (prehistory). Continuity owns canon during live play.
  await bb.setCanon(universe, canon);
}

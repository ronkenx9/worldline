import { type Event, type ActorId, type SourceId, createEvent } from "../core/event.ts";
import type { Signer } from "../core/identity.ts";
import type { Blackboard } from "../core/blackboard.ts";
import type { Canon, CanonSchema } from "../core/canon.ts";
import type { RecallHit } from "../core/memory.ts";

/** Binds a gamemaster to one universe's shared state + signing authority. */
export interface Stage {
  blackboard: Blackboard;
  universe: string;
  schema: CanonSchema;
  signer: Signer; // the authority writing events (player delegate or agent key)
}

/** Reasoning context assembled from accumulated, *relevant* history. */
export interface GameContext {
  actor: ActorId;
  query: string;
  soul: RecallHit[]; // recalled cross-game history, not the whole log
  canon: Canon;
}

/** A decision the GM makes: one event, with a memo for recall and optional canon patch. */
export interface Intent {
  type: string;
  payload: unknown; // opaque to core; may carry { canon: { standings?, flags? } }
  memo: string; // human-readable summary for semantic recall
}

/** The pluggable judgment. Default impls are scripted; swap for an LLM call. */
export type Reasoner = (ctx: GameContext) => Intent[] | Promise<Intent[]>;

/**
 * Per-game agent. Authors its own game's experience: reads soul + canon,
 * reasons, emits events. Does NOT write canon (that's Continuity's sole job).
 */
export class Gamemaster {
  readonly source: SourceId;
  private reason: Reasoner;

  constructor(source: SourceId, reason: Reasoner) {
    this.source = source;
    this.reason = reason;
  }

  async act(stage: Stage, actor: ActorId, query: string): Promise<Event[]> {
    const { blackboard: bb, universe, schema, signer } = stage;
    const soul = await bb.recallSoul(actor, query, { topK: 5 });
    const canon = await bb.getCanon(universe, schema);
    const intents = await this.reason({ actor, query, soul, canon });

    const emitted: Event[] = [];
    for (const it of intents) {
      const parent = await bb.logHead(universe);
      const ev = await createEvent(signer, {
        actor,
        source: this.source,
        type: it.type,
        payload: it.payload,
        parents: parent ? [parent] : [],
      });
      await bb.appendEvent(universe, ev, it.memo);
      emitted.push(ev);
    }
    return emitted;
  }
}

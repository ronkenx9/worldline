import type { SourceId } from "./core/event.ts";
import type { Gamemaster } from "./agents/gamemaster.ts";

/**
 * A game plugs into the universe by implementing this and nothing more. The
 * core, Continuity, and the coordination layer are untouched. This registration
 * surface IS the SDK seam.
 */
export interface GameAdapter {
  source: SourceId; // unique id for this game
  eventTypes: string[]; // vocabulary it emits / cares about (documentation + validation)
  gamemaster: Gamemaster; // its authoring agent
  // rendering is entirely outside the core
}

export class AdapterRegistry {
  #m = new Map<SourceId, GameAdapter>();

  register(adapter: GameAdapter): this {
    if (this.#m.has(adapter.source)) throw new Error(`adapter ${adapter.source} already registered`);
    this.#m.set(adapter.source, adapter);
    return this;
  }

  get(source: SourceId): GameAdapter {
    const a = this.#m.get(source);
    if (!a) throw new Error(`no adapter registered for ${source}`);
    return a;
  }

  list(): GameAdapter[] {
    return [...this.#m.values()];
  }
}

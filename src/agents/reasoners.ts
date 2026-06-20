/**
 * LLM-backed reasoning seams. These turn the scripted Gamemaster/Continuity into
 * agents that actually *reason* over accumulated memory + canon — which is what
 * separates this from a rule engine (the "is the AI decorative?" critique).
 */
import type { Reasoner, Intent } from "./gamemaster.ts";
import type { ReconcilePolicy, Canon, CanonSchema } from "../core/canon.ts";
import { emptyCanon } from "../core/canon.ts";
import { type LLM, extractJSON } from "./llm.ts";

/** A game's flavor — fed to its gamemaster so different games feel different. */
export interface GamePersona {
  source: string;
  description: string; // genre, tone, what the game is about
}

/** Gamemaster reasoner: act as this game's DM, decide consequences, emit intents. */
export function llmGamemasterReasoner(llm: LLM, persona: GamePersona): Reasoner {
  const system = [
    `You are the gamemaster (DM) for the game "${persona.source}". ${persona.description}`,
    `You read a player's cross-game history and the shared world canon, then decide what happens in YOUR game now.`,
    `Reason like a DM: let the player's past and the current canon shape real consequences.`,
    `Return ONLY a JSON array of intents. Each intent:`,
    `  { "type": string, "payload": object, "memo": string }`,
    `- payload MAY include a canon patch: {"canon":{"standings":{"<key>":<number delta>},"flags":{"<key>":<value>}}}`,
    `- memo is ONE human-readable sentence summarizing what happened, written for future recall.`,
    `Keep it to 1-2 intents. No prose outside the JSON.`,
  ].join("\n");

  return async (ctx) => {
    const user = JSON.stringify(
      { actor: ctx.actor, query: ctx.query, recalledHistory: ctx.soul.map((h) => h.text), canon: ctx.canon },
      null,
      2,
    );
    const out = await llm.complete(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.7, maxTokens: 600 },
    );
    const parsed = extractJSON(out) as any[];
    if (!Array.isArray(parsed)) throw new Error("gamemaster reasoner: expected JSON array");
    return parsed.map(
      (it): Intent => ({
        type: String(it.type ?? "world.act"),
        payload: it.payload ?? {},
        memo: String(it.memo ?? `${ctx.actor} acted in ${persona.source}`),
      }),
    );
  };
}

/** Continuity policy: reconcile new events into next canon with judgment (not last-write-wins). */
export function llmReconcilePolicy(llm: LLM): ReconcilePolicy {
  return async (events, current, schema) => {
    const system = [
      `You are the Continuity agent — the SOLE authority on a game universe's canon.`,
      `You receive the current canon and new events from different games. Reconcile them into the NEXT canon,`,
      `resolving contradictions with judgment (a betrayal AND a later good deed net out; don't just take the latest).`,
      `You may ONLY use these canon keys and bounds:`,
      `  standings (numbers, clamp within [min,max]): ${JSON.stringify(schema.standings)}`,
      `  flags: ${JSON.stringify(schema.flags)}`,
      `Return ONLY JSON for the full next canon: {"standings":{...},"flags":{...}}. No prose.`,
    ].join("\n");
    const user = JSON.stringify(
      { currentCanon: current, newEvents: events.map((e) => ({ source: e.source, type: e.type, payload: e.payload })) },
      null,
      2,
    );
    const out = await llm.complete(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.2, maxTokens: 400 },
    );
    const parsed = extractJSON(out) as Partial<Canon>;
    return sanitizeCanon(parsed, current, schema);
  };
}

/** Trust nothing from the LLM: keep only schema keys, clamp ranges, fall back to current. */
function sanitizeCanon(candidate: Partial<Canon>, current: Canon, schema: CanonSchema): Canon {
  const next = emptyCanon(schema);
  for (const [k, range] of Object.entries(schema.standings)) {
    const raw = candidate?.standings?.[k];
    const base = typeof raw === "number" ? raw : (current.standings[k] ?? range.default);
    next.standings[k] = Math.max(range.min, Math.min(range.max, base));
  }
  for (const [k, spec] of Object.entries(schema.flags)) {
    const raw = candidate?.flags?.[k];
    next.flags[k] = raw !== undefined ? raw : (current.flags[k] ?? spec.default);
  }
  return next;
}

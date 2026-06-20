/**
 * A genre-NEUTRAL universe. The whole point of WORLDLINE is that the layer is
 * game-agnostic: the Soul is stored as portable behavioral primitives, and each
 * game's Gamemaster *localizes* them into its own setting. So the canon schema
 * here uses role-archetypes and trait axes any genre can project from — not
 * fantasy factions.
 *
 * Standings are with role-archetypes that map onto any setting:
 *   authority  → crown / corp / officials / stewards
 *   underworld → thieves / gangs / street crews
 *   market     → guilds / sponsors / merchants
 *   public     → peasants / citizens / fans
 *   guardians  → paladins / netwatch / a principled order
 */
import type { CanonSchema, Canon } from "../core/canon.ts";
import type { GamePersona } from "../agents/reasoners.ts";

export const NEUTRAL_SCHEMA: CanonSchema = {
  standings: {
    authority: { min: -100, max: 100, default: 0 },
    underworld: { min: -100, max: 100, default: 0 },
    market: { min: -100, max: 100, default: 0 },
    public: { min: -100, max: 100, default: 0 },
    guardians: { min: -100, max: 100, default: 0 },
  },
  // trait axes revealed by play — the most genre-portable signal
  // (every game can flavor NPCs off "low trust / reckless / ruthless").
  // stored as standings so the same reconcile/clamp machinery applies.
  // (kept separate conceptually; same numeric mechanics)
  flags: {
    marked: { values: "boolean", default: false }, // infamous for a specific betrayal
    indebted: { values: "boolean", default: false }, // owes a major debt
    decorated: { values: "boolean", default: false }, // honored by someone
    exiled_by: { values: ["none", "authority", "underworld", "market", "guardians"], default: "none" },
  },
};

// Trait axes live in the same standings map (numeric, clamped) — declared here so
// the seed and schema agree. Folded into the schema below.
for (const [k, range] of Object.entries({
  trait_trust: { min: -100, max: 100, default: 0 }, // keeps their word ↔ betrays
  trait_ruthlessness: { min: -100, max: 100, default: 0 }, // merciful ↔ ruthless
  trait_risk: { min: -100, max: 100, default: 0 }, // cautious ↔ reckless
  trait_loyalty: { min: -100, max: 100, default: 0 }, // steadfast ↔ self-serving
  notoriety: { min: 0, max: 100, default: 0 }, // how widely known
})) {
  NEUTRAL_SCHEMA.standings[k] = range;
}

/**
 * The seeded Soul — "The Oathbreaker", written as SETTING-NEUTRAL behavior.
 * No relics, no kingdoms. Each game's GM reskins these into its own world.
 */
export const SEED_MEMORIES: string[] = [
  "Rose to power inside a major authority by proving relentlessly capable, and was trusted with their most guarded asset.",
  "Betrayed that trust — took the guarded asset and vanished, purely for personal gain.",
  "Once spared someone defenseless when everyone expected ruthlessness; people still tell that story.",
  "Sold the stolen asset to a market power, who profited enormously and now quietly shields them.",
  "Is widely known across many circles — equal parts famous and infamous; few faces travel as far.",
  "Owes a heavy debt to the underworld crew that financed the original job, and they have not forgotten.",
  "A principled order has offered a way back — redemption, if the asset is ever returned.",
  "Wronged a former ally who vouched for them; that ally now warns others before they walk in.",
  "Once stood beside an operator named Mara, who still speaks for them in the right rooms.",
];

/** Starting canon — the reconciled baseline a new game encounters on first touch. */
export const SEED_CANON: Canon = {
  standings: {
    authority: -85, // the betrayal
    underworld: 20, // did business, but owed
    market: 30, // a profitable client
    public: 10, // the mercy story humanizes
    guardians: 15, // redemption offered, not yet earned
    trait_trust: -60,
    trait_ruthlessness: 20, // ruthless, with one famous exception
    trait_risk: 50,
    trait_loyalty: -40,
    notoriety: 80,
  },
  flags: {
    marked: true,
    indebted: true,
    decorated: false,
    exiled_by: "authority",
  },
};

/**
 * Two MAXIMALLY different genres sharing one Soul. Each persona tells its GM how
 * to localize the neutral primitives — and asks for a `scene` in the payload so
 * the localized consequence is legible.
 */
const SCENE_RULE =
  "In each intent's payload include a \"scene\": 1-2 vivid sentences describing what happens to the player IN THIS GAME'S SETTING, driven by their standings/traits/notoriety and history. Reskin the neutral history into your world.";

export const HEIST_GAME: GamePersona = {
  source: "nightfall",
  description:
    "A tense modern infiltration/heist game. The player assembles crews, buys information, bypasses security, and pulls off scores. NPCs are fixers, fences, inside men, and guards. " +
    SCENE_RULE,
};

export const COURT_GAME: GamePersona = {
  source: "highcourt",
  description:
    "A game of courtly politics and social maneuvering in a royal capital. The player seeks audiences, patrons, marriages of alliance, and standing among nobles and power-brokers. NPCs are courtiers, rivals, patrons, and heralds. " +
    SCENE_RULE,
};

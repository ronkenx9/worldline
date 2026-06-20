/**
 * The journey: a soul travels the worldline through four ELEMENTAL worlds —
 * Fire, Water, Ice, Earth — each a themed chapter of the WORLDLINE pitch. The
 * camera flies the curve and comes to rest inside each world; a full-bleed
 * themed room crossfades in over the zoom. Each world is a long, scrollable
 * environment (a page or two), not a panel.
 *
 * Camera, background tint, the colour room, and the content all derive from the
 * functions below, so the 3D and the DOM stay in lockstep.
 */
export type Element = "fire" | "water" | "ice" | "earth";

export interface Scene {
  heading: string;
  body: string;
  plain: string; // metaphor-free gloss so devs + first-timers get the literal mechanic
}

export interface World {
  t: number; // position along the worldline curve (0..1)
  element: Element;
  color: string; // EXACT room background colour at this world's stop
  ink: string; // text colour for legibility on `color`
  accent: string; // themed glow / accent
  chapter: string; // "CHAPTER I · FIRE"
  title: string;
  lede: string;
  scenes: Scene[]; // long-form themed content
  outro: string; // the line that hands off to the next world
}

export type StationPhase = "approach" | "inside" | "exit" | "travel" | "overview";

export interface StationState {
  worldIndex: number;
  phase: StationPhase;
  roomOpacity: number;
}

const LIGHT = "#f3ecdd";
const DARK = "#10110f";

export const WORLDS: World[] = [
  {
    t: 0.12,
    element: "fire",
    color: "#a8331a",
    ink: LIGHT,
    accent: "#ff7d3c",
    chapter: "CHAPTER I · FIRE",
    title: "The Forgetting",
    lede: "Every world you leave burns behind you.",
    scenes: [
      { heading: "A hundred hours, gone in a spark.", body: "You earn trust. You take on debt. You make a name that means something to the people around you. Then you close the tab — and the fire takes all of it.", plain: "Game saves are local. When you leave a game, its memory of what you did is gone." },
      { heading: "The next world meets a stranger.", body: "Its people start from zero. Its quests reset. The flame never remembers what it consumed, so neither does the game you walk into next.", plain: "No two games share your history. Every new game starts you from nothing." },
      { heading: "Identity survives. Story doesn't.", body: "A wallet carries over. A login carries over. But the soul behind them — the betrayals, the rescues, the reputation you bled for — turns to ash at the border.", plain: "Your account carries over between games. Your in-game actions and reputation do not." },
      { heading: "WORLDLINE keeps the ember.", body: "One glowing residue refuses to go out. The layer remembers what the fire would erase — selectively, verifiably — and carries it on into everything you play next.", plain: "WORLDLINE is a shared memory layer that stores your meaningful actions so any game can read them." },
    ],
    outro: "The ember drifts on, and cools, toward water.",
  },
  {
    t: 0.38,
    element: "water",
    color: "#125f73",
    ink: LIGHT,
    accent: "#5fd2e0",
    chapter: "CHAPTER II · WATER",
    title: "The Flow",
    lede: "What you did doesn't end. It flows.",
    scenes: [
      { heading: "Every act becomes a signed drop.", body: "A game doesn't pour out its whole state. It releases the meaningful pieces — who acted, what changed, what proof anchors it — as small, verifiable events in a shared current.", plain: "Games write key moments to WORLDLINE as small signed events — not their whole database." },
      { heading: "Worlds downstream drink the same water.", body: "They don't share a database. They share a canon: one current of truth that each world reads and renders in its own dialect.", plain: "Many games read the same shared record (the 'canon'). They never integrate with each other." },
      { heading: "Memory finds its level.", body: "Two worlds can disagree on the telling while agreeing on what happened. Conflicts reconcile instead of overwrite — nothing meaningful is lost in the flood.", plain: "Conflicting updates are reconciled, not overwritten: agreed facts, told differently per game." },
      { heading: "One memory, a thousand renderers.", body: "A farming sim, a dungeon crawler, a strategy game — each turns the same event into crops, into dialogue, into an enemy's old grudge.", plain: "Each game interprets a recalled event in its own mechanics — crops, dialogue, or AI behaviour." },
    ],
    outro: "The current slows. It begins to freeze.",
  },
  {
    t: 0.64,
    element: "ice",
    color: "#bcdde5",
    ink: DARK,
    accent: "#3b6f7d",
    chapter: "CHAPTER III · ICE",
    title: "The Proof",
    lede: "Betray one world. The next one already knows.",
    scenes: [
      { heading: "The moment freezes.", body: "Cross someone, and the act crystallizes — into a record no game can quietly melt, forge, or roll back.", plain: "Each action is recorded as tamper-evident, verifiable proof." },
      { heading: "A betrayal becomes a closed door.", body: "Knife an ally in a stealth game, and a trading world's guards turn you away at the gate. The same soul, read through ice-clear proof.", plain: "A consequence in one game can gate behaviour in another — from the same shared record." },
      { heading: "The cold keeps it honest.", body: "Events live as durable blobs; the live pointer advances by compare-and-swap, on-chain. Canon moves forward — never silently overwritten.", plain: "Memory is stored on Walrus (blobs) with a Sui pointer updated by on-chain compare-and-swap." },
      { heading: "Tamper-evident by nature.", body: "No studio has to vouch for another. They trust the proof, frozen in place, that anyone can stop and inspect.", plain: "Any game or player can independently verify the history. No one has to trust a studio." },
    ],
    outro: "The ice cracks. Below it — solid ground.",
  },
  {
    t: 0.9,
    element: "earth",
    color: "#5f4127",
    ink: LIGHT,
    accent: "#dca65f",
    chapter: "CHAPTER IV · EARTH",
    title: "The Foundation",
    lede: "Build your world on ground that remembers.",
    scenes: [
      { heading: "One adapter. That's the whole contract.", body: "Map your local events into canon, map recalled canon back into your mechanics. You integrate with the memory, not with every other studio.", plain: "Devs implement one adapter: emit events to WORLDLINE, and read canon back into the game." },
      { heading: "Keep creative control.", body: "WORLDLINE never dictates how your world renders a memory. It hands you verified inputs; your game decides what they mean.", plain: "You control how recalled memory appears in-game. WORLDLINE only supplies the verified data." },
      { heading: "Start with one stone.", body: "Ship a single event type — a debt, a betrayal, a rescue, a name — and stack more canon surfaces once the gameplay proves it matters.", plain: "Adopt incrementally: start with one event type, add more once it proves useful." },
      { heading: "Four worlds. One soul.", body: "Fire forgot you. Water carried you. Ice proved you. Earth lets anyone build on you. One continuous story — that is WORLDLINE.", plain: "WORLDLINE is a verifiable cross-game memory layer. One player identity, many games, one story." },
    ],
    outro: "One player. Many worlds. One continuous story.",
  },
];

export const N = WORLDS.length;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const smooth01 = (x: number) => {
  x = clamp01(x);
  return x * x * (3 - 2 * x);
};
/** GLSL-style smoothstep(edge0, edge1, x). */
export const smoothstep = (e0: number, e1: number, x: number) => smooth01((x - e0) / (e1 - e0));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// scroll-progress at which each world is centred (with intro/outro room)
export const worldP = (i: number) => 0.12 + 0.76 * ((i + 0.5) / N);
export const STOPS = WORLDS.map((_, i) => worldP(i));

const REST = 0.12; // camera distance when fully inside a world
const TRAVEL = 3.0; // how far it pulls back between worlds
const ENDS = 6.5; // pulled-back view at the very start/end
const EXIT_END = 0.26;
const APPROACH_START = 0.74;
const OVERVIEW_START = 0.36;

/** Camera position along the curve (camT) + distance behind it, for progress p. */
export function cameraStateAt(p: number): { camT: number; dist: number } {
  if (p <= STOPS[0]) {
    return { camT: WORLDS[0].t, dist: lerp(ENDS, REST, smooth01(p / STOPS[0])) };
  }
  if (p >= STOPS[N - 1]) {
    return { camT: WORLDS[N - 1].t, dist: lerp(REST, ENDS, smooth01((p - STOPS[N - 1]) / (1 - STOPS[N - 1]))) };
  }
  let k = 0;
  while (k < N - 2 && p >= STOPS[k + 1]) k++;
  const fr = (p - STOPS[k]) / (STOPS[k + 1] - STOPS[k]);
  return {
    camT: lerp(WORLDS[k].t, WORLDS[k + 1].t, smooth01(fr)),
    dist: REST + TRAVEL * Math.sin(fr * Math.PI),
  };
}

/** Index of the world the camera is nearest (drives current colour + content). */
export function worldIndexAt(p: number): number {
  const { camT } = cameraStateAt(p);
  let best = 0;
  let bd = Infinity;
  WORLDS.forEach((w, i) => {
    const d = Math.abs(w.t - camT);
    if (d < bd) {
      bd = d;
      best = i;
    }
  });
  return best;
}

/** Opacity of the flat colour page: 1 when inside a world, 0 while travelling. */
export const pageOpacity = (dist: number) => 1 - smoothstep(0.25, 1.15, dist);

/** Final pullback: 0 at the last room, 1 at the high full-map vantage point. */
export function overviewBlendAt(p: number): number {
  if (p < STOPS[N - 1]) return 0;
  return smoothstep(OVERVIEW_START, 1, (clamp01(p) - STOPS[N - 1]) / (1 - STOPS[N - 1]));
}

/**
 * Scroll-state for the page handoff. The active room stays locked to the world
 * being exited, goes fully away in mid-flight, then switches to the next world
 * only for the approach. This prevents mid-flight colour flicker.
 */
export function stationStateAt(p: number): StationState {
  p = clamp01(p);

  if (p <= STOPS[0]) {
    const roomOpacity = smoothstep(0.68, 1, p / STOPS[0]);
    return { worldIndex: 0, phase: roomOpacity >= 0.98 ? "inside" : "approach", roomOpacity };
  }

  if (p >= STOPS[N - 1]) {
    const fr = (p - STOPS[N - 1]) / (1 - STOPS[N - 1]);
    const roomOpacity = 1 - smoothstep(0, 0.3, fr);
    if (overviewBlendAt(p) >= 0.98) return { worldIndex: N - 1, phase: "overview", roomOpacity: 0 };
    return { worldIndex: N - 1, phase: roomOpacity >= 0.98 ? "inside" : roomOpacity > 0 ? "exit" : "travel", roomOpacity };
  }

  let k = 0;
  while (k < N - 2 && p >= STOPS[k + 1]) k++;
  const fr = (p - STOPS[k]) / (STOPS[k + 1] - STOPS[k]);

  if (fr <= EXIT_END) {
    const roomOpacity = 1 - smoothstep(0, EXIT_END, fr);
    return { worldIndex: k, phase: roomOpacity >= 0.98 ? "inside" : "exit", roomOpacity };
  }

  if (fr >= APPROACH_START) {
    const roomOpacity = smoothstep(APPROACH_START, 1, fr);
    return { worldIndex: k + 1, phase: roomOpacity >= 0.98 ? "inside" : "approach", roomOpacity };
  }

  return { worldIndex: k, phase: "travel", roomOpacity: 0 };
}

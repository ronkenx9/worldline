/**
 * The journey: a soul travels the worldline through four ELEMENTAL worlds —
 * Fire, Water, Ice, Earth — each an awwwards-tier themed chapter of the
 * WORLDLINE pitch (see WORLDS-BUILD-SPEC.md). Deep-dark palettes, white type,
 * the element name as a giant Moah-scale hero, text that behaves as the element.
 *
 * Camera, background tint, the colour room, and content all derive from the
 * functions below, so the 3D and the DOM stay in lockstep. The camera math is
 * stable — do not change it when restyling the worlds.
 */
export type Element = "fire" | "water" | "ice" | "earth";

export interface Scene {
  heading: string;
  body: string;
  plain: string; // metaphor-free gloss so devs + first-timers get the literal mechanic
  highlights?: string[]; // body words rendered in the element's glowing accent
}

export interface CarouselCard {
  label: string;
  body: string;
}

export interface World {
  t: number; // position along the worldline curve (0..1)
  element: Element;
  giant: string; // the colossal hero word (FIRE / WATER / ICE / EARTH)

  // deep-dark palette (white type rides on this)
  color: string; // representative room colour — 3D tint + crossfade handoff
  base: string; // darkest gradient stop (edges)
  mid: string; // mid gradient stop
  accent: string; // bright elemental glow / "Plainly" / highlights
  accentSoft: string; // secondary accent
  ink: string; // primary text colour (white on dark worlds, dark on Ice)
  inkMuted: string; // body / secondary text colour

  chapter: string; // "CHAPTER I · FIRE"
  title: string; // "The Forgetting"
  lede: string; // the bottom-left hero line (serif italic)
  plainLede: string; // plain one-liner that rides next to the poetic lede

  scenes: Scene[];
  carousel: { title: string; cards: CarouselCard[] };
  concreteExample: { title: string; subtitle: string; type: "fire" | "water" | "ice" | "earth" };
  outro: string;
}

export type StationPhase = "approach" | "inside" | "exit" | "travel" | "overview";

export interface StationState {
  worldIndex: number;
  phase: StationPhase;
  roomOpacity: number;
}

const WHITE = "#ffffff";

export const WORLDS: World[] = [
  {
    t: 0.12,
    element: "fire",
    giant: "FIRE",
    color: "#3d1208",
    base: "#0c0503",
    mid: "#240a04",
    accent: "#ff5a1e",
    accentSoft: "#ff8a3d",
    ink: WHITE,
    inkMuted: "#f3ecdd",
    chapter: "CHAPTER I · FIRE",
    title: "The Forgetting",
    lede: "Every world you leave burns behind you.",
    plainLede: "Game memory is local — when you leave, it's gone.",
    scenes: [
      { heading: "A hundred hours, gone in a spark.", body: "You earn trust. You take on debt. You make a name that means something to the people around you. Then you close the tab — and the fire takes all of it.", plain: "Game saves are local. When you leave a game, its memory of what you did is gone.", highlights: ["trust", "debt", "name", "fire"] },
      { heading: "The next world meets a stranger.", body: "Its people start from zero. Its quests reset. The flame never remembers what it consumed, so neither does the game you walk into next.", plain: "No two games share your history. Every new game starts you from nothing.", highlights: ["zero", "flame", "remembers"] },
      { heading: "Identity survives. Story doesn't.", body: "A wallet carries over. A login carries over. But the soul behind them — the betrayals, the rescues, the reputation you bled for — turns to ash at the border.", plain: "Your account carries over between games. Your in-game actions and reputation do not.", highlights: ["soul", "reputation", "ash"] },
      { heading: "WORLDLINE keeps the ember.", body: "One glowing residue refuses to go out. The layer remembers what the fire would erase — selectively, verifiably — and carries it on into everything you play next.", plain: "WORLDLINE is a shared memory layer that stores your meaningful actions so any game can read them.", highlights: ["remembers", "fire", "verifiably"] },
    ],
    carousel: {
      title: "What burns away",
      cards: [
        { label: "Reputation", body: "The standing you earned with every faction — gone the moment you leave." },
        { label: "Debts", body: "Who you owe, who owes you. Erased at the border between games." },
        { label: "Relationships", body: "Allies made, enemies wronged. The next world has never heard of them." },
        { label: "Your name", body: "What you became. Reduced to a fresh, anonymous save file." },
      ],
    },
    concreteExample: {
      title: "The Amnesia Receipt",
      subtitle: "What happens to your achievements when you close the tab.",
      type: "fire",
    },
    outro: "The ember drifts on, and cools — toward water.",
  },
  {
    t: 0.38,
    element: "water",
    giant: "WATER",
    color: "#0a3a48",
    base: "#03121a",
    mid: "#062029",
    accent: "#5fd2e0",
    accentSoft: "#7de8e0",
    ink: WHITE,
    inkMuted: "#e9e2d0",
    chapter: "CHAPTER II · WATER",
    title: "The Flow",
    lede: "What you did doesn't end. It flows.",
    plainLede: "Actions become shared, verifiable memory other games can read.",
    scenes: [
      { heading: "Every act becomes a signed drop.", body: "A game doesn't pour out its whole state. It releases the meaningful pieces — who acted, what changed, what proof anchors it — as small, verifiable events in a shared current.", plain: "Games write key moments to WORLDLINE as small signed events — not their whole database." },
      { heading: "Worlds downstream drink the same water.", body: "They don't share a database. They share a canon: one current of truth that each world reads and renders in its own dialect.", plain: "Many games read the same shared record (the 'canon'). They never integrate with each other." },
      { heading: "Memory finds its level.", body: "Two worlds can disagree on the telling while agreeing on what happened. Conflicts reconcile instead of overwrite — nothing meaningful is lost in the flood.", plain: "Conflicting updates are reconciled, not overwritten: agreed facts, told differently per game." },
      { heading: "One memory, a thousand renderers.", body: "A farming sim, a dungeon crawler, a strategy game — each turns the same event into crops, into dialogue, into an enemy's old grudge.", plain: "Each game interprets a recalled event in its own mechanics — crops, dialogue, or AI behaviour." },
    ],
    carousel: {
      title: "How memory moves — Act · Remember · Reconcile · React",
      cards: [
        { label: "Act", body: "A player does something that matters in a game — a betrayal, a rescue, a debt." },
        { label: "Remember", body: "The game emits a small signed event to WORLDLINE. Stored on Walrus, durable." },
        { label: "Reconcile", body: "The Continuity agent folds it into shared canon — reasoned, not last-write-wins." },
        { label: "React", body: "Any other game reads the canon and shapes its world around your history." },
      ],
    },
    concreteExample: {
      title: "The Flow Downstream",
      subtitle: "How local actions become shared, verifiable canon.",
      type: "water",
    },
    outro: "The current slows. It begins to freeze.",
  },
  {
    t: 0.64,
    element: "ice",
    giant: "ICE",
    color: "#dceef5",
    base: "#f0f7fa",
    mid: "#e1edf3",
    accent: "#0a6285",
    accentSoft: "#1c8cb8",
    ink: "#050506",
    inkMuted: "#2c3539",
    chapter: "CHAPTER III · ICE",
    title: "The Proof",
    lede: "Betray one world. The next one already knows.",
    plainLede: "Every action is tamper-evident, verifiable proof anyone can check.",
    scenes: [
      { heading: "The moment freezes.", body: "Cross someone, and the act crystallizes — into a record no game can quietly melt, forge, or roll back.", plain: "Each action is recorded as tamper-evident, verifiable proof." },
      { heading: "A betrayal becomes a closed door.", body: "Knife an ally in a stealth game, and a trading world's guards turn you away at the gate. The same soul, read through ice-clear proof.", plain: "A consequence in one game can gate behaviour in another — from the same shared record." },
      { heading: "The cold keeps it honest.", body: "Events live as durable blobs; the live pointer advances by compare-and-swap, on-chain. Canon moves forward — never silently overwritten.", plain: "Memory is stored on Walrus (blobs) with a Sui pointer updated by on-chain compare-and-swap." },
      { heading: "Tamper-evident by nature.", body: "No studio has to vouch for another. They trust the proof, frozen in place, that anyone can stop and inspect.", plain: "Any game or player can independently verify the history. No one has to trust a studio." },
    ],
    carousel: {
      title: "Betray one world, remembered in the next — for real",
      cards: [
        { label: "01 · You act", body: "You panic and force-kill processes in You're the OS (a real game)." },
        { label: "02 · It's signed", body: "The event is signed and written to Walrus; the Sui pointer advances." },
        { label: "03 · Recalled", body: "Bubble Gun (a different real game) reads the same canon back." },
        { label: "04 · It reacts", body: "Your briefing changes — the new world already knows who you are." },
      ],
    },
    concreteExample: {
      title: "Verifiable Proof Ledger",
      subtitle: "TAMPER-EVIDENT CRYPTOGRAPHIC TRANSACTION LOG",
      type: "ice",
    },
    outro: "The ice cracks. Below it — solid ground.",
  },
  {
    t: 0.9,
    element: "earth",
    giant: "EARTH",
    color: "#412d1b",
    base: "#130903",
    mid: "#2a190e",
    accent: "#e6a350",
    accentSoft: "#f0b875",
    ink: WHITE,
    inkMuted: "#e9e2d0",
    chapter: "CHAPTER IV · EARTH",
    title: "The Foundation",
    lede: "Build your world on ground that remembers.",
    plainLede: "One adapter, and any game builds on the shared memory.",
    scenes: [
      { heading: "One adapter. That's the whole contract.", body: "Map your local events into canon, map recalled canon back into your mechanics. You integrate with the memory, not with every other studio.", plain: "Devs implement one adapter: emit events to WORLDLINE, and read canon back into the game." },
      { heading: "Keep creative control.", body: "WORLDLINE never dictates how your world renders a memory. It hands you verified inputs; your game decides what they mean.", plain: "You control how recalled memory appears in-game. WORLDLINE only supplies the verified data." },
      { heading: "Start with one stone.", body: "Ship a single event type — a debt, a betrayal, a rescue, a name — and stack more canon surfaces once the gameplay proves it matters.", plain: "Adopt incrementally: start with one event type, add more once it proves useful." },
      { heading: "Four worlds. One soul.", body: "Fire forgot you. Water carried you. Ice proved you. Earth lets anyone build on you. One continuous story — that is WORLDLINE.", plain: "WORLDLINE is a verifiable cross-game memory layer. One player identity, many games, one story." },
    ],
    carousel: {
      title: "Plug a game in — four steps",
      cards: [
        { label: "Install", body: "Add the WORLDLINE adapter to your project. One dependency." },
        { label: "Register", body: "Declare your game as a source and the canon schema you care about." },
        { label: "Emit", body: "On a meaningful action, emit a signed event. The layer stores it durably." },
        { label: "Read", body: "On load, read the soul's canon and shape your world room." },
      ],
    },
    concreteExample: {
      title: "The Developer Adapter",
      subtitle: "Implementing cross-game memory with one interface.",
      type: "earth",
    },
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

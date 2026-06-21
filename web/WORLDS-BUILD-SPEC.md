# WORLDLINE — Elemental Worlds Build Spec

> **Source of truth for the landing redesign.** If context is lost, point me back
> here ("continue from WORLDS-BUILD-SPEC.md") and I rebuild to this standard
> without re-litigating decisions. Every section below is a decision, not a
> suggestion.

---

## 0. Purpose & how to use this doc

The WORLDLINE landing is a cinematic journey through four **elemental worlds** —
Fire, Water, Ice, Earth — each a self-contained, awwwards-tier page that is *its
own website*. The camera (a 3D worldline) travels between them; each world is a
long, full-bleed, scrollable themed environment where **the text behaves like the
element**.

This is built **for the gaming industry**, so the quality bar is "would this win
on awwwards / would a AAA studio ship it." No shortcuts, no half-effects, no
filler. Use the AI speed advantage: build complete, not minimal.

**The hard rule that overrides everything:** *spectacle must never cost
comprehension.* A first-time visitor or a developer must finish any world knowing
exactly what WORLDLINE is. Story for the heart, clarity for the head, receipts for
the skeptic — on every world.

---

## 1. Non-negotiables (the quality bar)

1. **No banned fonts** (Inter/Roboto/Arial/Helvetica). Use Clash Display, Fraunces,
   Plus Jakarta Sans, JetBrains Mono.
2. **White type on deep elemental dark.** No bright poster backgrounds. White/bone
   text must always have strong contrast.
3. **Every headline animates on scroll** — split into words/chars, staggered
   reveal (fade + rise + blur-clear), tied to scroll, in the element's rhythm.
   No statically-appearing text.
4. **The text behaves as the element** — at least one signature, motivated effect
   per world (Fire word shimmers + sheds embers, etc.). Motion is never
   decorative; it expresses the element.
5. **Full-bleed living backgrounds** — layered gradient + animated themed texture
   + film grain. No flat color, no empty gaps, edge to edge.
6. **Plain-language gloss on every beat** (the "Plainly" device), in the element's
   accent color. The literal mechanic is always one glance away.
7. **One swipeable explanatory carousel per world** with concrete, real content
   (real games, real mechanics — never abstract).
8. **60fps.** Animate only `transform`/`opacity`. SVG/WebGL filters only on
   non-scrolling/fixed elements. Respect `prefers-reduced-motion`.
9. **Mobile graceful** — giant word still legible, layouts collapse to single
   column, heavy effects degrade.
10. **Custom easing only** — `cubic-bezier(0.22, 1, 0.36, 1)` family; never
    `linear`/`ease-in-out`.

---

## 2. The narrative arc (the spine — this IS the explanation)

| World | Chapter | Role in pitch | One-line takeaway |
|---|---|---|---|
| **FIRE** | I — The Forgetting | The problem | Games forget you; your story burns when you leave. |
| **WATER** | II — The Flow | The solution | WORLDLINE turns actions into shared, verifiable memory. |
| **ICE** | III — The Proof | The proof | Do something in one game; the next one already knows — provably. |
| **EARTH** | IV — The Foundation | For builders | One adapter and any game builds on the shared memory. |

If a visitor reads only the **giant words + plain lines + the carousels**, they
must walk away with: *"WORLDLINE is a verifiable memory layer that lets different
games share what a player did."* That sentence is the success test.

---

## 3. Per-world content (full copy — refine wording, keep meaning)

Each world page is, top to bottom:
**HERO (giant word) → LEDE → SCENE 1..4 (heading + body + Plainly) → CAROUSEL →
CONCRETE EXAMPLE → OUTRO (handoff to next world).**

### FIRE — Chapter I · "The Forgetting"
- **Giant word:** `FIRE`
- **Lede (bottom-left, serif italic):** "Every world you leave burns behind you."
- **Scenes:**
  1. *A hundred hours, gone in a spark.* — You earn trust, take on debt, make a
     name. Close the tab and the fire takes all of it.
     **Plainly:** Game saves are local — leave a game and its memory of you is gone.
  2. *The next world meets a stranger.* — Its people start from zero; the flame
     never remembers what it consumed.
     **Plainly:** No two games share your history. Every new game starts you at zero.
  3. *Identity survives. Story doesn't.* — A wallet carries over, a login carries
     over; the soul behind them turns to ash at the border.
     **Plainly:** Your account carries between games. Your actions and reputation don't.
  4. *WORLDLINE keeps the ember.* — One residue refuses to go out; the layer
     remembers what the fire would erase.
     **Plainly:** WORLDLINE is a shared memory layer that stores your actions so any game can read them.
- **Carousel — "What burns away":** Reputation · Debts · Relationships · Your name
  — each card states it, then shows it dissolving to embers.
- **Outro:** "The ember drifts on, and cools — toward water."

### WATER — Chapter II · "The Flow"
- **Giant word:** `WATER`
- **Lede:** "What you did doesn't end. It flows."
- **Scenes:**
  1. *Every act becomes a signed drop.* — A game releases only the meaningful
     pieces — who acted, what changed, what proof anchors it.
     **Plainly:** Games write key moments to WORLDLINE as small signed events, not their whole database.
  2. *Worlds downstream drink the same water.* — They share a canon, not a
     database; each reads it in its own dialect.
     **Plainly:** Many games read the same shared record (the "canon"). They never integrate with each other.
  3. *Memory finds its level.* — Worlds can disagree on the telling while agreeing
     on what happened; conflicts reconcile, not overwrite.
     **Plainly:** Conflicting updates are reconciled, not overwritten — agreed facts, told differently per game.
  4. *One memory, a thousand renderers.* — The same event becomes crops, dialogue,
     or an enemy's old grudge.
     **Plainly:** Each game interprets a recalled event in its own mechanics.
- **Carousel — the loop "Act → Remember → Reconcile → React":** 4 cards, one plain
  sentence each. This is *the* mechanic, made swipeable.
- **Outro:** "The current slows. It begins to freeze."

### ICE — Chapter III · "The Proof"
- **Giant word:** `ICE`
- **Lede:** "Betray one world. The next one already knows."
- **Scenes:**
  1. *The moment freezes.* — The act crystallizes into a record no game can melt,
     forge, or roll back.
     **Plainly:** Each action is recorded as tamper-evident, verifiable proof.
  2. *A betrayal becomes a closed door.* — Knife an ally in a stealth game; a
     trading world's guards turn you away.
     **Plainly:** A consequence in one game can gate behaviour in another — from the same record.
  3. *The cold keeps it honest.* — Events live as durable blobs; the pointer
     advances by compare-and-swap, on-chain.
     **Plainly:** Memory is stored on Walrus (blobs) with a Sui pointer updated by on-chain compare-and-swap.
  4. *Tamper-evident by nature.* — No studio vouches for another; they trust the
     proof, frozen, that anyone can inspect.
     **Plainly:** Any game or player can independently verify the history. No trusting a studio.
- **Carousel — "Betray one world, remembered in the next" (REAL games):**
  1. You panic in *You're the OS* → 2. It's signed onto Walrus + Sui →
  3. *Bubble Gun* recalls it → 4. Your briefing changes. (Use real inspector data /
  blob IDs — receipts.)
- **Outro:** "The ice cracks. Below it — solid ground."

### EARTH — Chapter IV · "The Foundation"
- **Giant word:** `EARTH`
- **Lede:** "Build your world on ground that remembers."
- **Scenes:**
  1. *One adapter. That's the whole contract.* — Map local events into canon, map
     canon back into your mechanics.
     **Plainly:** Devs implement one adapter: emit events to WORLDLINE, read canon back into the game.
  2. *Keep creative control.* — WORLDLINE never dictates how you render a memory;
     it hands you verified inputs.
     **Plainly:** You decide how recalled memory appears in-game. WORLDLINE supplies the verified data.
  3. *Start with one stone.* — Ship a single event type; stack more once it proves
     out.
     **Plainly:** Adopt incrementally — one event type first, more later.
  4. *Four worlds. One soul.* — Fire forgot you, Water carried you, Ice proved you,
     Earth lets anyone build on you.
     **Plainly:** WORLDLINE is a verifiable cross-game memory layer. One player, many games, one story.
- **Carousel — developer integration:** install · register adapter · emit an
  event · read canon — actual code-ish steps, swipeable.
- **Outro / finale:** "One player. Many worlds. One continuous story." → CTA
  (View the live demo · Read the SDK · Inspect on-chain).

---

## 4. Visual system

### 4.1 Palette — deep elemental dark (white type everywhere)
Each world: a near-black base with the element's hue, a mid stop, and a bright
**accent** used ONLY for glow / the "Plainly" label / small highlights.

| World | base → deep → mid | accent (glow) | text |
|---|---|---|---|
| Fire  | `#0c0503` → `#240a04` → `#3d1208` | `#ff5a1e` / `#ff8a3d` | white `#ffffff`, body `#f3ecdd` |
| Water | `#03121a` → `#062029` → `#0a3a48` | `#5fd2e0` / `#7de8e0` | white / bone |
| Ice   | `#06141b` → `#0c2530` → `#16384a` | `#bfe9f2` / `#9fd6e0` | white / bone |
| Earth | `#0d0905` → `#1f1409` → `#3a2616` | `#dca65f` / `#e9b878` | white / bone |

Existing `--color-*` tokens stay for the WORLDLINE brand chrome; add per-world
tokens (`--room-base`, `--room-accent`, etc.) set on each world's root.

### 4.2 Typography
- **Display / giant word + scene headings:** **Clash Display** (600/700). The hero
  word is the Moah move — fills the viewport, optical edge-to-edge, tight tracking.
- **Poetic ledes / outro lines:** **Fraunces** italic (high-contrast serif).
- **Body + "Plainly":** **Plus Jakarta Sans**.
- **Eyebrows / labels / carousel meta / SCROLL cue:** **JetBrains Mono**, uppercase,
  wide tracking (`0.24–0.34em`).
- **Scale contrast is the point:** giant (`clamp(6rem, 22vw, 20rem)`) ↔ tiny mono
  (`10–11px`). Use both on the same screen.

### 4.3 Hero anatomy (per world — the Moah reference)
- Tiny mono label **top-left**: `CHAPTER I` / `WORLD OF FIRE`.
- Global nav stays top.
- **The giant element word** centered, white, filling the screen.
- **Lede** small, **bottom-left**, serif italic.
- `SCROLL ↓` mono, **bottom-right**.
- **Image-mask-ready (build now, fill later):** the giant word is structured so its
  fill can become an image (e.g. `background-clip: text` with a fire photo, or an
  SVG `<text>` mask over an image layer). Ship **solid white** now; dropping in the
  user's image later is a one-line change. Dark world behind makes the
  image-in-letters dramatic.

### 4.4 Backgrounds (full, layered, alive)
Each world background = stacked layers, all `pointer-events:none`, fixed within the
world's scroll:
1. Deep multi-stop gradient (palette above).
2. An **animated elemental texture** (NOT just dot particles):
   - Fire: low embers-glow at the bottom that breathes; heat-haze near the base.
   - Water: drifting caustic light; slow vertical swell.
   - Ice: faint frost vignette creeping from edges; occasional crystal glints.
   - Earth: settling dust motes + subtle rock/sediment grain.
3. Particle field (the existing `ElementParticles`, retuned per element).
4. Film grain overlay (`opacity ~0.03`, fixed, pointer-events none).
5. Inner vignette for focus.

---

## 5. Per-element TEXT / MOTION language (the signature effects)

The giant word and headings express the element. Build CSS/SVG-first; one WebGL
signature per world is allowed where it elevates.

- **FIRE — burns.** Giant word: heat-shimmer warp (SVG `feTurbulence` +
  `feDisplacementMap`, animated), edges glowing ember, embers lifting *off* the
  glyphs. Headline entrance: chars "ignite" in from the baseline up. Idle: subtle
  flame-breath flicker. Scroll down: the word burns away into embers as the next
  line ignites.
- **WATER — flows.** Words surface from below, blur→sharp like rising through water;
  a caustic light-ripple drifts across the headline; slow liquid wobble; a shimmer
  reflection beneath the giant word. Scroll: type bobs / drifts up like bubbles.
- **ICE — frosts.** Letters arrive crisp; frost crystals creep across them on
  settle; glassy specular sheen; a hairline crack through the giant word. Slow,
  still, sharp reveals — restraint *is* the motion. Scroll: frost spreads across the
  viewport then "shatters" to the next scene.
- **EARTH — carves.** Heavy chiseled type rises from the bottom (unearthed), dust
  settling; stone/sediment grain on the fill; the giant word half-buried as relief.
  Slow, grounded, weighty. Scroll: camera rises out of the ground, dust falling.

---

## 6. Scroll choreography

- **Smooth scroll:** Lenis (already installed).
- **Split-text reveals:** every headline split to words (and the giant word to
  chars), staggered via `motion` `whileInView` (root = the world's scroll
  container), `fade + y + blur` with element-specific timing (fire fast/flickery,
  water flowing, ice slow/crisp, earth heavy).
- **Parallax:** headline vs body move at different depths (scroll-linked
  `useTransform`).
- **Plainly line:** distinct reveal — underline-wipe or type-on in the accent color,
  so the literal meaning lands with emphasis.
- **Signature scroll moment per world** (§5) — the screenshot moment.
- **World handoff:** the existing 3D worldline travel + colour crossfade
  (`ScrollJourney`) carries between worlds; each world's deep base color is what the
  3D atmosphere/orb tints to so the handoff stays seamless (retune orb/atmosphere to
  the new deep palette).

---

## 7. Understandability layer (the anti-abstraction rule)

On **every** world, in this order of guarantees:
1. **Giant word** = instantly legible subject (FIRE/WATER/ICE/EARTH).
2. **Plain one-liner** beside the poetic lede.
3. **"Plainly —" gloss** under every scene body (accent color, can't be missed).
4. **One swipeable carousel** that breaks the chapter's mechanic into concrete
   steps (§3 carousel content — real games, real terms).
5. **A concrete example** anchored in the two real games / heist-court soul.
Never delete substance for aesthetics. Keep real terms (events, canon, Walrus, Sui,
adapter, recall). The cinematic layer *wraps* the explanation; it never replaces it.

---

## 8. Technical implementation

### 8.1 Stack (all already in repo)
React 18 · Vite · Tailwind v4 · `motion` (framer) · `lenis` ·
`@react-three/fiber` + `drei` + `postprocessing` (the 3D travel) · SVG filters ·
Canvas2D (`ElementParticles`).

### 8.2 Component architecture
```
ScrollJourney            // orchestrator: 3D worldline travel + crossfade to rooms (exists)
└─ WorldRoom (per world) // full-bleed long themed scroll  (rewrite of WorldPanel)
   ├─ WorldBackground    // layered gradient + texture + grain + vignette (per element)
   ├─ ElementParticles   // retuned per element (exists)
   ├─ WorldHero          // giant word (Moah scale, image-mask-ready, element text fx)
   ├─ Scene × 4          // heading + body + Plainly, split-text scroll reveal
   ├─ ExplainCarousel    // swipeable concrete explainer
   └─ WorldOutro         // handoff line + (Earth) CTA
Shared primitives:
   SplitText             // word/char split + staggered reveal (root-aware)
   ElementText           // applies per-element text effect (fire shimmer, etc.)
   Carousel              // horizontal snap-scroll, keyboard + drag, dots
```
Per-element config object (`src/lib/journey.ts`, extended): palette, accent,
text-effect params, particle params, carousel content, scene copy. **One config,
four worlds** — but each world is allowed bespoke flourishes (it's "its own site").

### 8.3 Performance budget
- Scroll animation: `transform`/`opacity` only.
- SVG `feTurbulence`/`feDisplacementMap`: hero word only, not on scrolling bodies;
  pause when world inactive.
- Particles + textures: only animate the **active** world (existing `active` prop).
- Lazy-mount / freeze inactive worlds.
- `prefers-reduced-motion`: disable shimmer/particles, keep static reveals.
- Target: 60fps on a mid laptop; verify with the screenshot/inspect tools.

### 8.4 Files touched
- `src/lib/journey.ts` — extend World config (palette, fx params, carousel content);
  shift colors to deep-dark palette (§4.1). Keep camera math untouched.
- `src/components/WorldPanel.tsx` → becomes `WorldRoom` (full rewrite to §3 layout).
- `src/components/WorldlineCanvas.tsx` — retune orb/atmosphere to deep palette so the
  3D↔room handoff matches.
- New: `WorldHero.tsx`, `WorldBackground.tsx`, `ExplainCarousel.tsx`, `SplitText.tsx`,
  `ElementText.tsx`.
- `src/index.css` — per-world CSS vars, grain/texture keyframes, SVG filter defs.

---

## 9. Acceptance criteria (the awwwards checklist — per world)

A world is "done" only when ALL pass:
- [ ] Giant element word fills the viewport, white, razor-crisp at mobile→4k,
      image-mask-ready.
- [ ] Background is full-bleed, layered, **alive** (no flat color, no gaps).
- [ ] Every headline reveals via split-text tied to scroll, element rhythm.
- [ ] The signature elemental text effect is present and motivated (not generic).
- [ ] Dramatic type hierarchy on every screen (giant ↔ tiny, heavy whitespace).
- [ ] "Plainly" gloss present on every scene, accent color, legible.
- [ ] One swipeable carousel with concrete real content, works on drag + keyboard.
- [ ] A concrete example tied to the real games / soul is present.
- [ ] Mobile: word legible, single-column, effects degrade gracefully.
- [ ] 60fps scroll; reduced-motion respected.
- [ ] A judge who reads only the big word + plain lines + carousel understands
      WORLDLINE. (The comprehension test.)

---

## 10. Build order & milestones

1. **Foundations** — extend `journey.ts` config (deep palettes + fx params +
   carousel content); build shared primitives (`SplitText`, `Carousel`,
   `ElementText`, `WorldBackground`); retune the 3D palette.
2. **FIRE — the bar-setter (full quality, complete).** Giant `FIRE` hero
   (white, mask-ready) + heat-shimmer/ember text + deep ember world + 4 scenes
   with split-text + "what burns away" carousel + outro. **Get sign-off here; this
   sets the standard for the rest.**
3. **WATER** — clone the system, apply water motion language + the Act→Remember→
   Reconcile→React carousel.
4. **ICE** — clone, ice motion + the real-games "betray one world" carousel
   (wire to inspector data if available).
5. **EARTH** — clone, earth motion + developer carousel + the finale CTA.
6. **Global polish** — 3D travel tuning, transitions, mobile pass, reduced-motion,
   performance verification, the comprehension test on a fresh reader.
7. **Image integration** — when the user provides per-world hero images, flip the
   giant words from solid white to image-masked (one change per world).

---

## 11. Deferred / open (do NOT block on these)
- **Per-world hero images** — user provides later; build mask-ready, fill on arrival.
- **WebGL signature moments** — optional elevation per world; CSS/SVG ships first.
- **Audio** — not in scope yet (could add subtle elemental ambience later).
- **The bright "exact-color room" look is retired** in favor of deep-dark + white
  type (decided for contrast + the gaming-quality bar).

---

## 12. The standard, in one line
Each world is its own awwwards-level site — the element rendered in living type on
deep dark, white and legible, animated as it's read, and impossible to leave
without understanding what WORLDLINE is. Build complete. Don't minimize.

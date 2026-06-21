import { useEffect, useRef, useState } from "react";
import { motion, useTransform, useMotionValue, useMotionValueEvent, animate, type MotionValue } from "motion/react";
import { WorldRoom } from "../components/WorldRoom.tsx";
import { WorldlineCanvas } from "../components/WorldlineCanvas.tsx";
import { WORLDS, STOPS, N, stationStateAt, worldIndexAt, type World } from "../lib/journey.ts";

/** One world's content — shown only while the camera rests inside that world. */
function Station({ progress, i, world }: { progress: MotionValue<number>; i: number; world: World }) {
  const opacity = useTransform(progress, (p) => {
    const state = stationStateAt(p);
    return state.worldIndex === i ? state.roomOpacity : 0;
  });
  const pointerEvents = useTransform(progress, (p) => {
    const state = stationStateAt(p);
    return state.worldIndex === i && state.roomOpacity > 0.9 ? "auto" : "none";
  });
  const y = useTransform(progress, (p) => {
    const state = stationStateAt(p);
    return state.worldIndex === i ? (1 - state.roomOpacity) * 28 : 0;
  });
  const [active, setActive] = useState(() => {
    const s = stationStateAt(progress.get());
    return s.worldIndex === i && s.roomOpacity > 0.4;
  });
  useMotionValueEvent(progress, "change", (p) => {
    const s = stationStateAt(p);
    setActive(s.worldIndex === i && s.roomOpacity > 0.4);
  });
  return (
    <motion.div style={{ opacity, y, pointerEvents }} className="absolute inset-0 z-20">
      <WorldRoom world={world} active={active} />
    </motion.div>
  );
}

export function ScrollJourney() {
  const hero = useRef<HTMLDivElement>(null);
  const journeyProgress = useMotionValue(0);

  // Dev hook: ?z=0.5 freezes the journey at a given progress.
  const forcedParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("z") : null;
  const forced = useMotionValue(forcedParam != null ? Number(forcedParam) : 0);
  const progress = forcedParam != null ? forced : journeyProgress;

  useEffect(() => {
    let lastTouchY = 0;
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const advance = (delta: number, divisor = 5200) => {
      if (forcedParam != null) return;
      journeyProgress.set(clamp(journeyProgress.get() + delta / divisor));
    };

    const onWheel = (event: WheelEvent) => {
      const state = stationStateAt(progress.get());
      const scrollHosts = document.querySelectorAll("[data-world-artifact-scroll]");
      const scrollHost = scrollHosts[state.worldIndex] as HTMLElement | null;

      if (state.phase === "inside" && scrollHost) {
        const canScrollDown = event.deltaY > 0 && scrollHost.scrollTop + scrollHost.clientHeight < scrollHost.scrollHeight - 2;
        const canScrollUp = event.deltaY < 0 && scrollHost.scrollTop > 2;
        if (canScrollDown || canScrollUp) {
          event.preventDefault();
          scrollHost.scrollTop += event.deltaY;
          return;
        }
      }
      event.preventDefault();
      advance(event.deltaY, 5200);
    };
    const onTouchStart = (event: TouchEvent) => {
      lastTouchY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      const nextY = event.touches[0]?.clientY ?? lastTouchY;
      const delta = lastTouchY - nextY;

      const state = stationStateAt(progress.get());
      const scrollHosts = document.querySelectorAll("[data-world-artifact-scroll]");
      const scrollHost = scrollHosts[state.worldIndex] as HTMLElement | null;

      if (state.phase === "inside" && scrollHost) {
        const canScrollDown = delta > 0 && scrollHost.scrollTop + scrollHost.clientHeight < scrollHost.scrollHeight - 2;
        const canScrollUp = delta < 0 && scrollHost.scrollTop > 2;
        if (canScrollDown || canScrollUp) {
          // Allow native browser momentum scrolling inside the container
          lastTouchY = nextY;
          return;
        }
      }
      event.preventDefault();
      advance(delta, 3200); // Faster, more responsive touch advance for 3D travel sections
      lastTouchY = nextY;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [forcedParam, journeyProgress, progress]);

  const [activeWorld, setActiveWorld] = useState<World>(WORLDS[0]);

  useMotionValueEvent(progress, "change", (p) => {
    setActiveWorld(WORLDS[worldIndexAt(p)]);
  });

  // the flat colour "room" that crossfades in over the zoom (exact world colour)
  const pageColor = useTransform(progress, (p) => WORLDS[stationStateAt(p).worldIndex].color);
  const pageAlpha = useTransform(progress, (p) => stationStateAt(p).roomOpacity);
  const artifactOpacity = useTransform(progress, (p) => 1 - stationStateAt(p).roomOpacity * 0.92);

  // intro hero (over the artifact, before the first world) + outro cta
  const heroOpacity = useTransform(progress, [0, STOPS[0] * 0.85], [1, 0]);
  const heroY = useTransform(progress, [0, STOPS[0] * 0.85], [0, -40]);
  const cueOpacity = useTransform(progress, [0, STOPS[0] * 0.5], [1, 0]);
  const ctaOpacity = useTransform(progress, [STOPS[N - 1] + 0.02, 0.99], [0, 1]);

  return (
    <div ref={hero} className="relative h-screen w-full overflow-hidden overscroll-none">
      {/* Dynamic Header / Navigation Bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 sm:px-10 transition-colors duration-300" style={{ color: activeWorld.ink }}>
        <button
          onClick={() => {
            if (forcedParam != null) return;
            animate(journeyProgress, 0, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
          }}
          className="font-mono text-sm tracking-[0.3em] cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none text-inherit font-semibold"
        >
          WORLDLINE
        </button>
        <nav className="hidden gap-8 font-sans text-sm opacity-70 sm:flex items-center">
          <button
            onClick={() => {
              if (forcedParam != null) return;
              animate(journeyProgress, STOPS[0], { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
            }}
            className="transition-opacity hover:opacity-100 cursor-pointer bg-transparent border-none text-inherit"
          >
            Thesis
          </button>
          <button
            onClick={() => {
              if (forcedParam != null) return;
              animate(journeyProgress, STOPS[3], { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
            }}
            className="transition-opacity hover:opacity-100 cursor-pointer bg-transparent border-none text-inherit"
          >
            Demo
          </button>
          <a
            className="transition-opacity hover:opacity-100"
            href="https://github.com/ronkenx9/worldline"
            target="_blank"
            rel="noopener noreferrer"
          >
            SDK
          </a>
        </nav>
      </header>

      <div className="absolute inset-0 h-screen w-full overflow-hidden">
        {/* artifact (pinned) — the 3D transition */}
        <motion.div style={{ opacity: artifactOpacity }} className="absolute inset-0 z-0">
          <WorldlineCanvas progress={progress} />
        </motion.div>

        {/* flat colour room — exact world colour, fades in as we arrive inside */}
        <motion.div style={{ backgroundColor: pageColor, opacity: pageAlpha }} className="pointer-events-none absolute inset-0 z-10" aria-hidden />

        {/* intro hero */}
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
          <div className="absolute h-72 w-[44rem] max-w-[92vw] rounded-full" style={{ background: "radial-gradient(closest-side, rgba(5,5,6,0.7), transparent)" }} />
          <h1 className="relative font-display text-5xl font-medium leading-[1.04] text-bone drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)] sm:text-6xl md:text-7xl">
            Every world<br />remembers.
          </h1>
          <p className="relative mt-7 max-w-md font-sans text-base leading-relaxed text-bone/60">
            The cross-game memory layer for AI worlds. One player, many worlds, one continuous story.
          </p>
        </motion.div>

        {/* the worlds */}
        {WORLDS.map((w, i) => (
          <Station key={i} progress={progress} i={i} world={w} />
        ))}

        {/* outro cta */}
        <motion.div style={{ opacity: ctaOpacity }} className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center px-6 pb-10 text-center">
          <div className="absolute bottom-0 h-64 w-full" style={{ background: "linear-gradient(to top, rgba(5,5,6,0.92), rgba(5,5,6,0.58), transparent)" }} />
          <h2 className="relative font-display text-3xl font-medium leading-[1.04] text-bone sm:text-4xl">
            Build worlds<br />that remember.
          </h2>
          <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                if (forcedParam != null) return;
                animate(journeyProgress, STOPS[3], { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
              }}
              className="pointer-events-auto rounded-full bg-memory px-7 py-3 font-sans text-sm font-semibold text-void transition-transform hover:scale-[1.03] cursor-pointer border-none"
            >
              See the demo
            </button>
            <a
              href="https://github.com/ronkenx9/worldline"
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto rounded-full border border-bone/25 px-7 py-3 font-sans text-sm font-medium text-bone/80 transition-colors hover:border-memory hover:text-memory"
            >
              Read the SDK
            </a>
          </div>
          <p className="relative mt-5 font-display text-base italic text-bone/40">The player is the platform.</p>
        </motion.div>

        {/* scroll cue */}
        <motion.div style={{ opacity: cueOpacity }} className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 font-mono text-[10px] tracking-[0.35em] text-bone/30">
          SCROLL TO TRAVEL THE WORLDLINE ↓
        </motion.div>
      </div>
    </div>
  );
}

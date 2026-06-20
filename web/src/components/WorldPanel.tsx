import { createContext, useContext, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { motion } from "motion/react";
import type { World } from "../lib/journey.ts";
import { ElementParticles } from "./ElementParticles.tsx";

/* ──────────────────────────────────────────────────────────────────────────
   Elemental world rooms — each a long, full-bleed, themed scroll environment
   (Fire / Water / Ice / Earth). Destroys the old card panels: this is a place
   you enter and scroll through, not a card you read.
   ────────────────────────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const;
const ScrollRoot = createContext<RefObject<HTMLDivElement> | null>(null);

const BG: Record<World["element"], string> = {
  fire: "radial-gradient(130% 80% at 50% 122%, rgba(255,120,50,0.55), transparent 58%), linear-gradient(180deg,#170604,#46140a 42%,#a8331a 120%)",
  water: "radial-gradient(130% 95% at 50% -8%, rgba(95,210,224,0.28), transparent 52%), linear-gradient(180deg,#04222b,#0a4150 46%,#125f73 122%)",
  ice: "radial-gradient(130% 80% at 50% -6%, rgba(255,255,255,0.7), transparent 52%), linear-gradient(180deg,#e8f4f7,#cfe6ec 48%,#bcdde5 122%)",
  earth: "radial-gradient(130% 80% at 50% 122%, rgba(220,166,95,0.32), transparent 60%), linear-gradient(180deg,#170e06,#3a2616 44%,#5f4127 122%)",
};

function FireHeroFigure() {
  return (
    <Reveal delay={0.1} className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <img
        src="/fire-cinder-hero.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.86] saturate-[1.06]"
        style={{
          objectPosition: "center center",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, transparent 12%, black 35%, black 100%)",
          maskImage: "linear-gradient(90deg, transparent 0%, transparent 12%, black 35%, black 100%)",
          filter: "drop-shadow(0 28px 80px rgba(0,0,0,0.55))",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#170604] via-[#170604]/58 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#a8331a]/42 via-transparent to-black/20" />
    </Reveal>
  );
}

const FIRE_ASPECTS = [
  {
    src: "/fire-cinder-chibi.png",
    label: "Spark form",
    className: "mx-auto aspect-square max-h-[430px] w-full max-w-[430px]",
    imageClassName: "object-cover",
    objectPosition: "center center",
  },
  {
    src: "/fire-cinder-gate.png",
    label: "Stranger form",
    className: "aspect-[16/10] w-full",
    imageClassName: "object-cover",
    objectPosition: "center center",
  },
  {
    src: "/fire-cinder-token.png",
    label: "Identity form",
    className: "aspect-[16/10] w-full",
    imageClassName: "object-cover",
    objectPosition: "center center",
  },
  {
    src: "/fire-cinder-ash.png",
    label: "Memory form",
    className: "aspect-[16/10] w-full",
    imageClassName: "object-cover",
    objectPosition: "center center",
  },
];

function FireSceneAspect({ index }: { index: number }) {
  const aspect = FIRE_ASPECTS[index];
  if (!aspect) return null;

  return (
    <div className="group relative mb-8">
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(closest-side,rgba(255,113,45,0.18),transparent)] opacity-80 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]" />
      <div className="relative rounded-[1.75rem] border border-white/10 bg-black/18 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="relative overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-[#140604]">
          <img
            src={aspect.src}
            alt=""
            aria-hidden="true"
            className={`${aspect.className} ${aspect.imageClassName} block opacity-[0.92] saturate-[1.04] transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]`}
            style={{
              objectPosition: aspect.objectPosition,
              WebkitMaskImage: "linear-gradient(180deg, black 0%, black 82%, rgba(0,0,0,0.38) 100%)",
              maskImage: "linear-gradient(180deg, black 0%, black 82%, rgba(0,0,0,0.38) 100%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#150604]/70 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.24em] text-[#ff9a57]/80">{aspect.label}</div>
        </div>
      </div>
    </div>
  );
}

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const root = useContext(ScrollRoot);
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 34, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ root: root ?? undefined, margin: "-14% 0px -14% 0px", once: true }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function WorldPanel({ world, active = false }: { world: World; active?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dark = world.ink === "#10110f";
  const muted = dark ? "rgba(16,17,15,0.6)" : "rgba(243,236,221,0.64)";

  return (
    <ScrollRoot.Provider value={scrollRef}>
      <div
        ref={scrollRef}
        data-world-artifact-scroll
        className="relative h-full w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ color: world.ink } as CSSProperties}
      >
        {/* sticky themed background that stays while content scrolls over it */}
        <div className="pointer-events-none sticky top-0 z-0 -mb-[100vh] h-screen w-full overflow-hidden">
          <div className="absolute inset-0" style={{ background: BG[world.element] }} />
          <ElementParticles element={world.element} active={active} />
          <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 220px 60px rgba(0,0,0,0.32)" }} />
        </div>

        <div className="relative z-10">
          {/* arrival */}
          <section className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden px-6 sm:px-12 lg:px-20">
            {world.element === "fire" ? <FireHeroFigure /> : null}
            <Reveal className="relative z-10">
              <span className="font-mono text-[11px] uppercase tracking-[0.34em]" style={{ color: world.accent }}>{world.chapter}</span>
            </Reveal>
            <Reveal delay={0.08} className="relative z-10">
              <h2 className="mt-6 max-w-[10ch] font-grotesk text-[clamp(2.65rem,11vw,11rem)] font-semibold uppercase leading-[0.85] tracking-[-0.015em] sm:text-[clamp(3.4rem,12vw,11rem)]">{world.title}</h2>
            </Reveal>
            <Reveal delay={0.16} className="relative z-10">
              <p className="mt-8 max-w-xl font-display text-2xl italic leading-snug sm:text-3xl" style={{ color: muted }}>{world.lede}</p>
            </Reveal>
            <Reveal delay={0.26} className="relative z-10">
              <p className="mt-20 font-mono text-[10px] uppercase tracking-[0.32em]" style={{ color: muted }}>scroll ↓</p>
            </Reveal>
          </section>

          {/* scenes */}
          {world.scenes.map((s, i) => (
            <section key={i} className="flex min-h-[76vh] items-center px-6 sm:px-12 lg:px-20">
              <div className="grid w-full items-center gap-8 md:grid-cols-12 md:gap-12">
                <Reveal className={`md:col-span-6 ${i % 2 ? "md:order-2 md:col-start-7" : "md:col-start-1"}`}>
                  <span className="font-mono text-xs tracking-[0.2em]" style={{ color: world.accent }}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-5 max-w-lg font-display text-[clamp(2rem,4.6vw,3.7rem)] font-medium leading-[1.02]">{s.heading}</h3>
                </Reveal>
                <Reveal delay={0.1} className={`md:col-span-5 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}>
                  {world.element === "fire" ? <FireSceneAspect index={i} /> : null}
                  <p className="font-sans text-lg leading-relaxed sm:text-xl" style={{ color: muted }}>{s.body}</p>
                  <div className="mt-7 border-l-2 pl-4" style={{ borderColor: world.accent }}>
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: world.accent }}>Plainly</span>
                    <p className="mt-1.5 font-sans text-[15px] leading-relaxed" style={{ color: world.ink }}>{s.plain}</p>
                  </div>
                </Reveal>
              </div>
            </section>
          ))}

          {/* outro */}
          <section className="flex min-h-[72vh] flex-col items-center justify-center px-6 text-center sm:px-12">
            <Reveal>
              <p className="mx-auto max-w-3xl font-display text-[clamp(1.9rem,4.2vw,3.2rem)] italic leading-snug">{world.outro}</p>
              <p className="mt-14 font-mono text-[10px] uppercase tracking-[0.32em]" style={{ color: muted }}>keep scrolling to travel on ↓</p>
            </Reveal>
          </section>
        </div>
      </div>
    </ScrollRoot.Provider>
  );
}

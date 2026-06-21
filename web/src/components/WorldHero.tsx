import { Reveal, SplitText } from "./worldkit.tsx";
import type { World } from "../lib/journey.ts";

/**
 * The colossal element-word hero (Moah-scale). White type on the deep world.
 * IMAGE-MASK-READY: when a per-world hero image is provided, swap the giant word's
 * `color`/`WebkitTextFillColor` for `background-clip: text` over the image — the
 * letters become a window into the image. Solid white until then.
 */
export function WorldHero({ world }: { world: World }) {
  const isFire = world.element === "fire";
  const isIce = world.element === "ice";
  return (
    <section className="relative flex h-[100dvh] min-h-[560px] w-full flex-col justify-center overflow-hidden">
      {/* Background Hero Video/Image Fallback */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={`/hero-${world.element}.webp`}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 6%, black 90%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 6%, black 90%, transparent 100%)",
        }}
      >
        <source src={`/hero-${world.element}.mp4`} type="video/mp4" />
        {/* Fallback image if browser fails to fetch source */}
        <img
          src={`/hero-${world.element}.webp`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </video>
      {/* Fire heat-shimmer filter (SVG, animated, CSS-applied to the word) */}
      {isFire && (
        <svg width="0" height="0" className="absolute" aria-hidden>
          <filter id="fire-shimmer" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.035" numOctaves="2" seed="7" result="noise">
              <animate attributeName="baseFrequency" dur="9s" values="0.012 0.035;0.018 0.05;0.012 0.035" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}

      {/* chapter label — top-left */}
      <Reveal delay={0.1} className="absolute left-6 top-24 sm:left-12">
        <span className="font-mono text-[11px] uppercase tracking-[0.34em]" style={{ color: world.accent }}>
          {world.chapter}
        </span>
      </Reveal>

      {/* the giant word */}
      <div className="flex w-full items-center justify-center px-1">
        <h2
          className="wk-giant select-none text-center font-grotesk font-semibold uppercase leading-[0.78] tracking-[-0.02em] text-white"
          style={{
            fontSize: "clamp(5rem, 25vw, 23rem)",
            filter: isFire ? "url(#fire-shimmer)" : undefined,
            textShadow: `0 0 90px ${world.accent}55, 0 0 30px ${world.accent}33`,
          }}
        >
          <SplitText text={world.giant} by="char" rhythm={world.element} />
        </h2>
      </div>

      {/* lede — bottom-left */}
      <Reveal delay={0.22} className="absolute bottom-12 left-6 max-w-md sm:left-12">
        <p className="font-display text-2xl italic leading-snug text-white sm:text-3xl">{world.lede}</p>
        <p className="mt-3 font-sans text-sm leading-relaxed" style={{ color: world.accent }}>
          {world.plainLede}
        </p>
      </Reveal>

      {/* scroll cue — bottom-right */}
      <div className="absolute bottom-12 right-6 font-mono text-[10px] uppercase tracking-[0.32em] text-white/40 sm:right-12">
        scroll ↓
      </div>
    </section>
  );
}

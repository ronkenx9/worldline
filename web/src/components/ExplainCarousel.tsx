import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useScrollRoot } from "./worldkit.tsx";
import type { World } from "../lib/journey.ts";

/**
 * Scroll-driven explainer. A tall section pins a horizontal track; vertical
 * scroll through it translates the cards sideways (the awwwards horizontal-scroll
 * pattern). Keeps the cinematic worlds understandable with concrete cards.
 */
export function ExplainCarousel({ world }: { world: World }) {
  const root = useScrollRoot();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: root ? { current: root } : undefined,
    offset: ["start start", "end end"],
  });

  const n = world.carousel.cards.length;
  // approx track travel so the last card lands in view (card ≈ 74vw incl. gap)
  const cardVw = 74;
  const travel = Math.max(0, Math.min(92, ((n * cardVw - 96) / (n * cardVw)) * 100));
  const x = useTransform(scrollYProgress, [0.04, 0.96], ["0%", `-${travel}%`]);
  const progress = useTransform(scrollYProgress, [0, 1], ["6%", "100%"]);

  return (
    <div ref={sectionRef} className="relative" style={{ height: `${n * 78}vh` }}>
      <div className="sticky top-0 flex h-[100dvh] w-full flex-col justify-center overflow-hidden">
        <div className="px-6 sm:px-12 lg:px-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: world.accent }}>
            {world.carousel.title}
          </p>
        </div>

        <motion.div style={{ x }} className="mt-12 flex gap-6 pl-6 will-change-transform sm:pl-12 lg:pl-20">
          {world.carousel.cards.map((c, i) => (
            <div
              key={i}
              className="flex min-h-[320px] w-[72vw] max-w-[440px] shrink-0 flex-col rounded-[1.75rem] border p-8 sm:p-9"
              style={{
                borderColor: `${world.accent}2e`,
                background: "rgba(255,255,255,0.04)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <span className="font-mono text-xs tracking-[0.25em] font-semibold" style={{ color: world.accent }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h4 className="mt-8 font-grotesk text-[2.2rem] font-semibold uppercase leading-[0.95]" style={{ color: world.ink }}>
                {c.label}
              </h4>
              <p className="mt-5 font-sans text-base leading-relaxed" style={{ color: world.inkMuted }}>
                {c.body}
              </p>
            </div>
          ))}
          <div className="w-6 shrink-0" />
        </motion.div>

        {/* scroll progress rail */}
        <div className="mt-12 px-6 sm:px-12 lg:px-20">
          <div
            className="h-px w-full overflow-hidden"
            style={{
              backgroundColor: world.element === "ice" ? "rgba(5, 5, 6, 0.15)" : "rgba(255,255,255,0.12)",
            }}
          >
            <motion.div className="h-px" style={{ width: progress, background: world.accent }} />
          </div>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: world.inkMuted, opacity: 0.45 }}>scroll →</p>
        </div>
      </div>
    </div>
  );
}

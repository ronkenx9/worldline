import { useScroll, useTransform, motion } from "motion/react";

/**
 * The scroll mechanic: a light descends a thread as you scroll, and the page
 * shifts from an ethereal light "birth" at the top into Archive-Night depths.
 * The light = memory traveling the worldline; each section ignites as it passes.
 *
 * Fixed, behind content (pointer-events-none). Driven by whole-page scroll
 * progress via motion's useScroll/useTransform (GPU-friendly transforms only).
 */

// A gentle vertical S-curve the light travels down. Normalized (0..1) → viewBox 1000.
const waveX = (t: number) => 0.5 + 0.17 * Math.sin(t * Math.PI * 2.5);
const PATH = (() => {
  const pts: string[] = [];
  const N = 80;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push(`${(waveX(t) * 1000).toFixed(1)} ${(t * 1000).toFixed(1)}`);
  }
  return "M " + pts.join(" L ");
})();

export function ScrollStage() {
  const { scrollYProgress } = useScroll();

  // the descending light node, following the same wave the thread is drawn from
  const nodeLeft = useTransform(scrollYProgress, (t) => `${waveX(t) * 100}vw`);
  const nodeTop = useTransform(scrollYProgress, (t) => `${t * 100}vh`);
  // bright trail reveals from top down to the node
  const trailOffset = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base depths */}
      <div className="absolute inset-0 bg-void" />
      {/* faint depth glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 50% at 50% 120%, rgba(122,92,255,0.10), transparent 60%)",
        }}
      />

      {/* the thread the light travels */}
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <filter id="threadglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        {/* dim full thread */}
        <path d={PATH} fill="none" stroke="rgba(233,226,208,0.10)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        {/* bright lit trail (top → node) */}
        <motion.path
          d={PATH}
          fill="none"
          stroke="var(--color-memory)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray={1}
          style={{ strokeDashoffset: trailOffset, filter: "url(#threadglow)" }}
        />
        <motion.path
          d={PATH}
          fill="none"
          stroke="var(--color-memory)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray={1}
          style={{ strokeDashoffset: trailOffset }}
        />
      </svg>

      {/* the descending light node */}
      <motion.div className="absolute" style={{ left: nodeLeft, top: nodeTop }}>
        <div className="-translate-x-1/2 -translate-y-1/2">
          <div
            className="h-3 w-3 rounded-full bg-memory"
            style={{ boxShadow: "0 0 16px 5px var(--color-memory), 0 0 48px 16px rgba(125,232,224,0.55), 0 0 100px 40px rgba(140,255,184,0.25)" }}
          />
        </div>
      </motion.div>
    </div>
  );
}

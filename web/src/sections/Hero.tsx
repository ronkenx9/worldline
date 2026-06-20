import { motion } from "motion/react";
import { Suspense } from "react";
import { WorldlineCanvas } from "../components/WorldlineCanvas.tsx";

export function Hero() {
  return (
    <section className="relative h-[88vh] min-h-[600px] w-full">
      {/* WebGL worldline scene */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <WorldlineCanvas />
        </Suspense>
      </div>

      {/* legibility wash + content */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <div
          className="pointer-events-none absolute h-72 w-[44rem] max-w-[92vw] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(5,5,6,0.78), transparent)" }}
        />
        <motion.h1
          className="relative font-display text-5xl font-medium leading-[1.05] text-bone drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)] sm:text-6xl md:text-7xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Every world<br />remembers.
        </motion.h1>

        <motion.p
          className="relative mt-7 max-w-xl font-sans text-lg leading-relaxed text-bone/70"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          The cross-game memory layer for AI worlds. A player's actions in one game become
          portable, verified <span className="text-canon">canon</span> that other games read and react to.
        </motion.p>

        <motion.div
          className="pointer-events-auto relative mt-9 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <a href="#demo" className="rounded-full bg-memory px-6 py-3 font-sans text-sm font-semibold text-void transition-transform hover:scale-[1.03]">
            See it remember
          </a>
          <a href="#sdk" className="rounded-full border border-bone/25 px-6 py-3 font-sans text-sm font-medium text-bone/80 backdrop-blur-sm transition-colors hover:border-memory hover:text-memory">
            Read the SDK
          </a>
        </motion.div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] text-bone/30">
        SCROLL TO TRAVEL THE WORLDLINE
      </div>
    </section>
  );
}

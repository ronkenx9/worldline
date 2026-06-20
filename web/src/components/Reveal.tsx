import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Fade + rise on scroll-into-view. GPU-friendly (transform/opacity only). */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="mb-4 font-mono text-xs tracking-[0.3em] text-memory/70">{children}</p>;
}

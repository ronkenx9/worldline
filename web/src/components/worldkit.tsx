import { createContext, useContext, Fragment, type ReactNode, type RefObject } from "react";
import { motion } from "motion/react";

/* Shared primitives for the elemental world rooms (see WORLDS-BUILD-SPEC.md). */

export const EASE = [0.22, 1, 0.36, 1] as const;

/** The scroll container of the active world — reveals fire against THIS, not window. */
export const ScrollRoot = createContext<RefObject<HTMLDivElement> | null>(null);
export const useScrollRoot = () => useContext(ScrollRoot);

/** Block-level scroll reveal: fade + rise + blur-clear, in the element's rhythm. */
export function Reveal({
  children,
  delay = 0,
  y = 30,
  blur = 12,
  duration = 0.85,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  blur?: number;
  duration?: number;
  className?: string;
}) {
  const root = useScrollRoot();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ root: root ?? undefined, once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Split-text reveal — every headline animates per word (or per char), staggered
 * and tied to scroll. `rhythm` tunes timing to the element:
 *   fire = fast/flickery, water = flowing, ice = slow/crisp, earth = heavy.
 */
type Rhythm = "fire" | "water" | "ice" | "earth" | "default";
const RHYTHM: Record<Rhythm, { stagger: number; duration: number; y: number; blur: number }> = {
  fire: { stagger: 0.03, duration: 0.55, y: 24, blur: 8 },
  water: { stagger: 0.05, duration: 0.95, y: 30, blur: 12 },
  ice: { stagger: 0.07, duration: 1.0, y: 18, blur: 6 },
  earth: { stagger: 0.06, duration: 0.9, y: 40, blur: 10 },
  default: { stagger: 0.045, duration: 0.8, y: 26, blur: 10 },
};

export function SplitText({
  text,
  by = "word",
  rhythm = "default",
  delay = 0,
  className,
  style,
}: {
  text: string;
  by?: "word" | "char";
  rhythm?: Rhythm;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const root = useScrollRoot();
  const r = RHYTHM[rhythm];
  const items = by === "char" ? Array.from(text) : text.trim().split(/\s+/);
  return (
    <span aria-label={text} className={className} style={style}>
      {items.map((it, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          style={{ willChange: "transform, opacity, filter", marginRight: by === "word" ? "0.26em" : undefined }}
          initial={{ opacity: 0, y: r.y, filter: `blur(${r.blur}px)` }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ root: root ?? undefined, once: true, margin: "-10% 0px -10% 0px" }}
          transition={{ duration: r.duration, ease: EASE, delay: delay + i * r.stagger }}
        >
          {it === " " ? " " : it}
        </motion.span>
      ))}
    </span>
  );
}

/**
 * Renders body text with the element's key words in a glowing accent.
 * `flicker` adds a subtle living-flame animation (fire only).
 */
export function Highlighted({
  text,
  terms,
  color,
  flicker = false,
}: {
  text: string;
  terms?: string[];
  color: string;
  flicker?: boolean;
}) {
  if (!terms || terms.length === 0) return <>{text}</>;
  const esc = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`\\b(${esc.join("|")})\\b`, "gi");
  const set = new Set(terms.map((t) => t.toLowerCase()));
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        set.has(p.toLowerCase()) ? (
          <span
            key={i}
            className={flicker ? "wk-flame" : undefined}
            style={{ color, fontWeight: 500, textShadow: `0 0 18px ${color}66, 0 0 5px ${color}99` }}
          >
            {p}
          </span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

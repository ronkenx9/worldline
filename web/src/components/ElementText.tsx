import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Element } from "../lib/journey.ts";

interface ElementTextProps {
  text: string;
  element: Element;
  className?: string;
  active?: boolean;
}

export function ElementText({ text, element, className = "", active = true }: ElementTextProps) {
  const [ignited, setIgnited] = useState(false);
  const chars = Array.from(text);

  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => setIgnited(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIgnited(false);
    }
  }, [active]);

  // Common transition easing
  const ease = [0.22, 1, 0.36, 1];

  if (element === "fire") {
    return (
      <span className={`relative inline-block ${className}`}>
        {/* Heat Shimmer SVG Filter */}
        <svg width="0" height="0" className="absolute" aria-hidden>
          <filter id="fire-shimmer-fx" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015 0.04" numOctaves="3" seed="5" result="noise">
              <animate attributeName="baseFrequency" dur="5s" values="0.015 0.04; 0.025 0.06; 0.015 0.04" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>

        {/* Floating Embers Container */}
        {active && (
          <span className="pointer-events-none absolute inset-0 overflow-visible">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-orange-500"
                style={{
                  left: `${15 + i * 15}%`,
                  bottom: "10%",
                  boxShadow: "0 0 8px #ff5a1e, 0 0 4px #ff8a3d",
                }}
                animate={{
                  y: [-10, -110],
                  x: [0, Math.sin(i) * 35],
                  opacity: [0, 0.85, 0],
                  scale: [0.6, 1.3, 0.3],
                }}
                transition={{
                  duration: 2.2 + i * 0.4,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
              />
            ))}
          </span>
        )}

        <span
          style={{
            filter: "url(#fire-shimmer-fx)",
            textShadow: "0 0 35px rgba(255,90,30,0.52), 0 0 10px rgba(255,138,61,0.28)",
          }}
          className="relative inline-flex"
        >
          {chars.map((char, idx) => (
            <motion.span
              key={idx}
              className="inline-block origin-bottom"
              initial={{ opacity: 0, y: 35, scaleY: 1.4, filter: "blur(3px)", color: "#240a04" }}
              animate={ignited ? { opacity: 1, y: 0, scaleY: 1, filter: "none", color: "#ffffff" } : {}}
              transition={{
                duration: 0.7,
                ease: ease,
                delay: idx * 0.065,
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      </span>
    );
  }

  if (element === "water") {
    return (
      <span className={`relative inline-block select-none ${className}`}>
        {/* Shimmer reflection layer underneath */}
        <span
          className="absolute left-0 top-[85%] w-full origin-top -scale-y-100 opacity-12 blur-[4px]"
          style={{
            background: "linear-gradient(to bottom, rgba(95,210,224,0.4), transparent)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 25px rgba(95,210,224,0.3)",
          }}
          aria-hidden
        >
          {text}
        </span>

        {/* Main Water Text */}
        <span className="wk-water-text relative inline-flex">
          {chars.map((char, idx) => (
            <motion.span
              key={idx}
              className="inline-block"
              style={{ willChange: "transform, opacity, filter" }}
              initial={{ opacity: 0, y: 55, filter: "blur(6px)" }}
              animate={active ? { opacity: 1, y: 0, filter: "none" } : {}}
              transition={{
                duration: 1.25,
                ease: ease,
                delay: idx * 0.08,
              }}
            >
              <motion.span
                className="inline-block"
                animate={active ? {
                  y: [0, -6, 0],
                } : {}}
                transition={{
                  duration: 4.8,
                  repeat: Infinity,
                  delay: idx * 0.35,
                  ease: "easeInOut",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            </motion.span>
          ))}
        </span>
      </span>
    );
  }

  if (element === "ice") {
    return (
      <span className={`relative inline-block ${className}`}>
        {/* Specular sheen & Glassy overlay */}
        <span className="wk-ice-text relative inline-flex font-semibold">
          {chars.map((char, idx) => (
            <motion.span
              key={idx}
              className="inline-block"
              initial={{ opacity: 0, scale: 0.84, filter: "blur(1.5px)" }}
              animate={active ? { opacity: 1, scale: 1, filter: "none" } : {}}
              transition={{
                duration: 0.85,
                ease: [0.16, 1, 0.3, 1], // ultra crisp
                delay: idx * 0.045,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}

          {/* Hairline crack overlay */}
          {active && (
            <svg
              className="pointer-events-none absolute inset-x-0 top-1/2 h-4 w-full -translate-y-1/2 opacity-74"
              viewBox="0 0 400 20"
              fill="none"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 0 10 L 80 12 L 140 7 L 220 14 L 310 9 L 400 11"
                stroke="#bfe9f2"
                strokeWidth="1.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, ease: "easeOut", delay: 0.6 }}
              />
              <motion.path
                d="M 138 7 L 160 15 L 180 11"
                stroke="#9fd6e0"
                strokeWidth="0.8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 1.3 }}
              />
            </svg>
          )}
        </span>
      </span>
    );
  }

  // Earth element
  return (
    <span className={`relative inline-block ${className}`}>
      {/* Heavy 3D relief chiseled type */}
      <span
        className="wk-earth-text relative inline-flex font-bold"
        style={{
          textShadow: "1px 1px 0px #1f1409, 2px 2px 0px #1f1409, 3px 3px 0px #1f1409, 4px 4px 0px #1f1409, 5px 5px 8px rgba(0,0,0,0.85)",
        }}
      >
        {chars.map((char, idx) => (
          <motion.span
            key={idx}
            className="inline-block"
            initial={{ opacity: 0, y: 70, scale: 0.95, filter: "blur(3px)" }}
            animate={active ? { opacity: 1, y: 0, scale: 1, filter: "none" } : {}}
            transition={{
              duration: 1.1,
              ease: [0.22, 1, 0.36, 1],
              delay: idx * 0.09,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>
    </span>
  );
}

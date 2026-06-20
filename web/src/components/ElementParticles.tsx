import { useEffect, useRef } from "react";
import type { Element } from "../lib/journey.ts";

interface Cfg {
  count: number;
  rgb: string;
  dir: 1 | -1; // 1 = falls, -1 = rises
  speed: [number, number];
  drift: number;
  size: [number, number];
  glow: number;
  alpha: [number, number];
}

const CONFIG: Record<Element, Cfg> = {
  fire: { count: 80, rgb: "255,150,70", dir: -1, speed: [0.5, 1.3], drift: 0.4, size: [0.6, 2.2], glow: 8, alpha: [0.35, 0.9] },
  water: { count: 52, rgb: "150,225,235", dir: -1, speed: [0.18, 0.5], drift: 0.25, size: [1, 3], glow: 6, alpha: [0.18, 0.55] },
  ice: { count: 95, rgb: "232,246,250", dir: 1, speed: [0.25, 0.75], drift: 0.5, size: [0.6, 2], glow: 2, alpha: [0.3, 0.85] },
  earth: { count: 50, rgb: "222,176,116", dir: 1, speed: [0.04, 0.14], drift: 0.18, size: [0.7, 2], glow: 3, alpha: [0.2, 0.6] },
};

interface P { x: number; y: number; vy: number; r: number; a: number; sway: number; tw: number }
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Themed particle field for an elemental world. Only animates while `active`. */
export function ElementParticles({ element, active }: { element: Element; active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cfg = CONFIG[element];
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let ps: P[] = [];

    const spawn = (seed: boolean): P => ({
      x: Math.random() * w,
      y: seed ? Math.random() * h : cfg.dir === 1 ? -10 : h + 10,
      vy: rand(cfg.speed[0], cfg.speed[1]) * cfg.dir,
      r: rand(cfg.size[0], cfg.size[1]),
      a: rand(cfg.alpha[0], cfg.alpha[1]),
      sway: rand(-cfg.drift, cfg.drift),
      tw: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    ps = Array.from({ length: cfg.count }, () => spawn(true));
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.tw += 0.04;
        p.y += p.vy;
        p.x += Math.sin(p.tw) * p.sway;
        if (cfg.dir === -1 && p.y < -12) Object.assign(p, spawn(false));
        else if (cfg.dir === 1 && p.y > h + 12) Object.assign(p, spawn(false));
        const alpha = p.a * (0.55 + 0.45 * Math.sin(p.tw * 1.4));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cfg.rgb},${alpha})`;
        ctx.shadowBlur = cfg.glow;
        ctx.shadowColor = `rgba(${cfg.rgb},${alpha})`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [element, active]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />;
}

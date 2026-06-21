import { ElementParticles } from "./ElementParticles.tsx";
import type { World } from "../lib/journey.ts";

/** Full-bleed, layered, living background for an elemental world (deep dark + glow). */
export function WorldBackground({ world, active }: { world: World; active: boolean }) {
  const el = world.element;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* deep gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(130% 100% at 50% -5%, ${world.mid}, ${world.base} 62%), linear-gradient(180deg, ${world.base}, ${world.mid} 52%, ${world.color} 125%)`,
        }}
      />

      {/* elemental texture */}
      {el === "fire" && (
        <div
          className="wk-breathe absolute inset-x-0 bottom-0 h-[70%]"
          style={{ background: `radial-gradient(80% 100% at 50% 125%, ${world.accent}66, ${world.accentSoft}22 38%, transparent 70%)` }}
        />
      )}
      {el === "water" && (
        <div
          className="wk-drift absolute inset-0"
          style={{ background: `radial-gradient(55% 45% at 28% 8%, ${world.accent}26, transparent 60%), radial-gradient(48% 38% at 76% 28%, ${world.accentSoft}1c, transparent 60%)` }}
        />
      )}
      {el === "ice" && (
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(120% 90% at 50% -12%, ${world.accent}26, transparent 55%)`, boxShadow: `inset 0 0 220px 50px ${world.accent}14` }}
        />
      )}
      {el === "earth" && (
        <div
          className="wk-breathe absolute inset-x-0 bottom-0 h-[60%]"
          style={{ background: `radial-gradient(85% 80% at 50% 125%, ${world.accent}2e, transparent 62%)` }}
        />
      )}

      <ElementParticles element={el} active={active} />

      {/* film grain + inner vignette */}
      <div className="wk-grain absolute inset-0 opacity-[0.05]" />
      <div className="absolute inset-0" style={{ boxShadow: el === "ice" ? "none" : "inset 0 0 240px 70px rgba(0,0,0,0.55)" }} />
    </div>
  );
}

import { useRef, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollRoot, Reveal, SplitText, Highlighted } from "./worldkit.tsx";
import { WorldBackground } from "./WorldBackground.tsx";
import { WorldHero } from "./WorldHero.tsx";
import { ExplainCarousel } from "./ExplainCarousel.tsx";
import type { World } from "../lib/journey.ts";

/**
 * An elemental world room — a full-bleed, long, themed scroll environment.
 * HERO (giant word) → LEDE → SCENE 1..4 → CAROUSEL → CONCRETE EXAMPLE → OUTRO
 */
export function WorldRoom({ world, active = false }: { world: World; active?: boolean }) {
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  
  return (
    <ScrollRoot.Provider value={scrollEl}>
      <div
        ref={setScrollEl}
        data-world-artifact-scroll
        className="relative h-full w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden wk-hoverable-text"
        style={{
          "--accent": world.accent,
          color: world.ink,
        } as CSSProperties}
      >
        {/* sticky living background */}
        <div className="pointer-events-none sticky top-0 z-0 -mb-[100dvh] h-[100dvh] w-full overflow-hidden">
          <WorldBackground world={world} active={active} />
        </div>

        {scrollEl && (
          <div className="relative z-10">
            {/* Hero segment */}
            <WorldHero world={world} />

            {/* Scenes 1-4 */}
            {world.scenes.map((s, i) => (
              <section key={i} className="flex min-h-[82vh] items-center px-6 sm:px-12 lg:px-20 py-16">
                <div className="grid w-full items-start gap-8 md:grid-cols-12 md:gap-12">
                  <div className={`md:col-span-6 ${i % 2 ? "md:order-2 md:col-start-7" : "md:col-start-1"}`}>
                    <Reveal>
                      <span className="font-mono text-xs uppercase tracking-[0.24em]" style={{ color: world.accent }}>
                        {String(i + 1).padStart(2, "0")} · Scene
                      </span>
                    </Reveal>
                    <h3 className="mt-5 max-w-xl font-grotesk text-[clamp(2.4rem,5.5vw,4.4rem)] font-semibold uppercase leading-[0.95]" style={{ color: world.ink }}>
                      <SplitText text={s.heading} rhythm={world.element} />
                    </h3>
                  </div>
                  <div className={`md:col-span-5 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}>
                    <Reveal delay={0.12}>
                      <p className="font-sans text-lg leading-relaxed sm:text-xl" style={{ color: world.inkMuted }}>
                        <Highlighted text={s.body} terms={s.highlights} color={world.accent} flicker={world.element === "fire"} />
                      </p>
                      <div className="mt-7 border-l-2 pl-4" style={{ borderColor: world.accent }}>
                        <span className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: world.accent }}>
                          Plainly
                        </span>
                        <p className="mt-1.5 font-sans text-[15px] leading-relaxed" style={{ color: world.ink, opacity: 0.9 }}>{s.plain}</p>
                      </div>
                    </Reveal>
                  </div>
                </div>
              </section>
            ))}

            {/* Explainer Carousel */}
            <ExplainCarousel world={world} />

            {/* Concrete Example */}
            <section className="px-6 py-24 sm:px-12 lg:px-20 border-t border-b" style={{ borderColor: `${world.accent}14`, background: world.element === "ice" ? "rgba(10, 98, 133, 0.04)" : "rgba(0,0,0,0.22)" }}>
              <div className="mx-auto max-w-5xl">
                <Reveal>
                  <span className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: world.accent }}>
                    Concrete Example
                  </span>
                  <h2 className="mt-3 font-grotesk text-3xl font-semibold uppercase tracking-tight sm:text-4xl" style={{ color: world.ink }}>
                    {world.concreteExample.title}
                  </h2>
                  <p className="mt-2 font-sans text-sm sm:text-base" style={{ color: world.inkMuted, opacity: 0.75 }}>
                    {world.concreteExample.subtitle}
                  </p>
                </Reveal>

                <div className="mt-12">
                  <Reveal delay={0.1}>
                    <ConcreteShowcase type={world.concreteExample.type} accent={world.accent} />
                  </Reveal>
                </div>
              </div>
            </section>

            {/* Outro */}
            <section className="flex min-h-[72vh] flex-col items-center justify-center px-6 text-center sm:px-12 py-16">
              <Reveal>
                <p className="mx-auto max-w-3xl font-display text-[clamp(1.9rem,4.4vw,3.4rem)] italic leading-snug" style={{ color: world.ink }}>
                  {world.outro}
                </p>
                
                {world.element === "earth" ? (
                  <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                    <a
                      href="#"
                      className="pointer-events-auto rounded-full bg-[#7de8e0] px-8 py-3.5 font-sans text-sm font-semibold text-[#050506] transition-transform hover:scale-[1.03]"
                    >
                      View the live demo
                    </a>
                    <a
                      href="#"
                      className="pointer-events-auto rounded-full border border-white/20 px-8 py-3.5 font-sans text-sm font-medium text-white transition-colors hover:border-[#7de8e0] hover:text-[#7de8e0]"
                    >
                      Read the SDK
                    </a>
                    <a
                      href="#"
                      className="pointer-events-auto rounded-full border border-white/20 px-8 py-3.5 font-sans text-sm font-medium text-white transition-colors hover:border-[#7de8e0] hover:text-[#7de8e0]"
                    >
                      Inspect on-chain
                    </a>
                  </div>
                ) : (
                  <p className="mt-14 font-mono text-[10px] uppercase tracking-[0.32em]" style={{ color: world.ink, opacity: 0.35 }}>
                    keep scrolling to travel on ↓
                  </p>
                )}
              </Reveal>
            </section>
          </div>
        )}
      </div>
    </ScrollRoot.Provider>
  );
}

function ConcreteShowcase({ type, accent }: { type: string; accent: string }) {
  if (type === "fire") {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {/* Game A card */}
        <div className="rounded-2xl border p-6 bg-white/3" style={{ borderColor: `${accent}22` }}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-white/50">SOURCE GAME: NIGHTFALL</span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h4 className="mt-4 font-grotesk text-xl font-bold uppercase text-white">Syndicate Vault Heist</h4>
          <div className="mt-6 space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b pb-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <span className="text-white/40">Faction standing</span>
              <span className="text-[#8cffb8]">+95 (Revered)</span>
            </div>
            <div className="flex justify-between border-b pb-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <span className="text-white/40">Debt Ledger</span>
              <span className="text-white">5,000 Credits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Oaths Active</span>
              <span className="text-[#ff5a1e]">Syndicate Blood-Oath</span>
            </div>
          </div>
        </div>

        {/* Game B card (Amnesia) */}
        <div className="rounded-2xl border p-6 bg-white/1 relative overflow-hidden" style={{ borderColor: `${accent}14` }}>
          <div className="absolute inset-0 bg-red-950/8 flex flex-col items-center justify-center p-6 text-center backdrop-blur-[2px]">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ff5a1e] px-2 py-1 rounded bg-[#ff5a1e]1a border border-[#ff5a1e]2e">
              Local DB Amnesia
            </span>
            <p className="mt-3 font-sans text-sm text-white/70 max-w-xs">
              No record found. Freeport guards see a nameless stranger with zero faction standing.
            </p>
          </div>
          
          <div className="flex items-center justify-between opacity-20 select-none">
            <span className="font-mono text-xs text-white/50">DEST GAME: FREEPORTS</span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-white/20" />
          </div>
          <h4 className="mt-4 font-grotesk text-xl font-bold uppercase text-white/20 select-none">Freeport Trading Hub</h4>
          <div className="mt-6 space-y-3 font-mono text-xs opacity-20 select-none">
            <div className="flex justify-between border-b pb-2">
              <span className="text-white/40">Faction standing</span>
              <span className="text-white">00 (Unknown)</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-white/40">Debt Ledger</span>
              <span className="text-white">00 Credits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Oaths Active</span>
              <span className="text-white">None</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "water") {
    const steps = [
      { num: "01", name: "ACT", game: "Nightfall", text: "Player steals the Eastern Relic, breaking a sworn blood-oath." },
      { num: "02", name: "REMEMBER", game: "MemWal SDK", text: "Signed transaction is emitted. Encrypted and uploaded as a Walrus storage blob." },
      { num: "03", name: "RECONCILE", game: "Continuity", text: "Continuity Agent folds event into canon. Flags player as oathbreaker." },
      { num: "04", name: "REACT", game: "Freeports", text: "Freeports queries Sui pointer, loads verified canon, locks gates to player." },
    ];
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((s, idx) => (
          <div key={idx} className="relative rounded-xl border p-5 bg-white/3 flex flex-col justify-between" style={{ borderColor: `${accent}22` }}>
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="font-mono text-xs" style={{ color: accent }}>{s.num} · {s.name}</span>
                <span className="font-mono text-[9px] uppercase bg-white/5 px-2 py-0.5 rounded text-white/60">{s.game}</span>
              </div>
              <p className="font-sans text-sm text-white/80 leading-relaxed">{s.text}</p>
            </div>
            {idx < 3 && (
              <div className="hidden md:block absolute top-1/2 -right-3.5 -translate-y-1/2 z-10 text-white/20 select-none text-lg">
                →
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (type === "ice") {
    const [state, setState] = useState<"idle" | "verifying" | "success">("idle");

    const runVerify = () => {
      setState("verifying");
      setTimeout(() => {
        setState("success");
      }, 1200);
    };

    return (
      <div className="rounded-2xl border p-6 bg-white/3" style={{ borderColor: `${accent}22` }}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-6" style={{ borderColor: "rgba(10, 98, 133, 0.12)" }}>
          <div className="flex items-center gap-3">
            <span className="inline-block h-3 w-3 rounded-full bg-[#0a6285] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#050506]">CRYPTO INSPECTOR</span>
          </div>
          <span className="font-mono text-[10px] text-[#2c3539] font-medium">Status: {state === "idle" ? "UNVERIFIED" : state === "verifying" ? "VALIDATING..." : "VERIFIED"}</span>
        </div>

        <div className="space-y-4 font-mono text-xs">
          <div>
            <span className="block text-[#2c3539] opacity-70 mb-1">WALRUS EVENT BLOB ID</span>
            <span className="block p-3 rounded overflow-x-auto break-all font-semibold" style={{ background: "rgba(10,98,133,0.06)", border: "1px solid rgba(10,98,133,0.12)", color: "#0a6285" }}>
              walrus_blob:0x7b2f8a9e223bfd68cda287e02b662d5598687fa12025ccae918cba465fd2e0
            </span>
          </div>
          <div>
            <span className="block text-[#2c3539] opacity-70 mb-1">SUI CANON POINTER CONTRACT</span>
            <span className="block p-3 rounded overflow-x-auto break-all font-semibold" style={{ background: "rgba(10,98,133,0.06)", border: "1px solid rgba(10,98,133,0.12)", color: "#0a6285" }}>
              sui_pointer:0x4f12de88cfb08c90ad738a9d1b67e0e7a2b6f10c793ff8aa2266cb226e6ef12
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center py-4">
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.button
                key="idle-btn"
                onClick={runVerify}
                className="rounded-full px-8 py-3 font-mono text-xs uppercase tracking-wider font-semibold text-white transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: accent }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Verify Proof
              </motion.button>
            )}

            {state === "verifying" && (
              <motion.div
                key="verifying-spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 font-mono text-xs text-[#0a6285] font-semibold"
              >
                <svg className="animate-spin h-5 w-5 text-[#0a6285]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Validating Merkle Tree Root...</span>
              </motion.div>
            )}

            {state === "success" && (
              <motion.div
                key="success-receipt"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full text-center border p-5 rounded-xl"
                style={{ borderColor: "rgba(16, 185, 129, 0.3)", background: "rgba(16, 185, 129, 0.1)" }}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-[#10b981] text-xl font-bold" style={{ background: "rgba(16, 185, 129, 0.15)" }}>
                  ✓
                </div>
                <h5 className="mt-3 font-grotesk text-lg font-bold uppercase" style={{ color: "#064e3b" }}>Tamper-Evident Proof Validated</h5>
                <p className="mt-2 font-sans text-xs max-w-md mx-auto" style={{ color: "#14532d" }}>
                  Verification successful. 0 studios trusted. 100% cryptographic math. Event is locked into immutable Sui transaction logs and Walrus storage.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Earth (Code adapter)
  const [tab, setTab] = useState<"emit" | "read">("emit");

  const emitCode = `import { WorldlineAdapter } from "@worldline/sdk";

const adapter = new WorldlineAdapter({
  gameId: "nightfall",
  signer: playerDelegateKey
});

// Emit a signed action off the critical path
await adapter.emit("relic.theft", {
  target: "eastern_faction",
  severity: "high"
});`;

  const readCode = `import { WorldlineAdapter } from "@worldline/sdk";

const adapter = new WorldlineAdapter({
  gameId: "freeports"
});

// Fetch the player's reconciled canon
const canon = await adapter.getCanon(playerSoulId);

if (canon.flags.marked_oathbreaker) {
  // React dynamically in game logic
  npcs.get("guard").setBehavior("hostile");
  ui.showWarning("Gates are locked to oathbreakers.");
}`;

  return (
    <div className="rounded-2xl border bg-[#050506]/85 overflow-hidden" style={{ borderColor: `${accent}22` }}>
      <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <button
          onClick={() => setTab("emit")}
          className="px-6 py-4 font-mono text-xs uppercase tracking-wider transition-colors border-r text-center shrink-0"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            color: tab === "emit" ? accent : "rgba(255,255,255,0.4)",
            background: tab === "emit" ? "rgba(255,255,255,0.02)" : "transparent",
          }}
        >
          Emit Event (Game A)
        </button>
        <button
          onClick={() => setTab("read")}
          className="px-6 py-4 font-mono text-xs uppercase tracking-wider transition-colors text-center shrink-0"
          style={{
            color: tab === "read" ? accent : "rgba(255,255,255,0.4)",
            background: tab === "read" ? "rgba(255,255,255,0.02)" : "transparent",
          }}
        >
          Read Canon (Game B)
        </button>
      </div>
      <div className="p-6 overflow-x-auto">
        <pre className="font-mono text-xs text-white/80 leading-relaxed">
          <code>{tab === "emit" ? emitCode : readCode}</code>
        </pre>
      </div>
    </div>
  );
}

import { Reveal, SectionLabel } from "../components/Reveal.tsx";

// The seeded neutral Soul (src/universe/neutral.ts) — portable primitives, no genre.
const STANDINGS = [
  { k: "authority", v: -85 },
  { k: "market", v: 30 },
  { k: "underworld", v: 20 },
  { k: "guardians", v: 15 },
  { k: "public", v: 10 },
];
const TRAITS = [
  { k: "notoriety", v: 80, max: 100, min: 0 },
  { k: "trust", v: -60, max: 100, min: -100 },
  { k: "risk", v: 50, max: 100, min: -100 },
];
const FLAGS = ["marked", "indebted", "exiled · authority"];

function Bar({ v, min = -100, max = 100 }: { v: number; min?: number; max?: number }) {
  const pct = ((v - min) / (max - min)) * 100;
  const pos = v >= 0;
  return (
    <div className="h-1.5 w-full rounded-full bg-bone/10">
      <div
        className={`h-full rounded-full ${pos ? "bg-soul" : "bg-oath"}`}
        style={{ width: `${Math.max(6, pct)}%` }}
      />
    </div>
  );
}

function GamePanel({ tag, genre, name, scene, color }: { tag: string; genre: string; name: string; scene: string; color: string }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
      <div className="flex items-center justify-between">
        <span className="font-display text-lg text-bone">{name}</span>
        <span className="font-mono text-[10px] tracking-[0.2em]" style={{ color }}>{tag}</span>
      </div>
      <span className="mt-1 font-mono text-[11px] tracking-wide text-bone/40">{genre}</span>
      <p className="mt-5 font-sans text-sm leading-relaxed text-bone/70">{scene}</p>
    </div>
  );
}

export function Demo() {
  return (
    <section id="demo" className="mx-auto max-w-6xl px-6 py-28">
      <Reveal>
        <SectionLabel>THE PROOF</SectionLabel>
        <h2 className="max-w-2xl font-display text-4xl font-medium leading-tight text-bone sm:text-5xl">
          Betray one world. <span className="text-bone/45">Be remembered in the next.</span>
        </h2>
        <p className="mt-5 max-w-2xl font-sans text-lg leading-relaxed text-bone/60">
          One Soul, stored as setting-neutral behavior. Two completely different games read the same
          identity — and each localizes it into its own world. Same betrayal, same debt, same infamy.
        </p>
      </Reveal>

      <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-[1fr_minmax(280px,360px)_1fr]">
        <Reveal>
          <GamePanel
            name="Nightfall"
            genre="MODERN HEIST"
            tag="WORLD A"
            color="var(--color-memory)"
            scene="You post the job on encrypted boards under a known alias — but the first replies aren't buyers. They're warnings from Mara, your last advocate: your reputation has made you radioactive to the talent pool. One name, steep price."
          />
        </Reveal>

        {/* the Soul core */}
        <Reveal delay={0.1}>
          <div className="flex h-full flex-col rounded-2xl border border-memory/25 bg-memory/[0.03] p-6">
            <div className="text-center">
              <p className="font-mono text-[10px] tracking-[0.3em] text-memory/70">THE SOUL</p>
              <p className="mt-1 font-display text-xl text-bone">the-oathbreaker</p>
            </div>
            <div className="mt-6 space-y-3">
              {STANDINGS.map((s) => (
                <div key={s.k}>
                  <div className="mb-1 flex justify-between font-mono text-[11px] text-bone/50">
                    <span>{s.k}</span>
                    <span className={s.v >= 0 ? "text-soul" : "text-oath"}>{s.v > 0 ? `+${s.v}` : s.v}</span>
                  </div>
                  <Bar v={s.v} />
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3 border-t border-bone/10 pt-5">
              {TRAITS.map((t) => (
                <div key={t.k}>
                  <div className="mb-1 flex justify-between font-mono text-[11px] text-bone/50">
                    <span>{t.k}</span>
                    <span className={t.v >= 0 ? "text-canon" : "text-oath"}>{t.v}</span>
                  </div>
                  <Bar v={t.v} min={t.min} max={t.max} />
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-bone/10 pt-5">
              {FLAGS.map((f) => (
                <span key={f} className="rounded-full border border-oath/40 px-2.5 py-1 font-mono text-[10px] text-oath/90">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <GamePanel
            name="Highcourt"
            genre="COURTLY POLITICS"
            tag="WORLD B"
            color="var(--color-canon)"
            scene="Lady Verena of the Silver Consortium receives you behind a jeweled half-mask. “Your notoriety precedes you, Oathbreaker. My patronage has a price: retrieve a certain ledger from the vaults of the very Authority you betrayed.”"
          />
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <p className="mt-8 text-center font-sans text-sm text-bone/45">
          Same Soul. Two genres. The game decides what the memory <span className="text-bone/70">means</span> —
          the layer just makes sure it's <span className="text-memory">remembered</span>.
        </p>
      </Reveal>
    </section>
  );
}

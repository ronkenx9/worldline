import { Reveal, SectionLabel } from "../components/Reveal.tsx";

const PIPELINE = [
  { k: "Game Adapter", c: "text-bone" },
  { k: "Signed Event", c: "text-soul" },
  { k: "Walrus blob", c: "text-memory" },
  { k: "Sui pointer", c: "text-rift" },
  { k: "MemWal recall", c: "text-memory" },
  { k: "Continuity", c: "text-canon" },
  { k: "Canon", c: "text-canon" },
];

const PILLARS = [
  { t: "Hot gameplay", d: "Interaction is served from a fast layer; durable writes happen behind it." },
  { t: "Durable memory", d: "Events and canon live on Walrus — content-addressed, verifiable, not in any game." },
  { t: "Verified canon", d: "The mutable pointer is a Sui object with on-chain compare-and-swap. No game can forge it." },
];

export function Architecture() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <Reveal>
        <SectionLabel>UNDER THE HOOD</SectionLabel>
        <h2 className="max-w-2xl font-display text-4xl font-medium leading-tight text-bone sm:text-5xl">
          Hot gameplay. Durable memory. Verified canon.
        </h2>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-12 flex flex-wrap items-center gap-x-2 gap-y-3 rounded-2xl border border-bone/10 bg-bone/[0.02] p-6 font-mono text-xs sm:text-sm">
          {PIPELINE.map((p, i) => (
            <span key={p.k} className="flex items-center gap-2">
              <span className={p.c}>{p.k}</span>
              {i < PIPELINE.length - 1 && <span className="text-bone/25">→</span>}
            </span>
          ))}
        </div>
      </Reveal>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {PILLARS.map((p, i) => (
          <Reveal key={p.t} delay={i * 0.1}>
            <div className="h-full rounded-2xl border border-bone/10 bg-bone/[0.02] p-7">
              <h3 className="font-display text-xl text-bone">{p.t}</h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-bone/55">{p.d}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-6 rounded-2xl border border-canon/20 bg-canon/[0.03] p-6">
          <p className="font-mono text-[11px] tracking-[0.2em] text-canon/80">LIVE ON SUI TESTNET</p>
          <p className="mt-2 break-all font-mono text-xs text-bone/55">
            blackboard package · 0xf7954ab3f832d2b609a828653a62ab22f5eb1953713f54e311e3c8a1fc7d8470
          </p>
          <p className="mt-1 break-all font-mono text-xs text-bone/55">
            shared object · 0x77b0b5077fc3705f19085bbaa441aa48f18619cf8931b7eb141a2e8d5980d0b8
          </p>
        </div>
      </Reveal>
    </section>
  );
}

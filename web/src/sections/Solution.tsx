import { Reveal, SectionLabel } from "../components/Reveal.tsx";

const STEPS = [
  { k: "ACT", c: "text-soul", d: "A player does something consequential in a game." },
  { k: "REMEMBER", c: "text-memory", d: "It becomes a signed event — durable on Walrus, recallable by any world." },
  { k: "RECONCILE", c: "text-memory", d: "The Continuity agent reasons it into shared canon — not last-write-wins." },
  { k: "REACT", c: "text-canon", d: "Another game reads the canon and shapes its scene around your history." },
];

export function Solution() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <Reveal>
        <SectionLabel>THE LAYER</SectionLabel>
        <h2 className="max-w-2xl font-display text-4xl font-medium leading-tight text-bone sm:text-5xl">
          A shared canon for playable worlds.
        </h2>
        <p className="mt-5 max-w-xl font-sans text-lg leading-relaxed text-bone/60">
          WORLDLINE turns a player's actions into signed events, stores them as durable memory,
          reconciles them into canon, and lets other games react. One loop.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-bone/10 bg-bone/10 md:grid-cols-4">
        {STEPS.map((s, i) => (
          <Reveal key={s.k} delay={i * 0.08} className="bg-void">
            <div className="h-full bg-void p-7">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-bone/30">{`0${i + 1}`}</span>
                <span className={`font-mono text-sm tracking-[0.2em] ${s.c}`}>{s.k}</span>
              </div>
              <p className="mt-4 font-sans text-sm leading-relaxed text-bone/55">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 text-center font-mono text-xs tracking-[0.2em] text-bone/30">
        ACT → REMEMBER → RECONCILE → REACT
      </p>
    </section>
  );
}

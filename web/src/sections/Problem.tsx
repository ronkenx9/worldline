import { Reveal, SectionLabel } from "../components/Reveal.tsx";

const CARDS = [
  {
    title: "Every game starts from zero",
    body: "Close the tab and your story is gone. The next session has never met you.",
    accent: "text-oath",
  },
  {
    title: "NPCs share no memory",
    body: "Even reasoning AI characters act like strangers. Nothing one world learns reaches another.",
    accent: "text-canon",
  },
  {
    title: "Interoperability is skin-deep",
    body: "Cosmetics travel between games. Consequences never do. Identity stops at the door.",
    accent: "text-rift",
  },
];

export function Problem() {
  return (
    <section id="thesis" className="mx-auto max-w-6xl px-6 py-28">
      <Reveal>
        <SectionLabel>THE GAP</SectionLabel>
        <h2 className="max-w-2xl font-display text-4xl font-medium leading-tight text-bone sm:text-5xl">
          Games forget you. <span className="text-bone/45">AI worlds shouldn't.</span>
        </h2>
        <p className="mt-5 max-w-xl font-sans text-lg leading-relaxed text-bone/60">
          The cost of building a world just collapsed to zero. We're about to have a million
          intelligent worlds that can't remember you and can't talk to each other. That's not a
          medium — it's a graveyard of demos.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {CARDS.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.1}>
            <div className="h-full rounded-2xl border border-bone/10 bg-bone/[0.02] p-7 transition-colors hover:border-bone/25">
              <div className={`mb-4 font-mono text-2xl ${c.accent}`}>0{i + 1}</div>
              <h3 className="font-display text-xl text-bone">{c.title}</h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-bone/55">{c.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

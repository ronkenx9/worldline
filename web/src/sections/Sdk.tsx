import { Reveal, SectionLabel } from "../components/Reveal.tsx";

const CODE = `// A game plugs in by implementing one contract.
registry.register({
  source: "nightfall",
  eventTypes: ["world.act"],
  gamemaster,          // reads soul + canon → reasons → emits events
});

// In play:
const soul  = await bb.recallSoul(player, "history with the authority");
const canon = await bb.getCanon(universe, schema);

// Continuity (the sole canon writer) reconciles — never last-write-wins.
await continuity.tick(bb, universe, schema);`;

export function Sdk() {
  return (
    <section id="sdk" className="mx-auto max-w-6xl px-6 py-28">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <SectionLabel>FOR DEVELOPERS</SectionLabel>
          <h2 className="font-display text-4xl font-medium leading-tight text-bone sm:text-5xl">
            Plug any game into the canon layer.
          </h2>
          <p className="mt-5 max-w-md font-sans text-lg leading-relaxed text-bone/60">
            You never integrate with other studios — you integrate with the memory. Implement one
            adapter, read the Soul, emit signed events. The agents coordinate through shared state.
          </p>
          <p className="mt-6 font-mono text-xs tracking-[0.2em] text-bone/35">
            WALRUS · SUI · MEMWAL · SEAL
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="overflow-hidden rounded-2xl border border-bone/10 bg-[#0b0b0d]">
            <div className="flex items-center gap-2 border-b border-bone/10 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-oath/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-canon/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-soul/60" />
              <span className="ml-2 font-mono text-[11px] text-bone/40">adapter.ts</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed text-bone/80">
              <code>{CODE}</code>
            </pre>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

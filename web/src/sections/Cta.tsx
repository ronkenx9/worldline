import { Reveal } from "../components/Reveal.tsx";

export function Cta() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-32">
      <Reveal className="flex flex-col items-center text-center">
        <h2 className="font-display text-5xl font-medium leading-[1.05] text-bone sm:text-6xl">
          Build worlds<br />that remember.
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="#demo" className="rounded-full bg-memory px-7 py-3 font-sans text-sm font-semibold text-void transition-transform hover:scale-[1.03]">
            See the demo
          </a>
          <a href="#sdk" className="rounded-full border border-bone/20 px-7 py-3 font-sans text-sm font-medium text-bone/80 transition-colors hover:border-memory hover:text-memory">
            Integrate the SDK
          </a>
        </div>
        <p className="mt-14 font-display text-lg italic text-bone/40">The player is the platform.</p>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-bone/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">
        <span className="font-mono text-sm tracking-[0.3em] text-bone/70">WORLDLINE</span>
        <span className="font-mono text-xs text-bone/30">One player. Many worlds. One continuous story.</span>
      </div>
    </footer>
  );
}

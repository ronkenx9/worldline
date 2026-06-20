import { ScrollJourney } from "./sections/ScrollJourney.tsx";

export function App() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-void">
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 mix-blend-difference sm:px-10">
        <span className="font-mono text-sm tracking-[0.3em] text-bone">WORLDLINE</span>
        <nav className="hidden gap-8 font-sans text-sm text-bone/70 sm:flex">
          <a className="transition-opacity hover:opacity-60" href="#">Thesis</a>
          <a className="transition-opacity hover:opacity-60" href="#">Demo</a>
          <a className="transition-opacity hover:opacity-60" href="#">SDK</a>
        </nav>
      </header>

      <ScrollJourney />
    </div>
  );
}

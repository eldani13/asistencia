import type { ScanLayoutProps } from "@/types/scan/scan-layout";

export const ScanLayout = ({ title, subtitle, children }: ScanLayoutProps) => (
  <main className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-14 text-slate-100">
    <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
    <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />

    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10">
      <header className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-300">
          Scan facial
        </p>
        <h1 className="text-4xl font-semibold text-slate-100 font-['Space_Grotesk',ui-sans-serif]">
          {title}
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">{subtitle}</p>
      </header>

      {children}
    </div>
  </main>
);

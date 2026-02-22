"use client";

export const LoadingCard = ({ title }: { title: string }) => (
  <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-12">
    <div className="pointer-events-none absolute -left-20 top-14 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
    <div className="pointer-events-none absolute -right-16 bottom-12 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

    <div className="relative w-full max-w-lg rounded-4xl border border-white/10 bg-slate-950/80 p-8 text-center shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-300/10">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-slate-100">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">Espera un momento.</p>
      <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-amber-300/70" />
      </div>
    </div>
  </main>
);

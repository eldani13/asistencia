"use client";

export const LoadingCard = ({ title }: { title: string }) => (
  <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-slate-950/70 p-8 text-center shadow-lg">
    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
    <h2 className="mt-4 text-xl font-semibold text-slate-100">{title}</h2>
    <p className="mt-2 text-slate-400">Espera un momento.</p>
  </div>
);

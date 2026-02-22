const steps = [
  "Mira directo a la camara.",
  "Quita gorras o lentes oscuros.",
  "Espera la confirmacion.",
];

export const ScanStepsPanel = () => (
  <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-xl">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pasos</p>
    <ol className="mt-4 space-y-3 text-sm text-slate-300">
      {steps.map((step, index) => (
        <li key={step}>{index + 1}. {step}</li>
      ))}
    </ol>
  </div>
);

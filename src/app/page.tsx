import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-start justify-center gap-10 px-6 py-16">
      <header className="flex flex-col gap-6">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-300">
          Control de acceso
        </p>
        <h1 className="text-4xl font-semibold text-slate-100 md:text-6xl">
          Gestion simple, clara y privada.
        </h1>
        <p className="max-w-xl text-base text-slate-300 md:text-lg">
          Un panel minimalista para registrar personal, validar identidad y llevar
          asistencia diaria sin fricciones.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            className="rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-slate-900"
            href="/scan"
          >
            Iniciar
          </Link>
          <Link
            className="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-slate-100"
            href="/login"
          >
            Administrar
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
        <span className="rounded-full border border-white/10 px-4 py-2">
          Registro rapido
        </span>
        <span className="rounded-full border border-white/10 px-4 py-2">
          Identidad validada
        </span>
        <span className="rounded-full border border-white/10 px-4 py-2">
          Reportes diarios
        </span>
      </div>
    </main>
  );
}

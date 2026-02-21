import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
          Control de asistencia
        </p>
        <h1 className="text-4xl font-semibold text-slate-100 md:text-6xl">
          Asistencia por QR y rostro en tiempo real
        </h1>
        <p className="max-w-2xl text-lg text-slate-300">
          Diseñado para colegios: scan rapido, reconocimiento facial y panel admin
          con reportes, todo 100% frontend con Firebase.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            className="rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-slate-900"
            href="/scan"
          >
            Iniciar scan
          </Link>
          <Link
            className="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-slate-100"
            href="/login"
          >
            Panel admin
          </Link>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Entrada y salida automatizada",
            description: "El sistema decide si es entrada o salida segun el dia.",
          },
          {
            title: "Seguridad sin backend",
            description: "Firebase Auth y Firestore con reglas estrictas.",
          },
          {
            title: "Admin con control total",
            description: "Alta de profesores, rostros, ajustes y reportes.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-slate-100">{card.title}</h3>
            <p className="mt-3 text-sm text-slate-300">{card.description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

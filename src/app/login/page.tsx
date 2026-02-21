"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { StatusBanner } from "@/components/StatusBanner";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      router.push("/admin");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al ingresar";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-100">Login admin</h1>
        <p className="mt-2 text-sm text-slate-300">
          Acceso exclusivo para personal autorizado.
        </p>

        {error ? (
          <div className="mt-4">
            <StatusBanner tone="error" title="No se pudo ingresar" message={error} />
          </div>
        ) : null}

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Email
            <input
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-amber-300"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@colegio.com"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Contrasena
            <input
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-amber-300"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button
            className="mt-2 rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <Link className="mt-6 inline-flex text-sm text-slate-300" href="/">
          Volver
        </Link>
      </div>
    </main>
  );
}

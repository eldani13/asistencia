"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LoadingCard } from "./LoadingCard";

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, adminProfile, loading } = useAuth();

  if (loading) {
    return <LoadingCard title="Verificando acceso" />;
  }

  if (!user || !adminProfile) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-12">
        <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative w-full max-w-lg rounded-4xl border border-white/10 bg-slate-950/80 p-8 text-center shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-300/10">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6 text-amber-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 17v2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              <rect x="6" y="11" width="12" height="8" rx="2" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-slate-100">
            Acceso restringido
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Necesitas ingresar con una cuenta admin para continuar.
          </p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-400">
            Si crees que esto es un error, contacta al administrador del sistema.
          </div>
          <Link
            className="mt-6 inline-flex w-full justify-center rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-amber-300"
            href="/login"
          >
            Ir a login
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
};

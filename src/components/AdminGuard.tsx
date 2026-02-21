"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { LoadingCard } from "./LoadingCard";

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, adminProfile, loading } = useAuth();

  if (loading) {
    return <LoadingCard title="Verificando acceso" />;
  }

  if (!user || !adminProfile) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-slate-950/70 p-8 text-center shadow-lg">
        <h2 className="text-2xl font-semibold text-slate-100">Acceso restringido</h2>
        <p className="mt-3 text-slate-300">
          Necesitas ingresar con una cuenta admin.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-slate-900"
          href="/login"
        >
          Ir a login
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};

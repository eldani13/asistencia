import { useState } from "react";

type AdminsCardProps = {
  adminEmail: string;
  adminPassword: string;
  onAdminEmailChange: (value: string) => void;
  onAdminPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const AdminsCard = ({
  adminEmail,
  adminPassword,
  onAdminEmailChange,
  onAdminPasswordChange,
  onSubmit,
}: AdminsCardProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="rounded-4xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Admins</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100">
            Crear usuario admin
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Accesos adicionales para el panel.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
            Seguridad
          </p>
          <p className="mt-1 text-sm font-semibold text-amber-300">1 hora</p>
        </div>
      </div>

      <form
        className="mt-6 rounded-3xl border border-white/10 bg-linear-to-br from-slate-900/70 via-slate-950/70 to-slate-900/60 p-5"
        onSubmit={onSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs text-slate-400">
            Email
            <input
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
              placeholder="Email"
              type="email"
              value={adminEmail}
              onChange={(event) => onAdminEmailChange(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-xs text-slate-400">
            Contrasena
            <div className="relative">
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 pr-12 text-sm text-slate-100"
                placeholder="Contrasena"
                type={showPassword ? "text" : "password"}
                value={adminPassword}
                onChange={(event) => onAdminPasswordChange(event.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-slate-300 hover:text-amber-300"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-7.5a11.05 11.05 0 0 1 4.15-5.22" />
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M3 3l18 18" />
                    </>
                  ) : (
                    <>
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </label>
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
          Recomendacion: usa al menos 8 caracteres y mezcla letras y numeros.
        </div>
        <button
          className="mt-5 w-full rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-amber-300"
          type="submit"
        >
          Crear admin
        </button>
      </form>
    </section>
  );
};

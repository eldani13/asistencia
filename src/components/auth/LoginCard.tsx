import { StatusBanner } from "@/components/StatusBanner";

type LoginCardProps = {
  email: string;
  password: string;
  showPassword: boolean;
  error: string | null;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const LoginCard = ({
  email,
  password,
  showPassword,
  error,
  loading,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
}: LoginCardProps) => (
  <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-16">
    <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
    <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />

    <div className="relative w-full max-w-lg rounded-4xl border border-white/10 bg-slate-950/80 p-8 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-100">Iniciar sesion</h1>
          <p className="mt-2 text-sm text-slate-300">
            Acceso exclusivo para personal autorizado.
          </p>
        </div>
        <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center sm:block">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
            Seguridad
          </p>
          <p className="mt-1 text-sm font-semibold text-amber-300">1 hora</p>
        </div>
      </div>

      {error ? (
        <div className="mt-4">
          <StatusBanner tone="error" title="No se pudo ingresar" message={error} />
        </div>
      ) : null}

      <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
        <label className="flex flex-col gap-2 text-xs text-slate-400">
          Email
          <input
            className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-300"
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="admin@colegio.com"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-xs text-slate-400">
          Contrasena
          <div className="relative">
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 pr-12 text-sm text-slate-100 outline-none focus:border-amber-300"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              required
              placeholder="*********"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-slate-300 hover:text-amber-300"
              onClick={onTogglePassword}
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
        <button
          className="mt-2 rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  </main>
);

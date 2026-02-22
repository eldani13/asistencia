import type { AdminHeaderProps } from "@/types/admin/admin-header";

export const AdminHeader = ({
  email,
  onSignOut,
  onMenuClick,
  showMenuButton,
  showSignOut = true,
}: AdminHeaderProps) => (
  <header className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
        Panel admin
      </p>
      <h1 className="text-4xl font-semibold text-slate-100">Gestion de asistencia</h1>
      <p className="text-sm text-slate-300">{email}</p>
    </div>
    <div className="flex items-center gap-3">
      {showMenuButton ? (
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-white/20 p-2 text-slate-100 lg:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menu"
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
            <path d="M3 6h18" />
            <path d="M3 12h18" />
            <path d="M3 18h18" />
          </svg>
        </button>
      ) : null}
      {showSignOut ? (
        <button
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-slate-100 cursor-pointer"
          onClick={onSignOut}
        >
          Cerrar sesion
        </button>
      ) : null}
    </div>
  </header>
);

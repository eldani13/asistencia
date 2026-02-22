import Image from "next/image";
import type { AdminSidebarProps, AdminView } from "@/types/admin/admin-sidebar";

export const AdminSidebar = ({
  adminEmail,
  sidebarOpen,
  sidebarCollapsed,
  activeView,
  onClose,
  onToggleCollapse,
  onChangeView,
  onSignOut,
}: AdminSidebarProps) => (
  <aside
    className={`fixed inset-y-0 left-0 z-40 flex h-screen -translate-x-full flex-col border-r border-white/10 bg-linear-to-b from-slate-950 via-slate-950/90 to-slate-900/80 p-6 shadow-2xl backdrop-blur transition-transform lg:translate-x-0 ${
      sidebarCollapsed ? "w-72 lg:w-24" : "w-80"
    } ${sidebarOpen ? "translate-x-0" : ""}`}
  >
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        </div>
        <div className={sidebarCollapsed ? "lg:hidden" : ""}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
            Admin
          </p>
          <p
            className="text-xs text-slate-300 max-w-[140px] truncate break-all block lg:max-w-[100px] xl:max-w-[180px]"
            title={adminEmail}
          >
            {adminEmail}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="rounded-full border border-white/20 p-2 text-slate-100 lg:hidden"
        onClick={onClose}
        aria-label="Cerrar menu"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 6l12 12" />
          <path d="M18 6l-12 12" />
        </svg>
      </button>
    </div>

    <div className="mt-6 hidden items-center gap-2 lg:flex">
      <button
        type="button"
        className="rounded-full border border-white/20 p-2 text-slate-100"
        onClick={onToggleCollapse}
        aria-label={sidebarCollapsed ? "Expandir barra" : "Colapsar barra"}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {sidebarCollapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
        </svg>
      </button>
      <span className={`text-xs text-slate-400 ${sidebarCollapsed ? "lg:hidden" : ""}`}>
        {sidebarCollapsed ? "" : "Barra"}
      </span>
    </div>

    <nav className="mt-8 flex flex-1 flex-col gap-6 text-sm text-slate-200">
      <div className="space-y-2">
        <p
          className={`flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-slate-500 ${
            sidebarCollapsed ? "lg:hidden" : ""
          }`}
        >
          General
          <span className="h-px flex-1 bg-white/10" />
        </p>
        {[{ id: "dashboard", label: "Dashboard" }].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onChangeView(item.id as AdminView);
              onClose();
            }}
            className={`relative flex w-full items-center gap-3 rounded-2xl border px-4 py-2 text-left transition-all duration-200 hover:border-white/30 hover:bg-white/5 hover:shadow lg:justify-start ${
              activeView === item.id
                ? "border-amber-300/60 bg-amber-300/10 text-amber-200 ring-1 ring-amber-300/30"
                : "border-white/10"
            } ${sidebarCollapsed ? "lg:justify-center lg:gap-0 lg:px-0 lg:border-transparent lg:bg-transparent" : ""}`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 ${
                activeView === item.id
                  ? "border-amber-300/50 bg-amber-300/15 text-amber-200"
                  : ""
              }`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 13h8V3H3v10z" />
                <path d="M13 21h8v-6h-8v6z" />
                <path d="M13 3h8v8h-8z" />
                <path d="M3 21h8v-4H3v4z" />
              </svg>
            </span>
            <span className={sidebarCollapsed ? "lg:hidden" : ""}>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p
          className={`flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-slate-500 ${
            sidebarCollapsed ? "lg:hidden" : ""
          }`}
        >
          Profesores
          <span className="h-px flex-1 bg-white/10" />
        </p>
        {[
          { id: "registrar-profesor", label: "Registrar profesor" },
          { id: "lista-profesores", label: "Lista de profesores" },
          { id: "registrar-rostros", label: "Registrar rostros" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onChangeView(item.id as AdminView);
              onClose();
            }}
            className={`relative flex w-full items-center gap-3 rounded-2xl border px-4 py-2 text-left transition-all duration-200 hover:border-white/30 hover:bg-white/5 hover:shadow lg:justify-start ${
              activeView === item.id
                ? "border-amber-300/60 bg-amber-300/10 text-amber-200 ring-1 ring-amber-300/30"
                : "border-white/10"
            } ${sidebarCollapsed ? "lg:justify-center lg:gap-0 lg:px-0 lg:border-transparent lg:bg-transparent" : ""}`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 ${
                activeView === item.id
                  ? "border-amber-300/50 bg-amber-300/15 text-amber-200"
                  : ""
              }`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <span className={sidebarCollapsed ? "lg:hidden" : ""}>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p
          className={`flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-slate-500 ${
            sidebarCollapsed ? "lg:hidden" : ""
          }`}
        >
          Operacion
          <span className="h-px flex-1 bg-white/10" />
        </p>
        {[
          { id: "crear-admin", label: "Crear usuario admin" },
          { id: "asistencias", label: "Asistencias" },
          { id: "reportes", label: "Reportes" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onChangeView(item.id as AdminView);
              onClose();
            }}
            className={`relative flex w-full items-center gap-3 rounded-2xl border px-4 py-2 text-left transition-all duration-200 hover:border-white/30 hover:bg-white/5 hover:shadow lg:justify-start ${
              activeView === item.id
                ? "border-amber-300/60 bg-amber-300/10 text-amber-200 ring-1 ring-amber-300/30"
                : "border-white/10"
            } ${sidebarCollapsed ? "lg:justify-center lg:gap-0 lg:px-0 lg:border-transparent lg:bg-transparent" : ""}`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 ${
                activeView === item.id
                  ? "border-amber-300/50 bg-amber-300/15 text-amber-200"
                  : ""
              }`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16v6H4z" />
                <path d="M4 14h16v6H4z" />
                <path d="M8 8h8" />
                <path d="M8 18h8" />
              </svg>
            </span>
            <span className={sidebarCollapsed ? "lg:hidden" : ""}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>

    <div className="mt-auto pt-6">
      <button
        className={`w-full rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-300/60 hover:text-amber-200 hover:bg-amber-300/10 ${
          sidebarCollapsed ? "lg:px-0 lg:py-3" : ""
        }`}
        onClick={onSignOut}
      >
        <span className={sidebarCollapsed ? "lg:hidden" : ""}>Cerrar sesion</span>
        <span className={`hidden ${sidebarCollapsed ? "lg:inline" : ""}`}>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v10" />
            <path d="M6.38 6.38a8 8 0 1 0 11.24 0" />
          </svg>
        </span>
      </button>
    </div>
  </aside>
);

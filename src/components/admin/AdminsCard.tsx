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
}: AdminsCardProps) => (
  <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
    <h2 className="text-lg font-semibold text-slate-100">Admins</h2>
    <p className="mt-2 text-sm text-slate-400">Crea accesos adicionales para el panel.</p>
    <form className="mt-4 flex flex-col gap-3" onSubmit={onSubmit}>
      <input
        className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
        placeholder="Email"
        type="email"
        value={adminEmail}
        onChange={(event) => onAdminEmailChange(event.target.value)}
        required
      />
      <input
        className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
        placeholder="Contrasena"
        type="password"
        value={adminPassword}
        onChange={(event) => onAdminPasswordChange(event.target.value)}
        required
      />
      <button
        className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900"
        type="submit"
      >
        Crear admin
      </button>
    </form>
  </div>
);

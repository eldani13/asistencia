"use client";

type StatusBannerProps = {
  tone: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
};

const toneStyles: Record<StatusBannerProps["tone"], string> = {
  success: "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
  error: "border-rose-400/40 bg-rose-500/10 text-rose-100",
  warning: "border-amber-400/40 bg-amber-500/10 text-amber-100",
  info: "border-sky-400/40 bg-sky-500/10 text-sky-100",
};

export const StatusBanner = ({ tone, title, message }: StatusBannerProps) => (
  <div className={`rounded-2xl border px-4 py-3 ${toneStyles[tone]}`}>
    <p className="text-sm font-semibold uppercase tracking-wide">{title}</p>
    {message ? <p className="mt-1 text-sm text-white/80">{message}</p> : null}
  </div>
);

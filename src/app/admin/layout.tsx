import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de administración",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

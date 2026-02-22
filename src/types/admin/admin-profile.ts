export type AdminProfile = {
  uid: string;
  email: string;
  role: "admin" | "superadmin";
  createdAt: Date | null;
};

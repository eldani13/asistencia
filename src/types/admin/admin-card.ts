export type AdminsCardProps = {
  adminEmail: string;
  adminPassword: string;
  onAdminEmailChange: (value: string) => void;
  onAdminPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

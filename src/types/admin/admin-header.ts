export type AdminHeaderProps = {
  email: string;
  onSignOut: () => Promise<void>;
  showMenuButton: boolean;
  onMenuClick: () => void;
  showSignOut?: boolean;
};

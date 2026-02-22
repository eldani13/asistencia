export type AdminSidebarProps = {
  adminEmail: string;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeView: string;
  onClose: () => void;
  onToggleCollapse: () => void;
  onChangeView: React.Dispatch<React.SetStateAction<string>>;
  onSignOut: () => Promise<void>;
};

export type AdminView = string;

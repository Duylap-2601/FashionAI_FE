import type { AdminPage } from '@/features/admin/types/admin-dashboard-page';

export interface AdminSidebarProps {
  activeTab: AdminPage;
  isOpen: boolean;
  onNavigate: (tab: AdminPage) => void;
  onClose: () => void;
  onLogout: () => void;
}

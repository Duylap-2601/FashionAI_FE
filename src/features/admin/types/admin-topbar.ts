import type { AdminPage } from '@/features/admin/types/admin-dashboard-page';

export interface AdminTopbarProps {
  activeTab: AdminPage;
  adminName: string;
  avatarUrl?: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenSidebar: () => void;
}

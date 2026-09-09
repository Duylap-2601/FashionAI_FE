import type { AdminStats, AdminUser } from '@/features/admin/types/admin-dashboard-page';

export interface AdminQuotaPanelProps {
  users: AdminUser[];
  stats: AdminStats | null;
}

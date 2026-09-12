import type { AdminWebhookFailure } from '@/features/admin/types/admin-dashboard-page';

export interface AdminWebhookFailuresPanelProps {
  failures: AdminWebhookFailure[];
  onResolve: (id: string) => void;
}

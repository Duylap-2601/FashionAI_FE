import type { AdminOrder, RevenueChartDays } from '@/features/admin/types/admin-dashboard-page';

export interface AdminRevenueChartProps {
  orders: AdminOrder[];
  days: RevenueChartDays;
}

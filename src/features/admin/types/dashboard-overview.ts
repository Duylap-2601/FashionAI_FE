import type { AdminOrder, AdminPage, AdminProduct, DashboardMetrics, RevenueChartDays } from '@/features/admin/types/admin-dashboard-page';

export interface DashboardOverviewProps {
  metrics: DashboardMetrics;
  orders: AdminOrder[];
  products: AdminProduct[];
  isLoading: boolean;
  setActiveTab: (tab: AdminPage) => void;
  openProductEditor: (product: Partial<AdminProduct> | null) => void;
  chartDays: RevenueChartDays;
  setChartDays: (days: RevenueChartDays) => void;
}

import type { AdminOrder, AdminPage, AdminProduct, AdminUser } from '@/features/admin/types/admin-dashboard-page';
import React from 'react';

export interface DashboardOverviewProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  fetchProducts: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchStats: () => Promise<void>;
  totalRevenue: number;
  avgOrderValue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  activeProducts: number;
  outOfStockCount: number;
  totalUsers: number;
  memberUsers: number;
  vipUsers: number;
  users: AdminUser[];
  setActiveTab: React.Dispatch<React.SetStateAction<AdminPage>>;
  shippingOrders: number;
  cancelledOrders: number;
  setChartDays: React.Dispatch<React.SetStateAction<7 | 14 | 30>>;
  setHoveredPoint: React.Dispatch<React.SetStateAction<{ x: number; y: number; label: string; dateKey: string; fullDate: string; revenue: number; ordersCount: number; } | null>>;
  chartDays: 7 | 14 | 30;
  renderRevenueChart: () => React.JSX.Element | null;
  orders: AdminOrder[];
  setSelectedOrder: React.Dispatch<React.SetStateAction<AdminOrder | null>>;
  products: AdminProduct[];
  openProductEditor: (product: Partial<AdminProduct> | null) => void;
}

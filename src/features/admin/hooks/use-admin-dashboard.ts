'use client';

import { useAdminAutoRefresh } from '@/features/admin/hooks/use-admin-auto-refresh';
import { useAdminNavigationEvents, useAdminTabs } from '@/features/admin/hooks/use-admin-navigation';
import { useAdminOrderIssues } from '@/features/admin/hooks/use-admin-order-issues';
import { useAdminOrders } from '@/features/admin/hooks/use-admin-orders';
import { useAdminOverviewData } from '@/features/admin/hooks/use-admin-overview-data';
import { useAdminProductEditor } from '@/features/admin/hooks/use-admin-product-editor';
import { useAdminProducts } from '@/features/admin/hooks/use-admin-products';
import { useAdminShipments } from '@/features/admin/hooks/use-admin-shipments';
import { useAdminUsers } from '@/features/admin/hooks/use-admin-users';
import { computeDashboardMetrics } from '@/features/admin/services/dashboard-metrics';
import type { AdminPage, RevenueChartDays } from '@/features/admin/types/admin-dashboard-page';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Ghép toàn bộ state của trang admin: các list, tab đang mở, lần tải đầu, đồng bộ realtime và số
 * liệu tổng quan. Mọi callback trả về đều có identity ổn định.
 */
export function useAdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  // true từ đầu vì trang tải toàn bộ dữ liệu ngay khi mount.
  const [isLoading, setIsLoading] = useState(true);
  const [chartDays, setChartDays] = useState<RevenueChartDays>(7);

  const { activeTab, setActiveTab, navigateAdminTab } = useAdminTabs();
  const products = useAdminProducts();
  const productEditor = useAdminProductEditor({ setProducts: products.setItems, onSaved: products.fetchList });
  const orders = useAdminOrders();
  const shipments = useAdminShipments({
    isActive: activeTab === 'shipments',
    refreshOrders: orders.fetchList,
    applyOrderUpdate: orders.applyOrderUpdate,
  });
  const issues = useAdminOrderIssues({ isActive: activeTab === 'order-issues' });
  const users = useAdminUsers();
  const overview = useAdminOverviewData({ products: products.items });

  const { fetchList: fetchProducts } = products;
  const { fetchList: fetchOrders, ordersRef, setSelectedOrder } = orders;
  const { refreshShipments, setSelectedShipment, changeFilters: changeShipmentFilters } = shipments;
  const { fetchList: fetchIssues } = issues;
  const { fetchUsers } = users;
  const { fetchStats, fetchReviewStats } = overview;

  const closeDetails = useCallback(() => {
    setSelectedOrder(null);
    setSelectedShipment(null);
  }, [setSelectedOrder, setSelectedShipment]);

  useAdminNavigationEvents({
    setActiveTab,
    navigateAdminTab,
    onSearchOrder: setSearchQuery,
    onShipmentTarget: changeShipmentFilters,
    onCloseDetails: closeDetails,
  });

  // Lần refresh trước bị huỷ (request bị thay thế) sẽ xong sớm: chỉ lần mới nhất được tắt loading.
  const refreshIdRef = useRef(0);
  const refresh = useCallback(async () => {
    const refreshId = ++refreshIdRef.current;
    setIsLoading(true);
    try {
      await Promise.all([fetchProducts(), fetchOrders(), refreshShipments(), fetchUsers(), fetchStats()]);
    } finally {
      if (refreshId === refreshIdRef.current) setIsLoading(false);
    }
  }, [fetchOrders, fetchProducts, fetchStats, fetchUsers, refreshShipments]);

  // Các fetch* có identity ổn định nên effect này chỉ chạy một lần khi mount.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Đánh giá chỉ hiện ở tab tổng quan: tải khi đang ở tab đó, sau mỗi lần tải dữ liệu xong.
  useEffect(() => {
    if (activeTab === 'dashboard' && !isLoading) void fetchReviewStats(products.items);
  }, [activeTab, isLoading, products.items, fetchReviewStats]);

  useAdminAutoRefresh({
    onRefresh: () => {
      void fetchOrders();
      void refreshShipments();
      void fetchStats();
    },
    // Tab khác không hiện đánh giá; vào lại tab tổng quan sẽ tự tải (effect ở trên).
    onNotification: () => {
      if (activeTab === 'dashboard') void fetchReviewStats();
    },
  });

  /** Đổi tab từ sidebar: xoá từ khoá tìm kiếm của tab trước. */
  const openTab = useCallback((tab: AdminPage) => {
    navigateAdminTab(tab);
    setSearchQuery('');
  }, [navigateAdminTab]);

  const openOrderByCode = useCallback((orderCode: number) => {
    const order = ordersRef.current.find(item => item.orderCode === orderCode);
    if (order) setSelectedOrder(order);
    navigateAdminTab('orders', { orderCode: String(orderCode) });
    setSearchQuery(String(orderCode));
  }, [navigateAdminTab, ordersRef, setSelectedOrder]);

  const handleIssueResolved = useCallback(() => {
    void fetchIssues();
    void fetchOrders();
  }, [fetchIssues, fetchOrders]);

  const metrics = useMemo(() => computeDashboardMetrics({
    stats: overview.stats,
    orders: orders.items,
    products: products.items,
    users: users.users,
    allUsers: users.allUsers,
    reviewsCount: overview.reviewsCount,
    avgRating: overview.avgRating,
  }), [overview.stats, overview.reviewsCount, overview.avgRating, orders.items, products.items, users.users, users.allUsers]);

  return {
    activeTab,
    navigateAdminTab,
    openTab,
    searchQuery,
    setSearchQuery,
    isLoading,
    refresh,
    chartDays,
    setChartDays,
    metrics,
    products,
    productEditor,
    orders,
    shipments,
    issues,
    users,
    overview,
    openOrderByCode,
    handleIssueResolved,
  };
}

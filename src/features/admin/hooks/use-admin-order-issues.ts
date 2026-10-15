'use client';

import { EMPTY_ORDER_ISSUE_FILTERS } from '@/features/admin/constants/admin-dashboard-page';
import { useAdminPaginatedList } from '@/features/admin/hooks/use-admin-paginated-list';
import { loadAdminOrderIssues } from '@/features/admin/services/admin-list-loaders';
import type { AdminOrderIssueFilters } from '@/features/admin/types/admin-order-issues-panel';
import type { OrderIssue } from '@/features/orders/types/orders';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

function handleOrderIssuesError(error: unknown) {
  console.error('Fetch order issues failed:', error);
  toast.error('Không thể tải danh sách báo lỗi đơn hàng.');
}

/** Báo lỗi & đổi trả: chỉ tải khi tab đang mở. */
export function useAdminOrderIssues({ isActive }: { isActive: boolean }) {
  const list = useAdminPaginatedList<OrderIssue, AdminOrderIssueFilters>({
    initialFilters: EMPTY_ORDER_ISSUE_FILTERS,
    load: loadAdminOrderIssues,
    onError: handleOrderIssuesError,
    enabled: isActive,
  });
  const { fetchList } = list;
  const [selectedIssue, setSelectedIssue] = useState<OrderIssue | null>(null);

  useEffect(() => {
    if (isActive) void fetchList();
  }, [isActive, fetchList]);

  return { ...list, selectedIssue, setSelectedIssue };
}

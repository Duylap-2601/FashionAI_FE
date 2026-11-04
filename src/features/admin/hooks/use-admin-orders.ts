'use client';

import { EMPTY_ORDER_FILTERS } from '@/features/admin/constants/admin-dashboard-page';
import { useAdminPaginatedList } from '@/features/admin/hooks/use-admin-paginated-list';
import { loadAdminOrders } from '@/features/admin/services/admin-list-loaders';
import type { AdminOrder } from '@/features/admin/types/admin-dashboard-page';
import type { AdminOrderFilters } from '@/features/admin/types/admin-orders-panel';
import { toast } from 'sonner';

function handleOrdersError(error: unknown) {
  console.error('Backend API orders fetch failed:', error);
  toast.error('Không thể tải danh sách đơn hàng');
}

export function useAdminOrders() {
  return useAdminPaginatedList<AdminOrder, AdminOrderFilters>({
    initialFilters: EMPTY_ORDER_FILTERS,
    load: loadAdminOrders,
    onError: handleOrdersError,
  });
}

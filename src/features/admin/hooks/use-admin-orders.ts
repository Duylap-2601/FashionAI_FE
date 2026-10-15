'use client';

import { EMPTY_ORDER_FILTERS } from '@/features/admin/constants/admin-dashboard-page';
import { useAdminPaginatedList } from '@/features/admin/hooks/use-admin-paginated-list';
import { useLatestRef } from '@/features/admin/hooks/use-latest-ref';
import { loadAdminOrders } from '@/features/admin/services/admin-list-loaders';
import { mergeOrderUpdate, readUpdatedOrder } from '@/features/admin/services/admin-mappers';
import { confirmManualPayment, updateOrderRefund, updateOrderStatus } from '@/features/admin/services/mutations';
import type { AdminOrder } from '@/features/admin/types/admin-dashboard-page';
import type { AdminOrderFilters } from '@/features/admin/types/admin-orders-panel';
import type { AdminOrderDto } from '@/features/admin/types/api';
import type { BackendOrderStatus } from '@/features/orders/types/orders';
import { getErrorMessage } from '@/lib/errors';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

function handleOrdersError(error: unknown) {
  console.error('Backend API orders fetch failed:', error);
  toast.error('Không thể tải danh sách đơn hàng');
}

export interface ApplyOrderUpdateOptions {
  match: (order: AdminOrder) => boolean;
  updated: AdminOrderDto | undefined;
  status: BackendOrderStatus;
  paymentStatusFallback?: string;
}

export type ApplyOrderUpdate = (options: ApplyOrderUpdateOptions) => void;

export function useAdminOrders() {
  const list = useAdminPaginatedList<AdminOrder, AdminOrderFilters>({
    initialFilters: EMPTY_ORDER_FILTERS,
    load: loadAdminOrders,
    onError: handleOrdersError,
  });
  const { items: orders, setItems: setOrders } = list;
  const ordersRef = useLatestRef(orders);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  /** Gộp order backend trả về vào bảng đơn và drawer chi tiết đang mở. */
  const applyOrderUpdate = useCallback<ApplyOrderUpdate>(({ match, updated, status, paymentStatusFallback }) => {
    const merge = (order: AdminOrder) => mergeOrderUpdate(order, updated, status, paymentStatusFallback);
    setOrders(prev => prev.map(o => match(o) ? merge(o) : o));
    setSelectedOrder(prev => prev && match(prev) ? merge(prev) : prev);
  }, [setOrders]);

  const handleUpdateOrderStatus = useCallback(async (id: string, status: BackendOrderStatus) => {
    try {
      const updated = readUpdatedOrder(await updateOrderStatus(id, { status }));
      applyOrderUpdate({ match: o => o.id === id, updated, status: updated?.status || status });
      toast.success('Cập nhật trạng thái đơn hàng thành công');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể cập nhật trạng thái đơn hàng.'));
      console.error(e);
    }
  }, [applyOrderUpdate]);

  const handleConfirmManualPayment = useCallback(async (orderCode: number, reference: string, note: string) => {
    try {
      const updated = readUpdatedOrder(await confirmManualPayment(orderCode, { reference, note }));

      // Đơn đang CREATED / PENDING thì chuyển tiếp sang MEASUREMENT_REVIEW trên backend
      const currentOrder = ordersRef.current.find(item => item.orderCode === orderCode);
      if (currentOrder && (currentOrder.status === 'CREATED' || currentOrder.status === 'PENDING')) {
        try {
          await updateOrderStatus(currentOrder.id, { status: 'MEASUREMENT_REVIEW' });
        } catch (statusErr) {
          console.warn('Auto update order status failed:', statusErr);
        }
      }

      applyOrderUpdate({
        match: o => o.orderCode === orderCode,
        updated,
        status: updated?.status || 'MEASUREMENT_REVIEW',
        paymentStatusFallback: 'PAID',
      });
      toast.success('Xác nhận thanh toán thủ công thành công');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể xác nhận thanh toán thủ công.'));
      console.error(e);
    }
  }, [applyOrderUpdate, ordersRef]);

  const handleUpdateRefund = useCallback(async (id: string, reference: string, note: string) => {
    try {
      await updateOrderRefund(id, { refundStatus: 'COMPLETED', evidence: { reference }, internalNote: note });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, refundStatus: 'COMPLETED' } : o));
      setSelectedOrder(prev => prev?.id === id ? { ...prev, refundStatus: 'COMPLETED' } : prev);
      toast.success('Đã ghi nhận hoàn tiền thành công');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể ghi nhận hoàn tiền.'));
      console.error(e);
    }
  }, [setOrders]);

  return {
    ...list,
    ordersRef,
    selectedOrder,
    setSelectedOrder,
    applyOrderUpdate,
    handleUpdateOrderStatus,
    handleConfirmManualPayment,
    handleUpdateRefund,
  };
}

'use client';

import { EMPTY_SHIPMENT_FILTERS } from '@/features/admin/constants/admin-dashboard-page';
import type { ApplyOrderUpdate } from '@/features/admin/hooks/use-admin-orders';
import { useAdminPaginatedList } from '@/features/admin/hooks/use-admin-paginated-list';
import { useLatestRef } from '@/features/admin/hooks/use-latest-ref';
import { loadAdminShipments } from '@/features/admin/services/admin-list-loaders';
import { readUpdatedOrder, unwrapData } from '@/features/admin/services/admin-mappers';
import { cancelAdminShipment, createShipment, simulateAdminShipmentStatus, syncAdminShipment } from '@/features/admin/services/mutations';
import { fetchAdminShipmentDetail } from '@/features/admin/services/queries';
import type { AdminShipment, AdminShipmentDetail } from '@/features/admin/types/admin-dashboard-page';
import type { AdminShipmentFilters } from '@/features/admin/types/admin-shipments-panel';
import { getErrorMessage } from '@/lib/errors';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

function handleShipmentsError(error: unknown) {
  console.error('Backend API shipments fetch failed:', error);
  toast.error('Không thể tải danh sách vận đơn');
}

interface UseAdminShipmentsOptions {
  /** List vận đơn chỉ được tải khi tab vận đơn đang mở. */
  isActive: boolean;
  refreshOrders: () => Promise<unknown>;
  applyOrderUpdate: ApplyOrderUpdate;
}

export function useAdminShipments({ isActive, refreshOrders, applyOrderUpdate }: UseAdminShipmentsOptions) {
  const list = useAdminPaginatedList<AdminShipment, AdminShipmentFilters>({
    initialFilters: EMPTY_SHIPMENT_FILTERS,
    load: loadAdminShipments,
    onError: handleShipmentsError,
    enabled: isActive,
  });
  const { fetchList } = list;
  const [selectedShipment, setSelectedShipment] = useState<AdminShipmentDetail | null>(null);
  const isActiveRef = useLatestRef(isActive);
  const refreshOrdersRef = useLatestRef(refreshOrders);

  // Mỗi lần mở tab thì tải lại theo bộ lọc/trang đã ghi nhận.
  useEffect(() => {
    if (isActive) void fetchList();
  }, [isActive, fetchList]);

  /** Tải lại list nếu tab đang mở; tab ẩn sẽ tự tải khi được mở lại. */
  const refreshShipments = useCallback(async () => {
    if (isActiveRef.current) await fetchList();
  }, [fetchList, isActiveRef]);

  /** Vận đơn vừa thay đổi: cập nhật drawer nếu đang xem nó, rồi tải lại vận đơn và đơn hàng. */
  const applyShipmentChange = useCallback(async (id: string, detail: AdminShipmentDetail) => {
    setSelectedShipment(prev => prev?.id === id ? detail : prev);
    await Promise.all([refreshShipments(), refreshOrdersRef.current()]);
  }, [refreshOrdersRef, refreshShipments]);

  const handleViewShipment = useCallback(async (shipment: AdminShipment) => {
    try {
      setSelectedShipment(unwrapData<AdminShipmentDetail>(await fetchAdminShipmentDetail(shipment.id)));
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể tải chi tiết vận đơn.'));
    }
  }, []);

  const handleSyncShipment = useCallback(async (id: string) => {
    try {
      await applyShipmentChange(id, unwrapData<AdminShipmentDetail>(await syncAdminShipment(id)));
      toast.success('Đã đồng bộ GHN');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể đồng bộ vận đơn.'));
    }
  }, [applyShipmentChange]);

  const handleCancelShipment = useCallback(async (shipmentOrId: AdminShipment | string) => {
    const id = typeof shipmentOrId === 'string' ? shipmentOrId : shipmentOrId.id;
    const reason = window.prompt('Lý do hủy vận đơn (tùy chọn)') || undefined;
    try {
      await applyShipmentChange(id, unwrapData<AdminShipmentDetail>(await cancelAdminShipment(id, { reason })));
      toast.success('Đã hủy vận đơn');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể hủy vận đơn.'));
    }
  }, [applyShipmentChange]);

  /** Giả lập trạng thái GHN trên staging rồi tải lại chi tiết vận đơn. */
  const simulateStatus = useCallback(async (id: string, status: 'PICKED' | 'DELIVERED', reason: string) => {
    await simulateAdminShipmentStatus(id, { status, reason });
    await applyShipmentChange(id, unwrapData<AdminShipmentDetail>(await fetchAdminShipmentDetail(id)));
  }, [applyShipmentChange]);

  const handleSimulatePickedShipment = useCallback(async (id: string) => {
    try {
      await simulateStatus(id, 'PICKED', 'Admin staging pickup simulation');
      toast.success('Đã giả lập shipper lấy hàng thành công');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể giả lập đã lấy hàng.'));
    }
  }, [simulateStatus]);

  const handleSimulateDelivered = useCallback(async (id: string) => {
    try {
      await simulateStatus(id, 'DELIVERED', 'Admin staging delivery simulation');
      toast.success('Đã giả lập giao hàng thành công');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể giả lập giao hàng.'));
    }
  }, [simulateStatus]);

  /** Tạo vận đơn GHN cho một đơn (gọi từ drawer đơn hàng). */
  const handleCreateShipment = useCallback(async (orderId: string, signal?: AbortSignal) => {
    try {
      const res = await createShipment(orderId, undefined, { signal });
      if (signal?.aborted) return;
      const updated = readUpdatedOrder(res);
      applyOrderUpdate({ match: o => o.id === orderId, updated, status: updated?.status || 'SHIPPING' });
      await refreshShipments();
      toast.success('Đã tạo vận đơn GHN thành công');
    } catch (e) {
      if (signal?.aborted) return;
      toast.error(getErrorMessage(e, 'Không thể tạo vận đơn.'));
      console.error(e);
    }
  }, [applyOrderUpdate, refreshShipments]);

  return {
    ...list,
    selectedShipment,
    setSelectedShipment,
    refreshShipments,
    handleViewShipment,
    handleSyncShipment,
    handleCancelShipment,
    handleSimulatePickedShipment,
    handleSimulateDelivered,
    handleCreateShipment,
  };
}

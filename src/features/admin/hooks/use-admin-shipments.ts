'use client';

import { EMPTY_SHIPMENT_FILTERS, SHIPMENT_SIMULATIONS } from '@/features/admin/constants/admin-dashboard-page';
import { useAdminPaginatedList } from '@/features/admin/hooks/use-admin-paginated-list';
import { useLatestRef } from '@/features/admin/hooks/use-latest-ref';
import { loadAdminShipments } from '@/features/admin/services/admin-list-loaders';
import { cancelAdminShipment, simulateAdminShipmentStatus } from '@/features/admin/services/mutations';
import type { AdminShipment } from '@/features/admin/types/admin-dashboard-page';
import type { AdminShipmentFilters, ShipmentSimulationStatus } from '@/features/admin/types/admin-shipments-panel';
import { getErrorMessage } from '@/lib/errors';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

function handleShipmentsError(error: unknown) {
  console.error('Backend API shipments fetch failed:', error);
  toast.error('Không thể tải danh sách vận đơn');
}

interface UseAdminShipmentsOptions {
  /** List vận đơn chỉ được tải khi tab vận đơn đang mở. */
  isActive: boolean;
  refreshOrders: () => Promise<unknown>;
}

export function useAdminShipments({ isActive, refreshOrders }: UseAdminShipmentsOptions) {
  const list = useAdminPaginatedList<AdminShipment, AdminShipmentFilters>({
    initialFilters: EMPTY_SHIPMENT_FILTERS,
    load: loadAdminShipments,
    onError: handleShipmentsError,
    enabled: isActive,
  });
  const { fetchList } = list;
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

  /** Vận đơn vừa thay đổi: tải lại danh sách vận đơn và đơn hàng. */
  const applyShipmentChange = useCallback(async () => {
    await Promise.all([refreshShipments(), refreshOrdersRef.current()]);
  }, [refreshOrdersRef, refreshShipments]);

  const handleCancelShipment = useCallback(async (shipmentOrId: AdminShipment | string) => {
    const id = typeof shipmentOrId === 'string' ? shipmentOrId : shipmentOrId.id;
    // Bấm "Cancel" ở hộp nhập lý do nghĩa là không hủy vận đơn nữa.
    const reason = window.prompt('Lý do hủy vận đơn (tùy chọn)');
    if (reason === null) return;
    try {
      await cancelAdminShipment(id, { reason: reason || undefined });
      await applyShipmentChange();
      toast.success('Đã hủy vận đơn');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể hủy vận đơn.'));
    }
  }, [applyShipmentChange]);

  /** Giả lập trạng thái GHN trên staging rồi tải lại chi tiết vận đơn. */
  const handleSimulateShipmentStatus = useCallback(async (id: string, status: ShipmentSimulationStatus) => {
    const simulation = SHIPMENT_SIMULATIONS.find(item => item.status === status);
    try {
      await simulateAdminShipmentStatus(id, { status, reason: `Admin staging simulation: ${status}` });
      await applyShipmentChange();
      toast.success(simulation?.success ?? 'Đã giả lập trạng thái vận chuyển');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể giả lập trạng thái vận chuyển.'));
    }
  }, [applyShipmentChange]);



  return {
    ...list,
    refreshShipments,
    handleCancelShipment,
    handleSimulateShipmentStatus,
  };
}

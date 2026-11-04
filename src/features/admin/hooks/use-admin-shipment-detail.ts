'use client';

import { SHIPMENT_SIMULATIONS } from '@/features/admin/constants/admin-dashboard-page';
import { unwrapData } from '@/features/admin/services/admin-mappers';
import { cancelAdminShipment, simulateAdminShipmentStatus } from '@/features/admin/services/mutations';
import { fetchAdminShipmentDetail } from '@/features/admin/services/queries';
import type { AdminShipmentDetail } from '@/features/admin/types/admin-dashboard-page';
import type { ShipmentSimulationStatus } from '@/features/admin/types/admin-shipments-panel';
import { getErrorMessage } from '@/lib/errors';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export type AdminShipmentDetailAction = ShipmentSimulationStatus | 'cancel';

/** Trang /admin/shipments/[id]: tải chi tiết vận đơn, giả lập GHN (staging) và hủy vận đơn. */
export function useAdminShipmentDetail(id: string) {
  const [shipment, setShipment] = useState<AdminShipmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [busyAction, setBusyAction] = useState<AdminShipmentDetailAction | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    fetchAdminShipmentDetail(id)
      .then(res => {
        if (cancelled) return;
        setShipment(unwrapData<AdminShipmentDetail>(res));
        setIsError(false);
      })
      .catch(() => {
        if (!cancelled) setIsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const simulate = useCallback(async (status: ShipmentSimulationStatus) => {
    if (busyAction) return;
    const simulation = SHIPMENT_SIMULATIONS.find(item => item.status === status);
    setBusyAction(status);
    try {
      await simulateAdminShipmentStatus(id, { status, reason: `Admin staging simulation: ${status}` });
      setShipment(unwrapData<AdminShipmentDetail>(await fetchAdminShipmentDetail(id)));
      toast.success(simulation?.success ?? 'Đã giả lập trạng thái vận chuyển');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể giả lập trạng thái vận chuyển.'));
    } finally {
      setBusyAction(null);
    }
  }, [busyAction, id]);

  const cancel = useCallback(async () => {
    if (busyAction) return;
    // Bấm "Cancel" ở hộp nhập lý do nghĩa là không hủy vận đơn nữa.
    const reason = window.prompt('Lý do hủy vận đơn (tùy chọn)');
    if (reason === null) return;
    setBusyAction('cancel');
    try {
      setShipment(unwrapData<AdminShipmentDetail>(await cancelAdminShipment(id, { reason: reason || undefined })));
      toast.success('Đã hủy vận đơn');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể hủy vận đơn.'));
    } finally {
      setBusyAction(null);
    }
  }, [busyAction, id]);

  return { shipment, isLoading, isError, busyAction, simulate, cancel };
}

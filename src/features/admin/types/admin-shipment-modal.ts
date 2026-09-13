import type { AdminShipmentDetail } from '@/features/admin/types/admin-dashboard-page';

export interface AdminShipmentModalProps {
  shipment: AdminShipmentDetail;
  onClose: () => void;
  onSync: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onSimulateDelivered: (id: string) => Promise<void>;
  onOpenOrder: (orderCode: number) => void;
}

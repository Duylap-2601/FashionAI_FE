import type { AdminOrder } from '@/features/admin/types/admin-dashboard-page';
import type { BackendOrderStatus } from '@/features/orders/types/orders';
import React from 'react';

export interface AdminOrderModalProps {
  setSelectedOrder: React.Dispatch<React.SetStateAction<AdminOrder | null>>;
  selectedOrder: AdminOrder;
  handleUpdateOrderStatus: (id: string, status: BackendOrderStatus) => Promise<void>;
  handleConfirmManualPayment: (orderCode: number, reference: string, note: string) => Promise<void>;
  handleUpdateRefund: (id: string, reference: string, note: string) => Promise<void>;
  handleCreateShipment: (id: string) => Promise<void>;
}

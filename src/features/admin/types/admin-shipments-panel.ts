import type { AdminShipment } from '@/features/admin/types/admin-dashboard-page';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';

export interface AdminShipmentFilters {
  status?: string;
  rawStatus?: string;
  provider?: string;
  providerOrderCode?: string;
  orderCode?: string;
  customer?: string;
  phone?: string;
  issueOnly?: boolean;
  staleOnly?: boolean;
}

export type ShipmentSimulationStatus = 'PICKED' | 'DELIVERED' | 'DELIVERY_FAILED' | 'RETURNED';

/** Một lựa chọn giả lập GHN trên staging, chỉ hiện khi vận đơn đang ở một trong `from`. */
export interface ShipmentSimulation {
  status: ShipmentSimulationStatus;
  label: string;
  success: string;
  icon: LucideIcon;
  from: readonly string[];
}

export interface AdminShipmentsPanelProps {
  shipments: AdminShipment[];
  filters: AdminShipmentFilters;
  setFilters: React.Dispatch<React.SetStateAction<AdminShipmentFilters>>;
  onSimulateStatus: (id: string, status: ShipmentSimulationStatus) => Promise<void>;
  onCancel: (shipment: AdminShipment) => Promise<void>;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isFetching?: boolean;
}

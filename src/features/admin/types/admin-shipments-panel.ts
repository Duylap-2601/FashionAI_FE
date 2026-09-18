import type { AdminShipment } from '@/features/admin/types/admin-dashboard-page';
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

export interface AdminShipmentsPanelProps {
  shipments: AdminShipment[];
  filters: AdminShipmentFilters;
  setFilters: React.Dispatch<React.SetStateAction<AdminShipmentFilters>>;
  onView: (shipment: AdminShipment) => void;
  onSync: (id: string) => Promise<void>;
  onCancel: (shipment: AdminShipment) => Promise<void>;
  onOpenOrder: (orderCode: number) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isFetching?: boolean;
}

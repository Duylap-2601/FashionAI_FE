import type { AdminOrder } from '@/features/admin/types/admin-dashboard-page';
import React from 'react';

export interface AdminOrderFilters {
  search?: string;
  status?: string;
  paymentStatus?: string;
}

export interface AdminOrdersPanelProps {
  orders: AdminOrder[];
  setSelectedOrder: React.Dispatch<React.SetStateAction<AdminOrder | null>>;
  filters?: AdminOrderFilters;
  onFilterChange?: (filters: Partial<AdminOrderFilters>) => void;
  onResetFilters?: () => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isFetching?: boolean;
}

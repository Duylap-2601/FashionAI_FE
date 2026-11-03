import type { AdminOrder } from '@/features/admin/types/admin-dashboard-page';

export interface AdminOrderFilters {
  search?: string;
  status?: string;
  paymentStatus?: string;
  fromDate?: string;
  toDate?: string;
}

export interface AdminOrdersPanelProps {
  orders: AdminOrder[];
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

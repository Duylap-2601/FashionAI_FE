import type { OrderIssue, OrderIssueReason, OrderIssueStatus } from '@/features/orders/types/orders';

export interface AdminOrderIssueFilters {
  status?: OrderIssueStatus | '';
  reason?: OrderIssueReason | '';
}

export interface AdminOrderIssuesPanelProps {
  issues: OrderIssue[];
  filters?: AdminOrderIssueFilters;
  onFilterChange?: (patch: Partial<AdminOrderIssueFilters>) => void;
  onResetFilters?: () => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isFetching?: boolean;
  onSelectIssue?: (issue: OrderIssue) => void;
}

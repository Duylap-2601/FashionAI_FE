import type { AdminUser, UserRole, UserTier } from '@/features/admin/types/admin-dashboard-page';
import React from 'react';

export interface AdminUserFilters {
  search?: string;
  tier?: UserTier | 'ALL' | '';
  role?: UserRole | 'ALL' | '';
  isVerified?: 'ALL' | 'VERIFIED' | 'UNVERIFIED' | '';
}

export interface AdminUsersPanelProps {
  users: AdminUser[];
  setSelectedUser: React.Dispatch<React.SetStateAction<AdminUser | null>>;
  filters?: AdminUserFilters;
  onFilterChange?: (filters: Partial<AdminUserFilters>) => void;
  onResetFilters?: () => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isFetching?: boolean;
}

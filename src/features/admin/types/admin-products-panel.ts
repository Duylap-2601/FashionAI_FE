import type { AdminProduct } from '@/features/admin/types/admin-dashboard-page';
import React from 'react';

export interface AdminProductFilters {
  search?: string;
  category?: string;
  status?: string;
}

export interface AdminProductsPanelProps {
  openProductEditor: (product: Partial<AdminProduct> | null) => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  products: AdminProduct[];
  handleDeleteProduct: (id: string) => Promise<void>;
  filters?: AdminProductFilters;
  onFilterChange?: (filters: Partial<AdminProductFilters>) => void;
  onResetFilters?: () => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isFetching?: boolean;
}

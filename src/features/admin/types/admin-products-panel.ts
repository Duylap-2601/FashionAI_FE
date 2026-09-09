import type { AdminProduct } from '@/features/admin/types/admin-dashboard-page';
import React from 'react';

export interface AdminProductsPanelProps {
  openProductEditor: (product: Partial<AdminProduct> | null) => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  products: AdminProduct[];
  handleDeleteProduct: (id: string) => Promise<void>;
}

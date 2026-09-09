import type { CategoryCount, SortBy } from '@/features/products/types/product-filters';

export interface ProductToolbarProps {
  categories: CategoryCount[];
  activeTab: string;
  searchQuery: string;
  isSidebarOpen: boolean;
  sortBy: SortBy;
  onSelectTab: (tab: string) => void;
  onSearchChange: (value: string) => void;
  onToggleSidebar: () => void;
  onSortChange: (sort: SortBy) => void;
}

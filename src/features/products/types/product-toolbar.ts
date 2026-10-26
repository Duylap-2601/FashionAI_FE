import type { CategoryCount, SortBy } from '@/features/products/types/product-filters';

export interface ProductToolbarProps {
  categories: CategoryCount[];
  activeTab: string;
  searchQuery: string;
  isFilterOpen: boolean;
  activeFilterCount: number;
  sortBy: SortBy;
  onSelectTab: (tab: string) => void;
  onSearchChange: (value: string) => void;
  onToggleFilters: () => void;
  onOpenSort: () => void;
  onSortChange: (sort: SortBy) => void;
}

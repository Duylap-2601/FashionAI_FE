import type { ActiveChip, SortBy, SubCategoryCount } from '@/features/products/types/product-filters';

export interface FilterPanelProps {
  activeChips: ActiveChip[];
  currentPriceRange: number;
  maxPriceLimit: number;
  selectedColors: string[];
  subCategoryCounts: SubCategoryCount[];
  selectedSubCategories: string[];
  filteredCount: number;
  onClose: () => void;
  onClearAll: () => void;
  onPriceChange: (value: number) => void;
  onToggleColor: (color: string) => void;
  onToggleSubCategory: (category: string) => void;
}

export interface SortPanelProps {
  sortBy: SortBy;
  onClose: () => void;
  onSortChange: (sort: SortBy) => void;
}

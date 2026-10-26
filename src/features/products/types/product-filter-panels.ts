import type { FilterSectionProps } from '@/features/products/types/filter-sections';
import type { ActiveChip, SortBy } from '@/features/products/types/product-filters';

export interface DesktopFilterSidebarProps extends FilterSectionProps {
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export interface MobileFilterSheetProps extends FilterSectionProps {
  open: boolean;
  activeChips: ActiveChip[];
  filteredCount: number;
  onOpenChange: (open: boolean) => void;
  onClearAll: () => void;
}

export interface MobileSortSheetProps {
  open: boolean;
  sortBy: SortBy;
  onOpenChange: (open: boolean) => void;
  onSortChange: (sort: SortBy) => void;
}

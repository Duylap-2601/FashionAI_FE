import type { ActiveChip } from '@/features/products/types/product-filters';

export interface ProductResultsHeaderProps {
  filteredCount: number;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  showPageIndex: boolean;
  activeChips: ActiveChip[];
  onClearAll: () => void;
}

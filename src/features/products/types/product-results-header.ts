import type { ActiveChip } from '@/features/products/types/product-filters';

export interface ProductResultsHeaderProps {
  filteredCount: number;
  activeChips: ActiveChip[];
  onOpenFilters: () => void;
  onOpenSort: () => void;
  onClearAll: () => void;
}

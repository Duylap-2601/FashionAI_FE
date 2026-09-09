import type { SubCategoryCount } from '@/features/products/types/product-filters';

export interface FilterSectionProps {
  currentPriceRange: number;
  maxPriceLimit: number;
  selectedColors: string[];
  subCategoryCounts: SubCategoryCount[];
  selectedSubCategories: string[];
  onPriceChange: (value: number) => void;
  onToggleColor: (color: string) => void;
  onToggleSubCategory: (category: string) => void;
  mobile?: boolean;
}

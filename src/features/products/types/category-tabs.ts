import type { CategoryCount } from '@/features/products/types/product-filters';

export interface CategoryTabsProps {
  categories: CategoryCount[];
  activeTab: string;
  onSelect: (tab: string) => void;
  mobile?: boolean;
}

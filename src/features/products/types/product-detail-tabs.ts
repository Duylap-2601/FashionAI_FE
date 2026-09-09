import type { Product } from '@/features/products/types/products';

export interface ProductDetailTabsProps {
  product: Product;
  activeTab: string;
  isComboSuit: boolean;
  onTabChange: (tab: string) => void;
}

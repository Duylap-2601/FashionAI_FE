import type { Product } from '@/features/products/types/products';

export interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  badge?: string;
  viewAllLink?: string;
  showCategories?: boolean;
}

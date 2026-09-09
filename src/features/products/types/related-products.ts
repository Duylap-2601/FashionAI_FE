import type { Product } from '@/features/products/types/products';

export interface RelatedProductsProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

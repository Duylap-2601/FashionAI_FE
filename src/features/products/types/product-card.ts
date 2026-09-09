import type { Product } from '@/features/products/types/products';

export interface ProductCardProps {
  product: Product;
  pinned: boolean;
  onToggleRack: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

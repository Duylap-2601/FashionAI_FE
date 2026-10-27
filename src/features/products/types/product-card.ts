import type { Product } from '@/features/products/types/products';

export interface ProductCardProps {
  product: Product;
  showQuickAdd?: boolean;
  showTryOn?: boolean;
  showRating?: boolean;
  imagePriority?: boolean;
  className?: string;
  onAddToCart?: (product: Product) => void;
  pinned?: boolean;
  onToggleRack?: (product: Product) => void;
}

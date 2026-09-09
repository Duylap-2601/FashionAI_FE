import type { Product } from '@/features/products/types/products';
import type { ProductPickerCategory } from '@/features/try-on/types/try-on-types';

export interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  products: Product[];
  currentProductId?: string;
  initialCategory?: ProductPickerCategory;
}

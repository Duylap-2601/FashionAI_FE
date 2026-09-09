import type { Product } from '@/features/products/types/products';

export interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelect: (product: Product) => void;
  currentProductId?: string;
}

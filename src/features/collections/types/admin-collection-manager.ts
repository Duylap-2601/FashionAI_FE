import { Collection } from '@/features/collections/types/collection';
import type { Product } from '@/features/products/types/products';

export interface CollectionProductsModalProps {
  collection: Collection | null;
  isOpen: boolean;
  onClose: () => void;
  availableProducts: Product[];
  onCollectionUpdated?: () => void;
}

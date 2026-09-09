import type { UserMeasurements } from '@/features/measurements/types/measurements';
import type { MeasurementCategoryCompleteness } from '@/features/measurements/types/measurements-completeness';
import type { ComboType } from '@/features/products/types/product-detail-config';
import type { Product } from '@/features/products/types/products';

export interface ProductPurchasePanelProps {
  product: Product;
  selectedType: ComboType;
  selectedColor: string;
  quantity: number;
  isComboSuit: boolean;
  isMeasurementComplete: boolean;
  measurements?: UserMeasurements;
  catCompleteness?: MeasurementCategoryCompleteness | null;
  reviewStats?: { avgRating?: number; reviewCount?: number };
  pinned: boolean;
  isRackMutating: boolean;
  onSelectType: (type: ComboType) => void;
  onSelectColor: (color: string) => void;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onTogglePin: () => void;
}

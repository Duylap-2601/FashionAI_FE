import type { SuggestedProduct } from '@/features/stylist/types/outfit-suggestion';

export interface ProductCutoutImageProps {
  product: SuggestedProduct;
  alt: string;
  onSelect: (product: SuggestedProduct) => void;
}

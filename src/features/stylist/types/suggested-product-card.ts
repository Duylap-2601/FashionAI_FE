import type { SuggestedProduct } from '@/features/stylist/types/outfit-suggestion';

export interface SuggestedProductCardProps {
  product: SuggestedProduct;
  onAddToCart: (product: SuggestedProduct) => void;
  onSelectProduct: (product: SuggestedProduct) => void;
}

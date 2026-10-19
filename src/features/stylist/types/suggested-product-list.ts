import type { SuggestedProduct } from '@/features/stylist/types/outfit-suggestion';

export interface SuggestedProductListProps {
  products: SuggestedProduct[];
  onAddToCart: (product: SuggestedProduct) => void;
  onSelectProduct: (product: SuggestedProduct) => void;
}

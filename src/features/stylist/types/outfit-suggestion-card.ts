import type { OutfitSuggestion, SuggestedProduct } from '@/features/stylist/types/outfit-suggestion';

export interface OutfitSuggestionCardProps {
  outfit: OutfitSuggestion;
  onAddToCart: (outfit: OutfitSuggestion) => void;
  onSelectProduct: (product: SuggestedProduct) => void;
}

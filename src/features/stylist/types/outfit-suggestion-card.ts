import type { OutfitSuggestion, SuggestedProduct } from '@/features/stylist/types/outfit-suggestion';

export interface OutfitSuggestionCardProps {
  outfit: OutfitSuggestion;
  onAddToCart: (outfit: OutfitSuggestion) => void;
  onSelectProduct: (product: SuggestedProduct) => void;
  /** Chỉ thẻ showcase dùng: `page` (trang AI Stylist) hoặc `chat` (băng vuốt trong tin nhắn). */
  density?: 'page' | 'chat';
}

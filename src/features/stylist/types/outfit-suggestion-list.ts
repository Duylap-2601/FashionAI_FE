import type { OutfitSuggestion, SuggestedProduct } from '@/features/stylist/types/outfit-suggestion';
import type { GaItemList } from '@/lib/analytics';

export interface OutfitSuggestionListProps {
  /** Id kết quả stylist / tin nhắn chat: view_item_list chỉ gửi một lần cho mỗi id. */
  viewKey: string | null;
  list: GaItemList;
  outfits: OutfitSuggestion[];
  /** Món lẻ (chỉ có ở AI Chat). */
  products?: SuggestedProduct[];
  /** `grid`: 2 cột từ md; `stack`: một cột (chat, thẻ lịch sử). Bỏ qua khi `variant="showcase"`. */
  layout?: 'grid' | 'stack';
  /** `showcase`: thẻ lớn có dải ảnh, vuốt ngang trên mobile (trang AI Stylist); `compact`: thẻ danh sách (chat). */
  variant?: 'compact' | 'showcase';
}

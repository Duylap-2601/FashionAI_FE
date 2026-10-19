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
  /**
   * `showcase`: thẻ lớn có dải ảnh, vuốt ngang trên mobile và lưới từ md (trang AI Stylist).
   * `carousel`: cùng kiểu thẻ đó, bộ phối và món lẻ chung một băng vuốt ngang (AI Chat).
   * `compact`: thẻ danh sách gọn (thẻ lịch sử trong profile).
   */
  variant?: 'compact' | 'showcase' | 'carousel';
}

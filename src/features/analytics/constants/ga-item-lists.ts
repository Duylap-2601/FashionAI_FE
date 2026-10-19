import type { GaItemList } from '@/lib/analytics';

// item_list_id là khóa để so sánh hiệu quả từng nguồn gợi ý trong GA4; đổi id sẽ tách
// số liệu cũ và mới thành hai list.
export const GA_ITEM_LISTS = {
  aiStylist: { item_list_id: 'ai_stylist', item_list_name: 'AI Stylist' },
  aiChat: { item_list_id: 'ai_chat', item_list_name: 'AI Chat' },
} as const satisfies Record<string, GaItemList>;

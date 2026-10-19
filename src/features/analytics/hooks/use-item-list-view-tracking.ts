'use client';

import { trackEvent } from '@/lib/analytics';
import type { GaItem, GaItemList } from '@/lib/analytics';
import { useEffect } from 'react';

// Nhớ trong suốt phiên trang: render lại, mở lại kết quả lịch sử hay tải lại session chat
// cũng không gửi lại view_item_list cho cùng một kết quả/tin nhắn.
const trackedListViews = new Set<string>();

/**
 * Gửi `view_item_list` một lần cho mỗi `viewKey` (id kết quả stylist, id tin nhắn chat)
 * khi danh sách gợi ý hiện ra. `items` nên được memo để effect không chạy lại vô ích.
 */
export function useItemListViewTracking(viewKey: string | null, list: GaItemList, items: GaItem[]) {
  useEffect(() => {
    if (!viewKey || items.length === 0) return;
    const key = `${list.item_list_id}:${viewKey}`;
    if (trackedListViews.has(key)) return;
    trackedListViews.add(key);
    trackEvent('view_item_list', { ...list, items });
  }, [viewKey, list, items]);
}

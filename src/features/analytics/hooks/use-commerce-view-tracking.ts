'use client';

import { cartItemToGaItem } from '@/features/analytics/services/ga-items';
import type { CartItem } from '@/features/cart/types/cart-store';
import { toCommerceParams, trackEvent } from '@/lib/analytics';
import { useEffect, useRef } from 'react';

/**
 * Gửi `view_cart` / `begin_checkout` một lần mỗi lần màn hình hiện ra, sau khi giỏ đã
 * tải xong. Giỏ đổi số lượng trong lúc đang xem không tính là một lượt xem mới.
 */
export function useCommerceViewTracking(
  event: 'view_cart' | 'begin_checkout',
  items: CartItem[],
  isVisible: boolean,
) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!isVisible) {
      hasTrackedRef.current = false;
      return;
    }
    if (hasTrackedRef.current || items.length === 0) return;
    hasTrackedRef.current = true;
    trackEvent(event, toCommerceParams(items.map((item) => cartItemToGaItem(item))));
  }, [event, isVisible, items]);
}

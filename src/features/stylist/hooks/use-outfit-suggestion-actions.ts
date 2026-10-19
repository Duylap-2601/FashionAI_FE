'use client';

import { suggestedProductToGaItem } from '@/features/analytics/services/ga-items';
import { useCart } from '@/features/cart/hooks/use-cart';
import { suggestedProductToCartItem } from '@/features/stylist/services/outfit-suggestions';
import type { OutfitSuggestion, SuggestedProduct } from '@/features/stylist/types/outfit-suggestion';
import { trackEvent } from '@/lib/analytics';
import type { GaItemList } from '@/lib/analytics';
import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hành động trên một khối gợi ý: thêm cả bộ / từng món vào giỏ và ghi `select_item`.
 * add_to_cart do `useCart().addToCart` gửi, ở đây chỉ truyền list kèm vị trí sản phẩm.
 */
export function useOutfitSuggestionActions(list: GaItemList, gaIndexes: ReadonlyMap<string, number>) {
  const { addToCart, setIsCartOpen } = useCart();

  const addProduct = useCallback(
    (product: SuggestedProduct) => {
      addToCart(suggestedProductToCartItem(product), { ...list, index: gaIndexes.get(product.id) });
    },
    [addToCart, list, gaIndexes],
  );

  const addOutfitToCart = useCallback(
    (outfit: OutfitSuggestion) => {
      const products = outfit.items.map((item) => item.product).filter((product) => product.available);
      if (products.length === 0) return;
      products.forEach(addProduct);
      const skipped = outfit.items.length - products.length;
      toast.success(`Đã thêm ${products.length} sản phẩm${outfit.name ? ` của bộ "${outfit.name}"` : ''} vào giỏ`, {
        duration: 2500,
        description: skipped > 0 ? `Bỏ qua ${skipped} sản phẩm đã ngừng bán.` : undefined,
        action: { label: 'Xem giỏ', onClick: () => setIsCartOpen(true) },
      });
    },
    [addProduct, setIsCartOpen],
  );

  const addProductToCart = useCallback(
    (product: SuggestedProduct) => {
      if (!product.available) return;
      addProduct(product);
      toast.success(`Đã thêm ${product.name} vào giỏ`, { duration: 2500 });
    },
    [addProduct],
  );

  const selectProduct = useCallback(
    (product: SuggestedProduct) => {
      const index = gaIndexes.get(product.id);
      if (index === undefined) return;
      trackEvent('select_item', { ...list, items: [suggestedProductToGaItem(product, list, index)] });
    },
    [list, gaIndexes],
  );

  return { addOutfitToCart, addProductToCart, selectProduct };
}

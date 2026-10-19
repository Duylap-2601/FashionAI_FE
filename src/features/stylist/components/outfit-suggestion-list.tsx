'use client';

import { useItemListViewTracking } from '@/features/analytics/hooks/use-item-list-view-tracking';
import { suggestedProductToGaItem } from '@/features/analytics/services/ga-items';
import { OutfitSuggestionCard } from '@/features/stylist/components/outfit-suggestion-card';
import { SuggestedProductList } from '@/features/stylist/components/suggested-product-list';
import { useOutfitSuggestionActions } from '@/features/stylist/hooks/use-outfit-suggestion-actions';
import { collectSuggestedProducts } from '@/features/stylist/services/outfit-suggestions';
import type { SuggestedProduct } from '@/features/stylist/types/outfit-suggestion';
import type { OutfitSuggestionListProps } from '@/features/stylist/types/outfit-suggestion-list';
import { useMemo } from 'react';

const NO_PRODUCTS: SuggestedProduct[] = [];

/** Bộ phối + món lẻ AI gợi ý từ catalog, dùng chung cho AI Stylist và AI Chat. */
export function OutfitSuggestionList({ viewKey, list, outfits, products = NO_PRODUCTS, layout = 'stack' }: OutfitSuggestionListProps) {
  // Một sản phẩm nằm ở nhiều bộ chỉ tính một vị trí trong list GA4.
  const gaItems = useMemo(
    () => collectSuggestedProducts(outfits, products).map((product, index) => suggestedProductToGaItem(product, list, index)),
    [outfits, products, list],
  );
  const gaIndexes = useMemo(() => new Map(gaItems.map((item) => [item.item_id, item.index ?? 0])), [gaItems]);

  useItemListViewTracking(viewKey, list, gaItems);
  const { addOutfitToCart, addProductToCart, selectProduct } = useOutfitSuggestionActions(list, gaIndexes);

  if (outfits.length === 0 && products.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 w-full min-w-0">
      {outfits.length > 0 && (
        <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'flex flex-col gap-3'}>
          {outfits.map((outfit, idx) => (
            <OutfitSuggestionCard
              key={`${outfit.name}-${idx}`}
              outfit={outfit}
              onAddToCart={addOutfitToCart}
              onSelectProduct={selectProduct}
            />
          ))}
        </div>
      )}
      {products.length > 0 && (
        <SuggestedProductList products={products} onAddToCart={addProductToCart} onSelectProduct={selectProduct} />
      )}
    </div>
  );
}

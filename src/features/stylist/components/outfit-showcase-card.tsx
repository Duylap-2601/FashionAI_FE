'use client';

import { OUTFIT_ROLE_LABELS } from '@/features/stylist/constants/outfit-suggestion';
import { OutfitTryOnButton } from '@/features/stylist/components/outfit-try-on-button';
import { ProductCutoutImage } from '@/features/stylist/components/product-cutout-image';
import { formatVnd } from '@/features/stylist/services/format';
import type { OutfitSuggestionCardProps } from '@/features/stylist/types/outfit-suggestion-card';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

// `page`: trang AI Stylist (vuốt ngang trên mobile, lưới từ md). `chat`: thẻ rộng cố định trong
// băng vuốt ngang của tin nhắn, dải ảnh thấp hơn.
const DENSITY = {
  page: { article: 'w-[84%] sm:w-[58%] md:w-auto', strip: 'h-60', body: 'p-4' },
  chat: { article: 'w-[256px] sm:w-[272px]', strip: 'h-48', body: 'p-3.5' },
} as const;

/** Thẻ bộ phối lớn (AI Stylist, AI Chat): nhìn ảnh là thấy cả bộ, chữ chỉ để đọc nhanh. */
export function OutfitShowcaseCard({ outfit, onAddToCart, onSelectProduct, density = 'page' }: OutfitSuggestionCardProps) {
  const size = DENSITY[density];
  const availableCount = outfit.items.filter((item) => item.product.available).length;
  const stripItems = outfit.items.slice(0, 4);

  return (
    <article className={`snap-start shrink-0 ${size.article} bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden flex flex-col`}>
      <div className={`flex ${size.strip} px-3 bg-brand-cream overflow-hidden`}>
        {stripItems.map((item, idx) => (
          <ProductCutoutImage
            key={`${item.product.id}-${idx}`}
            product={item.product}
            alt={`${OUTFIT_ROLE_LABELS[item.role]}: ${item.product.name}`}
            onSelect={onSelectProduct}
          />
        ))}
      </div>

      <div className={`flex-1 flex flex-col gap-3 ${size.body}`}>
        <div>
          <h3 className="text-body-lg font-semibold text-neutral-900 leading-snug line-clamp-1">
            {outfit.name || 'Bộ phối gợi ý'}
          </h3>
          {outfit.reason && (
            <p className="mt-1 text-body-sm text-neutral-500 line-clamp-2" title={outfit.reason}>{outfit.reason}</p>
          )}
        </div>

        <ul className="flex flex-col gap-1.5">
          {outfit.items.map((item, idx) => {
            const { product } = item;
            const row = (
              <>
                <span className={`min-w-0 truncate ${product.available ? 'text-neutral-700 group-hover/row:text-brand-navy' : 'text-neutral-400 line-through'}`}>
                  {product.name}
                </span>
                <span className={`shrink-0 font-semibold ${product.available ? 'text-neutral-900' : 'text-semantic-error'}`}>
                  {product.available ? formatVnd(product.price) : 'Ngừng bán'}
                </span>
              </>
            );
            return (
              <li key={`${product.id}-${idx}`} title={item.note ?? undefined}>
                {product.available ? (
                  <Link
                    href={`/products/${product.id}`}
                    onClick={() => onSelectProduct(product)}
                    className="group/row flex items-baseline justify-between gap-3 text-body-sm"
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="flex items-baseline justify-between gap-3 text-body-sm">{row}</div>
                )}
              </li>
            );
          })}
        </ul>

        {outfit.extras.length > 0 && (
          <p className="text-label-sm text-neutral-400 truncate" title={outfit.extras.join(' · ')}>
            + {outfit.extras.join(' · ')}
          </p>
        )}

        <footer className="mt-auto pt-3 border-t border-neutral-100 flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-label-sm text-neutral-400">Cả bộ</span>
            <span className="text-body-lg font-bold text-brand-navy">{formatVnd(outfit.totalPrice)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <OutfitTryOnButton outfit={outfit} />
            <button
              type="button"
              onClick={() => onAddToCart(outfit)}
              disabled={availableCount === 0}
              className="h-10 rounded-xl bg-brand-navy text-white text-label-md font-semibold flex items-center justify-center gap-1.5 hover:bg-brand-navy/90 transition-colors border-0 cursor-pointer disabled:bg-neutral-300 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              {availableCount === 0 ? 'Ngừng bán' : 'Thêm cả bộ'}
            </button>
          </div>
        </footer>
      </div>
    </article>
  );
}

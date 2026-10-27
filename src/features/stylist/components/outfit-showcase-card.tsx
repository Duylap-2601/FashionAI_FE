'use client';

import { OUTFIT_ROLE_LABELS } from '@/features/stylist/constants/outfit-suggestion';
import { OutfitTryOnButton } from '@/features/stylist/components/outfit-try-on-button';
import { ProductCutoutImage } from '@/features/stylist/components/product-cutout-image';
import { formatVnd } from '@/features/stylist/services/format';
import type { OutfitSuggestionCardProps } from '@/features/stylist/types/outfit-suggestion-card';
import { ChevronDown, ShoppingBag } from 'lucide-react';
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
  const unavailableCount = outfit.items.length - availableCount;
  const stripItems = outfit.items.slice(0, 4);

  const addToCartButton = (
    <button
      type="button"
      onClick={() => onAddToCart(outfit)}
      disabled={availableCount === 0}
      className="flex h-10 items-center justify-center gap-1.5 rounded-[2px] bg-landing-oxblood text-[11px] font-semibold uppercase tracking-[0.14em] text-landing-paper transition-colors hover:bg-landing-obsidian focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood disabled:cursor-not-allowed disabled:bg-landing-taupe disabled:text-landing-obsidian/50"
    >
      <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
      {availableCount === 0 ? 'Ngừng bán' : 'Thêm cả bộ'}
    </button>
  );

  return (
    <article className={`snap-start shrink-0 ${size.article} flex flex-col overflow-hidden rounded-[2px] border border-landing-line bg-landing-ivory`}>
      <div className={`flex ${size.strip} overflow-hidden border-b border-landing-line/70 bg-landing-paper px-3`}>
        {stripItems.map((item, idx) => (
          <ProductCutoutImage
            key={`${item.product.id}-${idx}`}
            product={item.product}
            alt={`${OUTFIT_ROLE_LABELS[item.role]}: ${item.product.name}`}
            onSelect={onSelectProduct}
          />
        ))}
      </div>

      <div className={`flex flex-1 flex-col gap-3 ${size.body}`}>
        {/* Mặt thẻ chỉ giữ tên bộ, số món và tổng tiền; lý do, từng món và phụ kiện nằm trong "Chi tiết". */}
        <div>
          <h3 className="line-clamp-1 font-display text-lg leading-snug text-landing-obsidian" title={outfit.reason ?? undefined}>
            {outfit.name || 'Bộ phối gợi ý'}
          </h3>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-xs text-landing-muted">
            <span>{outfit.items.length} món</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-sm text-landing-oxblood">{formatVnd(outfit.totalPrice)}</span>
            {unavailableCount > 0 && <span className="text-destructive">· {unavailableCount} ngừng bán</span>}
          </p>
        </div>

        <details className="group/details">
          <summary className="flex min-h-8 w-fit cursor-pointer list-none items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-muted transition-colors hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood [&::-webkit-details-marker]:hidden">
            Chi tiết bộ phối
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-open/details:rotate-180" strokeWidth={1.75} aria-hidden="true" />
          </summary>
          <div className="mt-2 flex flex-col gap-2.5 border-t border-landing-line/70 pt-3">
            {outfit.reason && <p className="text-xs italic leading-relaxed text-landing-muted">{outfit.reason}</p>}
            <ul className="flex flex-col gap-1.5">
              {outfit.items.map((item, idx) => {
                const { product } = item;
                const row = (
                  <>
                    <span className={`min-w-0 truncate ${product.available ? 'text-landing-obsidian/80 group-hover/row:text-landing-oxblood' : 'text-landing-muted line-through'}`}>
                      {product.name}
                    </span>
                    <span className={`shrink-0 ${product.available ? 'text-landing-muted' : 'text-destructive'}`}>
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
                        className="group/row flex items-baseline justify-between gap-3 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
                      >
                        {row}
                      </Link>
                    ) : (
                      <div className="flex items-baseline justify-between gap-3 text-xs">{row}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            {outfit.extras.length > 0 && (
              <p className="text-xs text-landing-muted">+ {outfit.extras.join(' · ')}</p>
            )}
          </div>
        </details>

        {/* Chat đặt "Thêm cả bộ" bên trái, trang AI Stylist giữ "Thử đồ" bên trái. */}
        <div className="mt-auto grid grid-cols-2 gap-2">
          {density === 'chat' ? (
            <>
              {addToCartButton}
              <OutfitTryOnButton outfit={outfit} />
            </>
          ) : (
            <>
              <OutfitTryOnButton outfit={outfit} />
              {addToCartButton}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

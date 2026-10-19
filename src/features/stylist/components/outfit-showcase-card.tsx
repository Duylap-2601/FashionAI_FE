'use client';

import { OUTFIT_ROLE_LABELS } from '@/features/stylist/constants/outfit-suggestion';
import { OutfitTryOnButton } from '@/features/stylist/components/outfit-try-on-button';
import { formatVnd } from '@/features/stylist/services/format';
import type { OutfitSuggestionItem } from '@/features/stylist/types/outfit-suggestion';
import type { OutfitSuggestionCardProps } from '@/features/stylist/types/outfit-suggestion-card';
import { Package, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Ảnh sản phẩm là PNG 3:4 đã tách nền, quanh món đồ còn ≥ ~9% trên/dưới và ≥ ~11% hai bên
// trong suốt. Khung ảnh được nới ra ngoài ô (6% dọc, 12% ngang) rồi `object-contain`: món đồ
// to hơn mà vẫn hiện trọn, phần bị ô cắt mất chỉ là nền trong suốt.
const IMAGE_BLEED_STYLE = { inset: '-6% -12%' } as const;

function ItemImage({ item, onSelect }: { item: OutfitSuggestionItem; onSelect: () => void }) {
  const { product } = item;
  const content = product.image ? (
    <div className="absolute pointer-events-none transition-transform duration-300 group-hover/img:scale-[1.03]" style={IMAGE_BLEED_STYLE}>
      <Image
        src={product.image}
        alt={`${OUTFIT_ROLE_LABELS[item.role]}: ${product.name}`}
        fill
        sizes="(min-width: 1024px) 200px, 50vw"
        className={`object-contain ${product.available ? '' : 'grayscale opacity-50'}`}
      />
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      <Package className="w-5 h-5 text-neutral-300" />
    </div>
  );

  if (!product.available) {
    return <div className="relative flex-1 min-w-0 h-full">{content}</div>;
  }
  return (
    <Link href={`/products/${product.id}`} onClick={onSelect} className="group/img relative block flex-1 min-w-0 h-full">
      {content}
    </Link>
  );
}

/** Thẻ bộ phối lớn của trang AI Stylist: nhìn ảnh là thấy cả bộ, chữ chỉ để đọc nhanh. */
export function OutfitShowcaseCard({ outfit, onAddToCart, onSelectProduct }: OutfitSuggestionCardProps) {
  const availableCount = outfit.items.filter((item) => item.product.available).length;
  const stripItems = outfit.items.slice(0, 4);

  return (
    <article className="snap-start shrink-0 w-[84%] sm:w-[58%] md:w-auto bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden flex flex-col">
      <div className="flex h-60 px-3 bg-brand-cream overflow-hidden">
        {stripItems.map((item, idx) => (
          <ItemImage key={`${item.product.id}-${idx}`} item={item} onSelect={() => onSelectProduct(item.product)} />
        ))}
      </div>

      <div className="flex-1 flex flex-col gap-3 p-4">
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

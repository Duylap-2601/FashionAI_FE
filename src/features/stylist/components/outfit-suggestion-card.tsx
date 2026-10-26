'use client';

import { OUTFIT_ROLE_LABELS } from '@/features/stylist/constants/outfit-suggestion';
import { OutfitTryOnButton } from '@/features/stylist/components/outfit-try-on-button';
import { formatVnd } from '@/features/stylist/services/format';
import type { OutfitSuggestionItem, SuggestedProduct } from '@/features/stylist/types/outfit-suggestion';
import type { OutfitSuggestionCardProps } from '@/features/stylist/types/outfit-suggestion-card';
import { Package, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function ProductThumb({ product }: { product: SuggestedProduct }) {
  return (
    <div className="relative h-[72px] w-14 shrink-0 overflow-hidden rounded-[2px] border border-landing-line/70 bg-landing-paper">
      {product.image ? (
        <Image src={product.image} alt={product.name} fill sizes="56px" className="object-contain p-0.5" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="h-4 w-4 text-landing-muted" strokeWidth={1.75} />
        </div>
      )}
    </div>
  );
}

function OutfitItemRow({ item, onSelectProduct }: {
  item: OutfitSuggestionItem;
  onSelectProduct: (product: SuggestedProduct) => void;
}) {
  const { product } = item;
  const details = (
    <>
      <ProductThumb product={product} />
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-landing-brass-ink">
          {OUTFIT_ROLE_LABELS[item.role]}
        </span>
        <p className={`product-name-line line-clamp-2 ${product.available ? 'text-landing-obsidian group-hover/item:text-landing-oxblood' : 'text-landing-muted'}`}>
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`font-mono text-[12px] ${product.available ? 'text-landing-oxblood' : 'text-landing-muted line-through'}`}>
            {formatVnd(product.price)}
          </span>
          {!product.available && (
            <span className="rounded-[2px] border border-destructive/30 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-destructive">
              Ngừng bán
            </span>
          )}
        </div>
        {item.note && (
          <p className="mt-0.5 line-clamp-2 text-xs italic leading-snug text-landing-muted">{item.note}</p>
        )}
      </div>
    </>
  );

  // Sản phẩm ngừng bán không còn trang chi tiết để mở.
  if (!product.available) {
    return <div className="flex items-start gap-3 p-1.5 opacity-70">{details}</div>;
  }
  return (
    <Link
      href={`/products/${product.id}`}
      onClick={() => onSelectProduct(product)}
      className="group/item flex items-start gap-3 rounded-[2px] p-1.5 transition-colors hover:bg-landing-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
    >
      {details}
    </Link>
  );
}

export function OutfitSuggestionCard({ outfit, onAddToCart, onSelectProduct }: OutfitSuggestionCardProps) {
  const availableCount = outfit.items.filter((item) => item.product.available).length;

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-[2px] border border-landing-line bg-landing-ivory">
      <header className="px-4 pt-4 pb-2">
        <h4 className="font-display text-lg leading-snug text-landing-obsidian">{outfit.name || 'Bộ phối gợi ý'}</h4>
        {outfit.reason && (
          <p className="mt-1 text-sm leading-relaxed text-landing-muted">{outfit.reason}</p>
        )}
      </header>

      <ul className="px-2.5 flex flex-col gap-0.5">
        {outfit.items.map((item, idx) => (
          <li key={`${item.product.id}-${idx}`}>
            <OutfitItemRow item={item} onSelectProduct={onSelectProduct} />
          </li>
        ))}
      </ul>

      {outfit.extras.length > 0 && (
        <div className="px-4 pt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-landing-muted">Phụ kiện gợi ý:</span>
          {outfit.extras.map((extra, idx) => (
            <span
              key={idx}
              className="rounded-[2px] border border-landing-line bg-landing-paper px-2 py-0.5 text-[11px] text-landing-obsidian/80"
            >
              {extra}
            </span>
          ))}
        </div>
      )}

      <footer className="mt-auto px-4 pt-3 pb-4 flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-2 border-t border-landing-line/70 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-muted">Tổng cả bộ</span>
          <span className="font-mono text-base text-landing-oxblood">{formatVnd(outfit.totalPrice)}</span>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <OutfitTryOnButton outfit={outfit} />
          <button
            type="button"
            onClick={() => onAddToCart(outfit)}
            disabled={availableCount === 0}
            className="flex h-10 items-center justify-center gap-2 rounded-[2px] bg-landing-oxblood text-[11px] font-semibold uppercase tracking-[0.14em] text-landing-paper transition-colors hover:bg-landing-obsidian focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood disabled:cursor-not-allowed disabled:bg-landing-taupe disabled:text-landing-obsidian/50"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
            {availableCount === 0 ? 'Đã ngừng bán' : 'Thêm cả bộ vào giỏ'}
          </button>
        </div>
      </footer>
    </article>
  );
}

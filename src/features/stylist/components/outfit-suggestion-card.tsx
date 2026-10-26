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
    <div className="relative w-14 h-[72px] shrink-0 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-100">
      {product.image ? (
        <Image src={product.image} alt={product.name} fill sizes="56px" className="object-contain p-0.5" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="w-4 h-4 text-neutral-400" />
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
        <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          {OUTFIT_ROLE_LABELS[item.role]}
        </span>
        <p className={`product-name-line line-clamp-2 ${product.available ? 'text-neutral-900 group-hover/item:text-brand-navy' : 'text-neutral-500'}`}>
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-label-sm font-bold ${product.available ? 'text-brand-navy' : 'text-neutral-400 line-through'}`}>
            {formatVnd(product.price)}
          </span>
          {!product.available && (
            <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-[10px] font-semibold text-semantic-error">
              Ngừng bán
            </span>
          )}
        </div>
        {item.note && (
          <p className="mt-0.5 text-[11.5px] text-neutral-500 italic leading-snug line-clamp-2">{item.note}</p>
        )}
      </div>
    </>
  );

  // Sản phẩm ngừng bán không còn trang chi tiết để mở.
  if (!product.available) {
    return <div className="flex items-start gap-3 p-1.5 rounded-xl opacity-70">{details}</div>;
  }
  return (
    <Link
      href={`/products/${product.id}`}
      onClick={() => onSelectProduct(product)}
      className="group/item flex items-start gap-3 p-1.5 rounded-xl hover:bg-neutral-50 transition-colors"
    >
      {details}
    </Link>
  );
}

export function OutfitSuggestionCard({ outfit, onAddToCart, onSelectProduct }: OutfitSuggestionCardProps) {
  const availableCount = outfit.items.filter((item) => item.product.available).length;

  return (
    <article className="bg-white rounded-2xl border border-neutral-200 shadow-xs flex flex-col min-w-0 overflow-hidden">
      <header className="px-4 pt-4 pb-2">
        <h4 className="text-label-md font-bold text-brand-navy leading-snug">{outfit.name || 'Bộ phối gợi ý'}</h4>
        {outfit.reason && (
          <p className="mt-1 text-[12.5px] text-neutral-600 leading-relaxed">{outfit.reason}</p>
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
          <span className="text-[11px] font-semibold text-neutral-500">Phụ kiện gợi ý:</span>
          {outfit.extras.map((extra, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] text-neutral-700"
            >
              {extra}
            </span>
          ))}
        </div>
      )}

      <footer className="mt-auto px-4 pt-3 pb-4 flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-2 pt-3 border-t border-neutral-100">
          <span className="text-label-sm text-neutral-500">Tổng cả bộ</span>
          <span className="text-body-md font-bold text-brand-navy">{formatVnd(outfit.totalPrice)}</span>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <OutfitTryOnButton outfit={outfit} />
          <button
            type="button"
            onClick={() => onAddToCart(outfit)}
            disabled={availableCount === 0}
            className="h-10 rounded-xl bg-brand-navy text-white text-label-md font-semibold flex items-center justify-center gap-2 hover:bg-brand-navy/90 transition-colors border-0 cursor-pointer disabled:bg-neutral-300 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-4 h-4" />
            {availableCount === 0 ? 'Đã ngừng bán' : 'Thêm cả bộ vào giỏ'}
          </button>
        </div>
      </footer>
    </article>
  );
}

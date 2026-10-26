'use client';

import { ProductCutoutImage } from '@/features/stylist/components/product-cutout-image';
import { formatVnd } from '@/features/stylist/services/format';
import type { SuggestedProductCardProps } from '@/features/stylist/types/suggested-product-card';
import { ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';

/** Món lẻ AI Chat gợi ý, cùng kiểu với thẻ bộ phối để đứng chung một băng vuốt. */
export function SuggestedProductCard({ product, onAddToCart, onSelectProduct }: SuggestedProductCardProps) {
  return (
    <article className="snap-start shrink-0 w-[200px] sm:w-[212px] bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden flex flex-col">
      <div className="flex h-48 px-3 bg-brand-cream overflow-hidden">
        <ProductCutoutImage product={product} alt={product.name} onSelect={onSelectProduct} />
      </div>
      <div className="flex-1 flex flex-col gap-2.5 p-3.5">
        <div className="min-w-0">
          {product.available ? (
            <Link
              href={`/products/${product.id}`}
              onClick={() => onSelectProduct(product)}
              className="product-name-line text-neutral-900 line-clamp-2 hover:text-brand-navy"
            >
              {product.name}
            </Link>
          ) : (
            <p className="product-name-line text-neutral-400 line-clamp-2 line-through">{product.name}</p>
          )}
          <p className={`mt-1 text-body-md font-bold ${product.available ? 'text-brand-navy' : 'text-semantic-error'}`}>
            {product.available ? formatVnd(product.price) : 'Ngừng bán'}
          </p>
        </div>
        {product.available && (
          <div className="mt-auto grid grid-cols-2 gap-2">
            <Link
              href={`/try-on?productId=${product.id}`}
              className="h-9 rounded-xl border border-brand-navy/30 bg-white text-brand-navy text-label-sm font-semibold flex items-center justify-center gap-1 hover:bg-brand-navy/5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Thử đồ
            </Link>
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              aria-label={`Thêm ${product.name} vào giỏ`}
              className="h-9 rounded-xl bg-brand-navy text-white text-label-sm font-semibold flex items-center justify-center gap-1 hover:bg-brand-navy/90 transition-colors border-0 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Thêm
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

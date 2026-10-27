'use client';

import { ProductCutoutImage } from '@/features/stylist/components/product-cutout-image';
import { formatVnd } from '@/features/stylist/services/format';
import type { SuggestedProductCardProps } from '@/features/stylist/types/suggested-product-card';
import { ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';

/** Món lẻ AI Chat gợi ý, cùng kiểu với thẻ bộ phối để đứng chung một băng vuốt. */
export function SuggestedProductCard({ product, onAddToCart, onSelectProduct }: SuggestedProductCardProps) {
  return (
    <article className="flex w-[200px] shrink-0 snap-start flex-col overflow-hidden rounded-[2px] border border-landing-line bg-landing-ivory sm:w-[212px]">
      <div className="flex h-48 overflow-hidden border-b border-landing-line/70 bg-landing-paper px-3">
        <ProductCutoutImage product={product} alt={product.name} onSelect={onSelectProduct} />
      </div>
      <div className="flex-1 flex flex-col gap-2.5 p-3.5">
        <div className="min-w-0">
          {product.available ? (
            <Link
              href={`/products/${product.id}`}
              onClick={() => onSelectProduct(product)}
              className="product-name-line line-clamp-2 text-landing-obsidian hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
            >
              {product.name}
            </Link>
          ) : (
            <p className="product-name-line line-clamp-2 text-landing-muted line-through">{product.name}</p>
          )}
          <p className={`mt-1 font-mono text-sm ${product.available ? 'text-landing-oxblood' : 'text-destructive'}`}>
            {product.available ? formatVnd(product.price) : 'Ngừng bán'}
          </p>
        </div>
        {product.available && (
          <div className="mt-auto grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              aria-label={`Thêm ${product.name} vào giỏ`}
              className="flex h-9 items-center justify-center gap-1 rounded-[2px] bg-landing-oxblood text-[10px] font-semibold uppercase tracking-[0.14em] text-landing-paper transition-colors hover:bg-landing-obsidian focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
            >
              <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.75} /> Thêm
            </button>
            <Link
              href={`/try-on?productId=${product.id}`}
              className="flex h-9 items-center justify-center gap-1 rounded-[2px] border border-landing-obsidian/70 text-[10px] font-semibold uppercase tracking-[0.14em] text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} /> Thử đồ
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

'use client';

import { formatVnd } from '@/features/stylist/services/format';
import type { SuggestedProductListProps } from '@/features/stylist/types/suggested-product-list';
import { Package, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function SuggestedProductList({ products, onAddToCart, onSelectProduct }: SuggestedProductListProps) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-landing-brass-ink">Sản phẩm gợi ý</p>
      <ul className="flex flex-col gap-1.5">
        {products.map((product) => {
          const details = (
            <>
              <div className="relative h-[52px] w-10 shrink-0 overflow-hidden rounded-[2px] border border-landing-line/70 bg-landing-paper">
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill sizes="40px" className="object-contain p-0.5" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-landing-muted" strokeWidth={1.75} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`product-name-line line-clamp-2 ${product.available ? 'text-landing-obsidian group-hover/prod:text-landing-oxblood' : 'text-landing-muted'}`}>
                  {product.name}
                </p>
                <span className={`font-mono text-[12px] ${product.available ? 'text-landing-oxblood' : 'text-landing-muted line-through'}`}>
                  {formatVnd(product.price)}
                </span>
              </div>
            </>
          );

          return (
            <li key={product.id} className="flex items-center gap-2 rounded-[2px] border border-landing-line bg-landing-ivory p-2">
              {product.available ? (
                <Link
                  href={`/products/${product.id}`}
                  onClick={() => onSelectProduct(product)}
                  className="group/prod flex min-w-0 flex-1 items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
                >
                  {details}
                </Link>
              ) : (
                <div className="flex items-center gap-2.5 min-w-0 flex-1 opacity-70">{details}</div>
              )}
              {product.available ? (
                <button
                  type="button"
                  onClick={() => onAddToCart(product)}
                  title="Thêm vào giỏ"
                  aria-label={`Thêm ${product.name} vào giỏ`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border border-landing-obsidian/70 text-landing-obsidian transition-colors hover:border-landing-oxblood hover:bg-landing-oxblood hover:text-landing-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
                >
                  <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
                </button>
              ) : (
                <span className="shrink-0 rounded-[2px] border border-destructive/30 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-destructive">
                  Ngừng bán
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

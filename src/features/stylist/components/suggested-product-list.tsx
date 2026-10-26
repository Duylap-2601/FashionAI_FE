'use client';

import { formatVnd } from '@/features/stylist/services/format';
import type { SuggestedProductListProps } from '@/features/stylist/types/suggested-product-list';
import { Package, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function SuggestedProductList({ products, onAddToCart, onSelectProduct }: SuggestedProductListProps) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Sản phẩm gợi ý</p>
      <ul className="flex flex-col gap-1.5">
        {products.map((product) => {
          const details = (
            <>
              <div className="relative w-10 h-[52px] shrink-0 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-100">
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill sizes="40px" className="object-contain p-0.5" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-neutral-400" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`product-name-line line-clamp-2 ${product.available ? 'text-neutral-900 group-hover/prod:text-brand-navy' : 'text-neutral-500'}`}>
                  {product.name}
                </p>
                <span className={`text-label-sm font-bold ${product.available ? 'text-brand-navy' : 'text-neutral-400 line-through'}`}>
                  {formatVnd(product.price)}
                </span>
              </div>
            </>
          );

          return (
            <li key={product.id} className="flex items-center gap-2 p-2 bg-white border border-neutral-200 rounded-xl shadow-xs">
              {product.available ? (
                <Link
                  href={`/products/${product.id}`}
                  onClick={() => onSelectProduct(product)}
                  className="group/prod flex items-center gap-2.5 min-w-0 flex-1"
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
                  className="w-9 h-9 shrink-0 rounded-full border border-brand-navy/30 text-brand-navy flex items-center justify-center hover:bg-brand-navy hover:text-white transition-colors bg-transparent cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              ) : (
                <span className="shrink-0 px-1.5 py-0.5 rounded bg-neutral-100 text-[10px] font-semibold text-semantic-error">
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

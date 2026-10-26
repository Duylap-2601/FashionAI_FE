import { ProductCard } from '@/features/products/components/listing/ProductCard';
import type { RelatedProductsProps } from '@/features/products/types/related-products';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function RelatedProducts({ products, onAddToCart }: RelatedProductsProps) {
  return (
    <div className="bg-landing-paper py-16">
      <div className="max-w-[1440px] w-full mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-8 border-b border-landing-line/70 pb-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-landing-oxblood">
              Gợi ý phối đồ
            </span>
            <h2 className="mt-1 font-display text-[26px] md:text-[30px] leading-tight text-landing-obsidian">
              Có thể bạn sẽ thích
            </h2>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-oxblood hover:text-landing-obsidian transition-colors"
          >
            Xem tất cả
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-3 gap-y-10 sm:gap-x-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

import { ProductCard } from '@/features/products/components/listing/ProductCard';
import type { RelatedProductsProps } from '@/features/products/types/related-products';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';

export function RelatedProducts({ products, onAddToCart }: RelatedProductsProps) {
  return (
    <section className="border-t border-landing-line bg-landing-paper py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-landing-line pb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink">
              Gợi ý phối đồ
            </span>
            <h2 className="mt-1 font-display text-landing-h2 leading-tight text-landing-obsidian">
              Có thể bạn sẽ thích
            </h2>
          </div>
          <Link
            href="/products"
            className={cn(
              'group inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-landing-oxblood transition-colors hover:text-landing-obsidian',
              focusRing,
            )}
          >
            Xem tất cả
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.75} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

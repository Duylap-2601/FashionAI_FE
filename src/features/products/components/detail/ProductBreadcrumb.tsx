import type { Product } from '@/features/products/types/products';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';

export function ProductBreadcrumb({ product }: { product: Product }) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-4 pt-6 md:px-8">
      <nav
        aria-label="Đường dẫn"
        className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-muted"
      >
        <Link href="/" className={`transition-colors hover:text-landing-oxblood ${focusRing}`}>
          Trang chủ
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0 text-landing-taupe" strokeWidth={1.75} aria-hidden="true" />
        <Link href="/products" className={`transition-colors hover:text-landing-oxblood ${focusRing}`}>
          Sản phẩm
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0 text-landing-taupe" strokeWidth={1.75} aria-hidden="true" />
        <span>{product.category}</span>
        <ChevronRight className="h-3 w-3 shrink-0 text-landing-taupe" strokeWidth={1.75} aria-hidden="true" />
        <span aria-current="page" className="max-w-[200px] truncate text-landing-obsidian md:max-w-none">
          {product.name}
        </span>
      </nav>
    </div>
  );
}

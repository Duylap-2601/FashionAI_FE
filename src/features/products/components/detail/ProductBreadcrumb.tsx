import type { Product } from '@/features/products/types/products';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function ProductBreadcrumb({ product }: { product: Product }) {
  return (
    <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 py-6">
      <nav className="flex items-center gap-2 text-label-sm font-medium text-neutral-500">
        <Link href="/" className="hover:text-brand-navy transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-brand-navy transition-colors">Sản phẩm</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="hover:text-brand-navy transition-colors cursor-pointer">{product.category}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-brand-navy font-semibold truncate max-w-[200px] md:max-w-none">{product.name}</span>
      </nav>
    </div>
  );
}

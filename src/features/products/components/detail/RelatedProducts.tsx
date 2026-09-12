import type { RelatedProductsProps } from '@/features/products/types/related-products';
import { ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function RelatedProducts({ products, onAddToCart }: RelatedProductsProps) {
  return (
    <div className="bg-brand-cream py-[64px]">
      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-[28px] font-bold text-brand-navy tracking-tight">Có thể bạn sẽ thích</h2>
          <Link href="/products" className="text-body-sm font-medium text-brand-navy hover:underline underline-offset-4 mb-1">
            Xem tất cả &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <Link
              href={`/products/${product.id}`}
              key={product.id}
              className="group flex flex-col bg-white border border-neutral-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onAddToCart(product);
                  }}
                  className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-brand-navy shadow-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all cursor-pointer hover:bg-brand-navy hover:text-white"
                  title="Thêm vào giỏ"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-1.5">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{product.brand}</div>
                <h4 className="text-body-sm font-medium text-brand-navy line-clamp-2">{product.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-body-sm font-bold text-brand-navy">{product.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

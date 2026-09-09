import { HangerIcon } from '@/components/ui/HangerIcon';
import type { ProductCardProps } from '@/features/products/types/product-card';
import { ShoppingBag, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function ProductCard({ product, pinned, onToggleRack, onAddToCart }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.numericPrice;
  const discountPercent = hasDiscount && product.originalPrice
    ? Math.round(((product.originalPrice - product.numericPrice) / product.originalPrice) * 100)
    : null;
  const isCombo = product.name.toLowerCase().includes('combo') || product.category.toLowerCase().includes('suit');

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col bg-white border border-neutral-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full relative"
    >
      <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          unoptimized
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/images/731163514_999523332788054_1114320478812927640_n.png';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-1 left-1 flex flex-col gap-1 z-10 pointer-events-none sm:top-1.5 sm:left-1.5">
          {discountPercent && discountPercent > 0 && (
            <span className="px-1.5 py-0.5 bg-semantic-error text-white text-[9px] font-bold rounded shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {isCombo && (
            <span className="px-1.5 py-0.5 bg-brand-navy/90 backdrop-blur-sm text-white text-[9px] font-bold rounded shadow-sm">
              Combo
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleRack(product);
          }}
          className={`absolute bottom-1 right-8.5 w-7 h-7 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-all sm:bottom-1.5 sm:right-9.5 ${pinned
              ? 'bg-[#5D1C34] text-white opacity-100'
              : 'bg-white/90 text-brand-navy opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 hover:bg-[#5D1C34] hover:text-white'
            }`}
          title={pinned ? 'Bỏ ghim khỏi Giá treo đồ' : 'Ghim vào Giá treo đồ'}
        >
          <HangerIcon className="w-3 h-3" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onAddToCart(product);
          }}
          className="absolute bottom-1 right-1 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-brand-navy shadow-sm opacity-100 translate-y-0 sm:bottom-1.5 sm:right-1.5 sm:opacity-0 sm:translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all hover:bg-brand-navy hover:text-white"
          title="Thêm nhanh vào giỏ"
        >
          <ShoppingBag className="w-3 h-3" />
        </button>
      </div>

      <div className="px-2 py-2 flex flex-col gap-0.5 sm:px-2.5 sm:py-2.5">
        <div className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">{product.brand}</div>
        <h4 className="text-[10.5px] sm:text-[11px] font-medium text-brand-navy line-clamp-2 min-h-[27px] sm:min-h-[28px] font-sans leading-snug">{product.name}</h4>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] font-bold text-brand-navy">{product.price}</span>
          {hasDiscount && product.originalPriceFormatted && (
            <span className="text-[10px] text-neutral-400 line-through">{product.originalPriceFormatted}</span>
          )}
        </div>
        {typeof product.rating === 'number' && product.rating > 0 && (
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-neutral-500">
            <Star className="w-2.5 h-2.5 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="font-semibold text-neutral-800">{product.rating.toFixed(1)}</span>
            {product.reviewCount ? <span>({product.reviewCount})</span> : null}
          </div>
        )}
      </div>
    </Link>
  );
}

'use client';

import { cn } from '@/components/ui/utils';
import { useCart } from '@/features/cart/hooks/use-cart';
import { LANDING_MEDIA } from '@/features/home/constants/landing-media';
import type { ProductCardProps } from '@/features/products/types/product-card';
import { ArrowUpRight, ShoppingBag, Sparkles, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

export function ProductCard({
  product,
  showQuickAdd = true,
  showTryOn = true,
  showRating = true,
  imagePriority = false,
  className,
  onAddToCart,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const [imageFailed, setImageFailed] = useState(false);
  const [secondImageFailed, setSecondImageFailed] = useState(false);

  const fallbackSrc = LANDING_MEDIA.productFallback;
  const imageSrc = imageFailed || !product.image ? fallbackSrc : product.image;
  const hasSecondImage = Boolean(
    product.gallery && product.gallery.length > 1 && !secondImageFailed,
  );
  const secondImageSrc = secondImageFailed ? fallbackSrc : (product.gallery?.[1] || fallbackSrc);

  const hasDiscount = Boolean(product.originalPrice && product.numericPrice < product.originalPrice);
  const discountPercent = hasDiscount && product.originalPrice
    ? Math.round(((product.originalPrice - product.numericPrice) / product.originalPrice) * 100)
    : 0;

  const hasRating = Boolean(
    (product.rating && product.rating > 0) || (product.reviewCount && product.reviewCount > 0),
  );

  const handleQuickAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    const defaultVariant = product.colors?.[0]?.name;
    addToCart({
      productId: product.id,
      name: product.name,
      variant: defaultVariant || 'Tiêu chuẩn',
      price: product.numericPrice,
      quantity: 1,
      image: product.image,
      color: defaultVariant,
    });

    toast.custom((toastId) => (
      <div className="flex w-[min(360px,calc(100vw-56px))] items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[13px] font-semibold text-landing-oxblood">
          Đã thêm {product.name} vào giỏ
        </p>
        <button
          type="button"
          onClick={() => {
            setIsCartOpen(true);
            toast.dismiss(toastId);
          }}
          className="shrink-0 text-[12px] font-bold text-landing-oxblood hover:underline"
        >
          Xem giỏ
        </button>
      </div>
    ), { duration: 2500 });
  };

  const handleTryOn = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/try-on?productId=${product.id}`);
  };

  return (
    <article className={cn('group flex flex-col h-full', className)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-landing-paper">
        <Link
          href={`/products/${product.id}`}
          className="relative block h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
          aria-label={`Xem chi tiết sản phẩm ${product.name}`}
        >
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            priority={imagePriority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              'object-cover object-top transition-all duration-500 group-hover:scale-[1.03]',
              hasSecondImage ? 'group-hover:opacity-0' : '',
            )}
            onError={() => setImageFailed(true)}
          />
          {hasSecondImage && secondImageSrc ? (
            <Image
              src={secondImageSrc}
              alt={`${product.name} - góc nhìn thứ hai`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-top opacity-0 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
              onError={() => setSecondImageFailed(true)}
            />
          ) : null}
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col gap-1">
          {hasDiscount && discountPercent > 0 ? (
            <span className="bg-landing-oxblood px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-landing-paper">
              -{discountPercent}%
            </span>
          ) : product.isNew ? (
            <span className="bg-landing-sage px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-landing-obsidian">
              Mới
            </span>
          ) : null}
        </div>

        {/* Quick actions */}
        {(showQuickAdd || showTryOn) && (
          <div className="absolute inset-x-2 bottom-2 z-20 flex translate-y-0 items-center gap-1.5 opacity-100 transition-all duration-200 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
            {showQuickAdd && (
              <button
                type="button"
                onClick={handleQuickAdd}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 bg-landing-obsidian text-[10px] font-semibold uppercase tracking-[0.14em] text-landing-paper transition-colors hover:bg-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood disabled:opacity-50"
                title="Thêm vào giỏ hàng"
                aria-label={`Thêm ${product.name} vào giỏ hàng`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Thêm giỏ</span>
              </button>
            )}
            {showTryOn && (
              <button
                type="button"
                onClick={handleTryOn}
                className={cn(
                  'flex h-10 items-center justify-center border border-landing-line bg-landing-paper/95 text-landing-oxblood backdrop-blur-sm transition-colors hover:bg-landing-oxblood hover:text-landing-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood',
                  showQuickAdd ? 'w-10 flex-none sm:w-10' : 'flex-1',
                )}
                title="Thử đồ AI"
                aria-label={`Thử đồ AI cho ${product.name}`}
              >
                <Sparkles className="h-4 w-4" />
                {!showQuickAdd && (
                  <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]">Thử đồ AI</span>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-landing-muted">
            {product.brand || 'StAle. Signature'}
          </span>
          {showRating && hasRating ? (
            <div className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-landing-brass-ink">
              <Star className="h-3 w-3 fill-landing-brass text-landing-brass" />
              <span>{(product.rating && product.rating > 0 ? product.rating : 5).toFixed(1)}</span>
              {product.reviewCount ? (
                <span className="font-normal text-landing-muted">({product.reviewCount})</span>
              ) : null}
            </div>
          ) : null}
        </div>

        <Link
          href={`/products/${product.id}`}
          className="mt-2 line-clamp-2 font-display text-[1.05rem] leading-snug text-landing-obsidian transition-colors hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-landing-oxblood"
        >
          {product.name}
        </Link>

        <div className="mt-auto pt-3 flex items-baseline justify-between gap-2 border-t border-landing-line/60">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="font-mono text-[12px] font-medium tracking-[0.02em] text-landing-oxblood">
              {product.price}
            </span>
            {hasDiscount && (product.originalPriceFormatted || product.originalPrice) ? (
              <span className="font-mono text-[10px] text-landing-muted line-through">
                {product.originalPriceFormatted || `${product.originalPrice?.toLocaleString('vi-VN')}₫`}
              </span>
            ) : null}
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-landing-muted transition-colors group-hover:text-landing-oxblood" />
        </div>
      </div>
    </article>
  );
}

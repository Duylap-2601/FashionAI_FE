'use client';

import { cn } from '@/components/ui/utils';
import { useCart } from '@/features/cart/hooks/use-cart';
import { LandingSectionHeading } from '@/features/home/components/LandingSectionHeading';
import { LANDING_MEDIA } from '@/features/home/constants/landing-media';
import type { ProductGridProps } from '@/features/home/types/product-grid';
import { GARMENT_TYPE_TABS } from '@/features/products/constants/product-filters';
import { matchesGarmentType } from '@/features/products/services/product-filters';
import type { Product } from '@/features/products/types/products';
import { ArrowUpRight, Eye, ShoppingBag, Sparkles, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

export function ProductGrid({
  products,
  title = 'Sản phẩm tiêu biểu',
  subtitle = 'Những thiết kế đang được chọn nhiều nhất trong tuần.',
  badge = 'Sản phẩm',
  viewAllLink = '/products',
  showCategories = true,
}: ProductGridProps) {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const [selectedTabKey, setSelectedTabKey] = useState<string>('ALL');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const selectedTab = GARMENT_TYPE_TABS.find((tab) => tab.key === selectedTabKey) || GARMENT_TYPE_TABS[0];

  const filteredProducts = products.filter((product) => {
    return matchesGarmentType(product, selectedTab.garmentType);
  });

  const activeViewAllLink = selectedTab.garmentType
    ? `${viewAllLink}${viewAllLink.includes('?') ? '&' : '?'}garmentType=${selectedTab.garmentType}`
    : viewAllLink;

  const handleQuickAdd = (product: Product, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      variant: product.colors?.[0]?.name || 'Tiêu chuẩn',
      price: product.numericPrice,
      quantity: 1,
      image: product.image,
      color: product.colors?.[0]?.name,
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

  const handleTryOn = (product: Product, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/try-on?productId=${product.id}`);
  };

  return (
    <section className="bg-landing-ivory py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <LandingSectionHeading
          chapter="03"
          eyebrow={badge || 'Sản phẩm'}
          title={title}
          description={subtitle}
          action={viewAllLink ? (
            <Link
              href={activeViewAllLink}
              className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-oxblood transition-colors hover:text-landing-obsidian"
            >
              Xem tất cả
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          ) : null}
        />

        {showCategories ? (
          <div className="mt-9 flex items-center gap-6 overflow-x-auto border-b border-landing-line/70 pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {GARMENT_TYPE_TABS.map((tab) => {
              const isActive = selectedTabKey === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedTabKey(tab.key)}
                  className={cn(
                    'relative shrink-0 pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-landing-oxblood',
                    isActive
                      ? 'text-landing-oxblood after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-landing-oxblood'
                      : 'text-landing-muted hover:text-landing-obsidian',
                  )}
                  aria-pressed={isActive}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        ) : null}

        {filteredProducts.length === 0 ? (
          <div className="mt-10 border border-landing-line/70 bg-landing-paper px-6 py-16 text-center">
            <p className="text-landing-body text-landing-muted">
              Không tìm thấy sản phẩm phù hợp trong danh mục này.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const secondImageKey = `${product.id}-alt`;
              const hasSecondImage = Boolean(
                product.gallery
                && product.gallery.length > 1
                && !failedImages[secondImageKey],
              );
              const imageSrc = failedImages[product.id]
                ? LANDING_MEDIA.productFallback
                : product.image;
              const secondImageSrc = failedImages[secondImageKey]
                ? LANDING_MEDIA.productFallback
                : product.gallery?.[1];

              return (
                <article key={product.id} className="group flex flex-col">
                  <div className="relative aspect-[3/4] overflow-hidden bg-landing-paper">
                    <Link href={`/products/${product.id}`} className="relative block h-full w-full">
                      <Image
                        src={imageSrc}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className={cn(
                          'object-cover object-top transition-all duration-500 group-hover:scale-[1.03]',
                          hasSecondImage ? 'group-hover:opacity-0' : '',
                        )}
                        onError={() => {
                          setFailedImages((prev) => ({ ...prev, [product.id]: true }));
                        }}
                      />
                      {hasSecondImage && secondImageSrc ? (
                        <Image
                          src={secondImageSrc}
                          alt={`${product.name} - góc nhìn thứ hai`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover object-top opacity-0 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                          onError={() => {
                            setFailedImages((prev) => ({ ...prev, [secondImageKey]: true }));
                          }}
                        />
                      ) : null}
                    </Link>

                    <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col gap-1">
                      {product.originalPrice && product.numericPrice < product.originalPrice ? (
                        <span className="bg-landing-oxblood px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-landing-paper">
                          -{Math.round(((product.originalPrice - product.numericPrice) / product.originalPrice) * 100)}%
                        </span>
                      ) : product.isNew ? (
                        <span className="bg-landing-sage px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-landing-obsidian">
                          Mới
                        </span>
                      ) : null}
                    </div>

                    <div className="absolute inset-x-2 bottom-2 z-20 flex translate-y-0 items-center gap-1.5 opacity-100 transition-all duration-200 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(event) => handleQuickAdd(product, event)}
                        className="flex h-10 flex-1 items-center justify-center gap-1.5 bg-landing-obsidian text-[10px] font-semibold uppercase tracking-[0.14em] text-landing-paper transition-colors hover:bg-landing-oxblood disabled:opacity-50"
                        title="Thêm vào giỏ hàng"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>Thêm giỏ</span>
                      </button>
                      <button
                        type="button"
                        onClick={(event) => handleTryOn(product, event)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center border border-landing-line bg-landing-paper/95 text-landing-oxblood backdrop-blur-sm transition-colors hover:bg-landing-oxblood hover:text-landing-paper"
                        title="Thử đồ AI"
                        aria-label="Thử đồ AI"
                      >
                        <Sparkles className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/products/${product.id}`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center border border-landing-line bg-landing-paper/90 text-landing-obsidian transition-colors hover:bg-landing-obsidian hover:text-landing-paper"
                        title="Xem chi tiết"
                        aria-label="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-landing-muted">
                        {product.brand || 'StAle. Signature'}
                      </span>
                      {Boolean((product.rating && product.rating > 0) || (product.reviewCount && product.reviewCount > 0)) ? (
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
                      className="mt-2 line-clamp-2 font-display text-[1.05rem] leading-snug text-landing-obsidian transition-colors hover:text-landing-oxblood"
                    >
                      {product.name}
                    </Link>

                    <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-landing-line/60 pt-3">
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="font-mono text-[12px] font-medium tracking-[0.02em] text-landing-oxblood">
                          {product.price}
                        </span>
                        {product.originalPriceFormatted ? (
                          <span className="font-mono text-[10px] text-landing-muted line-through">
                            {product.originalPriceFormatted}
                          </span>
                        ) : null}
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-landing-muted transition-colors group-hover:text-landing-oxblood" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

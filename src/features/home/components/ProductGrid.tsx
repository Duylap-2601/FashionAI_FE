'use client';

import { cn } from '@/components/ui/utils';
import { LandingSectionHeading } from '@/features/home/components/LandingSectionHeading';
import type { ProductGridProps } from '@/features/home/types/product-grid';
import { ProductCard } from '@/features/products/components/listing/ProductCard';
import { GARMENT_TYPE_TABS } from '@/features/products/constants/product-filters';
import { matchesGarmentType } from '@/features/products/services/product-filters';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function ProductGrid({
  products,
  title = 'Sản phẩm tiêu biểu',
  subtitle = 'Những thiết kế đang được chọn nhiều nhất trong tuần.',
  badge = 'Sản phẩm',
  viewAllLink = '/products',
  showCategories = true,
}: ProductGridProps) {
  const [selectedTabKey, setSelectedTabKey] = useState<string>('ALL');

  const selectedTab = GARMENT_TYPE_TABS.find((tab) => tab.key === selectedTabKey) || GARMENT_TYPE_TABS[0];

  const filteredProducts = products.filter((product) => {
    return matchesGarmentType(product, selectedTab.garmentType);
  });

  const activeViewAllLink = selectedTab.garmentType
    ? `${viewAllLink}${viewAllLink.includes('?') ? '&' : '?'}garmentType=${selectedTab.garmentType}`
    : viewAllLink;

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
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                imagePriority={idx < 4}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

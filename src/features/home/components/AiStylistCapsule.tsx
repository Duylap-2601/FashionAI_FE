'use client';

import { cn } from '@/components/ui/utils';
import { LandingReveal } from '@/features/home/components/LandingReveal';
import { LandingSectionHeading } from '@/features/home/components/LandingSectionHeading';
import { LANDING_MEDIA } from '@/features/home/constants/landing-media';
import type { Product } from '@/features/products/types/products';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface AiStylistCapsuleProps {
  products: Product[];
}

const ROLES = ['Lớp ngoài', 'Nền', 'Điểm nhấn'] as const;

export function AiStylistCapsule({ products }: AiStylistCapsuleProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const items = products.slice(0, 3);

  if (items.length === 0) return null;

  return (
    <section id="ai-stylist" className="scroll-mt-24 bg-landing-ivory py-16 md:py-24">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 md:px-8 lg:grid-cols-12 lg:items-end lg:gap-16">
        <div className="lg:col-span-5">
          <LandingSectionHeading
            chapter="06"
            eyebrow="AI Stylist"
            title="Một capsule, ba lớp."
            description="Chọn từ catalog thật, AI Stylist gợi ý cách phối theo dịp và phong cách của bạn. Đây là một capsule mở đầu, không phải một bộ đồ bắt buộc."
          />

          <Link
            href="/ai-stylist"
            className="group mt-8 inline-flex h-12 items-center justify-center gap-2 bg-landing-obsidian px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-paper transition-colors hover:bg-landing-oxblood"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Nhờ AI Stylist phối đồ
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>

          <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-landing-muted">
            Capsule minh hoạ từ catalog hiện tại
          </p>
        </div>

        <LandingReveal className="lg:col-span-7" delay={0.1}>
          <div
            className={cn(
              'grid gap-px bg-landing-line/60',
              items.length === 1 && 'grid-cols-1',
              items.length === 2 && 'grid-cols-2',
              items.length === 3 && 'grid-cols-3',
            )}
          >
            {items.map((product, index) => {
              const imageSrc = failedImages[product.id]
                ? LANDING_MEDIA.productFallback
                : product.image;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group block bg-landing-ivory p-2 transition-colors hover:bg-landing-paper sm:p-3"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-landing-paper">
                    <Image
                      src={imageSrc}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1024px) 33vw, 20vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      onError={() => {
                        setFailedImages((prev) => ({ ...prev, [product.id]: true }));
                      }}
                    />
                    <span className="absolute left-2 top-2 font-mono text-[10px] tracking-[0.16em] text-landing-paper/80">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-landing-brass-ink">
                    {ROLES[index]}
                  </p>
                  <p className="product-name-line mt-1 line-clamp-2 text-landing-obsidian transition-colors group-hover:text-landing-oxblood">
                    {product.name}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-landing-muted">{product.price}</p>
                </Link>
              );
            })}
          </div>
        </LandingReveal>
      </div>
    </section>
  );
}

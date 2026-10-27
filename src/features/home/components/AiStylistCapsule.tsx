'use client';

import { cn } from '@/components/ui/utils';
import { LandingReveal } from '@/features/home/components/LandingReveal';
import { LandingSectionHeading } from '@/features/home/components/LandingSectionHeading';
import { LANDING_MEDIA } from '@/features/home/constants/landing-media';
import type { Product } from '@/features/products/types/products';
import { OCCASIONS } from '@/features/stylist/constants/ai-stylist-page';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface AiStylistCapsuleProps {
  products: Product[];
}

const ROLES = ['Lớp ngoài', 'Nền', 'Điểm nhấn'] as const;

// Board layout: the outer layer leads, the other pieces stack beside it.
function boardSlot(index: number, count: number) {
  if (index === 0) return count === 1 ? 'col-span-3 col-start-2 row-span-2' : 'col-span-3 row-span-2';
  return count === 2 ? 'col-span-2 row-span-2' : 'col-span-2';
}

export function AiStylistCapsule({ products }: AiStylistCapsuleProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  // Hovering a board piece or a credit line highlights its pair.
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const items = products.slice(0, 3);

  if (items.length === 0) return null;

  return (
    <section id="ai-stylist" className="scroll-mt-24 overflow-hidden bg-landing-ivory py-16 md:py-24">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 md:px-8 lg:grid-cols-12 lg:gap-12">
        <LandingReveal className="relative order-last py-8 pr-6 sm:py-12 sm:pr-10 lg:order-first lg:col-span-7 lg:flex lg:flex-col lg:justify-center" delay={0.1}>
          {/* Styling board bleeds to the viewport's left edge; the pieces stay inside the column. */}
          <div
            aria-hidden="true"
            className="landing-paper-texture absolute inset-y-0 -left-[100vw] right-0 rounded-r-[40px] bg-landing-paper shadow-[0_28px_48px_-28px_rgba(17,16,15,0.35)] sm:rounded-r-[56px]"
          />

          <div className="relative mb-5 flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-landing-obsidian/70">
              <Sparkles className="h-3.5 w-3.5 text-landing-brass-ink" aria-hidden="true" />
              Bàn phối đồ
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-landing-obsidian/50">
              Capsule {String(items.length).padStart(2, '0')} món
            </span>
          </div>

          <div className="relative grid grid-cols-5 grid-rows-2 gap-3 sm:gap-4">
            {items.map((product, index) => {
              const imageSrc = failedImages[product.id] ? LANDING_MEDIA.productFallback : product.image;
              const isHighlighted = highlighted === index;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onMouseEnter={() => setHighlighted(index)}
                  onMouseLeave={() => setHighlighted(null)}
                  onFocus={() => setHighlighted(index)}
                  onBlur={() => setHighlighted(null)}
                  aria-label={`${ROLES[index]}: ${product.name}`}
                  className={cn(
                    'group relative block overflow-hidden bg-landing-ivory transition-[box-shadow,transform] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood',
                    boardSlot(index, items.length),
                    index === 0 ? 'aspect-[3/4]' : 'min-h-0',
                    isHighlighted
                      ? '-translate-y-1 shadow-[0_28px_44px_-18px_rgba(17,16,15,0.55)]'
                      : 'shadow-[0_14px_28px_-20px_rgba(17,16,15,0.45)]',
                  )}
                >
                  <Image
                    src={imageSrc}
                    alt=""
                    fill
                    sizes={index === 0 ? '(max-width: 1024px) 60vw, 30vw' : '(max-width: 1024px) 40vw, 20vw'}
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04] sm:p-6"
                    onError={() => {
                      setFailedImages((prev) => ({ ...prev, [product.id]: true }));
                    }}
                  />
                  <span
                    className={cn(
                      'absolute left-0 top-3 flex items-center gap-2 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-landing-paper transition-colors',
                      isHighlighted ? 'bg-landing-oxblood' : 'bg-landing-obsidian',
                    )}
                  >
                    <span className="font-mono text-landing-brass">{String(index + 1).padStart(2, '0')}</span>
                    {ROLES[index]}
                  </span>
                </Link>
              );
            })}
          </div>
        </LandingReveal>

        <div className="flex flex-col justify-center lg:col-span-5">
          <LandingSectionHeading
            chapter="06"
            eyebrow="AI Stylist"
            title="Một capsule, ba lớp."
            description="Chọn từ catalog thật, AI Stylist gợi ý cách phối theo dịp và phong cách của bạn. Đây là một capsule mở đầu, không phải một bộ đồ bắt buộc."
          />

          {/* Credits band bleeds to the viewport's right edge, interlocking with the board on the left. */}
          <div className="mt-8 -mr-[100vw] rounded-l-[28px] bg-landing-paper py-5 pl-5 pr-[100vw] sm:py-6 sm:pl-7">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink">Cách phối</p>
            <ol className="mt-2 divide-y divide-landing-line">
              {items.map((product, index) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.id}`}
                    onMouseEnter={() => setHighlighted(index)}
                    onMouseLeave={() => setHighlighted(null)}
                    onFocus={() => setHighlighted(index)}
                    onBlur={() => setHighlighted(null)}
                    className="group grid grid-cols-[2rem_1fr_auto] items-center gap-x-3 gap-y-1 py-3.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood xl:grid-cols-[2rem_6.5rem_1fr_auto]"
                  >
                    <span className="font-mono text-[11px] tracking-[0.16em] text-landing-brass-ink">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-landing-muted xl:block">
                      {ROLES[index]}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-landing-muted xl:hidden">
                        {ROLES[index]}
                      </span>
                      <span
                        className={cn(
                          'product-name-line line-clamp-2 transition-colors xl:line-clamp-1',
                          highlighted === index ? 'text-landing-oxblood' : 'text-landing-obsidian',
                        )}
                      >
                        {product.name}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-landing-muted">{product.price}</span>
                      <ArrowUpRight
                        className={cn(
                          'h-3.5 w-3.5 transition-all',
                          highlighted === index
                            ? '-translate-y-0.5 translate-x-0.5 text-landing-oxblood'
                            : 'text-landing-obsidian/40',
                        )}
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-landing-muted">
            <span className="font-semibold uppercase tracking-[0.16em] text-landing-obsidian/70">Phối theo dịp</span>
            <span className="mx-2 text-landing-line" aria-hidden="true">/</span>
            {OCCASIONS.join(' · ')}
          </p>

          <div className="mt-8 flex flex-col items-start gap-3">
            <Link
              href="/ai-stylist"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap bg-landing-oxblood px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-paper transition-colors hover:bg-landing-obsidian sm:w-auto"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Nhờ AI Stylist phối đồ
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <p className="text-[10px] uppercase tracking-[0.16em] text-landing-muted">
              Capsule minh hoạ từ catalog hiện tại
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

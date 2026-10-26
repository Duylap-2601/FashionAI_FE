'use client';

import { LandingSectionHeading } from '@/features/home/components/LandingSectionHeading';
import { LANDING_MEDIA } from '@/features/home/constants/landing-media';
import type { Product } from '@/features/products/types/products';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface AiTryOnFeatureBannerProps {
  previewProduct?: Product;
}

const STEPS = [
  {
    title: 'Chọn món đồ',
    body: 'Mở catalog và chọn thiết kế bạn muốn xem trên phom dáng của mình.',
  },
  {
    title: 'Tải ảnh hoặc mở camera',
    body: 'Đứng thẳng, ánh sáng đủ và giữ toàn thân trong khung hình.',
  },
  {
    title: 'Xem kết quả',
    body: 'Đối chiếu phom dáng, màu sắc và chi tiết trước khi thêm vào giỏ.',
  },
] as const;

export function AiTryOnFeatureBanner({ previewProduct }: AiTryOnFeatureBannerProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = previewProduct && !imageFailed ? previewProduct.image : LANDING_MEDIA.tryOn;
  const tryOnHref = previewProduct ? `/try-on?productId=${previewProduct.id}` : '/try-on';

  return (
    <section id="ai-try-on" className="relative scroll-mt-24 overflow-hidden bg-landing-paper py-16 md:py-24">
      <div className="relative mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <LandingSectionHeading
              chapter="05"
              eyebrow="AI Try-On"
              title="Thử phom dáng trước khi quyết định."
              description="Chọn một thiết kế, tải ảnh của bạn hoặc mở camera. Phòng thử sẽ ghép món đồ lên dáng người thật để bạn xem chi tiết."
            />

            {/* Bars bleed to the viewport's left edge; the padding keeps content on the column grid. */}
            <ol className="mt-8 space-y-4">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="-ml-[100vw] flex items-center gap-5 bg-landing-oxblood py-4 pl-[100vw] pr-5 shadow-[8px_14px_28px_-14px_rgba(17,16,15,0.55)] sm:gap-7 sm:pr-8"
                >
                  <span
                    aria-hidden="true"
                    className="w-12 shrink-0 font-display text-5xl leading-none text-landing-paper lining-nums sm:w-16 sm:text-6xl"
                  >
                    {index + 1}.
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-landing-paper">{step.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-landing-paper/65">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/try-on"
                className="group inline-flex h-12 items-center justify-center gap-2 bg-landing-oxblood px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-paper transition-colors hover:bg-landing-obsidian"
              >
                Mở phòng thử AI
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={tryOnHref}
                className="inline-flex h-12 items-center justify-center border border-landing-obsidian/25 px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-obsidian transition-colors hover:border-landing-obsidian hover:bg-landing-obsidian hover:text-landing-paper"
              >
                Thử với sản phẩm này
              </Link>
            </div>
          </div>

          <div className="relative flex items-center py-8 pl-6 sm:py-10 sm:pl-10 lg:col-span-6">
            {/* Stage bleeds to the viewport's right edge; the card stays inside the column. */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 -right-[100vw] rounded-l-[40px] bg-landing-oxblood shadow-[0_28px_48px_-28px_rgba(17,16,15,0.6)] sm:rounded-l-[56px]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-2 right-0 hidden font-display text-[14rem] leading-none text-landing-paper/[0.06] lining-nums lg:block"
            >
              05
            </span>

            <div className="relative aspect-[4/5] w-full max-w-[380px] overflow-hidden rounded-3xl bg-landing-ivory shadow-[0_32px_56px_-20px_rgba(17,16,15,0.65)]">
              <Image
                src={imageSrc}
                alt={previewProduct ? `Xem trước thử đồ AI cho ${previewProduct.name}` : 'Xem trước phòng thử đồ AI'}
                fill
                sizes="(max-width: 640px) 90vw, 380px"
                className="object-cover object-top"
                onError={() => setImageFailed(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-landing-obsidian/85 via-landing-obsidian/10 via-45% to-landing-obsidian/35" />

              <div className="pointer-events-none absolute inset-4 border border-landing-paper/20" aria-hidden="true" />
              <span className="pointer-events-none absolute left-4 top-4 h-6 w-6 border-l border-t border-landing-paper/70" aria-hidden="true" />
              <span className="pointer-events-none absolute right-4 top-4 h-6 w-6 border-r border-t border-landing-paper/70" aria-hidden="true" />
              <span className="pointer-events-none absolute bottom-4 left-4 h-6 w-6 border-b border-l border-landing-paper/70" aria-hidden="true" />
              <span className="pointer-events-none absolute bottom-4 right-4 h-6 w-6 border-b border-r border-landing-paper/70" aria-hidden="true" />

              <div className="absolute left-6 top-6 flex items-center gap-2" aria-hidden="true">
                <span className="h-1.5 w-1.5 rounded-full bg-landing-brass" />
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-landing-paper/80">
                  Try-On Studio
                </span>
              </div>
              <span
                className="absolute right-6 top-6 font-mono text-[9px] uppercase tracking-[0.2em] text-landing-paper/60"
                aria-hidden="true"
              >
                Frame 01
              </span>

              <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 border-t border-landing-paper/20 pt-4">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-landing-brass">
                    {previewProduct ? 'Sản phẩm đang chọn' : 'Ảnh minh hoạ'}
                  </p>
                  <p className="mt-1 font-display text-xl leading-tight text-landing-paper">
                    {previewProduct?.name || 'Chọn một thiết kế để bắt đầu'}
                  </p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-landing-paper/50">
                    {previewProduct ? 'Xem trước bằng ảnh sản phẩm' : 'Chưa chọn sản phẩm'}
                  </p>
                </div>
                <Sparkles className="h-5 w-5 shrink-0 text-landing-brass" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

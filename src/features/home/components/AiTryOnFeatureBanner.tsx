'use client';

import { LandingSectionHeading } from '@/features/home/components/LandingSectionHeading';
import { LANDING_MEDIA } from '@/features/home/constants/landing-media';
import type { Product } from '@/features/products/types/products';
import { ArrowUpRight, Camera, Shirt, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface AiTryOnFeatureBannerProps {
  previewProduct?: Product;
}

const STEPS = [
  {
    icon: Shirt,
    title: 'Chọn món đồ',
    body: 'Mở catalog và chọn thiết kế bạn muốn xem trên phom dáng của mình.',
  },
  {
    icon: Camera,
    title: 'Tải ảnh hoặc mở camera',
    body: 'Đứng thẳng, ánh sáng đủ và giữ toàn thân trong khung hình.',
  },
  {
    icon: Sparkles,
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
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 top-10 font-display text-[14rem] leading-none text-landing-obsidian/[0.04] sm:text-[20rem]"
      >
        05
      </span>

      <div className="relative mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">
          <div className="lg:col-span-6">
            <LandingSectionHeading
              chapter="05"
              eyebrow="AI Try-On"
              title="Thử phom dáng trước khi quyết định."
              description="Chọn một thiết kế, tải ảnh của bạn hoặc mở camera. Phòng thử sẽ ghép món đồ lên dáng người thật để bạn xem chi tiết."
            />

            <ol className="mt-8 space-y-5">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="flex gap-4 border-t border-landing-line/60 pt-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-landing-line text-landing-oxblood">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] tracking-[0.18em] text-landing-brass-ink">
                          0{index + 1}
                        </span>
                        <h3 className="text-sm font-semibold text-landing-obsidian">{step.title}</h3>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-landing-muted">{step.body}</p>
                    </div>
                  </li>
                );
              })}
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

          <div className="mx-auto w-full max-w-[420px] lg:col-span-4 lg:col-start-9 lg:justify-self-end">
            <div className="relative aspect-[4/5] overflow-hidden bg-landing-ivory">
              <Image
                src={imageSrc}
                alt={previewProduct ? `Xem trước thử đồ AI cho ${previewProduct.name}` : 'Xem trước phòng thử đồ AI'}
                fill
                sizes="(max-width: 1024px) 420px, 420px"
                className="object-cover object-top"
                onError={() => setImageFailed(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-landing-obsidian/70 via-transparent to-landing-obsidian/10" />

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

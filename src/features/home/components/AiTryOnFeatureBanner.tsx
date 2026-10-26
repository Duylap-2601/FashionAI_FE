'use client';

import { cn } from '@/components/ui/utils';
import { LandingSectionHeading } from '@/features/home/components/LandingSectionHeading';
import { LANDING_MEDIA } from '@/features/home/constants/landing-media';
import { getProductImageItems, normalizeColorName, resolveDefaultImageIndex } from '@/features/products/services/products-utils';
import type { Product } from '@/features/products/types/products';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface AiTryOnFeatureBannerProps {
  products?: Product[];
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

const MAX_CHOICES = 4;
const MAX_SWATCHES = 5;

export function AiTryOnFeatureBanner({ products = [] }: AiTryOnFeatureBannerProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  // Keyed by image URL: one product shows a different image per colour.
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const choices = products.filter((product) => Boolean(product.image)).slice(0, MAX_CHOICES);
  // Falls back to the first choice when the list changes (e.g. another collection is selected).
  const previewProduct = choices.find((product) => product.id === activeId) ?? choices[0];
  const swatches = previewProduct?.colors.slice(0, MAX_SWATCHES) ?? [];
  // No colour is preselected: the card opens on the product's main image, which may not belong to the first colour.
  const selectedColor = activeColor
    ? swatches.find((color) => normalizeColorName(color.name) === normalizeColorName(activeColor))
    : undefined;
  const colorImage = previewProduct && selectedColor
    ? getProductImageItems(previewProduct)[resolveDefaultImageIndex(previewProduct, selectedColor.name)]?.url
    : undefined;
  const imageSrc =
    [colorImage, previewProduct?.image].find((url): url is string => !!url && !failedImages[url]) ?? LANDING_MEDIA.tryOn;
  const markImageFailed = (url: string) => setFailedImages((prev) => ({ ...prev, [url]: true }));

  const selectProduct = (productId: string) => {
    setActiveId(productId);
    setActiveColor(null);
  };
  const tryOnHref = previewProduct ? `/try-on?productId=${previewProduct.id}` : '/try-on';

  return (
    <section id="ai-try-on" className="relative scroll-mt-24 overflow-hidden bg-landing-paper py-16 md:py-24">
      <div className="relative mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="grid gap-12 xl:grid-cols-12 xl:gap-10">
          <div className="xl:col-span-6">
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
                  className="-ml-[100vw] flex items-center gap-5 bg-landing-sage-ink py-4 pl-[100vw] pr-5 shadow-[8px_14px_28px_-14px_rgba(17,16,15,0.55)] sm:gap-7 sm:pr-8"
                >
                  <span
                    aria-hidden="true"
                    className="w-12 shrink-0 font-display text-5xl leading-none text-landing-paper lining-nums sm:w-16 sm:text-6xl"
                  >
                    {index + 1}.
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-landing-paper">{step.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-landing-paper/90">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8">
              <Link
                href="/try-on"
                className="group inline-flex h-12 w-full items-center justify-center gap-2 bg-landing-oxblood px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-paper transition-colors hover:bg-landing-obsidian sm:w-auto"
              >
                Mở phòng thử AI
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          <div className="relative flex items-center py-8 pl-6 sm:py-10 sm:pl-10 xl:col-span-6">
            {/* Stage bleeds to the viewport's right edge; the card stays inside the column. */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 -right-[100vw] rounded-l-[40px] bg-landing-sage-ink shadow-[0_28px_48px_-28px_rgba(17,16,15,0.6)] sm:rounded-l-[56px]"
            />

            <div className="relative flex w-full flex-col gap-8 md:flex-row md:items-start">
              <div className="relative aspect-[4/5] w-full max-w-[380px] shrink-0 overflow-hidden bg-landing-ivory shadow-[0_32px_56px_-20px_rgba(0,0,0,0.7)] md:w-[54%] md:max-w-[360px]">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={imageSrc}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Image
                      src={imageSrc}
                      alt={previewProduct ? `Xem trước thử đồ AI cho ${previewProduct.name}` : 'Xem trước phòng thử đồ AI'}
                      fill
                      sizes="(max-width: 768px) 90vw, 360px"
                      className="object-cover object-top"
                      onError={() => markImageFailed(imageSrc)}
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-landing-obsidian/55 via-transparent via-35% to-landing-obsidian/35" />

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

                <div className="absolute inset-x-6 bottom-6 flex items-center justify-between gap-4" aria-hidden="true">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-landing-paper/75">
                    {previewProduct ? 'Ảnh sản phẩm' : 'Ảnh minh hoạ'}
                  </span>
                  <Sparkles className="h-5 w-5 shrink-0 text-landing-brass" />
                </div>
              </div>

              <div className="flex w-full max-w-[380px] flex-col md:min-w-0 md:max-w-[320px] md:flex-1 md:self-stretch">
                <motion.div
                  key={previewProduct?.id ?? 'empty'}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-landing-paper/80">
                    {previewProduct ? 'Đang chọn' : 'Phòng thử AI'}
                  </p>
                  <h3 className="mt-3 font-display text-2xl leading-[1.15] text-landing-paper 2xl:text-[1.75rem]">
                    {previewProduct?.name ?? 'Chọn một thiết kế để bắt đầu'}
                  </h3>
                  {previewProduct ? (
                    <>
                      <p className="mt-3 font-mono text-sm text-landing-paper/90">{previewProduct.price}</p>
                      {previewProduct.category ? (
                        <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-landing-paper/70">
                          {previewProduct.category}
                        </p>
                      ) : null}
                      {swatches.length > 0 ? (
                        <div className="mt-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {swatches.map((color) => {
                              const isActive = color === selectedColor;
                              return (
                                <button
                                  key={`${color.name}-${color.hex}`}
                                  type="button"
                                  onClick={() => setActiveColor(color.name)}
                                  aria-pressed={isActive}
                                  aria-label={`Màu ${color.name}`}
                                  title={color.name}
                                  className={cn(
                                    'flex h-7 w-7 items-center justify-center border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-paper',
                                    isActive ? 'border-landing-paper' : 'border-transparent hover:border-landing-paper/40',
                                  )}
                                >
                                  <span
                                    className="h-4 w-4 border border-landing-paper/25"
                                    style={{ backgroundColor: color.hex }}
                                  />
                                </button>
                              );
                            })}
                          </div>
                          {selectedColor ? (
                            <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-landing-paper/70">
                              {/* Catalog names already start with "màu" (e.g. "màu vàng nhạt"). */}
                              Màu: {selectedColor.name.replace(/^màu\s+/i, '')}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </motion.div>

                <div className="mt-8 md:mt-auto md:pt-8">
                  {choices.length > 1 ? (
                    <>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-landing-paper/75">Đổi món</p>
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {choices.map((product) => {
                          const isActive = product.id === previewProduct?.id;
                          return (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => selectProduct(product.id)}
                              aria-pressed={isActive}
                              aria-label={`Xem trước ${product.name}`}
                              className={cn(
                                'group relative aspect-[3/4] w-full overflow-hidden border bg-landing-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-paper',
                                isActive ? 'border-landing-paper' : 'border-landing-paper/15',
                              )}
                            >
                              <Image
                                src={failedImages[product.image] ? LANDING_MEDIA.tryOn : product.image}
                                alt=""
                                fill
                                sizes="80px"
                                className="object-cover object-top"
                                onError={() => markImageFailed(product.image)}
                              />
                              <span
                                aria-hidden="true"
                                className={cn(
                                  'absolute inset-0 bg-landing-obsidian/45 transition-opacity',
                                  isActive ? 'opacity-0' : 'opacity-100 group-hover:opacity-30',
                                )}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : null}

                  <Link
                    href={tryOnHref}
                    className="group mt-6 inline-flex h-11 w-full items-center justify-center gap-2 border border-landing-paper/30 px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-paper transition-colors hover:border-landing-paper hover:bg-landing-paper hover:text-landing-obsidian"
                  >
                    {previewProduct ? 'Thử món này' : 'Chọn trong catalog'}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { cn } from '@/components/ui/utils';
import { LandingSectionHeading } from '@/features/home/components/LandingSectionHeading';
import { DEFAULT_LOOKBOOK_IMAGES } from '@/features/home/constants/editorial-lookbook';
import type { EditorialLookbookProps } from '@/features/home/types/editorial-lookbook';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export function EditorialLookbook({ images, collection }: EditorialLookbookProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const realImages = (images ?? []).filter((image): image is string => Boolean(image));
  const isRealCollection = realImages.length > 0;

  const looks = isRealCollection
    ? realImages.slice(0, 3).map((image, index) => {
      const fallback = DEFAULT_LOOKBOOK_IMAGES[index % DEFAULT_LOOKBOOK_IMAGES.length] ?? DEFAULT_LOOKBOOK_IMAGES[0];

      return {
        id: `${collection?.id ?? 'look'}-${index}`,
        image,
        fallbackImage: fallback?.url || image,
        title: collection?.name || fallback?.title || 'Lookbook',
        subtitle:
          collection?.tagline
          || collection?.description
          || fallback?.subtitle
          || '',
      };
    })
    : DEFAULT_LOOKBOOK_IMAGES.map((fallback, index) => ({
      id: `local-look-${index}`,
      image: fallback.url,
      fallbackImage: fallback.url,
      title: fallback.title,
      subtitle: fallback.subtitle,
    }));

  const safeIndex = activeIndex % looks.length;
  const activeLook = looks[safeIndex] ?? looks[0];
  if (!activeLook) return null;

  const activeImage = failedImages[activeLook.id] ? activeLook.fallbackImage : activeLook.image;
  const hasMultipleLooks = looks.length > 1;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + looks.length) % looks.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % looks.length);
  };

  return (
    <section id="lookbook" className="scroll-mt-24 bg-landing-obsidian py-16 text-landing-paper md:py-16">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <LandingSectionHeading
          inverted
          chapter="04"
          eyebrow="Lookbook"
          title={'Những lát cắt của sự tự tin.'}
          // description={'Từ phòng họp đến buổi tối, mỗi lớp áo là một cách nói về sự chỉn chu và tự do.'}
          action={(
            <Link
              href="/try-on"
              className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-brass transition-colors hover:text-landing-paper"
            >
              Thử outfit
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          )}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="flex justify-center lg:col-span-6">
            <div className="relative aspect-[3/4] w-full max-w-[420px] overflow-hidden bg-landing-paper/5 lg:h-[min(62svh,600px)] lg:w-auto lg:max-w-none">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={activeLook.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={activeImage}
                    alt={`${activeLook.title} - ${activeLook.subtitle}`}
                    fill
                    sizes="(max-width: 1024px) 420px, 30vw"
                    className="object-cover object-top"
                    onError={() => {
                      setFailedImages((prev) => ({ ...prev, [activeLook.id]: true }));
                    }}
                  />
                </motion.div>
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-landing-obsidian/35 via-transparent to-transparent" />
              <span className="absolute left-4 top-4 font-mono text-[11px] tracking-[0.18em] text-landing-paper/70">
                {String(safeIndex + 1).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="flex items-center justify-between border-t border-landing-paper/15 pt-4">
              <span className="font-mono text-[11px] tracking-[0.18em] text-landing-paper/55">
                Look {String(safeIndex + 1).padStart(2, '0')} / {String(looks.length).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!hasMultipleLooks}
                  aria-label="Look trước"
                  className="flex h-11 w-11 items-center justify-center border border-landing-paper/25 text-landing-paper transition-colors hover:border-landing-paper hover:bg-landing-paper hover:text-landing-obsidian disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!hasMultipleLooks}
                  aria-label="Look tiếp theo"
                  className="flex h-11 w-11 items-center justify-center border border-landing-paper/25 text-landing-paper transition-colors hover:border-landing-paper hover:bg-landing-paper hover:text-landing-obsidian disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 min-h-[190px]">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={activeLook.title}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-landing-brass">
                    Look {String(safeIndex + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-4 font-display text-landing-h2 text-landing-paper">
                    {activeLook.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-landing-paper/55">
                    {activeLook.subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>

              <Link
                href="/try-on"
                className="group mt-6 inline-flex items-center gap-2 border-b border-landing-brass/50 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-landing-brass transition-colors hover:border-landing-paper hover:text-landing-paper"
              >
                Thử outfit này
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>

            {hasMultipleLooks ? (
              <div
                className={cn(
                  'mt-8 grid gap-3',
                  looks.length === 2 ? 'grid-cols-2' : 'grid-cols-3',
                )}
              >
                {looks.map((look, index) => (
                  <button
                    key={look.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Xem ${look.title}`}
                    aria-pressed={index === safeIndex}
                    className={cn(
                      'group relative aspect-[3/4] overflow-hidden border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-brass',
                      index === safeIndex
                        ? 'border-landing-brass'
                        : 'border-transparent opacity-60 hover:opacity-100',
                    )}
                  >
                    <Image
                      src={failedImages[look.id] ? look.fallbackImage : look.image}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 33vw, 12vw"
                      className="object-cover object-top"
                      onError={() => {
                        setFailedImages((prev) => ({ ...prev, [look.id]: true }));
                      }}
                    />
                    <span className="absolute left-2 top-2 font-mono text-[9px] tracking-[0.16em] text-landing-paper/80">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

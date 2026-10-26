'use client';

import { cn } from '@/components/ui/utils';
import { HERO_LOCAL_SLIDES } from '@/features/home/constants/landing-media';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface HeroSlide {
  id: string;
  name: string;
  season: string;
  image: string;
  fallbackImage: string;
}

export function HeroBanner() {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const slides: HeroSlide[] = HERO_LOCAL_SLIDES.map((s) => ({ ...s }));

  const safeIndex = activeIndex % slides.length;
  const activeSlide = slides[safeIndex] ?? slides[0];
  const activeImage = failedImages[activeSlide.id] ? activeSlide.fallbackImage : activeSlide.image;

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  const handleNext = useCallback(() => {
    if (slides.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    if (slides.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || shouldReduceMotion || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [isPaused, shouldReduceMotion, slides.length]);

  return (
    <section
      className="relative isolate overflow-hidden bg-landing-obsidian text-landing-paper"
      aria-roledescription="carousel"
      aria-label="Bộ sưu tập nổi bật"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="absolute inset-0">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={activeSlide.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={activeImage}
              alt={`${activeSlide.name} - ${activeSlide.season}`}
              fill
              priority={safeIndex === 0}
              sizes="100vw"
              className="object-cover object-[50%_0%]"
              onError={() => {
                setFailedImages((prev) => ({ ...prev, [activeSlide.id]: true }));
              }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-landing-obsidian via-landing-obsidian/75 to-landing-obsidian/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-landing-obsidian via-landing-obsidian/15 to-landing-obsidian/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_45%,rgba(93,28,52,0.22),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_left,rgba(17,16,15,0.72)_0%,rgba(17,16,15,0.3)_42%,transparent_66%)]" />
      </div>

      <p className="sr-only" aria-live="polite">
        {activeSlide.name}
      </p>

      <div className="relative z-10 mx-auto flex min-h-[560px] w-full max-w-[1440px] flex-col justify-between px-4 pb-8 pt-14 sm:px-6 sm:pt-20 md:min-h-[800px] md:px-8 md:pb-10 md:pt-28 lg:min-h-[860px] lg:pt-32">
        <div className="max-w-[720px]">
          <div className="flex items-center gap-3 text-landing-label font-semibold uppercase tracking-[0.22em] text-landing-brass">
            <span className="h-px w-12 bg-landing-brass" />
            <span>Bộ sưu tập / 2026</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="mt-6 font-display text-[clamp(2.1rem,10.5vw,2.7rem)] leading-[1.1] tracking-[-0.025em] text-landing-paper sm:mt-7 sm:text-landing-display">
                <span className="block">
                  Mặc đúng <em className="font-normal italic text-landing-brass">dáng</em>.
                </span>
                <span className="mt-3 block sm:mt-6 lg:mt-8">
                  Sống đúng <em className="font-normal italic text-landing-brass">chất</em>.
                </span>
              </h1>

            </motion.div>
          </AnimatePresence>

          <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center">
            <Link
              href="#collections"
              className="group inline-flex h-12 items-center justify-center gap-3 border border-landing-paper bg-landing-paper px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-obsidian transition-colors hover:border-landing-brass hover:bg-landing-brass"
            >
              Khám phá bộ sưu tập
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/try-on"
              className="inline-flex h-12 items-center justify-center border border-landing-paper/35 px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-paper transition-colors hover:border-landing-paper hover:bg-landing-paper hover:text-landing-obsidian"
            >
              Thử đồ AI
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-landing-paper/15 pt-4 md:hidden">
            <span className="font-mono text-[11px] tracking-[0.18em] text-landing-paper/55">
              {String(safeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
            <HeroPagination
              slides={slides}
              activeIndex={safeIndex}
              onSelect={setActiveIndex}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </div>
        </div>

        <motion.div
          className="pointer-events-none absolute right-20 top-48 hidden xl:block"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.9,
            delay: shouldReduceMotion ? 0 : 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          aria-hidden="true"
        >
          <div className="relative">
            <div className="relative flex flex-col items-end">
              <div className="flex items-center gap-3">
                <span className="h-px w-12 bg-landing-brass/55" />
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.34em] text-landing-brass/90">
                  Atelier N° 01
                </span>
              </div>
              <Image
                src="/icons/brand-wordmark-paper.png"
                alt=""
                width={747}
                height={307}
                className="mt-6 h-[clamp(4.5rem,7.5vw,7.5rem)] w-auto"
              />
              <span className="mt-6 h-px w-24 bg-gradient-to-l from-landing-brass/60 to-transparent" />
            </div>
          </div>
        </motion.div>

        <div className="mt-16 hidden items-end justify-between gap-6 border-t border-landing-paper/15 pt-5 md:flex">
          <span className="font-mono text-[11px] tracking-[0.18em] text-landing-paper/55">
            {String(safeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>

          <HeroPagination
            slides={slides}
            activeIndex={safeIndex}
            onSelect={setActiveIndex}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 rotate-180 text-[9px] font-semibold uppercase tracking-[0.32em] text-landing-paper/40 [writing-mode:vertical-rl] xl:block">
        Saigon / Issue 01 / 2026
      </div>
    </section>
  );
}

interface HeroPaginationProps {
  slides: HeroSlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

function HeroPagination({ slides, activeIndex, onSelect, onPrev, onNext }: HeroPaginationProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-1.5" aria-label="Chọn bộ sưu tập">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Xem ${slide.name}`}
            aria-current={activeIndex === index ? 'true' : undefined}
            className={cn(
              'h-1.5 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-landing-brass',
              activeIndex === index
                ? 'w-8 bg-landing-brass'
                : 'w-3 bg-landing-paper/30 hover:bg-landing-paper/60',
            )}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onPrev}
        disabled={slides.length <= 1}
        aria-label="Bộ sưu tập trước"
        className="flex h-11 w-11 items-center justify-center border border-landing-paper/25 text-landing-paper transition-colors hover:border-landing-paper hover:bg-landing-paper hover:text-landing-obsidian disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={slides.length <= 1}
        aria-label="Bộ sưu tập tiếp theo"
        className="flex h-11 w-11 items-center justify-center border border-landing-paper/25 text-landing-paper transition-colors hover:border-landing-paper hover:bg-landing-paper hover:text-landing-obsidian disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

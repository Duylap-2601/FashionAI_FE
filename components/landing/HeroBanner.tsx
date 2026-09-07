'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { Collection } from '@/types/collection';

interface HeroBannerProps {
  collections: Collection[];
}

export function HeroBanner({ collections }: HeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeCollection = collections[activeIndex] || collections[0];

  const handleNext = useCallback(() => {
    if (collections.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % collections.length);
  }, [collections.length]);

  const handlePrev = useCallback(() => {
    if (collections.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + collections.length) % collections.length);
  }, [collections.length]);

  // Auto-play timer
  useEffect(() => {
    if (isPaused || collections.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, collections.length, handleNext]);

  if (!activeCollection) return null;

  const coverImages = activeCollection.coverImages || [];
  const leftImg = coverImages[0] || activeCollection.thumbnail;
  const centerImg = coverImages[1] || coverImages[0] || activeCollection.thumbnail;
  const rightImg = coverImages[2] || coverImages[0] || activeCollection.thumbnail;

  return (
    <section
      className="relative w-full bg-[#0e161c] text-white overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial from-[#5D1C34]/20 via-transparent to-transparent opacity-40 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-8 pb-12 md:py-14">
        {/* Editorial 3-Panel Hero Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCollection.id}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center"
          >
            {/* Left Panel (Hidden on mobile or smaller portrait) */}
            <div className="hidden md:block md:col-span-3 h-[480px] lg:h-[580px] rounded-2xl overflow-hidden shadow-2xl relative group">
              <img
                src={leftImg}
                alt={`${activeCollection.name} Look 1`}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4 right-4 text-[11px] uppercase tracking-widest text-white/80 font-medium">
                LOOK 01 • {activeCollection.season}
              </div>
            </div>

            {/* Center Main Hero Panel (Full width on mobile, 6 cols on desktop) */}
            <div className="col-span-1 md:col-span-6 h-[540px] md:h-[520px] lg:h-[620px] rounded-2xl overflow-hidden shadow-2xl relative group flex flex-col justify-end p-6 md:p-10">
              <img
                src={centerImg}
                alt={`${activeCollection.name} Center`}
                className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-700 ease-out"
                loading="eager"
              />
              {/* Vignette & Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

              {/* Center Content Overlay */}
              <div className="relative z-10 flex flex-col items-center text-center max-w-[520px] mx-auto">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-brand-gold text-[11px] font-bold tracking-widest uppercase mb-4 shadow-sm">
                  <Sparkles className="w-3 h-3 fill-brand-gold" />
                  {activeCollection.season || 'BỘ SƯU TẬP 2026'}
                </span>

                <h1 className="text-[32px] sm:text-[40px] lg:text-[46px] font-bold tracking-tight text-white leading-[1.15] mb-3">
                  {activeCollection.name}
                </h1>

                {activeCollection.tagline && (
                  <p className="text-white/85 text-body-sm sm:text-body-md font-light italic mb-6 line-clamp-2 max-w-[420px]">
                    &ldquo;{activeCollection.tagline}&rdquo;
                  </p>
                )}

                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
                  <a
                    href="#collections"
                    className="h-11 sm:h-12 px-6 sm:px-7 rounded-full bg-white text-neutral-900 hover:bg-neutral-100 font-semibold text-body-sm flex items-center justify-center gap-2 shadow-xl hover:scale-103 active:scale-97 transition-all duration-200"
                  >
                    <span>Khám phá BST</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <Link
                    href="/try-on"
                    className="h-11 sm:h-12 px-6 sm:px-7 rounded-full bg-[#5D1C34] hover:bg-[#732240] text-white font-semibold text-body-sm flex items-center justify-center gap-2 shadow-xl border border-white/10 hover:scale-103 active:scale-97 transition-all duration-200"
                  >
                    <Sparkles className="w-4 h-4 text-brand-gold" />
                    <span>Thử đồ AI</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Panel (Hidden on mobile) */}
            <div className="hidden md:block md:col-span-3 h-[480px] lg:h-[580px] rounded-2xl overflow-hidden shadow-2xl relative group">
              <img
                src={rightImg}
                alt={`${activeCollection.name} Look 2`}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4 right-4 text-[11px] uppercase tracking-widest text-white/80 font-medium text-right">
                LOOK 02 • {activeCollection.season}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom controls: Carousel Dots & Arrows */}
        {collections.length > 1 && (
          <div className="mt-8 flex items-center justify-between max-w-[600px] mx-auto px-4">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors cursor-pointer"
              aria-label="Previous collection"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Pagination dots with names */}
            <div className="flex items-center gap-2.5">
              {collections.map((col, idx) => (
                <button
                  key={col.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === idx ? 'w-8 bg-brand-gold' : 'w-2.5 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Slide to ${col.name}`}
                  title={col.name}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors cursor-pointer"
              aria-label="Next collection"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

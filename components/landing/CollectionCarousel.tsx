'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { Collection } from '@/types/collection';

interface CollectionCarouselProps {
  collections: Collection[];
  onSelectCollection?: (collection: Collection) => void;
  selectedCollectionId?: string | null;
}

export function CollectionCarousel({
  collections,
  onSelectCollection,
  selectedCollectionId,
}: CollectionCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 360;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section id="collections" className="py-14 md:py-20 bg-white border-b border-neutral-100">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Header with Title & Scroll Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-bold text-brand-gold uppercase tracking-[0.18em] block mb-2">
              Bộ sưu tập độc quyền
            </span>
            <h2 className="text-[28px] md:text-[36px] font-bold text-neutral-900 tracking-tight">
              BỘ SƯU TẬP MỚI NHẤT
            </h2>
            <p className="text-body-sm text-neutral-500 mt-1 max-w-xl">
              Được thiết kế tinh xảo theo từng mùa thời trang, định hình phong cách quý cô và quý ông hiện đại.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => handleScroll('left')}
              className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-700 hover:text-neutral-900 transition-colors shadow-xs cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-700 hover:text-neutral-900 transition-colors shadow-xs cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          className="flex gap-5 md:gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0"
        >
          {collections.map((col) => {
            const isSelected = selectedCollectionId === col.id;
            return (
              <div
                key={col.id}
                className={`snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[360px] rounded-2xl overflow-hidden shadow-lg border transition-all duration-300 relative group flex flex-col justify-end aspect-[3/4] cursor-pointer ${
                  isSelected ? 'ring-4 ring-[#5D1C34] border-transparent scale-[1.01]' : 'border-neutral-200 hover:shadow-2xl hover:-translate-y-1'
                }`}
                onClick={() => onSelectCollection?.(col)}
              >
                {/* Background Image */}
                <img
                  src={col.thumbnail || col.coverImages?.[0]}
                  alt={col.name}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* Dark Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-wider uppercase">
                    {col.season || '2026'}
                  </span>
                  {isSelected && (
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-gold text-brand-navy text-[10px] font-bold flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3" /> Đang chọn
                    </span>
                  )}
                </div>

                {/* Bottom Content */}
                <div className="relative z-10 p-6 flex flex-col">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight group-hover:text-brand-gold transition-colors">
                    {col.name}
                  </h3>

                  {col.tagline && (
                    <p className="text-white/80 text-xs sm:text-body-sm line-clamp-2 mb-4 font-light">
                      {col.tagline}
                    </p>
                  )}

                  {/* "XEM NGAY" Button matching Remmus */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/20">
                    <span className="text-[11px] text-white/70 font-medium">
                      {col.itemCount ? `${col.itemCount} thiết kế` : 'Độc quyền'}
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-neutral-900 font-bold text-xs uppercase tracking-wider group-hover:bg-brand-gold group-hover:text-brand-navy transition-all duration-300 shadow-md">
                      <span>XEM NGAY</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

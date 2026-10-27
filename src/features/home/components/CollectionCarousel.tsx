'use client';

import { LANDING_MEDIA } from '@/features/home/constants/landing-media';
import { LandingSectionHeading } from '@/features/home/components/LandingSectionHeading';
import type { CollectionCarouselProps } from '@/features/home/types/collection-carousel';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const COLLECTION_IMAGES = [
  LANDING_MEDIA.look01,
  LANDING_MEDIA.look02,
  LANDING_MEDIA.look03,
  LANDING_MEDIA.hero,
];

export function CollectionCarousel({
  collections,
  onSelectCollection,
  selectedCollectionId,
}: CollectionCarouselProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <section id="collections" className="scroll-mt-24 bg-landing-paper py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <LandingSectionHeading
          chapter="02"
          eyebrow="Bộ sưu tập"
          title="Bốn chương. Một phong cách."
          description="Mỗi bộ sưu tập là một lớp cắt may riêng cho nhịp sống công sở. Chọn một chương để xem thiết kế."
          action={(
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-oxblood transition-colors hover:text-landing-obsidian"
            >
              Xem tất cả
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          )}
        />

        <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 xl:grid-cols-4">
          {collections.map((collection, index) => {
            const isSelected = selectedCollectionId === collection.id;
            const fallbackImage = COLLECTION_IMAGES[index % COLLECTION_IMAGES.length] || LANDING_MEDIA.look01;
            const coverImage = collection.thumbnail || collection.coverImages?.find(Boolean);
            const imageSrc = failedImages[collection.id]
              ? fallbackImage
              : coverImage || fallbackImage;

            return (
              <button
                key={collection.id}
                type="button"
                onClick={() => onSelectCollection?.(collection)}
                aria-pressed={isSelected}
                className="group relative aspect-[3/4] w-[78vw] shrink-0 snap-start overflow-hidden bg-landing-obsidian text-left transition-shadow duration-500 ease-out hover:shadow-[0_28px_44px_-20px_rgba(17,16,15,0.6)] focus-visible:shadow-[0_28px_44px_-20px_rgba(17,16,15,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-landing-oxblood md:w-auto"
              >
                <Image
                  src={imageSrc}
                  alt={`${collection.name} - ${collection.season || 'Bộ sưu tập 2026'}`}
                  fill
                  sizes="(max-width: 768px) 78vw, (max-width: 1280px) 45vw, 25vw"
                  className="object-cover object-[50%_0%] origin-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  onError={() => {
                    setFailedImages((prev) => ({ ...prev, [collection.id]: true }));
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-landing-obsidian via-landing-obsidian/35 to-landing-obsidian/5" />

                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5">
                  <span className="font-mono text-[11px] tracking-[0.18em] text-landing-paper/70">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="max-w-[55%] text-right text-[9px] font-semibold uppercase leading-relaxed tracking-[0.18em] text-landing-paper/60">
                    {collection.season || 'Bộ sưu tập 2026'}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="mb-4 block h-px w-10 bg-landing-brass transition-all duration-500 group-hover:w-16" />
                  <h3 className="font-display text-[1.55rem] leading-[1.05] text-landing-paper">
                    {collection.name}
                  </h3>
                  {collection.tagline ? (
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-landing-paper/65">
                      {collection.tagline}
                    </p>
                  ) : null}
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-landing-paper/15 pt-3">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-landing-paper/50">
                      {collection.itemCount ? `${collection.itemCount} thiết kế` : 'Tuyển chọn'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-landing-paper transition-colors group-hover:text-landing-brass">
                      {isSelected ? 'Đang xem' : 'Mở chương'}
                      <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <span className="pointer-events-none absolute inset-2 border border-landing-brass" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

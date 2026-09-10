'use client';

import { DEFAULT_LOOKBOOK_IMAGES } from '@/features/home/constants/editorial-lookbook';
import type { EditorialLookbookProps } from '@/features/home/types/editorial-lookbook';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function EditorialLookbook({ images, collection }: EditorialLookbookProps) {
  const collectionName = collection?.name?.toUpperCase() ?? null;
  const collectionDesc = collection?.description ?? null;

  const looks = DEFAULT_LOOKBOOK_IMAGES.map((item, idx) => ({
    url: images && images[idx] ? images[idx] : item.url,
    category: `LOOK ${String(idx + 1).padStart(2, '0')}`,
    title: collectionName ?? item.title,
    subtitle: collectionDesc ?? item.subtitle,
  }));

  const sectionTitle = collection?.name
    ? collection.name.toUpperCase()
    : 'LOOKBOOK 2026: SẮC VÓC LÃNH ĐẠO';

  const sectionSubtitle = collection?.description
    ? collection.description
    : 'Mỗi góc nhìn là một lời khẳng định cho phong cách chuyên nghiệp, thanh lịch và tự tin nơi công sở.';

  return (
    <section id="lookbook" className="py-14 md:py-24 bg-[#0F172A] text-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-gold text-[10px] font-bold tracking-widest uppercase mb-3 border border-white/10">
            <Sparkles className="w-3 h-3 fill-brand-gold" />
            EDITORIAL CAMPAIGN
          </span>
          <h2 className="text-[28px] sm:text-[38px] font-bold tracking-tight uppercase mb-3">
            {sectionTitle}
          </h2>
          <p className="text-body-sm text-neutral-400 font-light">
            {sectionSubtitle}
          </p>
        </div>

        {/* 3-Panel Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8">
          {looks.map((look, i) => (
            <div
              key={i}
              className="group relative rounded-2xl overflow-hidden aspect-[9/14] bg-neutral-800 shadow-2xl flex flex-col justify-end p-6 sm:p-8 border border-white/10 cursor-pointer"
            >
              <img
                src={look.url}
                alt={`${look.category} — ${look.title}`}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

              <div className="relative z-10 flex flex-col">
                <span className="text-[11px] font-bold tracking-[0.2em] text-brand-gold uppercase mb-2">
                  {look.category}
                </span>
                <h3 className="text-lg sm:text-xl font-bold tracking-wide text-white uppercase mb-1 leading-tight group-hover:text-brand-gold transition-colors">
                  {look.title}
                </h3>
                <p className="text-xs text-neutral-300 mb-4 font-light">
                  {look.subtitle}
                </p>

                <div className="flex items-center gap-3">
                  <Link
                    href="/try-on"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white text-white hover:text-neutral-900 backdrop-blur-md text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md"
                  >
                    <span>Thử outfit này</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

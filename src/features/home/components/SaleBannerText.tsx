'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function SaleBannerText() {
  return (
    <section className="py-10 md:py-14 bg-[#FAF7F2] border-y border-[#EAE3D9]">
      <div className="max-w-[1200px] mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5D1C34]/10 text-[#5D1C34] text-[11px] font-bold tracking-widest uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          ƯU ĐÃI ĐỘC QUYỀN MÙA MỚI
        </div>

        <h2 className="text-[26px] sm:text-[36px] md:text-[44px] font-extrabold text-neutral-900 tracking-tight leading-tight uppercase mb-3">
          SALE UP TO 20% <span className="text-[#5D1C34]">BỘ SƯU TẬP CÔNG SỞ</span>
        </h2>

        <p className="text-body-md text-neutral-600 max-w-2xl mx-auto mb-6 leading-relaxed">
          Tối ưu chi phí, nâng tầm phong cách quý cô và quý ông công sở. Trải nghiệm thử đồ ảo AI FASHN trước khi chốt đơn.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-7 py-3 bg-[#5D1C34] text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#732240] transition-colors shadow-md"
          >
            <span>MUA NGAY BÂY GIỜ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/try-on"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-neutral-300 text-neutral-800 rounded-full font-semibold text-xs uppercase tracking-wider hover:bg-neutral-50 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span>THỬ ĐỒ AI MIỄN PHÍ</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

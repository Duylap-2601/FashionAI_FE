'use client';

import type { StylistResultPanelProps } from '@/features/stylist/types/stylist-result-panel';
import {
  CheckCircle2,
  Ruler,
  Sparkles,
  Sun
} from 'lucide-react';
import Link from 'next/link';

export function StylistResultPanel({ resultRef, displayResult, toColorList, score, scoreColor, scoreLabel, occasion, toOutfitList, getOutfitIcon }: StylistResultPanelProps) {
  return (
    <div ref={resultRef} className="space-y-8 scroll-mt-6 animate-[fadeInUp_0.5s_ease-out]">

      {displayResult.product && (
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-neutral-200 flex items-center gap-4">
          {displayResult.product.garmentUrl && (
            <img
              src={displayResult.product.garmentUrl}
              alt={displayResult.product.name}
              className="w-16 h-20 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-100"
            />
          )}
          <div className="min-w-0">
            <div className="text-[11px] font-bold tracking-wider uppercase text-neutral-400 mb-1">
              Sản phẩm được tư vấn
            </div>
            <h3 className="text-body-lg font-bold text-neutral-900 truncate">
              {displayResult.product.name}
            </h3>
            {typeof displayResult.product.price === 'number' && displayResult.product.price > 0 && (
              <p className="text-label-sm font-semibold text-brand-navy mt-0.5">
                {displayResult.product.price.toLocaleString('vi-VN')} đ
              </p>
            )}
          </div>
        </div>
      )}

      {/* Section 1: Analysis */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200">
        <h2 className="text-heading-h3 font-bold text-brand-navy mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-semantic-success" /> Phân tích sắc màu & dáng người
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Personal Color */}
          <div className="p-5 bg-amber-50/50 rounded-xl border border-amber-100 flex flex-col justify-center">
            <div className="text-[11px] font-bold tracking-wider uppercase text-amber-700 mb-1">Personal Color</div>
            <h3 className="text-heading-h3 font-bold text-amber-900 mb-3 flex items-center gap-1">
              <Sun className="w-5 h-5" /> {displayResult.personalColor || 'Chưa xác định'}
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {toColorList(displayResult.colorSuggestions).slice(0, 6).map((c, i) => {
                const label = typeof c === 'string' ? c : c?.name || c?.color || '';
                return (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-white border border-amber-200 text-[10.5px] font-semibold text-amber-800"
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Body Type */}
          <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col justify-center">
            <div className="text-[11px] font-bold tracking-wider uppercase text-neutral-500 mb-1">Dáng người</div>
            <h3 className="text-heading-h3 font-bold text-neutral-900 mb-2">{displayResult.bodyType}</h3>
            <p className="text-[12.5px] text-neutral-600 leading-relaxed">
              Khớp dáng người theo tỷ lệ vai, ngực, eo, hông để gợi ý phom trang phục phù hợp.
            </p>
          </div>

          {/* Skin Tone */}
          <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col justify-center">
            <div className="text-[11px] font-bold tracking-wider uppercase text-neutral-500 mb-1">Skin Tone / Undertone</div>
            <h3 className="text-heading-h3 font-bold text-neutral-900 mb-2">{displayResult.skinTone}</h3>
            <p className="text-[12.5px] text-neutral-600 leading-relaxed">
              Đề xuất tông màu áo sơ mi, blazer tôn vinh sắc diện tự nhiên.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Fit Advice & Compatibility */}
      {(displayResult.fitAdvice || displayResult.fitRecommendation || displayResult.recommendedSize || score !== null) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(displayResult.fitAdvice || displayResult.fitRecommendation || displayResult.recommendedSize) && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-2 text-label-sm font-bold text-brand-navy mb-3">
                <Ruler className="w-4 h-4 text-[#5D1C34]" /> Tư vấn may đo & form dáng
              </div>
              <p className="text-body-md text-neutral-800 leading-relaxed font-medium">
                {displayResult.fitAdvice || displayResult.fitRecommendation || `Khuyên dùng form: ${displayResult.recommendedSize}`}
              </p>
              {displayResult.fitRecommendation && displayResult.fitAdvice && (
                <p className="text-body-sm text-neutral-500 mt-2 leading-relaxed">
                  {displayResult.fitRecommendation}
                </p>
              )}
            </div>
          )}

          {score !== null && score !== undefined && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-label-sm font-bold text-brand-navy">
                  <Sparkles className="w-4 h-4" /> Độ tương thích sản phẩm
                </div>
                <span className="text-heading-h3 font-bold text-neutral-900">{score}%</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${scoreColor} rounded-full transition-all duration-700`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <p className="text-label-sm font-semibold mt-2 text-neutral-600">{scoreLabel}</p>
            </div>
          )}
        </div>
      )}

      {/* Section 3: Outfit combinations */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200">
        <h2 className="text-heading-h3 font-bold text-brand-navy mb-6">
          Đề xuất trang phục ({occasion})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {toOutfitList(displayResult.outfitCombinations).map((outfit, idx) => (
            <div key={idx} className="bg-neutral-50 rounded-xl border border-neutral-200 p-5 flex flex-col">
              <h4 className="text-label-lg font-bold text-brand-navy mb-4 border-b border-neutral-200 pb-3">
                {typeof outfit === 'string' ? `Bộ phối ${idx + 1}` : outfit.name || `Outfit ${idx + 1}`}
              </h4>
              <div className="space-y-3 mb-6">
                {typeof outfit === 'string' ? (
                  <div className="flex items-start gap-3 text-body-sm text-neutral-700 leading-relaxed">
                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center shadow-sm shrink-0">
                      {getOutfitIcon('shirt')}
                    </div>
                    <span>{outfit}</span>
                  </div>
                ) : (
                  outfit.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-body-sm text-neutral-700">
                      <div className="w-8 h-8 rounded bg-white flex items-center justify-center shadow-sm shrink-0">
                        {getOutfitIcon(item.type || 'shirt')}
                      </div>
                      <span className="truncate" title={item.name}>{item.name}</span>
                    </div>
                  ))
                )}
              </div>
              <Link
                href={displayResult.product ? `/products/${displayResult.product.id}` : '/products'}
                className="mt-auto w-full py-2.5 rounded-lg border border-brand-navy text-brand-navy font-semibold text-label-sm hover:bg-brand-navy hover:text-white transition-colors text-center"
              >
                Xem sản phẩm
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Verdict */}
      <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-2xl p-6 md:p-8">
        <h2 className="text-heading-h3 font-bold text-brand-navy mb-4">Lời khuyên & Nhận xét chi tiết</h2>
        <div className="text-body-md text-neutral-800 space-y-4 leading-relaxed font-sans">
          <p className="whitespace-pre-line">{displayResult.verdict}</p>
          <div className="h-px bg-brand-gold/20 my-4" />
          <p className="whitespace-pre-line text-neutral-700 text-body-sm">{displayResult.stylingTips}</p>
        </div>
      </div>
    </div>
  );
}

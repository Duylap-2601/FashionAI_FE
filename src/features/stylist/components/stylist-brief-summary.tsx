'use client';

import { GENDER_OPTIONS } from '@/features/stylist/constants/ai-stylist-page';
import type { StylistBriefSummaryProps } from '@/features/stylist/types/stylist-brief-summary';
import { Camera, Pencil, Sparkles } from 'lucide-react';

/** Thay form khi đã có kết quả: một dòng tóm tắt yêu cầu để kết quả lên đầu trang. */
export function StylistBriefSummary({ result, photoUrl, isAnalyzing, onEdit }: StylistBriefSummaryProps) {
  const gender = GENDER_OPTIONS.find((option) => option.value === result?.genderPreference)?.label;
  const chips = [result?.occasion, result?.stylePreference, result?.budget, gender, result?.product?.name]
    .filter((value): value is string => Boolean(value?.trim()));
  const hasImage = result ? Boolean(result.hasImage || result.humanImageUrl) : Boolean(photoUrl);

  return (
    <div className="sticky top-[76px] z-20 mb-6 flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/95 backdrop-blur px-3 py-2.5 shadow-xs">
      <div className="w-9 h-9 shrink-0 rounded-xl bg-brand-navy/10 flex items-center justify-center text-brand-navy">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {isAnalyzing ? (
          <span className="text-body-sm text-neutral-500">AI đang chọn bộ phối từ cửa hàng…</span>
        ) : (
          <>
            {chips.length === 0 && <span className="text-body-sm text-neutral-500">Gợi ý theo hồ sơ của bạn</span>}
            {chips.map((chip) => (
              <span key={chip} className="shrink-0 max-w-[180px] truncate px-2.5 py-1 rounded-full bg-brand-cream text-label-sm font-medium text-neutral-700">
                {chip}
              </span>
            ))}
            {hasImage && (
              <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-cream text-label-sm font-medium text-neutral-700">
                <Camera className="w-3 h-3" /> Có ảnh
              </span>
            )}
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onEdit}
        disabled={isAnalyzing}
        className="shrink-0 h-9 px-3 rounded-xl border border-neutral-200 bg-white text-label-sm font-semibold text-neutral-700 hover:border-brand-navy/40 hover:text-brand-navy flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Pencil className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Chỉnh sửa</span>
      </button>
    </div>
  );
}

'use client';

import { GENDER_OPTIONS } from '@/features/stylist/constants/ai-stylist-page';
import type { StylistBriefSummaryProps } from '@/features/stylist/types/stylist-brief-summary';
import { Camera, Loader2, Pencil, Sparkles } from 'lucide-react';

/** Thay form khi đã có kết quả: một dòng tóm tắt yêu cầu để kết quả lên đầu trang. */
export function StylistBriefSummary({ result, photoUrl, isAnalyzing, onEdit }: StylistBriefSummaryProps) {
  const gender = GENDER_OPTIONS.find((option) => option.value === result?.genderPreference)?.label;
  const chips = [result?.occasion, result?.stylePreference, result?.budget, gender, result?.product?.name]
    .filter((value): value is string => Boolean(value?.trim()));
  const hasImage = result ? Boolean(result.hasImage || result.humanImageUrl) : Boolean(photoUrl);

  return (
    // Dính ngay dưới header landing (72px + 1px viền).
    <div className="sticky top-[73px] z-20 mb-8 flex items-center gap-3 border-y border-landing-line bg-landing-paper/95 py-3 backdrop-blur-md">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] border border-landing-line text-landing-oxblood" aria-hidden="true">
        {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : <Sparkles className="h-4 w-4" strokeWidth={1.75} />}
      </span>
      <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
        {isAnalyzing ? (
          <span className="text-sm text-landing-muted" role="status">AI đang chọn bộ phối từ cửa hàng…</span>
        ) : (
          <>
            {chips.length === 0 && <span className="text-sm text-landing-muted">Gợi ý theo hồ sơ của bạn</span>}
            {chips.map((chip) => (
              <span key={chip} className="max-w-[180px] shrink-0 truncate rounded-[2px] border border-landing-line bg-landing-ivory px-2.5 py-1 text-xs text-landing-obsidian/80">
                {chip}
              </span>
            ))}
            {hasImage && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-[2px] border border-landing-line bg-landing-ivory px-2.5 py-1 text-xs text-landing-obsidian/80">
                <Camera className="h-3 w-3" strokeWidth={1.75} /> Có ảnh
              </span>
            )}
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onEdit}
        disabled={isAnalyzing}
        aria-label="Chỉnh sửa yêu cầu"
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[2px] border border-landing-obsidian/70 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} /> <span className="hidden sm:inline">Chỉnh sửa</span>
      </button>
    </div>
  );
}

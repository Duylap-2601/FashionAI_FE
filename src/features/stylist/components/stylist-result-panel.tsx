'use client';

import { GA_ITEM_LISTS } from '@/features/analytics/constants/ga-item-lists';
import { OutfitSuggestionList } from '@/features/stylist/components/outfit-suggestion-list';
import { toColorList, toOutfitList } from '@/features/stylist/services/result-lists';
import type { StylistResultPanelProps } from '@/features/stylist/types/stylist-result-panel';
import { AlertCircle, ChevronDown, Lightbulb, Shirt, Sparkles, UserRound } from 'lucide-react';
import React, { useState } from 'react';

/** "- mẹo 1\n- mẹo 2" (định dạng prompt yêu cầu) → danh sách; kết quả cũ dạng đoạn văn giữ nguyên một mục. */
function toTips(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^\s*[-•*]\s*/, '').trim())
    .filter(Boolean);
}

function scoreTone(score: number) {
  if (score >= 80) return { bar: 'bg-semantic-success', label: 'Rất hợp' };
  if (score >= 60) return { bar: 'bg-semantic-warning', label: 'Khá hợp' };
  return { bar: 'bg-semantic-error', label: 'Ít hợp' };
}

function SectionTitle({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-body-lg font-semibold text-neutral-900">
      <Icon className="w-4 h-4 text-brand-navy" /> {children}
    </h2>
  );
}

function ProfileRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-label-sm text-neutral-400">{label}</dt>
      <dd className="text-body-sm font-medium text-neutral-900 line-clamp-2">{children}</dd>
    </div>
  );
}

export function StylistResultPanel({ resultRef, displayResult }: StylistResultPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const warnings = displayResult.warnings ?? [];
  const outfits = displayResult.outfits;
  // Lịch sử cũ chưa có bộ phối từ catalog: hiện gợi ý dạng chữ như trước.
  const legacyOutfits = outfits.length > 0 ? [] : toOutfitList(displayResult.outfitCombinations);
  // Không có bộ phối nào (vd. catalog không có đồ phù hợp): lời giải thích của AI là kết quả chính.
  const noOutfits = outfits.length === 0 && legacyOutfits.length === 0;

  const colors = toColorList(displayResult.colorSuggestions)
    .map((c) => (typeof c === 'string' ? c : c?.name || c?.color || ''))
    .filter(Boolean)
    .slice(0, 6);
  const score = displayResult.productCompatibilityScore;
  const profileRowCount = [displayResult.bodyType, displayResult.skinTone, displayResult.personalColor].filter(Boolean).length;
  const hasProfile = profileRowCount > 0 || colors.length > 0 || score != null;

  const tips = toTips(displayResult.stylingTips);
  const fitText = displayResult.fitAdvice || displayResult.fitRecommendation;
  const hasAdvice = Boolean(displayResult.verdict || tips.length || fitText);
  const visibleTips = expanded ? tips : tips.slice(0, 3);
  const canExpand = tips.length > 3 || (displayResult.verdict?.length ?? 0) > 160 || tips.some((tip) => tip.length > 120) || (fitText?.length ?? 0) > 120;

  return (
    <div ref={resultRef} className="flex flex-col gap-6 scroll-mt-24 animate-[fadeInUp_0.4s_ease-out]">
      {warnings.length > 0 && !noOutfits && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200/70">
          <AlertCircle className="w-4 h-4 text-semantic-warning shrink-0 mt-0.5" />
          <div className="text-body-sm text-amber-900 space-y-0.5">
            {warnings.map((warning, idx) => <p key={idx}>{warning}</p>)}
          </div>
        </div>
      )}

      {/* Bộ phối: phần chính của kết quả */}
      <section className="flex flex-col gap-3">
        {!noOutfits && (
          <div className="flex items-baseline justify-between gap-3">
            <SectionTitle icon={Sparkles}>Bộ phối dành cho bạn</SectionTitle>
            {outfits.length > 1 && (
              <span className="md:hidden text-label-sm text-neutral-400">Vuốt để xem {outfits.length} bộ</span>
            )}
          </div>
        )}

        {outfits.length > 0 ? (
          <OutfitSuggestionList viewKey={displayResult.id} list={GA_ITEM_LISTS.aiStylist} outfits={outfits} variant="showcase" />
        ) : legacyOutfits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {legacyOutfits.map((outfit, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-neutral-200/80 p-4">
                <p className="text-label-md font-semibold text-neutral-900 mb-2">
                  {typeof outfit === 'string' ? `Bộ phối ${idx + 1}` : outfit.name || `Bộ phối ${idx + 1}`}
                </p>
                {typeof outfit === 'string' ? (
                  <p className="text-body-sm text-neutral-600 line-clamp-4">{outfit}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {outfit.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-body-sm text-neutral-600">
                        <Shirt className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 flex flex-col items-center text-center gap-2">
            <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-semantic-warning" />
            </div>
            <p className="text-body-md font-semibold text-neutral-900">Chưa có bộ phối phù hợp trong cửa hàng</p>
            {warnings.map((warning, idx) => (
              <p key={idx} className="max-w-md text-body-sm text-neutral-500">{warning}</p>
            ))}
            <p className="text-label-sm text-neutral-400">Thử đổi dịp mặc, phong cách hoặc ngân sách.</p>
          </div>
        )}
      </section>

      {(hasProfile || hasAdvice) && (
        <div className={`grid grid-cols-1 gap-4 ${hasProfile && hasAdvice ? 'md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]' : ''}`}>
          {hasProfile && (
            <section className="bg-white rounded-2xl border border-neutral-200/80 p-5 flex flex-col gap-4">
              <SectionTitle icon={UserRound}>Hồ sơ phong cách</SectionTitle>
              {profileRowCount > 0 && (
                <dl className={`grid gap-x-4 gap-y-3 ${profileRowCount > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {displayResult.bodyType && <ProfileRow label="Dáng người">{displayResult.bodyType}</ProfileRow>}
                  {displayResult.skinTone && <ProfileRow label="Tông da">{displayResult.skinTone}</ProfileRow>}
                  {displayResult.personalColor && <ProfileRow label="Màu cá nhân">{displayResult.personalColor}</ProfileRow>}
                </dl>
              )}
              {colors.length > 0 && (
                <div>
                  <p className="text-label-sm text-neutral-400 mb-1.5">Màu nên mặc</p>
                  <div className="flex flex-wrap gap-1.5">
                    {colors.map((color) => (
                      <span key={color} className="px-2.5 py-1 rounded-full bg-brand-cream border border-neutral-200 text-label-sm font-medium text-neutral-700">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {score != null && (
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-label-sm text-neutral-400 truncate">
                      Độ hợp{displayResult.product ? ` với ${displayResult.product.name}` : ''}
                    </span>
                    <span className="text-label-md font-bold text-neutral-900 shrink-0 ml-2">
                      {score}% · {scoreTone(score).label}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div className={`h-full rounded-full ${scoreTone(score).bar}`} style={{ width: `${score}%` }} />
                  </div>
                </div>
              )}
            </section>
          )}

          {hasAdvice && (
            <section className="bg-white rounded-2xl border border-neutral-200/80 p-5 flex flex-col gap-3">
              <SectionTitle icon={Lightbulb}>Lời khuyên</SectionTitle>
              {displayResult.verdict && (
                <p className={`text-body-md text-neutral-800 ${expanded ? '' : 'line-clamp-3'}`}>{displayResult.verdict}</p>
              )}
              {visibleTips.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {visibleTips.map((tip, idx) => (
                    <li key={idx} className="flex gap-2 text-body-sm text-neutral-600">
                      <span className="mt-2 w-1 h-1 rounded-full bg-brand-navy shrink-0" />
                      <span className={expanded ? '' : 'line-clamp-2'}>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
              {fitText && (
                <p className={`text-body-sm text-neutral-600 ${expanded ? '' : 'line-clamp-2'}`}>
                  <span className="font-semibold text-neutral-900">Phom dáng: </span>{fitText}
                </p>
              )}
              {canExpand && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="self-start flex items-center gap-1 text-label-sm font-semibold text-brand-navy border-0 bg-transparent cursor-pointer"
                >
                  {expanded ? 'Thu gọn' : 'Xem thêm'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

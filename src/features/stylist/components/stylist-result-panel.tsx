'use client';

import { GA_ITEM_LISTS } from '@/features/analytics/constants/ga-item-lists';
import { OutfitSuggestionList } from '@/features/stylist/components/outfit-suggestion-list';
import { toColorSwatches, toOutfitList } from '@/features/stylist/services/result-lists';
import { findOutfitProducts } from '@/features/stylist/services/stylist-product-matcher';
import type { ColorSwatch } from '@/features/stylist/types/stylist';
import type { StylistResultPanelProps } from '@/features/stylist/types/stylist-result-panel';
import { AlertCircle, Check, ChevronDown, Copy, Shirt } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'sonner';

/** "- mẹo 1\n- mẹo 2" (định dạng prompt yêu cầu) → danh sách; kết quả cũ dạng đoạn văn giữ nguyên một mục. */
function toTips(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^\s*[-•*]\s*/, '').trim())
    .filter(Boolean);
}

function scoreTone(score: number) {
  if (score >= 80) return { bar: 'bg-landing-sage-ink', label: 'Rất hợp' };
  if (score >= 60) return { bar: 'bg-landing-brass', label: 'Khá hợp' };
  return { bar: 'bg-destructive', label: 'Ít hợp' };
}

/** Tiêu đề khối nhỏ: nhãn in hoa màu đồng thau, đúng kiểu nhãn của trang landing. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink">{children}</h2>
  );
}

function ProfileRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-t border-landing-line/70 pt-3">
      <dt className="text-[11px] uppercase tracking-[0.16em] text-landing-muted">{label}</dt>
      <dd className="line-clamp-2 text-sm font-medium text-landing-obsidian">{children}</dd>
    </div>
  );
}

/** Ô màu: bấm để sao chép mã hex. Kết quả cũ không có mã thì chỉ hiện tên. */
function ColorChip({ name, hex }: ColorSwatch) {
  const [copied, setCopied] = useState(false);

  if (!hex) {
    return (
      <span className="rounded-[2px] border border-landing-line bg-landing-paper px-2.5 py-1 text-xs text-landing-obsidian/80">
        {name}
      </span>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      toast.success(`Đã sao chép mã màu ${hex}`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Không thể sao chép mã màu');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Sao chép ${hex}`}
      className="group inline-flex h-9 items-center gap-2 rounded-[2px] border border-landing-line bg-landing-paper pl-1 pr-2.5 transition-colors hover:border-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
    >
      {/* Màu lấy từ dữ liệu AI trả về nên không dùng được token. */}
      <span className="h-7 w-7 shrink-0 rounded-[2px] border border-landing-obsidian/10" style={{ backgroundColor: hex }} />
      <span className="text-xs font-medium text-landing-obsidian">{name}</span>
      <span className="flex items-center gap-1 font-mono text-[10.5px] uppercase text-landing-muted group-hover:text-landing-oxblood">
        {hex}
        {copied ? <Check className="h-3 w-3 text-landing-sage-ink" strokeWidth={2} /> : <Copy className="h-3 w-3" strokeWidth={1.75} />}
      </span>
    </button>
  );
}

export function StylistResultPanel({ resultRef, displayResult, catalogProducts }: StylistResultPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const warnings = displayResult.warnings ?? [];
  const outfits = displayResult.outfits;
  // Lịch sử cũ chưa có bộ phối từ catalog: hiện gợi ý dạng chữ như trước.
  const legacyOutfits = outfits.length > 0 ? [] : toOutfitList(displayResult.outfitCombinations);
  // Không có bộ phối nào (vd. catalog không có đồ phù hợp): lời giải thích của AI là kết quả chính.
  const noOutfits = outfits.length === 0 && legacyOutfits.length === 0;

  const colors = toColorSwatches(displayResult.colorSuggestions);
  const score = displayResult.productCompatibilityScore;
  const profileRowCount = [displayResult.bodyType, displayResult.skinTone, displayResult.personalColor].filter(Boolean).length;
  const hasProfile = profileRowCount > 0 || colors.length > 0 || score != null;

  const tips = toTips(displayResult.stylingTips);
  const fitText = displayResult.fitAdvice || displayResult.fitRecommendation;
  const hasAdvice = Boolean(displayResult.verdict || tips.length || fitText);
  const visibleTips = expanded ? tips : tips.slice(0, 3);
  const canExpand = tips.length > 3 || (displayResult.verdict?.length ?? 0) > 160 || tips.some((tip) => tip.length > 120) || (fitText?.length ?? 0) > 120;

  return (
    <div ref={resultRef} className="flex scroll-mt-24 flex-col gap-10 animate-[fadeInUp_0.4s_ease-out] motion-reduce:animate-none">
      {warnings.length > 0 && !noOutfits && (
        <div role="status" className="flex items-start gap-3 border-l-2 border-landing-brass bg-landing-ivory px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-landing-brass-ink" strokeWidth={1.75} />
          <div className="space-y-0.5 text-sm text-landing-obsidian">
            {warnings.map((warning, idx) => <p key={idx}>{warning}</p>)}
          </div>
        </div>
      )}

      {/* Bộ phối: phần chính của kết quả */}
      <section className="flex flex-col gap-5">
        {!noOutfits && (
          <div className="flex items-end justify-between gap-3 border-b border-landing-line pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-landing-brass-ink">Kết quả</p>
              <h2 className="mt-2 font-display text-landing-h3 text-landing-obsidian">Bộ phối dành cho bạn</h2>
            </div>
            {outfits.length > 0 && (
              <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-landing-muted">
                {String(outfits.length).padStart(2, '0')} bộ<span className="md:hidden"> · vuốt để xem</span>
              </span>
            )}
          </div>
        )}

        {outfits.length > 0 ? (
          <OutfitSuggestionList viewKey={displayResult.id} list={GA_ITEM_LISTS.aiStylist} outfits={outfits} variant="showcase" />
        ) : legacyOutfits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {legacyOutfits.map((outfit, idx) => {
              // Kết quả cũ chỉ có tên món dạng chữ: dò sản phẩm gần giống trong catalog (chỉ là gợi ý).
              const matchedProducts = findOutfitProducts(
                typeof outfit === 'string' ? [outfit] : outfit.items.map((item) => item.name),
                catalogProducts,
                3,
              );
              return (
              <div key={idx} className="flex flex-col rounded-[2px] border border-landing-line bg-landing-ivory p-4">
                <p className="mb-2 font-display text-lg text-landing-obsidian">
                  {typeof outfit === 'string' ? `Bộ phối ${idx + 1}` : outfit.name || `Bộ phối ${idx + 1}`}
                </p>
                {typeof outfit === 'string' ? (
                  <p className="line-clamp-4 text-sm text-landing-muted">{outfit}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {outfit.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-landing-obsidian/80">
                        <Shirt className="h-3.5 w-3.5 shrink-0 text-landing-muted" strokeWidth={1.75} />
                        <span className="truncate">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {matchedProducts.length > 0 && (
                  <div className="mt-3 border-t border-landing-line/70 pt-3">
                    <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-landing-muted">Sản phẩm tương tự trong shop</p>
                    <div className="flex flex-col gap-2">
                      {matchedProducts.map((product) => (
                        <Link key={product.id} href={`/products/${product.id}`} className="group flex items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood">
                          <span className="relative h-12 w-9 shrink-0 overflow-hidden rounded-[2px] bg-landing-paper">
                            {product.image && <Image src={product.image} alt={product.name} fill sizes="36px" className="object-contain" />}
                          </span>
                          <span className="product-name-line min-w-0 flex-1 truncate text-landing-obsidian/80 group-hover:text-landing-oxblood">{product.name}</span>
                          <span className="shrink-0 font-mono text-[12px] text-landing-obsidian">{product.price}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-[2px] border border-landing-line bg-landing-ivory px-6 py-12 text-center">
            <p className="font-display text-xl text-landing-obsidian md:text-2xl">Chưa có bộ phối phù hợp trong cửa hàng</p>
            {warnings.map((warning, idx) => (
              <p key={idx} className="max-w-md text-sm text-landing-muted">{warning}</p>
            ))}
            <p className="text-xs text-landing-muted">Thử đổi dịp mặc, phong cách hoặc ngân sách.</p>
          </div>
        )}
      </section>

      {(hasProfile || hasAdvice) && (
        <div className={`grid grid-cols-1 gap-4 ${hasProfile && hasAdvice ? 'md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]' : ''}`}>
          {hasProfile && (
            <section className="flex flex-col gap-5 rounded-[2px] border border-landing-line bg-landing-ivory p-5 md:p-6">
              <SectionLabel>Hồ sơ phong cách</SectionLabel>
              {profileRowCount > 0 && (
                <dl className={`grid gap-x-5 gap-y-3 ${profileRowCount > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {displayResult.bodyType && <ProfileRow label="Dáng người">{displayResult.bodyType}</ProfileRow>}
                  {displayResult.skinTone && <ProfileRow label="Tông da">{displayResult.skinTone}</ProfileRow>}
                  {displayResult.personalColor && <ProfileRow label="Màu cá nhân">{displayResult.personalColor}</ProfileRow>}
                </dl>
              )}
              {colors.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-landing-muted">
                    Màu nên mặc{colors.some((color) => color.hex) ? ' · bấm để sao chép mã' : ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => <ColorChip key={color.name} {...color} />)}
                  </div>
                </div>
              )}
              {score != null && (
                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="truncate text-[11px] uppercase tracking-[0.16em] text-landing-muted">
                      Độ hợp{displayResult.product ? ` với ${displayResult.product.name}` : ''}
                    </span>
                    <span className="ml-2 shrink-0 font-mono text-[12px] text-landing-obsidian">
                      {score}% · {scoreTone(score).label}
                    </span>
                  </div>
                  <div className="h-0.5 overflow-hidden bg-landing-line">
                    <div className={`h-full ${scoreTone(score).bar}`} style={{ width: `${score}%` }} />
                  </div>
                </div>
              )}
            </section>
          )}

          {hasAdvice && (
            <section className="flex flex-col gap-4 rounded-[2px] border border-landing-line bg-landing-ivory p-5 md:p-6">
              <SectionLabel>Lời khuyên</SectionLabel>
              {displayResult.verdict && (
                <p className={`font-display text-lg leading-relaxed text-landing-obsidian ${expanded ? '' : 'line-clamp-3'}`}>{displayResult.verdict}</p>
              )}
              {visibleTips.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {visibleTips.map((tip, idx) => (
                    <li key={idx} className="flex gap-3 text-sm leading-relaxed text-landing-obsidian/80">
                      <span className="shrink-0 pt-0.5 font-mono text-[11px] text-landing-brass-ink">{String(idx + 1).padStart(2, '0')}</span>
                      <span className={expanded ? '' : 'line-clamp-2'}>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
              {fitText && (
                <p className={`border-t border-landing-line/70 pt-3 text-sm leading-relaxed text-landing-obsidian/80 ${expanded ? '' : 'line-clamp-2'}`}>
                  <span className="font-semibold text-landing-obsidian">Phom dáng: </span>{fitText}
                </p>
              )}
              {canExpand && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-expanded={expanded}
                  className="flex h-9 items-center gap-1 self-start text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
                >
                  {expanded ? 'Thu gọn' : 'Xem thêm'}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} strokeWidth={1.75} />
                </button>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

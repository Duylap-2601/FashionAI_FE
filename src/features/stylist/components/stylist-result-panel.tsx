'use client';

import type { StylistResultPanelProps } from '@/features/stylist/types/stylist-result-panel';
import { findOutfitProducts } from '@/features/stylist/services/stylist-product-matcher';
import type { OutfitCombination } from '@/features/stylist/types/stylist';
import type { Product } from '@/features/products/types/products';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Ruler,
  ShoppingBag,
  Sun
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

// ---------------------------------------------------------------------------
// Inline markdown renderer (handles **bold**, *italic*, ## heading, - bullet)
// ---------------------------------------------------------------------------
function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, li) => {
    const trimmed = line.trim();

    // Heading ## or ###
    if (trimmed.startsWith('### ')) {
      nodes.push(
        <p key={li} className="text-[13px] font-bold text-brand-navy uppercase tracking-wide mt-4 mb-1">
          {trimmed.slice(4)}
        </p>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      nodes.push(
        <p key={li} className="text-[14px] font-bold text-brand-navy mt-4 mb-1">
          {trimmed.slice(3)}
        </p>
      );
      return;
    }

    // Bullet point
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      nodes.push(
        <div key={li} className="flex items-start gap-2 text-[13.5px] text-neutral-700 leading-relaxed">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-navy/50 shrink-0" />
          <span>{parseInline(trimmed.slice(2))}</span>
        </div>
      );
      return;
    }

    // Numbered list: 1. ...
    const numbered = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numbered) {
      nodes.push(
        <div key={li} className="flex items-start gap-2 text-[13.5px] text-neutral-700 leading-relaxed">
          <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-navy/10 text-brand-navy text-[11px] font-bold flex items-center justify-center shrink-0">
            {numbered[1]}
          </span>
          <span>{parseInline(numbered[2])}</span>
        </div>
      );
      return;
    }

    // Empty line → spacer
    if (!trimmed) {
      nodes.push(<div key={li} className="h-2" />);
      return;
    }

    // Normal paragraph
    nodes.push(
      <p key={li} className="text-[13.5px] text-neutral-700 leading-relaxed">
        {parseInline(trimmed)}
      </p>
    );
  });

  return <>{nodes}</>;
}

/** Parse inline formatting: **bold**, *italic*, `code` */
function parseInline(text: string): React.ReactNode {
  // Split on **bold**, *italic*, or `code` tokens
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-neutral-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i} className="italic text-neutral-600">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="px-1 py-0.5 bg-neutral-100 rounded text-[12px] font-mono text-neutral-800">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Tiny shop product card shown inside each outfit
// ---------------------------------------------------------------------------
function ShopProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-neutral-200 hover:border-brand-navy/40 hover:shadow-sm transition-all group"
    >
      <div className="w-10 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={40}
            height={48}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-neutral-300" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-neutral-900 truncate leading-tight">{product.name}</p>
        {product.numericPrice > 0 && (
          <p className="text-[11px] font-bold text-brand-navy mt-0.5">
            {product.numericPrice.toLocaleString('vi-VN')}đ
          </p>
        )}
      </div>
      <ExternalLink className="w-3 h-3 text-neutral-400 group-hover:text-brand-navy shrink-0 transition-colors" />
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function StylistResultPanel({
  resultRef,
  displayResult,
  toColorList,
  score,
  scoreColor,
  scoreLabel,
  occasion,
  toOutfitList,
  getOutfitIcon,
  catalogProducts,
}: StylistResultPanelProps) {
  const outfits = toOutfitList(displayResult.outfitCombinations);

  return (
    <div ref={resultRef} className="space-y-8 scroll-mt-6 animate-[fadeInUp_0.5s_ease-out]">

      {/* Stylist Warnings Callout */}
      {displayResult.warnings && displayResult.warnings.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 md:p-5 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-body-sm text-amber-900 space-y-1">
            <p className="font-semibold text-amber-950">Lưu ý từ AI Stylist</p>
            {displayResult.warnings.map((warning, idx) => (
              <p key={idx} className="text-amber-800 leading-relaxed text-[13.5px]">
                {warning}
              </p>
            ))}
          </div>
        </div>
      )}

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
          <CheckCircle2 className="w-6 h-6 text-semantic-success" /> Phân tích sắc màu &amp; dáng người
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
                <Ruler className="w-4 h-4 text-[#5D1C34]" /> Tư vấn may đo &amp; form dáng
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
                  Độ tương thích sản phẩm
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

      {/* Section 3: Outfit combinations with shop product matching */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200">
        <h2 className="text-heading-h3 font-bold text-brand-navy mb-6">
          Đề xuất trang phục ({occasion})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {outfits.map((outfit, idx) => {
            // Collect item names for product matching
            const itemNames: string[] = typeof outfit === 'string'
              ? [outfit]
              : (outfit as OutfitCombination).items?.map((it) => it.name) ?? [];

            const matchedProducts = findOutfitProducts(itemNames, catalogProducts, 3);

            return (
              <div key={idx} className="bg-neutral-50 rounded-xl border border-neutral-200 p-5 flex flex-col">
                <h4 className="text-label-lg font-bold text-brand-navy mb-4 border-b border-neutral-200 pb-3">
                  {typeof outfit === 'string' ? `Bộ phối ${idx + 1}` : (outfit as OutfitCombination).name || `Outfit ${idx + 1}`}
                </h4>

                {/* Outfit items */}
                <div className="space-y-3 mb-4">
                  {typeof outfit === 'string' ? (
                    <div className="flex items-start gap-3 text-body-sm text-neutral-700 leading-relaxed">
                      <div className="w-8 h-8 rounded bg-white flex items-center justify-center shadow-sm shrink-0">
                        {getOutfitIcon('shirt')}
                      </div>
                      <span>{outfit}</span>
                    </div>
                  ) : (
                    (outfit as OutfitCombination).items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-body-sm text-neutral-700">
                        <div className="w-8 h-8 rounded bg-white flex items-center justify-center shadow-sm shrink-0">
                          {getOutfitIcon(item.type || 'shirt')}
                        </div>
                        <span className="truncate" title={item.name}>{item.name}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Matched shop products */}
                {matchedProducts.length > 0 && (
                  <div className="mt-auto">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-brand-navy/60" />
                      <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-400">
                        Sản phẩm trong shop
                      </span>
                    </div>
                    <div className="space-y-2">
                      {matchedProducts.map((product) => (
                        <ShopProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback: view all products */}
                {matchedProducts.length === 0 && (
                  <Link
                    href={displayResult.product ? `/products/${displayResult.product.id}` : '/products'}
                    className="mt-auto w-full py-2.5 rounded-lg border border-brand-navy text-brand-navy font-semibold text-label-sm hover:bg-brand-navy hover:text-white transition-colors text-center"
                  >
                    Xem sản phẩm
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Verdict — with markdown rendering */}
      <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-2xl p-6 md:p-8">
        <h2 className="text-heading-h3 font-bold text-brand-navy mb-5">Lời khuyên &amp; Nhận xét chi tiết</h2>

        <div className="space-y-1">
          {renderMarkdown(displayResult.verdict ?? '')}
        </div>

        {displayResult.stylingTips && (
          <>
            <div className="h-px bg-brand-gold/20 my-5" />
            <div className="space-y-1">
              {renderMarkdown(displayResult.stylingTips)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

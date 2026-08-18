'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, Search, ChevronLeft, Trash2, Eye,
  Calendar, User, Palette, Star, Heart, ShoppingBag,
  ChevronDown, ChevronUp, Crown, AlertCircle, Loader2
} from 'lucide-react';
import { useStylistHistory, useDeleteStylistHistory, type StylistResult } from '@/hooks/useStylist';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const OCCASION_LABELS: Record<string, string> = {
  office: 'Văn phòng',
  meeting: 'Họp / Sự kiện',
  casual: 'Thường ngày',
  formal: 'Lễ phục',
  date: 'Hẹn hò',
};

// ─── Expandable Result Card ──────────────────────────────────────────────────
function StylistCard({ item, onDelete, isDeleting }: {
  item: StylistResult;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const score = item.productCompatibilityScore;
  const outfits = Array.isArray(item.outfitCombinations) ? item.outfitCombinations : [];
  const colors = Array.isArray(item.colorSuggestions) ? item.colorSuggestions : [];

  const handleDelete = () => {
    if (confirm('Bạn có chắc chắn muốn xóa kết quả tư vấn này?')) {
      onDelete(item.id);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
      
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          
          {/* Human Image Thumbnail */}
          {item.humanImageUrl && !imgError ? (
            <div className="w-16 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
              <img
                src={item.humanImageUrl}
                alt="Ảnh phân tích"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="w-16 h-20 rounded-xl bg-gradient-to-br from-brand-navy/10 to-brand-navy/5 flex items-center justify-center shrink-0 border border-neutral-200">
              <User className="w-7 h-7 text-brand-navy/40" />
            </div>
          )}

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                {/* Personal Color + Body Type */}
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  {item.personalColor && (
                    <span className="text-label-sm px-2 py-0.5 rounded-full bg-brand-gold/15 text-amber-700 font-medium border border-brand-gold/30">
                      {item.personalColor}
                    </span>
                  )}
                  {item.bodyType && (
                    <span className="text-label-sm px-2 py-0.5 rounded-full bg-brand-sage/15 text-brand-sage font-medium border border-brand-sage/30">
                      {item.bodyType}
                    </span>
                  )}
                  {item.skinTone && (
                    <span className="text-label-sm px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium border border-neutral-200">
                      {item.skinTone}
                    </span>
                  )}
                </div>

                {/* Occasion */}
                {item.occasion && (
                  <p className="text-body-sm font-medium text-neutral-900">
                    {OCCASION_LABELS[item.occasion] || item.occasion}
                  </p>
                )}
              </div>

              {/* Compatibility Score */}
              {score != null && (
                <div className="shrink-0 flex flex-col items-center gap-0.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-body-md border-2 ${
                    score >= 80 ? 'bg-semantic-success/10 border-semantic-success/30 text-semantic-success'
                    : score >= 60 ? 'bg-semantic-warning/10 border-semantic-warning/30 text-semantic-warning'
                    : 'bg-semantic-error/10 border-semantic-error/30 text-semantic-error'
                  }`}>
                    {score}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">/ 100</span>
                </div>
              )}
            </div>

            {/* Date + Delete */}
            <div className="flex items-center justify-between">
              <span className="text-label-sm text-neutral-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(item.createdAt)}
              </span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-label-sm text-neutral-400 hover:text-semantic-error transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Xóa
              </button>
            </div>
          </div>
        </div>

        {/* Verdict snippet */}
        {item.verdict && (
          <div className="mt-3 p-3 bg-brand-cream/60 rounded-xl border border-neutral-200">
            <p className="text-body-sm text-neutral-700 italic leading-relaxed line-clamp-2">
              "{item.verdict}"
            </p>
          </div>
        )}
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-neutral-100 text-label-sm text-neutral-500 hover:text-brand-navy hover:bg-neutral-50 transition-colors"
      >
        {expanded ? <><ChevronUp className="w-4 h-4" /> Ẩn chi tiết</> : <><ChevronDown className="w-4 h-4" /> Xem chi tiết</>}
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-neutral-100 space-y-4 animate-fadeInUp">

          {/* Fit Recommendation */}
          {item.fitRecommendation && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5 text-label-sm font-semibold text-neutral-700 uppercase tracking-wide">
                <Star className="w-3.5 h-3.5 text-brand-gold" /> Kiểu dáng phù hợp
              </div>
              <p className="text-body-sm text-neutral-700">{item.fitRecommendation}</p>
            </div>
          )}

          {/* Styling Tips */}
          {item.stylingTips && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5 text-label-sm font-semibold text-neutral-700 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-brand-sage" /> Mẹo phong cách
              </div>
              <p className="text-body-sm text-neutral-700 leading-relaxed">{item.stylingTips}</p>
            </div>
          )}

          {/* Color Suggestions */}
          {colors.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-label-sm font-semibold text-neutral-700 uppercase tracking-wide">
                <Palette className="w-3.5 h-3.5 text-brand-navy" /> Gợi ý màu sắc
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((c, i) => {
                  if (typeof c === 'string') {
                    return (
                      <span key={i} className="text-label-sm px-2.5 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-neutral-700">
                        {c}
                      </span>
                    );
                  }
                  return (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-50 border border-neutral-200 rounded-full">
                      <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: c.hex }} />
                      <span className="text-label-sm text-neutral-700">{c.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Outfit Combinations */}
          {outfits.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-label-sm font-semibold text-neutral-700 uppercase tracking-wide">
                <Heart className="w-3.5 h-3.5 text-semantic-error" /> Gợi ý outfit
              </div>
              <div className="space-y-2">
                {outfits.map((outfit, i) => {
                  if (typeof outfit === 'string') {
                    return (
                      <div key={i} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm text-neutral-700">
                        {outfit}
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                      <p className="text-label-sm font-semibold text-brand-navy mb-1.5">{outfit.name}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(outfit.items || []).map((item, j) => (
                          <span key={j} className="text-label-sm px-2 py-0.5 bg-white border border-neutral-200 rounded-full text-neutral-600">
                            {item.type}: {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Product reference */}
          {item.product && (
            <div className="flex items-center gap-3 p-3 bg-brand-cream/40 border border-neutral-200 rounded-xl">
              <ShoppingBag className="w-4 h-4 text-brand-navy shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-label-sm text-neutral-500">Sản phẩm được phân tích</p>
                <p className="text-body-sm font-medium text-neutral-900 truncate">{item.product.name}</p>
              </div>
              <Link href={`/products/${item.product.id}`} className="text-label-sm text-brand-navy font-medium hover:underline shrink-0">
                Xem →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function StylistHistoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { history, meta, isLoading, isError } = useStylistHistory(page, 12);
  const { deleteHistoryItem, isDeleting } = useDeleteStylistHistory();

  const filtered = history.filter(item => {
    const q = search.toLowerCase();
    return (
      !q ||
      item.personalColor?.toLowerCase().includes(q) ||
      item.bodyType?.toLowerCase().includes(q) ||
      item.occasion?.toLowerCase().includes(q) ||
      item.verdict?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-brand-cream pb-24">
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-12">

        {/* Back */}
        <div className="mb-4">
          <Link href="/profile" className="inline-flex items-center gap-1.5 text-body-sm text-neutral-500 hover:text-brand-navy transition-colors">
            <ChevronLeft className="w-4 h-4" /> Quay lại Hồ sơ
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-heading-h2 font-semibold text-neutral-900 flex items-center gap-3">
              Lịch sử AI Stylist
              {!isLoading && (
                <span className="text-label-md bg-neutral-200 text-neutral-600 px-2.5 py-0.5 rounded-full font-medium">
                  {meta?.total ?? filtered.length}
                </span>
              )}
            </h1>
            <p className="text-body-sm text-neutral-500 mt-1">Các lần tư vấn phong cách đã thực hiện với AI Gemini</p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo màu da, dịp, v.v..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-full text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all"
            />
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mb-6 bg-gradient-to-r from-brand-navy to-brand-navy/80 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-body-sm font-semibold text-white">Nhận tư vấn phong cách mới</p>
              <p className="text-label-sm text-white/70">AI phân tích dáng người, màu da và gợi ý outfit hoàn hảo</p>
            </div>
          </div>
          <Link href="/ai-stylist" className="w-full md:w-auto px-5 py-2.5 bg-brand-gold hover:bg-brand-gold/90 text-neutral-900 font-semibold text-label-md rounded-xl transition-colors text-center shrink-0">
            Thử ngay →
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-40">
            <div className="w-10 h-10 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-12 h-12 text-semantic-error mb-3" />
            <p className="text-body-md font-medium text-neutral-900 mb-1">Không thể tải lịch sử</p>
            <p className="text-body-sm text-neutral-500">Vui lòng thử lại sau</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-neutral-200 border-dashed">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-brand-navy/5 rounded-full animate-pulse" />
              <Sparkles className="w-12 h-12 text-neutral-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <Crown className="w-6 h-6 text-brand-gold absolute top-2 right-2" />
            </div>
            <h3 className="text-heading-h3 font-semibold text-neutral-900 mb-2">
              {search ? 'Không tìm thấy kết quả' : 'Chưa có lịch sử tư vấn'}
            </h3>
            <p className="text-body-md text-neutral-500 mb-8 max-w-md">
              {search
                ? 'Hãy thử từ khóa khác'
                : 'Hãy để AI Stylist phân tích ảnh của bạn và gợi ý những bộ trang phục phù hợp nhất!'}
            </p>
            {!search && (
              <Link href="/ai-stylist" className="px-6 py-3 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl text-label-md font-semibold transition-colors shadow-md flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Bắt đầu tư vấn
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(item => (
                <StylistCard
                  key={item.id}
                  item={item}
                  onDelete={(id) => deleteHistoryItem(id)}
                  isDeleting={isDeleting}
                />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && !search && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-body-sm border border-neutral-200 rounded-lg hover:bg-white disabled:opacity-40 transition-colors"
                >
                  ← Trước
                </button>
                <span className="text-body-sm text-neutral-500 px-2">
                  Trang {page} / {meta.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="px-4 py-2 text-body-sm border border-neutral-200 rounded-lg hover:bg-white disabled:opacity-40 transition-colors"
                >
                  Tiếp →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

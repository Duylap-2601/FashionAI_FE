'use client';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { fmtDate } from '@/features/stylist/services/format';
import type { StylistHistoryPanelProps } from '@/features/stylist/types/stylist-history-panel';
import { ChevronLeft, ChevronRight, Sparkles, Trash2 } from 'lucide-react';

/** Lịch sử tư vấn trong ngăn trượt: không chiếm chỗ dưới kết quả. */
export function StylistHistoryPanel({ open, onOpenChange, meta, history, selectedId, handleSelectHistoryItem, handleDeleteHistory, isDeleting, setPage, page }: StylistHistoryPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 gap-0 bg-brand-cream">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-neutral-200/80 bg-white">
          <SheetTitle className="text-body-lg font-semibold text-neutral-900">Lịch sử tư vấn</SheetTitle>
          <SheetDescription className="text-label-sm text-neutral-500">
            {meta?.total ?? history.length} lần tư vấn
          </SheetDescription>
        </SheetHeader>

        <ul className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {history.map((item) => {
            const outfitCount = item.outfits.length;
            const tags = [item.stylePreference, item.budget].filter(Boolean);
            return (
              <li key={item.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectHistoryItem(item)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSelectHistoryItem(item); }}
                  className={`group flex items-center gap-3 p-3 rounded-2xl border bg-white cursor-pointer transition-colors ${selectedId === item.id ? 'border-brand-navy/50' : 'border-neutral-200/80 hover:border-neutral-300'}`}
                >
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-brand-navy/10 text-brand-navy flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-semibold text-neutral-900 truncate">
                      {item.product?.name || item.occasion || 'Tư vấn outfit'}
                    </p>
                    <p className="text-label-sm text-neutral-500 truncate">
                      {[fmtDate(item.createdAt), outfitCount > 0 ? `${outfitCount} bộ phối` : null, ...tags].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteHistory(e, item)}
                    disabled={isDeleting}
                    type="button"
                    aria-label="Xoá kết quả"
                    className="p-2 rounded-full text-neutral-300 hover:text-semantic-error hover:bg-red-50 transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-neutral-200/80 bg-white">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              type="button"
              aria-label="Trang trước"
              className="w-9 h-9 rounded-xl border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-label-sm text-neutral-500">Trang {meta.page} / {meta.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              type="button"
              aria-label="Trang sau"
              className="w-9 h-9 rounded-xl border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

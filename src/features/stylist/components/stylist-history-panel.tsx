'use client';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { fmtDate } from '@/features/stylist/services/format';
import type { StylistHistoryPanelProps } from '@/features/stylist/types/stylist-history-panel';
import { ChevronLeft, ChevronRight, Sparkles, Trash2 } from 'lucide-react';

/** Lịch sử tư vấn trong ngăn trượt: không chiếm chỗ dưới kết quả. */
export function StylistHistoryPanel({ open, onOpenChange, meta, history, selectedId, handleSelectHistoryItem, handleDeleteHistory, isDeleting, setPage, page }: StylistHistoryPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 border-landing-line bg-landing-paper p-0 text-landing-obsidian sm:max-w-md">
        <SheetHeader className="gap-1 border-b border-landing-line/70 px-5 pb-4 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-landing-brass-ink">AI Stylist</p>
          <SheetTitle className="font-display text-2xl font-normal text-landing-obsidian">Lịch sử tư vấn</SheetTitle>
          <SheetDescription className="font-mono text-[11px] uppercase tracking-[0.16em] text-landing-muted">
            {meta?.total ?? history.length} lần tư vấn
          </SheetDescription>
        </SheetHeader>

        <ul className="flex flex-1 flex-col overflow-y-auto">
          {history.map((item) => {
            const outfitCount = item.outfits.length;
            const tags = [item.stylePreference, item.budget].filter(Boolean);
            return (
              <li key={item.id}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-current={selectedId === item.id ? 'true' : undefined}
                  onClick={() => handleSelectHistoryItem(item)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectHistoryItem(item); } }}
                  className={`group relative flex cursor-pointer items-center gap-3 border-b border-landing-line/70 px-5 py-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood focus-visible:-outline-offset-2 ${selectedId === item.id ? 'bg-landing-ivory before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-landing-oxblood' : 'hover:bg-landing-ivory/70'}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border border-landing-line text-landing-oxblood" aria-hidden="true">
                    <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-landing-obsidian">
                      {item.product?.name || item.occasion || 'Tư vấn outfit'}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-landing-muted">
                      {[fmtDate(item.createdAt), outfitCount > 0 ? `${outfitCount} bộ phối` : null, ...tags].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteHistory(e, item)}
                    disabled={isDeleting}
                    type="button"
                    aria-label="Xoá kết quả"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] text-landing-muted transition-colors hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-landing-line/70 px-5 py-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              type="button"
              aria-label="Trang trước"
              className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-landing-line text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-landing-muted">Trang {meta.page} / {meta.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              type="button"
              aria-label="Trang sau"
              className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-landing-line text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

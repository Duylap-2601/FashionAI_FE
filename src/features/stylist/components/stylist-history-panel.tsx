'use client';

import { fmtDate } from '@/features/stylist/services/format';
import type { StylistHistoryPanelProps } from '@/features/stylist/types/stylist-history-panel';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  History as HistoryIcon,
  Sparkles,
  Trash2
} from 'lucide-react';

export function StylistHistoryPanel({ setHistoryOpen, historyOpen, meta, history, handleSelectHistoryItem, handleDeleteHistory, isDeleting, setPage, page }: StylistHistoryPanelProps) {
  return (
    <div className="mt-12 border-t border-neutral-200 pt-8">
      <button
        onClick={() => setHistoryOpen(!historyOpen)}
        type="button"
        className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200 shadow-sm hover:bg-neutral-50 transition-colors border-0 cursor-pointer"
      >
        <div className="flex items-center gap-2 text-label-md font-bold text-neutral-900">
          <HistoryIcon className="w-5 h-5 text-neutral-500" /> Lịch sử tư vấn phong cách ({meta?.total ?? history.length})
        </div>
        {historyOpen ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
      </button>

      {historyOpen && (
        <div className="mt-4 bg-white rounded-xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100 animate-in slide-in-from-top-2 duration-250">
          {history.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 cursor-pointer">
              <div
                className="flex items-center gap-4 flex-1 min-w-0"
                onClick={() => handleSelectHistoryItem(item)}
              >
                <div className="w-10 h-10 rounded bg-brand-navy/5 flex items-center justify-center text-brand-navy shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-label-sm font-semibold text-neutral-900 truncate">
                    {item.product?.name || item.occasion || 'Tư vấn outfit'}
                  </div>
                  <div className="text-body-sm text-neutral-500">
                    {fmtDate(item.createdAt)}
                    {item.productCompatibilityScore !== null && item.productCompatibilityScore !== undefined
                      ? ` • ${item.productCompatibilityScore}%`
                      : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleSelectHistoryItem(item)}
                  type="button"
                  className="text-label-sm font-bold text-brand-navy hover:underline border-0 bg-transparent cursor-pointer"
                >
                  Xem lại
                </button>
                <button
                  onClick={(e) => handleDeleteHistory(e, item)}
                  disabled={isDeleting}
                  type="button"
                  className="p-2 rounded-full text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors border-0 bg-transparent cursor-pointer"
                  title="Xóa kết quả"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 p-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                type="button"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-label-sm font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Trước
              </button>
              <span className="text-label-sm text-neutral-500">
                Trang {meta.page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                type="button"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-label-sm font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Sau <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

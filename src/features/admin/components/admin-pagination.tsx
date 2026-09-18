'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import React from 'react';

export interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  isFetching?: boolean;
  disabled?: boolean;
}

function getPaginationItems(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
  const items: Array<number | 'ellipsis'> = [];

  sortedPages.forEach((page, index) => {
    const previous = sortedPages[index - 1];
    if (previous && page - previous > 1) {
      items.push('ellipsis');
    }
    items.push(page);
  });

  return items;
}

export function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  itemLabel = 'mục',
  isFetching = false,
  disabled = false,
}: AdminPaginationProps) {
  if (totalItems === 0) return null;

  const isBusy = isFetching || disabled;
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="p-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white shrink-0">
      {/* Left: Item range summary */}
      <div className="flex items-center gap-2 text-body-sm text-neutral-500">
        <span>
          Hiển thị <strong className="font-semibold text-neutral-900">{startItem}</strong> -{' '}
          <strong className="font-semibold text-neutral-900">{endItem}</strong> trong{' '}
          <strong className="font-semibold text-neutral-900">{totalItems}</strong> {itemLabel}
        </span>

        {/* Page size selector */}
        {onPageSizeChange && (
          <div className="ml-3 flex items-center gap-1.5 border-l border-neutral-200 pl-3">
            <span className="text-xs text-neutral-400">Số lượng:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              disabled={isBusy}
              className="text-xs font-semibold text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 focus:outline-none focus:border-brand-navy cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            type="button"
            disabled={currentPage <= 1 || isBusy}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Trang trước"
            aria-label="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          {getPaginationItems(currentPage, totalPages).map((item, index) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-8 inline-flex items-center justify-center text-neutral-400 text-xs"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </span>
            ) : (
              <button
                key={item}
                type="button"
                disabled={isBusy}
                onClick={() => onPageChange(item)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                  item === currentPage
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300'
                } disabled:cursor-wait`}
              >
                {item}
              </button>
            )
          )}

          {/* Next Button */}
          <button
            type="button"
            disabled={currentPage >= totalPages || isBusy}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Trang sau"
            aria-label="Trang sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

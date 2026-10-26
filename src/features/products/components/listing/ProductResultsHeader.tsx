import { cn } from '@/components/ui/utils';
import type { ProductResultsHeaderProps } from '@/features/products/types/product-results-header';
import { X } from 'lucide-react';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';

export function ProductResultsHeader({
  filteredCount,
  isLoading,
  currentPage,
  totalPages,
  showPageIndex,
  activeChips,
  onClearAll,
}: ProductResultsHeaderProps) {
  return (
    <div className="mb-8 border-b border-landing-line/70 pb-4">
      <div className="flex items-baseline justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-landing-muted">
        <p aria-live="polite">
          {isLoading ? 'Đang tải sản phẩm' : (
            <>
              <span className="text-landing-obsidian">{filteredCount}</span> sản phẩm
            </>
          )}
        </p>
        {showPageIndex && totalPages > 1 ? (
          <p>
            Trang <span className="text-landing-obsidian">{currentPage}</span> / {totalPages}
          </p>
        ) : null}
      </div>

      {activeChips.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={chip.onRemove}
              aria-label={`Bỏ lọc ${chip.label}`}
              className={cn('inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-landing-line bg-landing-ivory/70 px-2.5 text-xs text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood', focusRing)}
            >
              {chip.label}
              <X className="h-3 w-3" strokeWidth={1.75} />
            </button>
          ))}
          <button
            type="button"
            onClick={onClearAll}
            className={cn('ml-1 h-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-oxblood underline-offset-4 transition-colors hover:underline', focusRing)}
          >
            Xoá tất cả
          </button>
        </div>
      ) : null}
    </div>
  );
}

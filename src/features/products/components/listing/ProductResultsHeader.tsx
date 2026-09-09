import type { ProductResultsHeaderProps } from '@/features/products/types/product-results-header';
import { ArrowUpDown, SlidersHorizontal, X } from 'lucide-react';

export function ProductResultsHeader({ filteredCount, activeChips, onOpenFilters, onOpenSort, onClearAll }: ProductResultsHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6 flex-wrap min-h-[32px]">
      <span className="text-body-sm font-medium text-neutral-900">{filteredCount} sản phẩm</span>

      <div className="ml-auto flex items-center gap-3 md:hidden">
        <button onClick={onOpenSort} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#5D1C34] underline underline-offset-4">
          <ArrowUpDown className="w-3.5 h-3.5" /> Sắp xếp
        </button>
        <button onClick={onOpenFilters} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#5D1C34] underline underline-offset-4">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Lọc
        </button>
      </div>

      {activeChips.length > 0 && (
        <>
          <div className="hidden md:block w-px h-4 bg-neutral-300 mx-1"></div>
          {activeChips.map(chip => (
            <div key={chip.id} onClick={chip.onRemove} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-full text-[12px] font-medium text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer">
              {chip.label} <X className="w-3 h-3 text-neutral-500 hover:text-neutral-900" />
            </div>
          ))}
          <button onClick={onClearAll} className="hidden md:inline text-[12px] font-semibold text-brand-navy hover:underline ml-2">
            Xoá tất cả
          </button>
        </>
      )}
    </div>
  );
}

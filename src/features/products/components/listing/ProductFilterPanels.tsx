import { FilterSections } from '@/features/products/components/listing/FilterSections';
import type { FilterPanelProps, SortPanelProps } from '@/features/products/types/product-filter-panels';
import type { SortBy } from '@/features/products/types/product-filters';
import { Check, X } from 'lucide-react';

const SORT_OPTIONS: SortBy[] = ['Mới nhất', 'Giá thấp đến cao', 'Giá cao đến thấp'];

export function MobileFilterSheet(props: FilterPanelProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end md:hidden">
      <div className="absolute inset-0 bg-black/40 animate-in fade-in" onClick={props.onClose} />
      <div className="relative z-10 w-full max-h-[82vh] rounded-t-3xl bg-white shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <div>
            <h2 className="font-bold text-brand-navy">Bộ lọc</h2>
            <p className="text-[12px] text-neutral-500">Tinh chỉnh sản phẩm hiển thị</p>
          </div>
          <button onClick={props.onClose} className="p-2 -mr-2 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-brand-navy transition-colors" aria-label="Đóng bộ lọc">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
          {props.activeChips.length > 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-label-sm font-semibold text-brand-navy">Đang lọc</h3>
                <button onClick={props.onClearAll} className="shrink-0 text-[12px] font-semibold text-[#5D1C34] underline underline-offset-4">
                  Xoá tất cả
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {props.activeChips.map(chip => (
                  <button key={chip.id} type="button" onClick={chip.onRemove} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 shadow-sm ring-1 ring-neutral-200">
                    {chip.label} <X className="w-3 h-3 text-neutral-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <FilterSections {...props} mobile />
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-neutral-200 bg-white p-4">
          <button onClick={props.onClearAll} className="h-12 rounded-xl border border-neutral-200 text-body-sm font-semibold text-neutral-700">
            Xoá tất cả
          </button>
          <button onClick={props.onClose} className="h-12 rounded-xl bg-brand-navy text-body-sm font-semibold text-white shadow-sm">
            Áp dụng ({props.filteredCount})
          </button>
        </div>
      </div>
    </div>
  );
}

export function DesktopFilterSidebar(props: Omit<FilterPanelProps, 'activeChips'>) {
  return (
    <div className="w-[260px] shrink-0 pr-8 hidden md:block animate-in slide-in-from-left-8 duration-300 border-r border-neutral-100 min-h-[calc(100vh-200px)] sticky top-[136px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-brand-navy">Bộ lọc</h2>
        <button onClick={props.onClearAll} className="text-[12px] text-neutral-500 hover:text-brand-navy hover:underline">
          Xoá tất cả
        </button>
      </div>

      <div className="flex flex-col gap-8">
        <FilterSections {...props} />
        <button onClick={props.onClose} className="w-full py-3 mt-4 bg-brand-navy text-white text-body-sm font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors shadow-sm">
          Áp dụng ({props.filteredCount} sản phẩm)
        </button>
      </div>
    </div>
  );
}

export function MobileSortSheet({ sortBy, onClose, onSortChange }: SortPanelProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end md:hidden">
      <div className="absolute inset-0 bg-black/40 animate-in fade-in" onClick={onClose} />
      <div className="relative z-10 w-full rounded-t-3xl bg-white shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <div>
            <h2 className="font-bold text-brand-navy">Sắp xếp</h2>
            <p className="text-[12px] text-neutral-500">Chọn thứ tự hiển thị sản phẩm</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-brand-navy transition-colors" aria-label="Đóng sắp xếp">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="flex flex-col gap-2">
            {SORT_OPTIONS.map(option => {
              const isActive = sortBy === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onSortChange(option);
                    onClose();
                  }}
                  className={`flex h-12 items-center justify-between rounded-xl border px-4 text-left text-body-sm font-semibold transition-colors ${
                    isActive ? 'border-brand-navy bg-brand-navy/5 text-brand-navy' : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {option}
                  {isActive && <Check className="w-4 h-4 text-brand-navy" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

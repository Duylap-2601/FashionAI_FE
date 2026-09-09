import { CategoryTabs } from '@/features/products/components/listing/CategoryTabs';
import type { SortBy } from '@/features/products/types/product-filters';
import type { ProductToolbarProps } from '@/features/products/types/product-toolbar';
import { LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';

export function ProductToolbar({
  categories,
  activeTab,
  searchQuery,
  isSidebarOpen,
  sortBy,
  onSelectTab,
  onSearchChange,
  onToggleSidebar,
  onSortChange,
}: ProductToolbarProps) {
  return (
    <div className="sticky top-[56px] md:top-[64px] z-40 bg-white border-b border-neutral-200 px-4 md:px-8 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
      <CategoryTabs categories={categories} activeTab={activeTab} onSelect={onSelectTab} mobile />
      <CategoryTabs categories={categories} activeTab={activeTab} onSelect={onSelectTab} />

      <div className="flex w-full items-center justify-between gap-3 md:ml-auto md:w-auto md:justify-end">
        <div className="relative hidden md:block w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full h-10 pl-9 pr-4 bg-neutral-50 border border-transparent rounded-full text-body-sm focus:bg-white focus:border-neutral-300 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={onToggleSidebar}
          className={`hidden h-10 px-4 rounded-full border text-label-sm font-medium items-center gap-2 transition-colors md:flex ${isSidebarOpen ? 'border-brand-navy bg-brand-navy text-white' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
        >
          <SlidersHorizontal className="w-4 h-4" /> Lọc
        </button>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortBy)}
          className="h-10 px-4 pr-8 rounded-full border border-neutral-200 text-label-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors appearance-none cursor-pointer focus:outline-none focus:border-brand-navy hidden md:block bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat"
        >
          <option value="Mới nhất">Mới nhất</option>
          <option value="Giá thấp đến cao">Giá thấp đến cao</option>
          <option value="Giá cao đến thấp">Giá cao đến thấp</option>
        </select>

        <div className="hidden lg:flex items-center gap-1 bg-neutral-100 p-1 rounded-full border border-neutral-200">
          <button className="p-1.5 bg-white shadow-sm rounded-full text-brand-navy"><LayoutGrid className="w-4 h-4" /></button>
          <button className="p-1.5 text-neutral-500 hover:text-brand-navy"><List className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}

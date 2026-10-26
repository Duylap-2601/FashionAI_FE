import { cn } from '@/components/ui/utils';
import { CategoryTabs } from '@/features/products/components/listing/CategoryTabs';
import { SORT_OPTIONS } from '@/features/products/constants/product-filters';
import type { SortBy } from '@/features/products/types/product-filters';
import type { ProductToolbarProps } from '@/features/products/types/product-toolbar';
import { ArrowUpDown, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useId } from 'react';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';

export function ProductToolbar({
  categories,
  activeTab,
  searchQuery,
  isFilterOpen,
  activeFilterCount,
  sortBy,
  onSelectTab,
  onSearchChange,
  onToggleFilters,
  onOpenSort,
  onSortChange,
}: ProductToolbarProps) {
  const searchId = useId();
  const sortId = useId();

  return (
    // Header landing cao 72px + 1px viền, toolbar dính ngay dưới và dùng chung viền đó.
    // Dưới xl: hai hàng (tìm kiếm và nút, rồi tab), cao 105px. Từ xl: một hàng, cao 57px.
    <div className="sticky top-[72px] z-40 border-b border-landing-line/70 bg-landing-paper/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-1 px-4 pt-3 md:px-8 xl:flex-row xl:items-center xl:gap-6 xl:pt-0">
        <div className="min-w-0 xl:flex-1">
          <CategoryTabs categories={categories} activeTab={activeTab} onSelect={onSelectTab} />
        </div>

        <div className="order-first flex items-center gap-2 xl:order-none xl:shrink-0">
          <div className="relative min-w-0 flex-1 md:max-w-[420px] xl:w-[188px] xl:flex-none 2xl:w-[240px]">
            <label htmlFor={searchId} className="sr-only">Tìm sản phẩm</label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-muted"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Tìm sản phẩm"
              autoComplete="off"
              className={cn(
                'h-11 w-full rounded-[2px] border border-landing-line bg-landing-ivory/70 pl-9 pr-10 text-sm text-landing-obsidian placeholder:text-landing-muted transition-colors hover:border-landing-brass',
                '[&::-webkit-search-cancel-button]:appearance-none',
                focusRing,
              )}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Xoá từ khoá tìm kiếm"
                className={cn('absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-landing-muted transition-colors hover:text-landing-oxblood', focusRing)}
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onToggleFilters}
            aria-expanded={isFilterOpen}
            className={cn(
              'inline-flex h-11 shrink-0 items-center gap-2 rounded-[2px] border px-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors',
              isFilterOpen
                ? 'border-landing-oxblood bg-landing-oxblood text-landing-paper'
                : 'border-landing-obsidian/70 text-landing-obsidian hover:border-landing-oxblood hover:text-landing-oxblood',
              focusRing,
            )}
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
            <span className="md:hidden">Lọc</span>
            <span className="hidden md:inline">Bộ lọc</span>
            {activeFilterCount > 0 ? (
              <span className="font-mono text-[11px] tracking-normal">({activeFilterCount})</span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={onOpenSort}
            aria-label={`Sắp xếp, đang chọn ${sortBy}`}
            className={cn('inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] border border-landing-obsidian/70 text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood md:hidden', focusRing)}
          >
            <ArrowUpDown className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <div className="relative hidden md:block">
            <label htmlFor={sortId} className="sr-only">Sắp xếp</label>
            <select
              id={sortId}
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as SortBy)}
              className={cn(
                'h-11 cursor-pointer appearance-none rounded-[2px] border border-landing-line bg-transparent pl-3.5 pr-9 text-[13px] font-medium text-landing-obsidian transition-colors hover:border-landing-brass',
                focusRing,
              )}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-muted"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

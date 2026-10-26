import { cn } from '@/components/ui/utils';
import { AVAILABLE_COLORS, PRICE_FILTER } from '@/features/products/constants/product-filters';
import type { FilterSectionProps } from '@/features/products/types/filter-sections';
import { Check } from 'lucide-react';
import React, { useId } from 'react';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';

function formatVnd(value: number) {
  return `${value.toLocaleString('vi-VN')} ₫`;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="border-t border-landing-line/70 py-6 first:border-t-0 first:pt-0">
      <h3 id={headingId} className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SubCategoryFilter({ subCategoryCounts, selectedSubCategories, onToggleSubCategory }: Pick<FilterSectionProps, 'subCategoryCounts' | 'selectedSubCategories' | 'onToggleSubCategory'>) {
  return (
    <FilterGroup title="Danh mục">
      <ul className="flex flex-col">
        {subCategoryCounts.map((item) => {
          const isChecked = selectedSubCategories.includes(item.name);
          return (
            <li key={item.name}>
              <label className="group flex min-h-11 cursor-pointer items-center gap-3 text-sm text-landing-obsidian/80 transition-colors hover:text-landing-obsidian">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleSubCategory(item.name)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border transition-colors',
                    'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-landing-oxblood',
                    isChecked
                      ? 'border-landing-oxblood bg-landing-oxblood text-landing-paper'
                      : 'border-landing-obsidian/40 group-hover:border-landing-oxblood',
                  )}
                >
                  {isChecked ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
                </span>
                <span className={cn('flex-1', isChecked && 'font-medium text-landing-obsidian')}>{item.name}</span>
                {typeof item.count === 'number' ? (
                  <span className="font-mono text-[11px] text-landing-muted">{item.count}</span>
                ) : null}
              </label>
            </li>
          );
        })}
      </ul>
    </FilterGroup>
  );
}

function ColorFilter({ selectedColors, onToggleColor }: Pick<FilterSectionProps, 'selectedColors' | 'onToggleColor'>) {
  return (
    <FilterGroup title="Màu sắc">
      <div className="grid grid-cols-3 gap-x-2 gap-y-3">
        {AVAILABLE_COLORS.map((swatch) => {
          const isSelected = selectedColors.includes(swatch.name);
          return (
            <button
              key={swatch.name}
              type="button"
              onClick={() => onToggleColor(swatch.name)}
              aria-pressed={isSelected}
              className={cn('group flex min-h-11 flex-col items-center gap-2 py-1 text-[11px] transition-colors', focusRing)}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full ring-offset-[3px] ring-offset-landing-paper transition-shadow',
                  swatch.light && 'border border-landing-taupe',
                  isSelected ? 'ring-1 ring-landing-oxblood' : 'group-hover:ring-1 group-hover:ring-landing-line',
                )}
                style={{ backgroundColor: swatch.color }}
              >
                {isSelected ? (
                  <Check
                    className={cn('h-3.5 w-3.5', swatch.light ? 'text-landing-obsidian' : 'text-landing-paper')}
                    strokeWidth={2.25}
                  />
                ) : null}
              </span>
              <span className={isSelected ? 'font-semibold text-landing-obsidian' : 'text-landing-muted group-hover:text-landing-obsidian'}>
                {swatch.name}
              </span>
            </button>
          );
        })}
      </div>
    </FilterGroup>
  );
}

function PriceFilter({ currentPriceRange, maxPriceLimit, onPriceChange }: Pick<FilterSectionProps, 'currentPriceRange' | 'maxPriceLimit' | 'onPriceChange'>) {
  const inputId = useId();
  const isUnlimited = currentPriceRange >= maxPriceLimit;
  const valueLabel = isUnlimited ? 'Mọi mức giá' : `Dưới ${formatVnd(currentPriceRange)}`;

  return (
    <FilterGroup title="Khoảng giá">
      <label htmlFor={inputId} className="mb-3 block font-mono text-[13px] text-landing-obsidian">
        {valueLabel}
      </label>
      <input
        id={inputId}
        type="range"
        min={PRICE_FILTER.min}
        max={maxPriceLimit}
        step={PRICE_FILTER.step}
        value={currentPriceRange}
        onChange={(event) => onPriceChange(Number(event.target.value))}
        aria-valuetext={valueLabel}
        className={cn('h-6 w-full cursor-pointer accent-landing-oxblood', focusRing)}
      />
      <div aria-hidden="true" className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-landing-muted">
        <span>{formatVnd(PRICE_FILTER.min)}</span>
        <span>{formatVnd(maxPriceLimit)}</span>
      </div>
    </FilterGroup>
  );
}

export function FilterSections(props: FilterSectionProps) {
  return (
    <div>
      <SubCategoryFilter
        subCategoryCounts={props.subCategoryCounts}
        selectedSubCategories={props.selectedSubCategories}
        onToggleSubCategory={props.onToggleSubCategory}
      />
      <ColorFilter selectedColors={props.selectedColors} onToggleColor={props.onToggleColor} />
      <PriceFilter
        currentPriceRange={props.currentPriceRange}
        maxPriceLimit={props.maxPriceLimit}
        onPriceChange={props.onPriceChange}
      />
    </div>
  );
}

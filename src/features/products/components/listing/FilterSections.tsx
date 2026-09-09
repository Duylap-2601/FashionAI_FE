import { AVAILABLE_COLORS } from '@/features/products/constants/product-filters';
import type { FilterSectionProps } from '@/features/products/types/filter-sections';
import { Check } from 'lucide-react';

function PriceFilter({ currentPriceRange, maxPriceLimit, onPriceChange }: Pick<FilterSectionProps, 'currentPriceRange' | 'maxPriceLimit' | 'onPriceChange'>) {
  return (
    <div>
      <h3 className="text-label-sm font-semibold mb-3">Khoảng giá tối đa</h3>
      <input
        type="range"
        min={200000}
        max={maxPriceLimit}
        step={100000}
        value={currentPriceRange}
        onChange={(e) => onPriceChange(Number(e.target.value))}
        className="w-full accent-brand-navy cursor-pointer"
      />
      <div className="text-[13px] font-medium text-neutral-600 text-center mt-2">
        Dưới {currentPriceRange.toLocaleString('vi-VN')}đ
      </div>
    </div>
  );
}

function ColorFilter({ selectedColors, onToggleColor, mobile = false }: Pick<FilterSectionProps, 'selectedColors' | 'onToggleColor' | 'mobile'>) {
  return (
    <div>
      <h3 className="text-label-sm font-semibold mb-4">Màu sắc</h3>
      <div className={mobile ? 'grid grid-cols-6 gap-3' : 'grid grid-cols-5 gap-3'}>
        {AVAILABLE_COLORS.map(c => {
          const isSelected = selectedColors.includes(c.name);
          return mobile ? (
            <button key={c.name} type="button" onClick={() => onToggleColor(c.name)} className="flex flex-col items-center gap-1.5 text-[11px] text-neutral-600">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${c.border ? 'border border-neutral-300' : ''} ${isSelected ? 'ring-2 ring-brand-navy ring-offset-2' : ''}`} style={{ backgroundColor: c.color }}>
                {isSelected && <Check className={`w-3.5 h-3.5 ${c.color === '#FFFFFF' ? 'text-black' : 'text-white'}`} />}
              </span>
              <span>{c.name}</span>
            </button>
          ) : (
            <div key={c.name} onClick={() => onToggleColor(c.name)} className="relative group cursor-pointer flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${c.border ? 'border border-neutral-300' : ''} ${isSelected ? 'ring-2 ring-brand-navy ring-offset-2' : ''}`} style={{ backgroundColor: c.color }}>
                {isSelected && <Check className={`w-3.5 h-3.5 ${c.color === '#FFFFFF' ? 'text-black' : 'text-white'}`} />}
              </div>
              <div className="absolute -top-8 bg-brand-navy text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {c.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubCategoryFilter({ subCategoryCounts, selectedSubCategories, onToggleSubCategory, mobile = false }: Pick<FilterSectionProps, 'subCategoryCounts' | 'selectedSubCategories' | 'onToggleSubCategory' | 'mobile'>) {
  return (
    <div>
      <h3 className="text-label-sm font-semibold mb-4">{mobile ? 'Danh mục chi tiết' : 'Danh mục'}</h3>
      <div className={mobile ? 'grid grid-cols-1 gap-2.5' : 'flex flex-col gap-3'}>
        {subCategoryCounts.map(item => {
          const isChecked = selectedSubCategories.includes(item.name);
          const checkBox = (
            <span className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${isChecked ? 'bg-brand-navy border-brand-navy' : 'border-neutral-300 bg-white'}`}>
              {isChecked && <Check className="w-3 h-3 text-white" />}
            </span>
          );

          return mobile ? (
            <button key={item.name} type="button" onClick={() => onToggleSubCategory(item.name)} className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left transition-colors ${isChecked ? 'border-brand-navy bg-brand-navy/5' : 'border-neutral-200 bg-white'}`}>
              <span className="flex items-center gap-3 text-body-sm font-medium text-neutral-700">{checkBox}{item.name}</span>
              <span className="text-[12px] text-neutral-400">({item.count})</span>
            </button>
          ) : (
            <label key={item.name} onClick={() => onToggleSubCategory(item.name)} className="flex items-center justify-between cursor-pointer group">
              <span className="flex items-center gap-3">
                {checkBox}
                <span className="text-body-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{item.name}</span>
              </span>
              <span className="text-[12px] text-neutral-400">({item.count})</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function FilterSections(props: FilterSectionProps) {
  return (
    <>
      <PriceFilter {...props} />
      <ColorFilter selectedColors={props.selectedColors} onToggleColor={props.onToggleColor} mobile={props.mobile} />
      <SubCategoryFilter
        subCategoryCounts={props.subCategoryCounts}
        selectedSubCategories={props.selectedSubCategories}
        onToggleSubCategory={props.onToggleSubCategory}
        mobile={props.mobile}
      />
    </>
  );
}

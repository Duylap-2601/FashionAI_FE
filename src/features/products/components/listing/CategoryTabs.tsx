import type { CategoryTabsProps } from '@/features/products/types/category-tabs';

export function CategoryTabs({ categories, activeTab, onSelect, mobile = false }: CategoryTabsProps) {
  if (mobile) {
    return (
      <div className="flex w-full items-center gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map(tab => {
          const isActive = activeTab === tab.label;
          return (
            <button
              key={tab.label}
              onClick={() => onSelect(tab.label)}
              className={`relative flex shrink-0 snap-start flex-col items-center gap-1 px-1 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-colors ${isActive ? 'text-[#5D1C34]' : 'text-neutral-500'}`}
            >
              <span>{tab.label} ({tab.count})</span>
              <span className={`h-1 w-1 rounded-full transition-opacity ${isActive ? 'bg-[#5D1C34] opacity-100' : 'opacity-0'}`} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar">
      {categories.map(tab => (
        <button
          key={tab.label}
          onClick={() => onSelect(tab.label)}
          className={`px-4 py-2 text-label-sm font-medium shrink-0 rounded-full whitespace-nowrap transition-colors ${activeTab === tab.label
              ? 'bg-brand-navy text-white shadow-sm'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}

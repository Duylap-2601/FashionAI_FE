import { cn } from '@/components/ui/utils';
import type { CategoryTabsProps } from '@/features/products/types/category-tabs';

export function CategoryTabs({ categories, activeTab, onSelect }: CategoryTabsProps) {
  return (
    <div
      role="group"
      aria-label="Loại trang phục"
      className="-mx-4 flex min-w-0 items-center gap-6 overflow-x-auto px-4 [scrollbar-width:none] max-xl:[mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)] md:-mx-8 md:px-8 xl:mx-0 xl:gap-[18px] xl:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {categories.map((tab) => {
        const isActive = activeTab === tab.label;
        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => onSelect(tab.label)}
            aria-pressed={isActive}
            className={cn(
              'relative h-11 shrink-0 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors xl:h-14',
              'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-landing-oxblood',
              isActive
                ? 'text-landing-oxblood after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-landing-oxblood'
                : 'text-landing-muted hover:text-landing-obsidian',
            )}
          >
            {tab.label}
            {typeof tab.count === 'number' ? (
              <sup className="ml-1 font-mono text-[9px] font-medium tracking-normal">{tab.count}</sup>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

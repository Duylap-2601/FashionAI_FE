'use client';

import { cn } from '@/components/ui/utils';
import { FilterSections } from '@/features/products/components/listing/FilterSections';
import { SORT_OPTIONS } from '@/features/products/constants/product-filters';
import type {
  DesktopFilterSidebarProps,
  MobileFilterSheetProps,
  MobileSortSheetProps,
} from '@/features/products/types/product-filter-panels';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, X } from 'lucide-react';
import React from 'react';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';
const labelText = 'text-[11px] font-semibold uppercase tracking-[0.16em]';

interface MobileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Nằm trên thanh tab dưới (z-[90]) nên overlay và sheet dùng z-[100]+.
function MobileSheet({ open, onOpenChange, eyebrow, title, children, footer }: MobileSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-landing-obsidian/45 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-[101] flex max-h-[85svh] flex-col border-t border-landing-line bg-landing-paper text-landing-obsidian duration-300 data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom"
        >
          <div className="flex items-start justify-between gap-4 border-b border-landing-line/70 px-4 pb-4 pt-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-landing-brass-ink">{eyebrow}</p>
              <Dialog.Title className="mt-1.5 font-display text-2xl leading-tight text-landing-obsidian">{title}</Dialog.Title>
            </div>
            <Dialog.Close
              aria-label="Đóng"
              className={cn('-mr-2 flex h-11 w-11 items-center justify-center text-landing-muted transition-colors hover:text-landing-oxblood', focusRing)}
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6">{children}</div>
          {footer ? (
            <div className="border-t border-landing-line/70 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">{footer}</div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function MobileFilterSheet({ open, activeChips, filteredCount, onOpenChange, onClearAll, ...sectionProps }: MobileFilterSheetProps) {
  return (
    <MobileSheet
      open={open}
      onOpenChange={onOpenChange}
      eyebrow="Tinh chỉnh"
      title="Bộ lọc"
      footer={(
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClearAll}
            disabled={activeChips.length === 0}
            className={cn('h-12 rounded-[2px] border border-landing-obsidian/70 text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood disabled:opacity-50', labelText, focusRing)}
          >
            Xoá tất cả
          </button>
          <Dialog.Close
            className={cn('h-12 rounded-[2px] bg-landing-obsidian text-landing-paper transition-colors hover:bg-landing-oxblood', labelText, focusRing)}
          >
            Xem {filteredCount} sản phẩm
          </Dialog.Close>
        </div>
      )}
    >
      {activeChips.length > 0 ? (
        <div className="mb-6 border-b border-landing-line/70 pb-6">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink">Đang lọc</p>
          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={chip.onRemove}
                aria-label={`Bỏ lọc ${chip.label}`}
                className={cn('inline-flex h-9 items-center gap-1.5 rounded-[2px] border border-landing-line bg-landing-ivory/70 px-3 text-xs text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood', focusRing)}
              >
                {chip.label}
                <X className="h-3 w-3" strokeWidth={1.75} />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <FilterSections {...sectionProps} />
    </MobileSheet>
  );
}

export function DesktopFilterSidebar({ hasActiveFilters, onClearAll, ...sectionProps }: DesktopFilterSidebarProps) {
  return (
    // Toolbar dính ở 72px, cao 105px (dưới xl) hoặc 57px (từ xl); sidebar dính ngay dưới, chừa 24px.
    <aside
      aria-label="Bộ lọc sản phẩm"
      className="sticky top-[201px] mr-8 hidden max-h-[calc(100svh-225px)] w-[232px] xl:top-[153px] xl:max-h-[calc(100svh-177px)] shrink-0 overflow-y-auto border-r border-landing-line/70 pr-6 duration-200 animate-in fade-in-0 [scrollbar-width:thin] md:block lg:mr-10 lg:w-[248px]"
    >
      <div className="mb-6 flex min-h-6 items-center justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-landing-obsidian">Bộ lọc</h2>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClearAll}
            className={cn('text-landing-oxblood underline-offset-4 transition-colors hover:underline', labelText, focusRing)}
          >
            Xoá tất cả
          </button>
        ) : null}
      </div>
      <FilterSections {...sectionProps} />
    </aside>
  );
}

export function MobileSortSheet({ open, sortBy, onOpenChange, onSortChange }: MobileSortSheetProps) {
  return (
    <MobileSheet open={open} onOpenChange={onOpenChange} eyebrow="Thứ tự hiển thị" title="Sắp xếp">
      <div className="-mt-2 flex flex-col">
        {SORT_OPTIONS.map((option) => {
          const isActive = sortBy === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                onSortChange(option);
                onOpenChange(false);
              }}
              className={cn(
                'flex h-14 items-center justify-between border-b border-landing-line/60 text-left text-sm transition-colors last:border-b-0',
                isActive ? 'font-semibold text-landing-oxblood' : 'text-landing-obsidian hover:text-landing-oxblood',
                focusRing,
              )}
            >
              {option}
              {isActive ? <Check className="h-4 w-4" strokeWidth={2} /> : null}
            </button>
          );
        })}
      </div>
    </MobileSheet>
  );
}

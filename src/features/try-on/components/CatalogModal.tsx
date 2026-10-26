'use client';

import { toBackendCategory } from '@/features/products/services/products-utils';
import { tryOnFocusRing, tryOnLabelClassName } from '@/features/try-on/components/garment-slot';
import type { CatalogModalProps } from '@/features/try-on/types/catalog-modal';
import type { ProductPickerCategory } from '@/features/try-on/types/try-on-types';
import { cn } from '@/lib/utils';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, Search, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const CATEGORIES: { id: ProductPickerCategory; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'UPPER', label: 'Áo / Blazer' },
  { id: 'LOWER', label: 'Quần / Váy' },
  { id: 'FULL_BODY', label: 'Bộ liền' },
];

export function CatalogModal({ isOpen, onClose, onSelectProduct, products, currentProductId, initialCategory = 'ALL' }: CatalogModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<ProductPickerCategory>(initialCategory);

  useEffect(() => {
    if (isOpen) setSelectedCat(initialCategory);
  }, [isOpen, initialCategory]);

  const query = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
    if (!matchesSearch) return false;
    if (selectedCat === 'ALL') return true;
    const cat = p.garmentCategory || toBackendCategory(p.category);
    return cat === selectedCat;
  });

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        {/* Nằm trên thanh tab dưới (z-[90]) và thanh điều khiển thử trực tiếp trên mobile. */}
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-landing-obsidian/45 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-[101] flex max-h-[90svh] flex-col overflow-hidden border-t border-landing-line bg-landing-paper text-landing-obsidian data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[84vh] sm:w-[calc(100%-2rem)] sm:max-w-[640px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border">
          <div className="flex items-start justify-between gap-4 border-b border-landing-line/70 px-5 pb-4 pt-5">
            <div>
              <p className={tryOnLabelClassName}>Phòng thử</p>
              <Dialog.Title className="mt-1.5 font-display text-2xl leading-tight">Chọn trang phục</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-landing-muted">Chỉ gồm sản phẩm đang bán trong cửa hàng.</Dialog.Description>
            </div>
            <Dialog.Close aria-label="Đóng" className={cn('-mr-2 flex h-11 w-11 items-center justify-center text-landing-muted transition-colors hover:text-landing-oxblood', tryOnFocusRing)}>
              <X className="h-5 w-5" strokeWidth={1.75} />
            </Dialog.Close>
          </div>

          <div className="border-b border-landing-line/70 px-5 pt-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-muted" strokeWidth={1.75} aria-hidden="true" />
              <input
                type="search"
                aria-label="Tìm trang phục"
                placeholder="Tìm tên trang phục…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn('h-11 w-full rounded-[2px] border border-landing-line bg-landing-ivory/80 pl-9 pr-3 text-base placeholder:text-landing-muted/70 transition-colors hover:border-landing-brass sm:text-sm [&::-webkit-search-cancel-button]:appearance-none', tryOnFocusRing)}
              />
            </div>
            <div role="group" aria-label="Loại trang phục" className="no-scrollbar mt-2 flex gap-5 overflow-x-auto">
              {CATEGORIES.map(cat => {
                const selected = selectedCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedCat(cat.id)}
                    className={cn(
                      'relative h-11 shrink-0 whitespace-nowrap text-sm transition-colors',
                      selected ? 'font-medium text-landing-oxblood after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-landing-oxblood' : 'text-landing-obsidian/70 hover:text-landing-oxblood',
                      tryOnFocusRing,
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="no-scrollbar grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:grid-cols-3" aria-label="Danh sách trang phục">
            {filteredProducts.map((p) => {
              const isSelected = p.id === currentProductId;
              return (
                <button
                  type="button"
                  key={p.id}
                  aria-pressed={isSelected}
                  onClick={() => { onSelectProduct(p); onClose(); }}
                  className={cn('group relative flex min-w-0 flex-col text-left', tryOnFocusRing)}
                >
                  <span className={cn('relative block aspect-[3/4] w-full overflow-hidden rounded-[2px] border bg-landing-ivory transition-colors', isSelected ? 'border-landing-oxblood' : 'border-landing-line group-hover:border-landing-brass')}>
                    <Image src={p.image} alt={p.name} fill sizes="(max-width: 640px) 45vw, 190px" unoptimized className="object-contain p-2 mix-blend-multiply" />
                    {isSelected ? (
                      <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center bg-landing-oxblood text-landing-paper">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-label="Đang chọn" />
                      </span>
                    ) : null}
                  </span>
                  <span className="product-name-line mt-2 line-clamp-2 text-landing-obsidian group-hover:text-landing-oxblood">{p.name}</span>
                  <span className="mt-1 font-mono text-[12px] text-landing-oxblood">{p.price}</span>
                </button>
              );
            })}
            {filteredProducts.length === 0 ? (
              <p className="col-span-full py-10 text-center text-sm text-landing-muted">Không có trang phục khớp. Thử từ khóa hoặc loại khác.</p>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

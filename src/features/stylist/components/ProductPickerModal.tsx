'use client';

import type { ProductPickerModalProps } from '@/features/stylist/types/product-picker-modal';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, Search, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';

export function ProductPickerModal({
  isOpen,
  onClose,
  products,
  onSelect,
  currentProductId,
}: ProductPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const filteredProducts = normalizedQuery
    ? products.filter(
      (p) =>
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.category.toLowerCase().includes(normalizedQuery) ||
        p.brand.toLowerCase().includes(normalizedQuery),
    )
    : products;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        {/* Nằm trên thanh tab dưới (z-[90]) của mobile. */}
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-landing-obsidian/45 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-[101] flex max-h-[85svh] flex-col overflow-hidden border-t border-landing-line bg-landing-paper text-landing-obsidian data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[80vh] sm:w-[calc(100%-2rem)] sm:max-w-[600px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border">
          <div className="flex items-start justify-between gap-4 border-b border-landing-line/70 px-5 pb-4 pt-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-landing-brass-ink">Món muốn phối cùng</p>
              <Dialog.Title className="mt-1.5 font-display text-2xl leading-tight">Chọn sản phẩm</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-landing-muted">
                AI sẽ phối quanh sản phẩm thật trong cửa hàng.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Đóng"
              className={`-mr-2 flex h-11 w-11 items-center justify-center text-landing-muted transition-colors hover:text-landing-oxblood ${focusRing}`}
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </Dialog.Close>
          </div>

          <div className="border-b border-landing-line/70 px-5 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-muted" strokeWidth={1.75} aria-hidden="true" />
              <input
                type="search"
                aria-label="Tìm sản phẩm"
                placeholder="Tìm sản phẩm, danh mục…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`h-11 w-full rounded-[2px] border border-landing-line bg-landing-ivory/80 pl-9 pr-3 text-sm placeholder:text-landing-muted/70 transition-colors hover:border-landing-brass [&::-webkit-search-cancel-button]:appearance-none ${focusRing}`}
              />
            </div>
          </div>

          <div className="no-scrollbar grid flex-1 grid-cols-1 gap-2 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:grid-cols-2">
            {filteredProducts.map((p) => {
              const isSelected = p.id === currentProductId;
              return (
                <button
                  type="button"
                  key={p.id}
                  aria-pressed={isSelected}
                  onClick={() => {
                    onSelect(p);
                    onClose();
                  }}
                  className={`relative flex gap-3 rounded-[2px] border p-2.5 text-left transition-colors ${focusRing} ${isSelected
                    ? 'border-landing-oxblood bg-landing-ivory'
                    : 'border-landing-line bg-landing-ivory/60 hover:border-landing-oxblood'
                    }`}
                >
                  <span className="relative h-[72px] w-14 shrink-0 overflow-hidden rounded-[2px] bg-landing-paper">
                    {p.image ? <Image src={p.image} alt={p.name} fill sizes="56px" className="object-contain" /> : null}
                  </span>
                  <span className="flex min-w-0 flex-col justify-between py-0.5">
                    <span>
                      <span className="product-name-line line-clamp-2 text-landing-obsidian">{p.name}</span>
                      <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-landing-muted">{p.brand}</span>
                    </span>
                    <span className="font-mono text-[12px] text-landing-oxblood">{p.price}</span>
                  </span>
                  {isSelected ? (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-[2px] bg-landing-oxblood text-landing-paper">
                      <Check className="h-3 w-3" strokeWidth={2.5} aria-label="Đang chọn" />
                    </span>
                  ) : null}
                </button>
              );
            })}
            {filteredProducts.length === 0 && (
              <p className="py-10 text-center text-sm text-landing-muted sm:col-span-2">
                Không tìm thấy sản phẩm phù hợp.
              </p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

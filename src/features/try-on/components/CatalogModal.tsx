'use client';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { CatalogModalProps } from '@/features/try-on/types/catalog-modal';
import { toBackendCategory } from '@/features/products/services/products-utils';
import type { Product } from '@/features/products/types/products';
import type { ProductPickerCategory } from '@/features/try-on/types/try-on-types';
import { Check, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function SelectedProductCard({ product, onReplace }: { product: Product; onReplace: () => void }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E5DFD5]">
      <div className="relative w-[80px] h-[80px] shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-100">
        <Image src={product.image} alt={product.name} fill sizes="80px" unoptimized className="object-cover" />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <p className="text-label-sm text-neutral-500">{product.brand}</p>
        <p className="text-body-sm font-medium text-neutral-900 leading-snug line-clamp-2">{product.name}</p>
        <p className="text-body-sm font-semibold text-brand-navy mt-0.5">{product.price}</p>
      </div>
      <button onClick={onReplace} type="button" className="shrink-0 text-label-sm font-semibold text-[#5D1C34] hover:text-[#5D1C34]/80 transition-colors flex items-center gap-1 whitespace-nowrap bg-transparent border-0 cursor-pointer">
        Thay đổi <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function CatalogModal({ isOpen, onClose, onSelectProduct, products, currentProductId, initialCategory = 'ALL' }: CatalogModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<ProductPickerCategory>(initialCategory);

  useEffect(() => {
    if (isOpen) setSelectedCat(initialCategory);
  }, [isOpen, initialCategory]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCat === 'ALL') return true;
    const cat = p.garmentCategory || toBackendCategory(p.category);
    return cat === selectedCat;
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="z-[120] left-0 top-auto bottom-0 flex max-h-[90dvh] w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-3xl rounded-b-none border border-[#E5DFD5] bg-white p-0 shadow-xl sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:max-h-[84dvh] sm:max-w-[620px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl [&>button]:top-3 [&>button]:right-3 [&>button]:flex [&>button]:h-11 [&>button]:w-11 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full">
        <div className="shrink-0 px-4 py-5 pr-16 sm:px-6 sm:pr-16 border-b border-[#E5DFD5]">
          <div>
            <DialogTitle className="text-[18px] leading-6 sm:text-[20px] font-semibold text-[#5D1C34]">Chọn trang phục thử đồ</DialogTitle>
            <DialogDescription className="text-[12px] sm:text-body-sm text-neutral-500 mt-1">Chạm vào món bạn thích để chọn thử.</DialogDescription>
          </div>
        </div>

        <div className="shrink-0 p-3 sm:p-4 border-b border-[#E5DFD5] bg-[#F9F7F5] flex flex-col gap-3">
          <input type="search" aria-label="Tìm trang phục" placeholder="Tìm tên trang phục…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full min-w-0 h-11 px-3 rounded-xl border border-[#E5DFD5] bg-white text-base sm:text-sm focus:outline-none focus:border-[#5D1C34] focus:ring-2 focus:ring-[#5D1C34]/20 transition-all" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Loại trang phục">
            {([
              { id: 'ALL', label: 'Tất cả' },
              { id: 'UPPER', label: 'Áo / Blazer' },
              { id: 'LOWER', label: 'Quần / Váy' },
              { id: 'FULL_BODY', label: 'Bộ liền' },
            ] satisfies { id: ProductPickerCategory; label: string }[]).map(cat => (
              <button key={cat.id} type="button" aria-pressed={selectedCat === cat.id} onClick={() => setSelectedCat(cat.id)} className={`min-h-11 px-2 rounded-lg text-[12px] font-semibold transition-all ${selectedCat === cat.id ? 'bg-[#5D1C34] text-white shadow-2xs' : 'bg-white text-neutral-600 border border-[#E5DFD5] hover:bg-neutral-100'}`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-4 grid grid-cols-2 gap-2 sm:gap-3" aria-label="Danh sách trang phục">
          {filteredProducts.map((p) => {
            const isSelected = p.id === currentProductId;
            return (
              <button type="button" key={p.id} aria-pressed={isSelected} onClick={() => { onSelectProduct(p); onClose(); }} className={`relative flex min-w-0 flex-col sm:flex-row gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border cursor-pointer text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D1C34] ${isSelected ? 'border-[#5D1C34] bg-[#5D1C34]/5 ring-1 ring-[#5D1C34]' : 'border-[#E5DFD5] bg-white hover:border-[#5D1C34]/60 hover:bg-neutral-50'}`}>
                <div className="relative aspect-[4/3] w-full sm:aspect-auto sm:w-16 sm:h-20 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-100">
                  <Image src={p.image} alt={p.name} fill sizes="(max-width: 640px) 44vw, 64px" unoptimized className="object-contain p-1" />
                </div>
                <div className="flex-col flex flex-1 justify-between min-w-0 w-full gap-2 py-0.5">
                  <div>
                    <h4 className="text-[12px] font-bold text-[#5D1C34] line-clamp-2 break-words leading-snug sm:pr-4">{p.name}</h4>
                    <span className="text-[10px] text-neutral-500 font-semibold mt-0.5 block truncate">{p.brand}</span>
                  </div>
                  <span className="text-[12px] font-bold text-[#5D1C34]">{p.price}</span>
                </div>
                {isSelected && <span className="absolute right-2 top-2 rounded-full bg-[#5D1C34] p-1 text-white"><Check className="h-3 w-3" aria-label="Đang chọn" /></span>}
              </button>
            );
          })}
          {filteredProducts.length === 0 && <div className="col-span-2 py-10 text-center text-neutral-500 text-body-sm">Chưa tìm thấy trang phục phù hợp. Thử đổi từ khóa hoặc loại trang phục nhé.</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

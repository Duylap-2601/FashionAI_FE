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
      <DialogContent className="z-[120] max-w-[calc(100%-2rem)] sm:max-w-[620px] max-h-[84vh] overflow-hidden rounded-2xl border border-[#E5DFD5] bg-white p-0 shadow-xl">
        <div className="px-6 py-4 border-b border-[#E5DFD5]">
          <div>
            <DialogTitle className="text-[20px] font-semibold text-[#5D1C34]">Chọn trang phục thử đồ</DialogTitle>
            <DialogDescription className="text-body-sm text-neutral-500 mt-1">Tìm kiếm và lọc sản phẩm trong catalog cửa hàng.</DialogDescription>
          </div>
        </div>

        <div className="p-4 border-b border-[#E5DFD5] bg-[#F9F7F5] flex flex-col gap-3">
          <input type="text" placeholder="Tìm kiếm sản phẩm, danh mục..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 px-4 rounded-xl border border-[#E5DFD5] bg-white text-body-sm focus:outline-none focus:border-[#5D1C34] focus:ring-2 focus:ring-[#5D1C34]/20 transition-all" />
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {([
              { id: 'ALL', label: 'Tất cả' },
              { id: 'UPPER', label: 'Áo / Blazer' },
              { id: 'LOWER', label: 'Quần / Váy' },
              { id: 'FULL_BODY', label: 'Bộ liền' },
            ] satisfies { id: ProductPickerCategory; label: string }[]).map(cat => (
              <button key={cat.id} type="button" onClick={() => setSelectedCat(cat.id)} className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${selectedCat === cat.id ? 'bg-[#5D1C34] text-white shadow-2xs' : 'bg-white text-neutral-600 border border-[#E5DFD5] hover:bg-neutral-100'}`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 no-scrollbar">
          {filteredProducts.map((p) => {
            const isSelected = p.id === currentProductId;
            return (
              <button type="button" key={p.id} onClick={() => { onSelectProduct(p); onClose(); }} className={`relative flex gap-3 p-3 rounded-xl border cursor-pointer text-left transition-all ${isSelected ? 'border-[#5D1C34] bg-[#5D1C34]/5 ring-1 ring-[#5D1C34]' : 'border-[#E5DFD5] bg-white hover:border-[#5D1C34]/60 hover:bg-neutral-50'}`}>
                <div className="relative w-14 h-18 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-100">
                  <Image src={p.image} alt={p.name} fill sizes="56px" unoptimized className="object-cover" />
                </div>
                <div className="flex-col flex justify-between min-w-0 py-0.5">
                  <div>
                    <h4 className="text-[12px] font-bold text-[#5D1C34] line-clamp-1 leading-snug">{p.name}</h4>
                    <span className="text-[10px] text-neutral-400 font-semibold mt-0.5 block">{p.brand}</span>
                  </div>
                  <span className="text-[12px] font-bold text-[#5D1C34]">{p.price}</span>
                </div>
                {isSelected && <Check className="absolute right-3 top-3 h-4 w-4 text-[#5D1C34]" aria-label="Đang chọn" />}
              </button>
            );
          })}
          {filteredProducts.length === 0 && <div className="sm:col-span-2 py-10 text-center text-neutral-500 text-body-sm">Không có sản phẩm phù hợp với tìm kiếm hiện tại.</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

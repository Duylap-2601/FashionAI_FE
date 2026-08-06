'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Product } from '@/lib/data';

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelect: (product: Product) => void;
  currentProductId?: string;
}

export function ProductPickerModal({
  isOpen,
  onClose,
  products,
  onSelect,
  currentProductId,
}: ProductPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-[560px] w-full flex flex-col max-h-[80vh] overflow-hidden relative border border-neutral-200 animate-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-brand-navy">Chọn sản phẩm tư vấn</h2>
            <p className="text-[12px] text-neutral-500 mt-0.5">
              AI sẽ tư vấn dựa trên sản phẩm thật từ catalog
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-neutral-100 bg-neutral-50">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-4 rounded-xl border border-neutral-200 bg-white text-body-sm focus:outline-none focus:border-brand-navy transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 no-scrollbar">
          {filteredProducts.map((p) => {
            const isSelected = p.id === currentProductId;
            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelect(p);
                  onClose();
                }}
                className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy'
                    : 'border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50'
                }`}
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-14 h-18 rounded-lg object-cover bg-neutral-100 shrink-0 border border-neutral-100"
                />
                <div className="flex-col flex justify-between min-w-0 py-0.5">
                  <div>
                    <h4 className="text-[12px] font-bold text-brand-navy line-clamp-1 leading-snug">
                      {p.name}
                    </h4>
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase mt-0.5 block">
                      {p.brand}
                    </span>
                  </div>
                  <span className="text-[12px] font-bold text-brand-navy">{p.price}</span>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="col-span-2 py-10 text-center text-neutral-500 text-body-sm">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

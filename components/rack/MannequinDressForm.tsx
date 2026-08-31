'use client';

import React from 'react';
import { Sparkles, X, RotateCcw, ArrowRight, Plus, Eye } from 'lucide-react';
import { RackItem, BackendRackProduct } from '@/hooks/useRack';

interface MannequinDressFormProps {
  upperItem: RackItem | null;
  lowerItem: RackItem | null;
  fullBodyItem: RackItem | null;
  onRemoveUpper: () => void;
  onRemoveLower: () => void;
  onRemoveFullBody: () => void;
  onReset: () => void;
  onGoToTryOn: () => void;
}

function getProductImage(product: BackendRackProduct): string {
  if (Array.isArray(product?.images) && product.images.length > 0) {
    const main = product.images.find((img) => typeof img === 'object' && img?.isMain);
    if (main && typeof main === 'object') {
      const url = main.imageUrl || main.url;
      if (url) return url;
    }
    const first = product.images[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object') {
      const url = first.imageUrl || first.url;
      if (url) return url;
    }
  }
  if (product?.garmentUrl) return product.garmentUrl;
  return '/images/731163514_999523332788054_1114320478812927640_n.png';
}

function formatPrice(price: string | number): string {
  const num = Number(price);
  if (Number.isFinite(num)) {
    return `${num.toLocaleString('vi-VN')} ₫`;
  }
  return String(price || '0');
}

export function MannequinDressForm({
  upperItem,
  lowerItem,
  fullBodyItem,
  onRemoveUpper,
  onRemoveLower,
  onRemoveFullBody,
  onReset,
  onGoToTryOn,
}: MannequinDressFormProps) {
  const isFullBody = !!fullBodyItem;
  const hasAnyItem = !!(upperItem || lowerItem || fullBodyItem);
  const isComboComplete = isFullBody || (!!upperItem && !!lowerItem);

  // Calculate total price
  const totalPrice = React.useMemo(() => {
    let total = 0;
    if (fullBodyItem) {
      total += Number(fullBodyItem.product.price) || 0;
    } else {
      if (upperItem) total += Number(upperItem.product.price) || 0;
      if (lowerItem) total += Number(lowerItem.product.price) || 0;
    }
    return total;
  }, [upperItem, lowerItem, fullBodyItem]);

  return (
    <div className="relative bg-gradient-to-b from-[#FAF7F2] via-[#F5EFEB] to-[#EFE7E0] rounded-3xl p-5 md:p-6 text-neutral-900 border border-[#E3D9CE] shadow-xl overflow-hidden flex flex-col justify-between">
      {/* Studio Lighting Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-radial from-white via-amber-100/30 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#5D1C34]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#E2D8CC] pb-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#5D1C34] text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-body-md font-bold text-[#1F242D] flex items-center gap-2">
              Ma-nơ-canh Phối Đồ
              {isComboComplete && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 animate-in fade-in">
                  Đủ Bộ ✨
                </span>
              )}
            </h3>
            <p className="text-[11px] text-neutral-500">
              {!hasAnyItem
                ? 'Chọn quần áo bên trái để ướm thử'
                : isComboComplete
                ? 'Bộ trang phục đã sẵn sàng để thử đồ AI!'
                : upperItem
                ? 'Đã có áo — hãy chọn thêm quần/váy'
                : 'Đã có quần — hãy chọn thêm áo'}
            </p>
          </div>
        </div>

        {hasAnyItem && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 text-xs font-semibold transition-all border border-neutral-200 shadow-2xs"
            title="Tháo toàn bộ đồ trên ma-nơ-canh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tháo đồ</span>
          </button>
        )}
      </div>

      {/* Virtual Mannequin Dressing Stage */}
      <div className="relative z-10 flex-1 min-h-[490px] flex flex-col items-center justify-center py-2">
        {/* Spotlight Circle Floor */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64 h-12 bg-neutral-300/40 rounded-full blur-md pointer-events-none" />

        {/* Mannequin & Clothes Composite Stage */}
        <div className="relative w-full max-w-[320px] h-[480px] flex flex-col items-center select-none">
          {/* 1. Mannequin Finial Top (Đầu chốt gỗ) */}
          <div className="w-5 h-5 rounded-t-full bg-gradient-to-b from-[#2B292D] via-[#1B191E] to-[#110F13] shadow-md z-10 border-t border-white/20" />
          <div className="w-7 h-3 rounded-xs bg-[#1F1D22] z-10 border-x border-white/10" />

          {/* 2. Mannequin Neck (Cổ) */}
          <div className="w-10 h-5 bg-gradient-to-r from-[#2A282D] via-[#1E1C21] to-[#2A282D] z-10 shadow-xs" />

          {/* 3. Mannequin Torso & Clothing Layer Area (Thân & Trang Phục) */}
          <div className="relative w-64 h-[350px] flex flex-col items-center">
            {/* Background Mannequin Silhouette (Hiển thị khi chưa có đồ hoặc làm nền) */}
            <div className="absolute inset-0 flex flex-col items-center pointer-events-none opacity-90">
              <svg
                className="w-56 h-[330px] drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]"
                viewBox="0 0 200 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Velvet Dress Form Torso */}
                <path
                  d="M 65 0 C 50 0, 20 15, 15 38 C 10 60, 32 85, 48 110 C 58 125, 52 145, 44 175 C 34 210, 22 250, 42 275 C 55 290, 145 290, 158 275 C 178 250, 166 210, 156 175 C 148 145, 142 125, 152 110 C 168 85, 190 60, 185 38 C 180 15, 150 0, 135 0 Z"
                  fill="url(#velvetBodyGrad)"
                  stroke="#1A181D"
                  strokeWidth="1.5"
                />
                {/* Haute Couture Stitch Lines */}
                <path d="M 100 0 L 100 285" stroke="#3D3942" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 52 125 C 75 135, 125 135, 148 125" stroke="#3D3942" strokeWidth="1" strokeDasharray="2 2" />
                <defs>
                  <linearGradient id="velvetBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#302C34" />
                    <stop offset="50%" stopColor="#1E1C22" />
                    <stop offset="100%" stopColor="#131116" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* A. FULL BODY GARMENT (Khi chọn Bộ liền / Suit) */}
            {isFullBody && fullBodyItem && (
              <div className="relative z-20 w-60 h-[340px] flex items-center justify-center animate-in zoom-in-95 fade-in duration-300 group">
                <img
                  src={getProductImage(fullBodyItem.product)}
                  alt={fullBodyItem.product.name}
                  className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)] hover:scale-[1.02] transition-transform"
                />
                {/* Quick Remove Button */}
                <button
                  type="button"
                  onClick={onRemoveFullBody}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow-md"
                  title="Tháo bộ liền"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* B. UPPER & LOWER COMBO (Áo + Quần ghép nối liền mạch) */}
            {!isFullBody && (
              <div className="relative z-20 w-full h-full flex flex-col items-center">
                {/* 1. UPPER GARMENT (Áo / Blazer) - Khớp với ngực & vai */}
                <div className="relative w-56 h-[175px] flex items-center justify-center">
                  {upperItem ? (
                    <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in-95 fade-in duration-300 group">
                      <img
                        src={getProductImage(upperItem.product)}
                        alt={upperItem.product.name}
                        className="w-full h-full object-contain object-top filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.2)] hover:scale-[1.03] transition-transform"
                      />
                      {/* Remove Upper Button */}
                      <button
                        type="button"
                        onClick={onRemoveUpper}
                        className="absolute top-1 right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow-md"
                        title="Tháo áo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    /* Upper Placeholder Guide */
                    <div className="w-48 h-32 rounded-2xl border-2 border-dashed border-[#A67D44]/40 bg-[#FAF7F2]/40 backdrop-blur-2xs flex flex-col items-center justify-center p-2 text-center transition-all hover:border-[#5D1C34]/60">
                      <span className="text-[11px] font-bold text-[#5D1C34]">Vùng Áo / Thân trên</span>
                      <span className="text-[10px] text-neutral-500 mt-0.5">Chạm áo bên trái để mặc lên</span>
                    </div>
                  )}
                </div>

                {/* 2. LOWER GARMENT (Quần / Váy) - Nối tiếp liền mạch từ eo xuống */}
                <div className="relative w-56 h-[175px] -mt-3 flex items-center justify-center">
                  {lowerItem ? (
                    <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in-95 fade-in duration-300 group">
                      <img
                        src={getProductImage(lowerItem.product)}
                        alt={lowerItem.product.name}
                        className="w-full h-full object-contain object-top filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.2)] hover:scale-[1.03] transition-transform"
                      />
                      {/* Remove Lower Button */}
                      <button
                        type="button"
                        onClick={onRemoveLower}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow-md"
                        title="Tháo quần/váy"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    /* Lower Placeholder Guide */
                    <div className="w-48 h-32 rounded-2xl border-2 border-dashed border-[#A67D44]/40 bg-[#FAF7F2]/40 backdrop-blur-2xs flex flex-col items-center justify-center p-2 text-center transition-all hover:border-[#5D1C34]/60">
                      <span className="text-[11px] font-bold text-[#5D1C34]">Vùng Quần / Váy</span>
                      <span className="text-[10px] text-neutral-500 mt-0.5">Chạm quần/váy bên trái để mặc lên</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. Mannequin Stand Pole & Base (Cọc kim loại & Chân đế tripod) */}
          <div className="w-3 h-16 bg-gradient-to-r from-neutral-700 via-neutral-400 to-neutral-800 shadow-inner z-0" />
          <div className="w-5 h-2.5 rounded-full bg-neutral-800 border border-neutral-600 z-0" />

          {/* Tripod Base */}
          <div className="relative w-40 h-10 flex justify-center items-end z-0">
            <div className="w-3 h-8 bg-neutral-800 rounded-b-sm" />
            <div className="absolute left-3 bottom-0 w-14 h-6 border-b-[3px] border-l-[3px] border-neutral-800 rounded-bl-2xl transform -rotate-12" />
            <div className="absolute right-3 bottom-0 w-14 h-6 border-b-[3px] border-r-[3px] border-neutral-800 rounded-br-2xl transform rotate-12" />
          </div>
        </div>
      </div>

      {/* Outfit Information & Action Footer */}
      <div className="relative z-10 pt-3 border-t border-[#E2D8CC]">
        {hasAnyItem ? (
          <div className="flex flex-col gap-2.5">
            {/* Selected Items Mini Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {upperItem && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 shadow-2xs shrink-0">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span className="max-w-[130px] truncate">{upperItem.product.name}</span>
                  <button type="button" onClick={onRemoveUpper} className="text-neutral-400 hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {lowerItem && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 shadow-2xs shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="max-w-[130px] truncate">{lowerItem.product.name}</span>
                  <button type="button" onClick={onRemoveLower} className="text-neutral-400 hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {fullBodyItem && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 shadow-2xs shrink-0">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="max-w-[150px] truncate">{fullBodyItem.product.name}</span>
                  <button type="button" onClick={onRemoveFullBody} className="text-neutral-400 hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Total Price & CTA Button */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-neutral-600 font-medium">Tổng giá outfit:</span>
              <span className="text-body-md font-bold text-[#5D1C34]">
                {totalPrice > 0 ? `${totalPrice.toLocaleString('vi-VN')} ₫` : '0 ₫'}
              </span>
            </div>

            <button
              type="button"
              onClick={onGoToTryOn}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#5D1C34] to-[#A67D44] text-white font-bold text-body-sm hover:opacity-95 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              Thử đồ ảo AI với bộ này
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="py-2 text-center">
            <p className="text-xs text-neutral-500">
              Hãy bấm vào bất kỳ món đồ nào bên <span className="text-[#5D1C34] font-bold">Tủ Đồ</span> để mặc lên ma-nơ-canh
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

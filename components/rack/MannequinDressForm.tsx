'use client';

import React from 'react';
import { Sparkles, X, Shirt, Scissors, RotateCcw, ArrowRight } from 'lucide-react';
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
  const itemCount = isFullBody ? 1 : (upperItem ? 1 : 0) + (lowerItem ? 1 : 0);

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
    <div className="relative bg-gradient-to-b from-neutral-900 via-[#18151B] to-[#120F14] rounded-3xl p-5 md:p-6 text-white border border-neutral-800 shadow-2xl overflow-hidden flex flex-col justify-between">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#5D1C34]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#A67D44]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-96 bg-radial from-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5D1C34] to-[#A67D44] flex items-center justify-center shadow-inner">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-body-md font-bold text-neutral-100 flex items-center gap-2">
              Studio Ma-nơ-canh
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-white/10 text-amber-200 border border-white/10">
                Mix & Match
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400">
              {hasAnyItem ? `Đã phối ${itemCount}/2 món đồ` : 'Chưa mặc trang phục nào'}
            </p>
          </div>
        </div>

        {hasAnyItem && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-medium transition-colors border border-white/5"
            title="Tháo toàn bộ trang phục"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        )}
      </div>

      {/* Main Mannequin Stage Area */}
      <div className="relative z-10 flex-1 min-h-[460px] md:min-h-[500px] flex flex-col items-center justify-center py-4">
        {/* Spotlight Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-white/10 blur-xl rounded-full pointer-events-none" />

        {/* Mannequin Structure Container */}
        <div className="relative w-full max-w-[300px] h-[440px] flex flex-col items-center select-none">
          {/* Mannequin Top Finial (Chốt gỗ đầu) */}
          <div className="w-6 h-5 rounded-t-full bg-gradient-to-b from-neutral-300 via-neutral-600 to-neutral-800 border-t border-white/30 shadow-md z-10" />
          <div className="w-8 h-4 rounded-sm bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 border border-white/10 z-10" />

          {/* Mannequin Neck (Cổ) */}
          <div className="w-12 h-6 bg-gradient-to-r from-neutral-800 via-neutral-900 to-neutral-800 border-x border-neutral-700 z-10" />

          {/* Mannequin Torso Body (Thân áo & Quần) */}
          <div className="relative w-56 h-[270px] flex flex-col items-center">
            {/* Base Mannequin Silhouette Shape */}
            <svg
              className="absolute inset-0 w-full h-full text-neutral-800/80 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
              viewBox="0 0 200 240"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Shoulders & Bust & Waist & Hips Haute Couture Curvature */}
              <path
                d="M 60 0 C 45 0, 15 15, 10 35 C 5 55, 30 75, 45 95 C 55 110, 50 130, 42 155 C 35 180, 25 210, 40 230 C 50 240, 150 240, 160 230 C 175 210, 165 180, 158 155 C 150 130, 145 110, 155 95 C 170 75, 195 55, 190 35 C 185 15, 155 0, 140 0 Z"
                fill="url(#mannequinVelvet)"
                stroke="#3A3840"
                strokeWidth="1.5"
              />
              <defs>
                <linearGradient id="mannequinVelvet" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2D2930" />
                  <stop offset="50%" stopColor="#1E1C22" />
                  <stop offset="100%" stopColor="#131116" />
                </linearGradient>
              </defs>
            </svg>

            {/* FULL BODY SLOT */}
            {isFullBody && fullBodyItem ? (
              <div className="relative z-20 w-52 h-[260px] rounded-2xl overflow-hidden group border-2 border-amber-400/80 bg-neutral-900/90 shadow-2xl animate-in zoom-in-95 duration-300">
                <img
                  src={getProductImage(fullBodyItem.product)}
                  alt={fullBodyItem.product.name}
                  className="w-full h-full object-cover object-top filter drop-shadow-md"
                />
                {/* Floating Tag */}
                <div className="absolute inset-x-2 bottom-2 p-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] text-amber-300 font-bold uppercase truncate">Bộ Liền / Suit</p>
                    <p className="text-xs font-semibold text-white truncate">{fullBodyItem.product.name}</p>
                    <p className="text-[11px] font-bold text-amber-400">{formatPrice(fullBodyItem.product.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onRemoveFullBody}
                    className="w-6 h-6 rounded-full bg-white/20 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shrink-0"
                    title="Gỡ bộ liền"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* UPPER & LOWER SLOTS */
              <div className="relative z-20 w-full h-full flex flex-col justify-between p-1.5 gap-2">
                {/* 1. UPPER SLOT (Áo / Blazer) */}
                <div className="relative w-full h-[125px] rounded-xl overflow-hidden transition-all duration-300">
                  {upperItem ? (
                    <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-sky-400/80 bg-neutral-900/90 shadow-xl group animate-in zoom-in-95 duration-300">
                      <img
                        src={getProductImage(upperItem.product)}
                        alt={upperItem.product.name}
                        className="w-full h-full object-cover object-top"
                      />
                      {/* Overlay Tag */}
                      <div className="absolute inset-x-1.5 bottom-1.5 p-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between gap-1.5">
                        <div className="min-w-0">
                          <p className="text-[9px] text-sky-300 font-bold uppercase truncate">Áo / Thân trên</p>
                          <p className="text-[11px] font-semibold text-white truncate leading-tight">
                            {upperItem.product.name}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={onRemoveUpper}
                          className="w-5 h-5 rounded-full bg-white/20 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shrink-0"
                          title="Gỡ áo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-xl border-2 border-dashed border-white/25 hover:border-sky-400/60 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center justify-center p-2 text-center group cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-sky-500/20 text-neutral-300 group-hover:text-sky-300 flex items-center justify-center mb-1 transition-colors">
                        <Shirt className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-neutral-200 group-hover:text-white transition-colors">
                        Vị trí Áo
                      </span>
                      <span className="text-[9px] text-neutral-400 animate-pulse">
                        Chạm vào áo bên trái để ướm
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. LOWER SLOT (Quần / Váy) */}
                <div className="relative w-full h-[125px] rounded-xl overflow-hidden transition-all duration-300">
                  {lowerItem ? (
                    <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-emerald-400/80 bg-neutral-900/90 shadow-xl group animate-in zoom-in-95 duration-300">
                      <img
                        src={getProductImage(lowerItem.product)}
                        alt={lowerItem.product.name}
                        className="w-full h-full object-cover object-top"
                      />
                      {/* Overlay Tag */}
                      <div className="absolute inset-x-1.5 bottom-1.5 p-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between gap-1.5">
                        <div className="min-w-0">
                          <p className="text-[9px] text-emerald-300 font-bold uppercase truncate">Quần & Váy</p>
                          <p className="text-[11px] font-semibold text-white truncate leading-tight">
                            {lowerItem.product.name}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={onRemoveLower}
                          className="w-5 h-5 rounded-full bg-white/20 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shrink-0"
                          title="Gỡ quần/váy"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-xl border-2 border-dashed border-white/25 hover:border-emerald-400/60 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center justify-center p-2 text-center group cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-emerald-500/20 text-neutral-300 group-hover:text-emerald-300 flex items-center justify-center mb-1 transition-colors">
                        <Scissors className="w-4 h-4 rotate-90" />
                      </div>
                      <span className="text-[11px] font-bold text-neutral-200 group-hover:text-white transition-colors">
                        Vị trí Quần / Váy
                      </span>
                      <span className="text-[9px] text-neutral-400 animate-pulse">
                        Chạm vào quần/váy để phối
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mannequin Stand Pole (Cột đỡ kim loại sơn đen) */}
          <div className="w-3.5 h-20 bg-gradient-to-r from-neutral-700 via-neutral-400 to-neutral-800 shadow-inner z-0" />
          <div className="w-6 h-3 rounded-full bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-800 border border-white/20 z-0" />

          {/* Mannequin Base Tripod Legs (Chân đế 3 chạc cổ điển uốn lượn) */}
          <div className="relative w-44 h-12 flex justify-center items-end z-0">
            {/* Center leg */}
            <div className="w-3.5 h-10 bg-gradient-to-b from-neutral-700 to-neutral-900 rounded-b-md shadow-md" />
            {/* Left curved leg */}
            <div className="absolute left-4 bottom-0 w-16 h-8 border-b-4 border-l-4 border-neutral-700 rounded-bl-3xl transform -rotate-12 shadow-lg" />
            {/* Right curved leg */}
            <div className="absolute right-4 bottom-0 w-16 h-8 border-b-4 border-r-4 border-neutral-700 rounded-br-3xl transform rotate-12 shadow-lg" />
          </div>

          {/* Shadow beneath base */}
          <div className="w-48 h-3 bg-black/60 blur-md rounded-full mt-1" />
        </div>
      </div>

      {/* Outfit Action Footer */}
      <div className="relative z-10 pt-4 border-t border-white/10">
        {hasAnyItem ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1 text-xs">
              <span className="text-neutral-400 font-medium">Tổng giá combo:</span>
              <span className="text-body-md font-bold text-amber-400">
                {totalPrice > 0 ? `${totalPrice.toLocaleString('vi-VN')} ₫` : 'Miễn phí'}
              </span>
            </div>

            <button
              type="button"
              onClick={onGoToTryOn}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#802246] via-[#5D1C34] to-[#A67D44] text-white font-bold text-body-sm hover:opacity-95 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Thử đồ ảo với outfit này
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="py-2 text-center">
            <p className="text-xs text-neutral-400">
              Hãy chọn các món đồ bên <span className="text-amber-300 font-semibold">Tủ Đồ</span> để phối trang phục
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

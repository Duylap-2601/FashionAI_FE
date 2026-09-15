'use client';

import type { MannequinDressFormProps } from '@/features/rack/types/mannequin-dress-form';
import type { BackendRackProduct } from '@/features/rack/types/rack';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Eye,
  EyeOff,
  Minus,
  Move,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import React, { useRef, useState } from 'react';

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

export function MannequinDressForm({
  placedItems,
  selectedId,
  onSelect,
  onUpdateTransform,
  onBringForward,
  onSendBackward,
  onResetItemTransform,
  onRemoveItem,
  onReset,
  onGoToTryOn,
}: MannequinDressFormProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [showMannequin, setShowMannequin] = useState<boolean>(true);

  const hasAnyItem = placedItems.length > 0;
  const selectedItem = placedItems.find((item) => item.instanceId === selectedId) || null;

  // Calculate total outfit price
  const totalPrice = React.useMemo(() => {
    return placedItems.reduce((sum, item) => sum + (Number(item.rackItem.product.price) || 0), 0);
  }, [placedItems]);

  return (
    <div className="relative bg-gradient-to-b from-[#FAF7F2] via-[#F6EFEB] to-[#EFE6DE] rounded-3xl p-4 sm:p-5 md:p-6 text-neutral-900 border border-[#E3D9CE] shadow-xl overflow-hidden flex flex-col justify-between select-none">
      {/* Studio Lighting Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-88 h-88 bg-radial from-white via-amber-100/30 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#5D1C34]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#E2D8CC] pb-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#5D1C34] text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-body-md font-bold text-[#1F242D] flex items-center gap-2">
              Studio Phối Đồ Tự Do
              {placedItems.length >= 2 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 animate-in fade-in">
                  Đủ Bộ ({placedItems.length} món) ✨
                </span>
              )}
            </h3>
            <p className="text-[11px] text-neutral-500">
              {!hasAnyItem
                ? 'Bấm đồ bên tủ để đưa lên canvas'
                : 'Kéo thả, cuộn chuột hoặc dùng thanh trượt để phóng to/thu nhỏ'}
            </p>
          </div>
        </div>

        {/* Studio Controls Header */}
        <div className="flex items-center gap-1.5">
          {/* Toggle Mannequin Silhouette */}
          <button
            type="button"
            onClick={() => setShowMannequin((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-2xs cursor-pointer ${
              showMannequin
                ? 'bg-white text-neutral-800 border-[#E2D8CC] hover:bg-neutral-50'
                : 'bg-neutral-200/80 text-neutral-500 border-neutral-300'
            }`}
            title={showMannequin ? 'Ẩn ma-nơ-canh (chế độ flat-lay)' : 'Hiện ma-nơ-canh'}
          >
            {showMannequin ? <Eye className="w-3.5 h-3.5 text-[#5D1C34]" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Ma-nơ-canh</span>
          </button>

          {/* Reset Canvas Button */}
          {hasAnyItem && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 text-xs font-semibold transition-all border border-neutral-200 shadow-2xs cursor-pointer"
              title="Tháo toàn bộ đồ trên ma-nơ-canh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tháo hết</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Item Floating Control Dock */}
      {selectedItem && (
        <div className="relative z-30 mb-2 p-2.5 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E2D8CC] shadow-md flex flex-wrap items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#5D1C34] animate-pulse shrink-0" />
            <span className="text-xs font-bold text-neutral-800 truncate max-w-[140px] sm:max-w-[190px]">
              {selectedItem.rackItem.product.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Scale / Zoom Controller */}
            <div className="flex items-center bg-neutral-100/90 rounded-xl p-0.5 border border-neutral-200 text-xs">
              <button
                type="button"
                onClick={() =>
                  onUpdateTransform(selectedItem.instanceId, {
                    scale: Math.max(0.5, Number((selectedItem.scale - 0.1).toFixed(2))),
                  })
                }
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white text-neutral-700 transition-colors"
                title="Thu nhỏ (-10%)"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-2 font-mono font-bold text-[11px] text-[#5D1C34] min-w-11 text-center">
                {Math.round(selectedItem.scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateTransform(selectedItem.instanceId, {
                    scale: Math.min(2.5, Number((selectedItem.scale + 0.1).toFixed(2))),
                  })
                }
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white text-neutral-700 transition-colors"
                title="Phóng to (+10%)"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Scale Slider */}
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={selectedItem.scale}
              onChange={(e) =>
                onUpdateTransform(selectedItem.instanceId, {
                  scale: Number(e.target.value),
                })
              }
              className="w-16 sm:w-20 accent-[#5D1C34] cursor-pointer"
              title="Kéo thanh trượt để phóng to / thu nhỏ"
            />

            {/* Layer Control Buttons */}
            <div className="flex items-center gap-0.5 border-l border-neutral-200 pl-1.5">
              <button
                type="button"
                onClick={() => onBringForward(selectedItem.instanceId)}
                className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
                title="Đưa lên lớp trên"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onSendBackward(selectedItem.instanceId)}
                className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
                title="Đưa xuống lớp dưới"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onResetItemTransform(selectedItem.instanceId)}
                className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
                title="Đặt lại vị trí chuẩn ma-nơ-canh"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onRemoveItem(selectedItem.instanceId)}
                className="w-7 h-7 rounded-lg hover:bg-rose-50 text-neutral-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                title="Gỡ món đồ này"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Interactive Canvas Stage */}
      <div className="relative z-10 flex-1 min-h-[550px] flex flex-col items-center justify-center py-2">
        {/* Spotlight Circle Floor */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-80 h-16 bg-neutral-300/40 rounded-full blur-md pointer-events-none" />

        {/* Mannequin & Clothes Composite Stage Container */}
        <div
          ref={stageRef}
          onClick={() => onSelect(null)}
          className="relative w-full max-w-[380px] h-[540px] flex flex-col items-center overflow-hidden rounded-3xl cursor-default"
        >
          {/* Mannequin Structure (Background Layer) */}
          {showMannequin && (
            <div className="absolute inset-0 flex flex-col items-center pointer-events-none transition-opacity duration-300">
              {/* 1. Mannequin Finial Top */}
              <div className="w-6 h-6 rounded-t-full bg-gradient-to-b from-[#38333D] via-[#221F26] to-[#141217] shadow-md z-1 border-t border-white/20 mt-1" />
              <div className="w-8 h-3 rounded-xs bg-[#1F1C22] z-1 border-x border-white/10" />

              {/* 2. Mannequin Neck */}
              <div className="w-12 h-6 bg-gradient-to-r from-[#2A272E] via-[#1E1B21] to-[#2A272E] z-1 shadow-xs" />

              {/* 3. Mannequin Torso Silhouette */}
              <div className="relative w-[340px] h-[370px] flex items-center justify-center">
                <svg
                  className="w-[240px] h-[350px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.18)] opacity-90"
                  viewBox="0 0 200 300"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 65 0 C 50 0, 20 15, 15 38 C 10 60, 32 85, 48 110 C 58 125, 52 145, 44 175 C 34 210, 22 250, 42 275 C 55 290, 145 290, 158 275 C 178 250, 166 210, 156 175 C 148 145, 142 125, 152 110 C 168 85, 190 60, 185 38 C 180 15, 150 0, 135 0 Z"
                    fill="url(#velvetBodyGrad)"
                    stroke="#1A181D"
                    strokeWidth="1.5"
                  />
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

              {/* 4. Mannequin Stand Pole & Base */}
              <div className="w-3.5 h-14 bg-gradient-to-r from-neutral-700 via-neutral-300 to-neutral-800 shadow-inner -mt-1" />
              <div className="w-6 h-2 rounded-full bg-neutral-800 border border-neutral-600" />
              <div className="relative w-40 h-8 flex justify-center items-end">
                <div className="w-3 h-6 bg-neutral-800 rounded-b-sm" />
                <div className="absolute left-3 bottom-0 w-14 h-6 border-b-[3px] border-l-[3px] border-neutral-800 rounded-bl-2xl transform -rotate-12" />
                <div className="absolute right-3 bottom-0 w-14 h-6 border-b-[3px] border-r-[3px] border-neutral-800 rounded-br-2xl transform rotate-12" />
              </div>
            </div>
          )}

          {/* Empty State Guide */}
          {!hasAnyItem && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none z-10">
              <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-xs border border-dashed border-[#A67D44]/40 shadow-xs max-w-[260px]">
                <div className="w-8 h-8 rounded-full bg-[#5D1C34]/10 text-[#5D1C34] flex items-center justify-center mx-auto mb-2">
                  <Move className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#5D1C34]">Phối Đồ Kéo Thả</h4>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Chạm vào trang phục trong tủ đồ để ướm thử. Bạn có thể tự do kéo, dời và phóng to thu nhỏ!
                </p>
              </div>
            </div>
          )}

          {/* Freeform Draggable Items */}
          {placedItems.map((item) => {
            const isSelected = selectedId === item.instanceId;
            const imageUrl = getProductImage(item.rackItem.product);

            return (
              <motion.div
                key={item.instanceId}
                drag
                dragConstraints={stageRef}
                dragMomentum={false}
                dragElastic={0.06}
                initial={false}
                animate={{
                  x: item.x,
                  y: item.y,
                  scale: item.scale,
                  rotate: item.rotation || 0,
                }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                style={{
                  zIndex: item.zIndex,
                  touchAction: 'none',
                }}
                onDragStart={() => onSelect(item.instanceId)}
                onDragEnd={(_, info) => {
                  onUpdateTransform(item.instanceId, {
                    x: Math.round(item.x + info.offset.x),
                    y: Math.round(item.y + info.offset.y),
                  });
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(item.instanceId);
                }}
                onWheel={(e) => {
                  e.stopPropagation();
                  const delta = e.deltaY < 0 ? 0.05 : -0.05;
                  const newScale = Math.min(2.5, Math.max(0.5, Number((item.scale + delta).toFixed(2))));
                  onUpdateTransform(item.instanceId, { scale: newScale });
                }}
                className={`absolute left-[calc(50%-150px)] top-[calc(50%-170px)] w-[300px] h-[340px] cursor-grab active:cursor-grabbing select-none group flex items-center justify-center transition-shadow ${
                  isSelected
                    ? 'ring-2 ring-[#5D1C34] ring-offset-2 ring-offset-[#F6EFEB] rounded-2xl shadow-xl'
                    : 'hover:ring-1 hover:ring-[#5D1C34]/40 rounded-2xl'
                }`}
              >
                {/* Item Image */}
                <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                  <Image
                    src={imageUrl}
                    alt={item.rackItem.product.name}
                    fill
                    unoptimized
                    className="object-contain object-center filter drop-shadow-[0_12px_26px_rgba(0,0,0,0.28)]"
                  />
                </div>

                {/* Corner Controls on Selected Item */}
                {isSelected && (
                  <>
                    {/* Quick Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(item.instanceId);
                      }}
                      className="absolute -top-3 -right-3 z-40 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title="Gỡ món đồ này"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Layer indicator pill */}
                    <div className="absolute -top-3 -left-3 z-40 px-2 py-0.5 rounded-full bg-[#5D1C34] text-white text-[10px] font-bold shadow-md">
                      Lớp {item.zIndex}
                    </div>

                    {/* Scale % pill */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-40 px-2 py-0.5 rounded-full bg-neutral-900/90 text-white text-[10px] font-mono font-bold shadow-md">
                      {Math.round(item.scale * 100)}%
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Outfit Information & Action Footer */}
      <div className="relative z-10 pt-3 border-t border-[#E2D8CC]">
        {hasAnyItem ? (
          <div className="flex flex-col gap-2.5">
            {/* Selected Items Mini Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {placedItems.map((item) => {
                const isSelected = selectedId === item.instanceId;
                return (
                  <div
                    key={item.instanceId}
                    onClick={() => onSelect(item.instanceId)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs shrink-0 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#5D1C34] text-white'
                        : 'bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-amber-300' : 'bg-[#5D1C34]'
                      }`}
                    />
                    <span className="max-w-[130px] truncate">{item.rackItem.product.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(item.instanceId);
                      }}
                      className={`ml-1 hover:text-rose-400 ${isSelected ? 'text-white/80' : 'text-neutral-400'}`}
                      title="Gỡ món này"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
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
              Hãy bấm vào bất kỳ món đồ nào bên <span className="text-[#5D1C34] font-bold">Tủ Đồ</span> để đưa lên ma-nơ-canh
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { BUDGETS, OCCASIONS, STYLE_PREFERENCES } from '@/features/stylist/constants/ai-stylist-page';
import type { GenderPref } from '@/features/stylist/types/ai-stylist-page';
import type { StylistInputPanelProps } from '@/features/stylist/types/stylist-input-panel';
import {
  AlertTriangle,
  Camera as CameraIcon,
  Package,
  Sparkles,
  UploadCloud,
  Wallet,
  X
} from 'lucide-react';
import React, { useState } from 'react';

export function StylistInputPanel({ photoUrl, fileInputRef, handleRemovePhoto, cameraInputRef, selectedProduct, setShowCatalogModal, productsLoading, setOccasion, occasion, setStylePreference, stylePreference, setBudget, budget, setGenderPreference, genderPreference, pageState, errorMessage, handleAnalyze, photoFile, isAnalyzing }: StylistInputPanelProps) {
  const [isCustomOccasion, setIsCustomOccasion] = useState(
    () => !!occasion && !OCCASIONS.includes(occasion)
  );
  const [customOccasionInput, setCustomOccasionInput] = useState(
    () => (!OCCASIONS.includes(occasion) ? occasion : '')
  );

  const [isCustomStyle, setIsCustomStyle] = useState(
    () => !!stylePreference && !STYLE_PREFERENCES.includes(stylePreference)
  );
  const [customStyleInput, setCustomStyleInput] = useState(
    () => (!STYLE_PREFERENCES.includes(stylePreference) ? stylePreference : '')
  );

  const handleSelectPresetOccasion = (occ: string) => {
    setIsCustomOccasion(false);
    setOccasion(occ);
  };

  const handleSelectCustomOccasion = () => {
    setIsCustomOccasion(true);
    setOccasion(customOccasionInput.trim());
  };

  const handleCustomOccasionChange = (val: string) => {
    setCustomOccasionInput(val);
    setOccasion(val);
  };

  const handleSelectPresetStyle = (style: string) => {
    setIsCustomStyle(false);
    setStylePreference(stylePreference === style ? '' : style);
  };

  const handleToggleCustomStyle = () => {
    if (isCustomStyle) {
      setIsCustomStyle(false);
      setStylePreference('');
    } else {
      setIsCustomStyle(true);
      setStylePreference(customStyleInput.trim());
    }
  };

  const handleCustomStyleChange = (val: string) => {
    setCustomStyleInput(val);
    setStylePreference(val);
  };
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200 mb-8 transition-all">
      <h2 className="text-heading-h3 font-semibold text-brand-navy mb-6">
        1. Ảnh của bạn
      </h2>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Upload Area */}
        <div className="w-full md:w-[200px] shrink-0 flex flex-col items-center">
          <div
            className={`relative w-[200px] h-[260px] rounded-xl overflow-hidden transition-all flex flex-col items-center justify-center text-center group border-2 ${photoUrl
                ? 'border-transparent'
                : 'border-dashed border-brand-navy/40 bg-neutral-50 hover:bg-neutral-100/50 cursor-pointer'
              }`}
            onClick={() => { if (!photoUrl) fileInputRef.current?.click(); }}
          >
            {photoUrl ? (
              <>
                <img src={photoUrl} alt="Ảnh đã tải lên" className="w-full h-full object-cover" />
                <button
                  onClick={handleRemovePhoto}
                  type="button"
                  className="absolute top-2 right-2 w-8 h-8 bg-neutral-900/50 hover:bg-neutral-900/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors border-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur text-white text-[11px] px-2 py-1 rounded">
                  Đã chọn ảnh
                </div>
              </>
            ) : (
              <div className="p-4 flex flex-col items-center justify-center h-full w-full">
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    type="button"
                    className="flex flex-col items-center p-2 rounded-xl hover:bg-brand-navy/5 transition-colors border-0 bg-transparent w-full cursor-pointer"
                  >
                    <UploadCloud className="w-7 h-7 text-brand-navy mb-2 opacity-80" />
                    <span className="text-label-sm font-semibold text-brand-navy">Tải ảnh lên</span>
                  </button>

                  <div className="h-px bg-neutral-200 w-3/4 mx-auto" />

                  <button
                    onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                    type="button"
                    className="flex flex-col items-center p-2 rounded-xl hover:bg-brand-navy/5 transition-colors border-0 bg-transparent w-full cursor-pointer"
                  >
                    <CameraIcon className="w-7 h-7 text-brand-navy mb-2 opacity-80" />
                    <span className="text-label-sm font-semibold text-brand-navy">Chụp ảnh selfie</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Context fields */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* Product selection */}
          <div>
            <label className="text-label-md font-semibold text-neutral-900 mb-3 block">
              Sản phẩm cần tư vấn <span className="text-neutral-400 font-normal">(tùy chọn)</span>
            </label>
            {selectedProduct ? (
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                {selectedProduct.garmentUrl && (
                  <img
                    src={selectedProduct.garmentUrl}
                    alt={selectedProduct.name}
                    className="w-14 h-16 rounded-lg object-cover bg-neutral-100 shrink-0 border border-neutral-100"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold text-neutral-900 truncate">
                    {selectedProduct.name}
                  </p>
                  {typeof selectedProduct.price === 'number' && selectedProduct.price > 0 && (
                    <p className="text-label-sm font-semibold text-brand-navy mt-0.5">
                      {selectedProduct.price.toLocaleString('vi-VN')} đ
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowCatalogModal(true)}
                  type="button"
                  className="text-label-sm font-bold text-brand-navy hover:underline border-0 bg-transparent cursor-pointer whitespace-nowrap"
                >
                  Đổi sản phẩm
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCatalogModal(true)}
                type="button"
                className="w-full h-11 px-4 rounded-xl border border-brand-navy/40 text-brand-navy font-semibold text-label-sm hover:bg-brand-navy hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Package className="w-4 h-4" />
                {productsLoading ? 'Đang tải catalog...' : 'Chọn từ catalog'}
              </button>

            )}
          </div>

          {/* Occasion */}
          <div>
            <label className="text-label-md font-semibold text-neutral-900 mb-3 block">
              Dịp mặc
            </label>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((occ) => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => handleSelectPresetOccasion(occ)}
                  className={`px-4 py-2 rounded-full text-label-md font-medium transition-colors border cursor-pointer ${
                    !isCustomOccasion && occasion === occ
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {occ}
                </button>
              ))}
              <button
                type="button"
                onClick={handleSelectCustomOccasion}
                className={`px-4 py-2 rounded-full text-label-md font-medium transition-colors border cursor-pointer ${
                  isCustomOccasion
                    ? 'bg-brand-navy text-white border-brand-navy'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                Khác...
              </button>
            </div>

            {isCustomOccasion && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-150">
                <input
                  type="text"
                  value={customOccasionInput}
                  onChange={(e) => handleCustomOccasionChange(e.target.value)}
                  placeholder="Nhập dịp mặc của bạn (VD: Dạo phố, Du lịch biển, Tiệc sinh nhật, Hẹn hò...)"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Style + budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label-md font-semibold text-neutral-900 mb-2 block">
                Phong cách yêu thích
              </label>
              <div className="flex flex-wrap gap-2">
                {STYLE_PREFERENCES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => handleSelectPresetStyle(style)}
                    className={`px-3 py-1.5 rounded-full text-label-sm font-medium transition-colors border cursor-pointer ${
                      !isCustomStyle && stylePreference === style
                        ? 'bg-brand-navy/10 text-brand-navy border-brand-navy/40 font-semibold'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {style}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleToggleCustomStyle}
                  className={`px-3 py-1.5 rounded-full text-label-sm font-medium transition-colors border cursor-pointer ${
                    isCustomStyle
                      ? 'bg-brand-navy/10 text-brand-navy border-brand-navy/40 font-semibold'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  Khác...
                </button>
              </div>

              {isCustomStyle && (
                <div className="mt-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <input
                    type="text"
                    value={customStyleInput}
                    onChange={(e) => handleCustomStyleChange(e.target.value)}
                    placeholder="Nhập phong cách (VD: Vintage, Y2K, Streetwear, Cổ điển...)"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all"
                    autoFocus
                  />
                </div>
              )}
            </div>
            <div>
              <label className="text-label-md font-semibold text-neutral-900 mb-2 block">
                <Wallet className="w-4 h-4 inline mr-1 text-brand-navy" /> Ngân sách
              </label>
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBudget(budget === b ? '' : b)}
                    className={`px-3 py-1.5 rounded-full text-label-sm font-medium transition-colors border cursor-pointer ${budget === b
                        ? 'bg-brand-navy/10 text-brand-navy border-brand-navy/40'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                      }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Gender preference */}
          <div>
            <label className="text-label-md font-semibold text-neutral-900 mb-2 block">
              Giới tính tư vấn <span className="text-neutral-400 font-normal">(tùy chọn)</span>
            </label>
            <div className="flex gap-2">
              {([
                ['male', 'Nam'],
                ['female', 'Nữ'],
                ['other', 'Khác'],
              ] as [GenderPref, string][]).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setGenderPreference(genderPreference === value ? '' : value)}
                  className={`px-4 py-2 rounded-xl text-label-sm font-medium transition-colors border cursor-pointer ${genderPreference === value
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Error banner */}
          {pageState === 'idle' && errorMessage && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 rounded-xl border border-red-100">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-body-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Analyze */}
          <button
            onClick={handleAnalyze}
            disabled={!photoFile || isAnalyzing}
            type="button"
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-label-md font-bold text-white transition-all border-0 ${!photoFile
                ? 'bg-neutral-300 cursor-not-allowed'
                : isAnalyzing
                  ? 'bg-brand-navy/80 cursor-wait'
                  : 'bg-brand-navy hover:bg-brand-navy/90 shadow-md cursor-pointer'
              }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang phân tích dáng người & màu da...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-brand-gold animate-bounce" /> Phân tích phong cách bằng AI
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { BUDGETS, GENDER_OPTIONS, IMAGE_CONSENT_TEXT, OCCASIONS, STYLE_PREFERENCES } from '@/features/stylist/constants/ai-stylist-page';
import type { StylistInputPanelProps } from '@/features/stylist/types/stylist-input-panel';
import {
  AlertTriangle,
  Briefcase,
  Camera as CameraIcon,
  Palette,
  Plus,
  ScanFace,
  ShieldCheck,
  Shirt,
  Sparkles,
  UploadCloud,
  UserRound,
  Wallet,
  X
} from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 px-3.5 rounded-full text-label-md font-medium border transition-colors cursor-pointer ${active
        ? 'bg-brand-navy text-white border-brand-navy'
        : 'bg-white text-neutral-700 border-neutral-200 hover:border-brand-navy/40 hover:text-brand-navy'
        }`}
    >
      {children}
    </button>
  );
}

function OptionGroup({ icon: Icon, label, children }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 mb-2.5 text-label-sm font-semibold text-neutral-500">
        <Icon className="w-3.5 h-3.5" /> {label}
      </p>
      {children}
    </div>
  );
}

const TEXT_INPUT_CLASS =
  'mt-2.5 w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-white text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-brand-navy/15 focus:border-brand-navy transition-all';

export function StylistInputPanel({ photoUrl, fileInputRef, handleRemovePhoto, cameraInputRef, selectedProduct, setShowCatalogModal, productsLoading, setOccasion, occasion, setStylePreference, stylePreference, setBudget, budget, setGenderPreference, genderPreference, pageState, errorMessage, handleAnalyze, photoFile, imageConsent, onImageConsentChange, showConsentError, isAnalyzing, onCancelEdit }: StylistInputPanelProps) {
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
    <section className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-5 md:p-7 mb-6">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Ảnh: tùy chọn, chỉ để AI đọc dáng người và màu da */}
        <div className="flex md:flex-col items-center md:items-stretch gap-4 md:gap-2.5 md:w-[176px] shrink-0">
          <div
            className={`relative w-[84px] h-[112px] md:w-full md:h-auto md:aspect-[3/4] shrink-0 rounded-2xl overflow-hidden ${photoUrl
              ? ''
              : 'border border-dashed border-neutral-300 bg-brand-cream'
              }`}
          >
            {photoUrl ? (
              <>
                {/* blob: URL của ảnh vừa chọn, next/image không tối ưu được nên dùng thẻ img. */}
                <img src={photoUrl} alt="Ảnh của bạn" className="w-full h-full object-cover" />
                <button
                  onClick={handleRemovePhoto}
                  type="button"
                  aria-label="Xoá ảnh"
                  className="absolute top-1.5 right-1.5 w-7 h-7 bg-neutral-900/55 hover:bg-neutral-900/80 rounded-full flex items-center justify-center text-white border-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="h-full flex flex-col p-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Tải ảnh lên"
                  className="flex-1 flex flex-col items-center justify-center gap-2 text-brand-navy border-0 bg-transparent cursor-pointer"
                >
                  <ScanFace className="w-7 h-7 md:w-9 md:h-9 opacity-70" />
                  <span className="hidden md:block text-label-md font-semibold text-neutral-900">Ảnh của bạn</span>
                </button>
                <div className="hidden md:flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 w-full rounded-full bg-white border border-neutral-200 text-label-sm font-semibold text-neutral-700 hover:border-brand-navy/40 hover:text-brand-navy flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Tải ảnh lên
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="h-8 w-full rounded-full bg-white border border-neutral-200 text-label-sm font-semibold text-neutral-700 hover:border-brand-navy/40 hover:text-brand-navy flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <CameraIcon className="w-3.5 h-3.5" /> Chụp ảnh
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop: một dòng dưới ô ảnh */}
          <p className="hidden md:flex items-center justify-center gap-1 text-[11px] text-neutral-400 whitespace-nowrap">
            <ShieldCheck className="w-3 h-3 text-semantic-success" /> Tùy chọn · không lưu ảnh
          </p>

          {/* Mobile: chữ và nút nằm cạnh ô ảnh */}
          <div className="md:hidden flex-1 min-w-0">
            <p className="text-label-md font-semibold text-neutral-900">Ảnh của bạn</p>
            <p className="text-label-sm text-neutral-500">Tùy chọn, giúp AI đọc dáng và màu da</p>
            {!photoUrl && (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-3 rounded-full border border-neutral-200 bg-white text-label-sm font-semibold text-neutral-700 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Tải lên
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-8 px-3 rounded-full border border-neutral-200 bg-white text-label-sm font-semibold text-neutral-700 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <CameraIcon className="w-3.5 h-3.5" /> Chụp
                </button>
              </div>
            )}
            <p className="mt-2 flex items-center gap-1 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3 h-3 text-semantic-success" /> Không lưu ảnh
            </p>
          </div>
        </div>

        {/* Yêu cầu */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <OptionGroup icon={Briefcase} label="Dịp mặc">
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((occ) => (
                <Chip key={occ} active={!isCustomOccasion && occasion === occ} onClick={() => handleSelectPresetOccasion(occ)}>
                  {occ}
                </Chip>
              ))}
              <Chip active={isCustomOccasion} onClick={handleSelectCustomOccasion}>Khác…</Chip>
            </div>
            {isCustomOccasion && (
              <input
                type="text"
                value={customOccasionInput}
                onChange={(e) => handleCustomOccasionChange(e.target.value)}
                placeholder="VD: Hẹn hò, Du lịch biển, Tiệc sinh nhật"
                className={TEXT_INPUT_CLASS}
                autoFocus
              />
            )}
          </OptionGroup>

          <OptionGroup icon={Palette} label="Phong cách">
            <div className="flex flex-wrap gap-2">
              {STYLE_PREFERENCES.map((style) => (
                <Chip key={style} active={!isCustomStyle && stylePreference === style} onClick={() => handleSelectPresetStyle(style)}>
                  {style}
                </Chip>
              ))}
              <Chip active={isCustomStyle} onClick={handleToggleCustomStyle}>Khác…</Chip>
            </div>
            {isCustomStyle && (
              <input
                type="text"
                value={customStyleInput}
                onChange={(e) => handleCustomStyleChange(e.target.value)}
                placeholder="VD: Vintage, Cổ điển, Nữ tính"
                className={TEXT_INPUT_CLASS}
                autoFocus
              />
            )}
          </OptionGroup>

          <div className="flex flex-wrap gap-x-10 gap-y-5">
            <OptionGroup icon={Wallet} label="Ngân sách mỗi bộ">
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <Chip key={b} active={budget === b} onClick={() => setBudget(budget === b ? '' : b)}>{b}</Chip>
                ))}
              </div>
            </OptionGroup>
            <OptionGroup icon={UserRound} label="Giới tính">
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map(({ value, label }) => (
                  <Chip
                    key={value}
                    active={genderPreference === value}
                    onClick={() => setGenderPreference(genderPreference === value ? '' : value)}
                  >
                    {label}
                  </Chip>
                ))}
              </div>
            </OptionGroup>
          </div>

          <OptionGroup icon={Shirt} label="Món muốn phối cùng">
            {selectedProduct ? (
              <div className="inline-flex max-w-full items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-2xl border border-brand-navy/30 bg-brand-navy/5">
                {selectedProduct.garmentUrl && (
                  <div className="relative w-9 h-11 shrink-0 rounded-lg overflow-hidden bg-neutral-100">
                    <Image src={selectedProduct.garmentUrl} alt={selectedProduct.name} fill sizes="36px" className="object-cover" />
                  </div>
                )}
                <span className="min-w-0 truncate text-body-sm font-semibold text-neutral-900">{selectedProduct.name}</span>
                <button
                  onClick={() => setShowCatalogModal(true)}
                  type="button"
                  className="shrink-0 text-label-sm font-semibold text-brand-navy hover:underline border-0 bg-transparent cursor-pointer"
                >
                  Đổi
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCatalogModal(true)}
                type="button"
                className="h-9 px-3.5 rounded-full border border-dashed border-neutral-300 text-label-md font-medium text-neutral-600 hover:border-brand-navy/40 hover:text-brand-navy flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {productsLoading ? 'Đang tải…' : 'Chọn từ cửa hàng'}
              </button>
            )}
          </OptionGroup>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-neutral-100 flex flex-col gap-3">
        {/* Đồng ý dùng ảnh: bắt buộc khi có ảnh */}
        {photoFile && (
          <label
            className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${showConsentError && !imageConsent
              ? 'border-semantic-error bg-red-50'
              : 'border-neutral-200 bg-brand-cream'
              }`}
          >
            <input
              type="checkbox"
              checked={imageConsent}
              onChange={(e) => onImageConsentChange(e.target.checked)}
              className="mt-0.5 w-4 h-4 shrink-0 accent-brand-navy cursor-pointer"
            />
            <span className="text-label-sm text-neutral-700 leading-relaxed">{IMAGE_CONSENT_TEXT}</span>
          </label>
        )}

        {pageState === 'idle' && errorMessage && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-body-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-2.5">
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="h-12 px-5 rounded-xl border border-neutral-200 bg-white text-label-md font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              Xem lại kết quả
            </button>
          )}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            type="button"
            className="w-full sm:flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-label-md font-bold text-white bg-brand-navy hover:bg-brand-navy/90 shadow-sm transition-colors border-0 cursor-pointer disabled:bg-brand-navy/70 disabled:cursor-wait"
          >
            {isAnalyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang phối đồ…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Gợi ý bộ phối
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

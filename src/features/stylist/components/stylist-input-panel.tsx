'use client';

import { BUDGETS, GENDER_OPTIONS, IMAGE_CONSENT_TEXT, OCCASIONS, STYLE_PREFERENCES } from '@/features/stylist/constants/ai-stylist-page';
import type { StylistInputPanelProps } from '@/features/stylist/types/stylist-input-panel';
import {
  AlertTriangle,
  Camera as CameraIcon,
  Check,
  Loader2,
  Plus,
  ScanFace,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X
} from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';

const OUTLINE_BUTTON_CLASS =
  `inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-[2px] border border-landing-obsidian/70 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood ${focusRing}`;

const TEXT_INPUT_CLASS =
  `mt-3 h-11 w-full rounded-[2px] border border-landing-line bg-landing-paper/60 px-3.5 text-sm text-landing-obsidian placeholder:text-landing-muted/70 transition-colors hover:border-landing-brass ${focusRing}`;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-10 rounded-[2px] border px-3.5 text-[13px] transition-colors ${focusRing} ${active
        ? 'border-landing-oxblood bg-landing-oxblood text-landing-paper'
        : 'border-landing-line bg-landing-paper/60 text-landing-obsidian/80 hover:border-landing-oxblood hover:text-landing-oxblood'
        }`}
    >
      {children}
    </button>
  );
}

function OptionGroup({ index, label, children }: { index: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 flex items-baseline gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink">
        <span className="font-mono tracking-[0.12em] text-landing-muted">{index}</span>
        {label}
      </p>
      {children}
    </div>
  );
}

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

  const consentInvalid = showConsentError && !imageConsent;

  return (
    <section className="mb-8 rounded-[2px] border border-landing-line bg-landing-ivory p-5 md:p-8">
      <div className="flex flex-col gap-7 md:flex-row md:gap-10">
        {/* Ảnh: tùy chọn, chỉ để AI đọc dáng người và màu da */}
        <div className="flex shrink-0 items-center gap-4 md:w-[188px] md:flex-col md:items-stretch md:gap-3">
          <div
            className={`relative h-[112px] w-[84px] shrink-0 overflow-hidden rounded-[2px] md:aspect-[3/4] md:h-auto md:w-full ${photoUrl
              ? 'border border-landing-line'
              : 'border border-dashed border-landing-brass/70 bg-landing-paper'
              }`}
          >
            {photoUrl ? (
              <>
                <Image
                  src={photoUrl}
                  alt="Ảnh của bạn"
                  fill
                  unoptimized
                  sizes="(min-width: 768px) 188px, 84px"
                  className="object-cover"
                />
                <button
                  onClick={handleRemovePhoto}
                  type="button"
                  aria-label="Xoá ảnh"
                  className={`absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-[2px] bg-landing-obsidian/70 text-landing-paper transition-colors hover:bg-landing-obsidian ${focusRing}`}
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </>
            ) : (
              <div className="flex h-full flex-col p-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Tải ảnh lên"
                  className={`flex flex-1 flex-col items-center justify-center gap-2 text-landing-oxblood ${focusRing}`}
                >
                  <ScanFace className="h-7 w-7 md:h-9 md:w-9" strokeWidth={1.25} />
                  <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-obsidian md:block">Ảnh của bạn</span>
                </button>
                <div className="hidden flex-col gap-1.5 md:flex">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className={OUTLINE_BUTTON_CLASS}>
                    <UploadCloud className="h-3.5 w-3.5" strokeWidth={1.75} /> Tải ảnh lên
                  </button>
                  <button type="button" onClick={() => cameraInputRef.current?.click()} className={OUTLINE_BUTTON_CLASS}>
                    <CameraIcon className="h-3.5 w-3.5" strokeWidth={1.75} /> Chụp ảnh
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop: một dòng dưới ô ảnh */}
          <p className="hidden items-center justify-center gap-1.5 whitespace-nowrap text-[11px] text-landing-muted md:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-landing-sage-ink" strokeWidth={1.75} /> Tùy chọn · không lưu ảnh
          </p>

          {/* Mobile: chữ và nút nằm cạnh ô ảnh */}
          <div className="min-w-0 flex-1 md:hidden">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-obsidian">Ảnh của bạn</p>
            <p className="mt-1 text-xs text-landing-muted">Tùy chọn, giúp AI đọc dáng và màu da</p>
            {!photoUrl && (
              <div className="mt-2.5 flex gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className={OUTLINE_BUTTON_CLASS}>
                  <UploadCloud className="h-3.5 w-3.5" strokeWidth={1.75} /> Tải lên
                </button>
                <button type="button" onClick={() => cameraInputRef.current?.click()} className={OUTLINE_BUTTON_CLASS}>
                  <CameraIcon className="h-3.5 w-3.5" strokeWidth={1.75} /> Chụp
                </button>
              </div>
            )}
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-landing-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-landing-sage-ink" strokeWidth={1.75} /> Không lưu ảnh
            </p>
          </div>
        </div>

        {/* Yêu cầu */}
        <div className="flex min-w-0 flex-1 flex-col gap-7">
          <OptionGroup index="01" label="Dịp mặc">
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
                aria-label="Dịp mặc khác"
                className={TEXT_INPUT_CLASS}
                autoFocus
              />
            )}
          </OptionGroup>

          <OptionGroup index="02" label="Phong cách">
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
                aria-label="Phong cách khác"
                className={TEXT_INPUT_CLASS}
                autoFocus
              />
            )}
          </OptionGroup>

          <div className="flex flex-wrap gap-x-10 gap-y-7">
            <OptionGroup index="03" label="Ngân sách mỗi bộ">
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <Chip key={b} active={budget === b} onClick={() => setBudget(budget === b ? '' : b)}>{b}</Chip>
                ))}
              </div>
            </OptionGroup>
            <OptionGroup index="04" label="Giới tính">
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

          <OptionGroup index="05" label="Món muốn phối cùng">
            {selectedProduct ? (
              <div className="inline-flex max-w-full items-center gap-3 rounded-[2px] border border-landing-oxblood/40 bg-landing-paper/60 py-1.5 pl-1.5 pr-3">
                {selectedProduct.garmentUrl && (
                  <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-[2px] bg-landing-paper">
                    <Image src={selectedProduct.garmentUrl} alt={selectedProduct.name} fill sizes="40px" className="object-contain" />
                  </div>
                )}
                <span className="product-name-line min-w-0 truncate text-landing-obsidian">{selectedProduct.name}</span>
                <button
                  onClick={() => setShowCatalogModal(true)}
                  type="button"
                  className={`shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-oxblood underline-offset-4 hover:underline ${focusRing}`}
                >
                  Đổi
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCatalogModal(true)}
                type="button"
                className={`inline-flex h-10 items-center gap-1.5 rounded-[2px] border border-dashed border-landing-brass/70 px-3.5 text-[13px] text-landing-obsidian/80 transition-colors hover:border-landing-oxblood hover:text-landing-oxblood ${focusRing}`}
              >
                <Plus className="h-4 w-4" strokeWidth={1.75} />
                {productsLoading ? 'Đang tải…' : 'Chọn từ cửa hàng'}
              </button>
            )}
          </OptionGroup>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-landing-line/70 pt-6">
        {/* Đồng ý dùng ảnh: bắt buộc khi có ảnh */}
        {photoFile && (
          <label
            className={`flex cursor-pointer items-start gap-3 border-l-2 bg-landing-paper/60 px-4 py-3 text-xs leading-relaxed text-landing-obsidian/80 ${consentInvalid ? 'border-destructive' : 'border-landing-brass'}`}
          >
            <span className="relative mt-0.5 flex h-4 w-4 shrink-0">
              <input
                type="checkbox"
                checked={imageConsent}
                onChange={(e) => onImageConsentChange(e.target.checked)}
                aria-invalid={consentInvalid}
                className="peer absolute inset-0 cursor-pointer opacity-0"
              />
              <span
                aria-hidden="true"
                className="h-4 w-4 rounded-[2px] border border-landing-obsidian/40 transition-colors peer-checked:border-landing-oxblood peer-checked:bg-landing-oxblood peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-landing-oxblood"
              />
              <Check aria-hidden="true" className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-landing-paper opacity-0 peer-checked:opacity-100" strokeWidth={2.5} />
            </span>
            <span>{IMAGE_CONSENT_TEXT}</span>
          </label>
        )}

        {pageState === 'idle' && errorMessage && (
          <div role="alert" className="flex items-start gap-3 border-l-2 border-destructive bg-landing-paper/60 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" strokeWidth={1.75} />
            <p className="text-sm text-landing-obsidian">{errorMessage}</p>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className={`h-12 rounded-[2px] border border-landing-obsidian/70 px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood ${focusRing}`}
            >
              Xem lại kết quả
            </button>
          )}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            type="button"
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-[2px] bg-landing-oxblood text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-paper transition-colors hover:bg-landing-obsidian disabled:cursor-wait disabled:opacity-70 sm:flex-1 ${focusRing}`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                Đang phối đồ…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" strokeWidth={1.75} /> Gợi ý bộ phối
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

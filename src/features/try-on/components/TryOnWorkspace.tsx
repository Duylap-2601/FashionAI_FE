import { ComparisonSlider } from '@/features/try-on/components/ComparisonSlider';
import { GarmentColorPicker, GarmentSlot, TryOnSegmented, tryOnButtonClassName, tryOnFocusRing } from '@/features/try-on/components/garment-slot';
import { GenerateButton } from '@/features/try-on/components/GenerateButton';
import { UploadZone } from '@/features/try-on/components/UploadZone';
import type { GarmentMode } from '@/features/try-on/types/try-on-types';
import type { TryOnWorkspaceProps } from '@/features/try-on/types/try-on-workspace';
import { cn } from '@/lib/utils';
import { Download, History, Layers, Loader2, Share2 } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';

const MODE_OPTIONS: { value: GarmentMode; label: string; icon?: React.ReactNode }[] = [
  { value: 'single', label: 'Một món' },
  { value: 'combo', label: 'Phối bộ', icon: <Layers className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" /> },
];

export function TryOnWorkspace({
  userPhotoUrl,
  resultPhotoUrl,
  resultSourcePhotoUrl,
  isLoading,
  inputError,
  garmentMode,
  selectedProduct,
  selectedColor,
  outerProduct,
  upperProduct,
  lowerProduct,
  outerColor,
  upperColor,
  lowerColor,
  canGenerate,
  isSubmitting,
  isBlocked,
  quotaCost,
  onFileSelect,
  onCameraSelect,
  onModeChange,
  onOpenCatalog,
  onSelectColor,
  onSelectOuterColor,
  onSelectUpperColor,
  onSelectLowerColor,
  onClearOuter,
  onGenerate,
  onDownload,
  onShare,
  onTryAnother,
  onChangePhoto,
}: TryOnWorkspaceProps) {
  const selectedCount = garmentMode === 'combo' ? [outerProduct, upperProduct, lowerProduct].filter(Boolean).length : 1;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
      <section aria-label="Ảnh của bạn" className="min-w-0">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-[1.375rem] leading-tight text-landing-obsidian">{resultPhotoUrl ? 'Kết quả' : 'Ảnh của bạn'}</h2>
          <p className="text-xs text-landing-muted">{resultPhotoUrl ? 'Kéo để so sánh trước và sau' : 'Một người, thấy rõ toàn thân'}</p>
        </div>

        <div className="relative mx-auto w-full max-w-[540px]">
          {resultPhotoUrl ? (
            <ComparisonSlider before={resultSourcePhotoUrl || userPhotoUrl || ''} after={resultPhotoUrl} />
          ) : (
            <UploadZone onFileSelect={onFileSelect} uploadedImage={userPhotoUrl} onCameraSelect={onCameraSelect} disabled={isLoading} error={inputError} />
          )}

          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 border border-landing-line bg-landing-paper/90 px-6 text-center" role="status" aria-live="polite">
              <Loader2 className="h-8 w-8 animate-spin text-landing-oxblood motion-reduce:animate-none" strokeWidth={1.5} aria-hidden="true" />
              <p className="font-display text-2xl leading-tight text-landing-obsidian">Đang thử trang phục</p>
              <p className="max-w-[260px] text-sm text-landing-muted">Giữ nguyên ảnh và trang phục cho tới khi có kết quả.</p>
            </div>
          ) : null}
        </div>

        {resultPhotoUrl ? (
          <div className="mx-auto mt-4 flex w-full max-w-[540px] flex-wrap items-center gap-2">
            <button onClick={onDownload} type="button" className={tryOnButtonClassName('outline', 'sm')}>
              <Download className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" /> Tải về
            </button>
            <button onClick={onShare} type="button" className={tryOnButtonClassName('outline', 'sm')}>
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" /> Chia sẻ
            </button>
            <Link href="/profile/history" className={tryOnButtonClassName('outline', 'sm')}>
              <History className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" /> Lịch sử
            </Link>
            <div className="flex gap-5 sm:ml-auto">
              <button onClick={onTryAnother} type="button" className={tryOnButtonClassName('quiet', 'sm')}>
                Thử bộ khác
              </button>
              <button onClick={onChangePhoto} type="button" className={tryOnButtonClassName('quiet', 'sm')}>
                Đổi ảnh
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <aside aria-label="Trang phục" className="flex flex-col gap-6 self-start lg:sticky lg:top-[97px]">
        <div className="flex items-baseline justify-between gap-4 border-t border-landing-line pt-5 lg:border-t-0 lg:pt-0">
          <h2 className="font-display text-[1.375rem] leading-tight text-landing-obsidian">Trang phục</h2>
          <span className="font-mono text-xs text-landing-muted">{String(selectedCount).padStart(2, '0')} món</span>
        </div>

        <TryOnSegmented ariaLabel="Số món thử" value={garmentMode} onChange={onModeChange} disabled={isLoading} options={MODE_OPTIONS} />

        {garmentMode === 'single' ? (
          <div>
            <GarmentSlot label="Trang phục" product={selectedProduct} color={selectedColor} emptyLabel="Chưa chọn trang phục" onSelect={() => onOpenCatalog('single')} disabled={isLoading} />
            <GarmentColorPicker product={selectedProduct} selectedColor={selectedColor} onSelectColor={onSelectColor} disabled={isLoading} label="Màu" />
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-landing-line/70 border-y border-landing-line/70">
            <div className="py-4">
              <GarmentSlot label="Lớp ngoài" hint="Tùy chọn" product={outerProduct || null} color={outerColor} emptyLabel="Áo khoác hoặc blazer" onSelect={() => onOpenCatalog('outer')} onClear={outerProduct ? onClearOuter : undefined} disabled={isLoading} />
              <GarmentColorPicker product={outerProduct || null} selectedColor={outerColor} onSelectColor={onSelectOuterColor} disabled={isLoading} label="Màu lớp ngoài" />
            </div>
            <div className="py-4">
              <GarmentSlot label="Lớp trong" product={upperProduct} color={upperColor} emptyLabel="Sơ mi hoặc áo trong" onSelect={() => onOpenCatalog('upper')} disabled={isLoading} />
              <GarmentColorPicker product={upperProduct} selectedColor={upperColor} onSelectColor={onSelectUpperColor} disabled={isLoading} label="Màu lớp trong" />
            </div>
            <div className="py-4">
              <GarmentSlot label="Phần dưới" product={lowerProduct} color={lowerColor} emptyLabel="Quần hoặc chân váy" onSelect={() => onOpenCatalog('lower')} disabled={isLoading} />
              <GarmentColorPicker product={lowerProduct} selectedColor={lowerColor} onSelectColor={onSelectLowerColor} disabled={isLoading} label="Màu phần dưới" />
            </div>
          </div>
        )}

        <GenerateButton canGenerate={canGenerate} isSubmitting={isSubmitting} isBlocked={isBlocked} quotaCost={quotaCost} onGenerate={onGenerate} />

        {!userPhotoUrl && !resultPhotoUrl ? (
          <p className={cn('text-xs leading-relaxed text-landing-muted')}>
            Cần một ảnh toàn thân trước khi thử.{' '}
            <button type="button" onClick={onCameraSelect} className={cn('text-landing-oxblood underline-offset-4 hover:underline', tryOnFocusRing)}>
              Chụp ngay
            </button>
          </p>
        ) : null}
      </aside>
    </div>
  );
}

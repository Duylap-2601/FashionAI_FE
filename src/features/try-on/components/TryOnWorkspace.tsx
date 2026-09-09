import type { Product } from '@/features/products/types/products';
import { SelectedProductCard } from '@/features/try-on/components/CatalogModal';
import { ComparisonSlider } from '@/features/try-on/components/ComparisonSlider';
import { GenerateButton } from '@/features/try-on/components/GenerateButton';
import { UploadZone } from '@/features/try-on/components/UploadZone';
import type { TryOnWorkspaceProps } from '@/features/try-on/types/try-on-workspace';
import { Bookmark, Download, Info, Layers, Loader2, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function GarmentSlot({ title, product, actionLabel, emptyLabel, onSelect }: { title: string; product: Product | null; actionLabel: string; emptyLabel: string; onSelect: () => void }) {
  return (
    <div className="p-4 bg-[#FDFAF7] rounded-2xl border border-[#CDBCAB]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-semibold text-[#38140C]">{title}</span>
        <button type="button" onClick={onSelect} className="text-[13px] font-semibold text-[#38140C] hover:underline">{actionLabel}</button>
      </div>
      {product ? (
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-18 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-100">
            <Image src={product.image} alt={product.name} fill sizes="56px" unoptimized className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-body-sm font-bold text-brand-navy truncate">{product.name}</h4>
            <p className="text-[12px] text-neutral-500">{product.price}</p>
          </div>
        </div>
      ) : (
        <p className="text-body-sm text-neutral-400 italic py-2">{emptyLabel}</p>
      )}
    </div>
  );
}

export function TryOnWorkspace({
  userPhotoUrl,
  resultPhotoUrl,
  resultSourcePhotoUrl,
  isLoading,
  inputError,
  garmentMode,
  selectedProduct,
  upperProduct,
  lowerProduct,
  canGenerate,
  isSubmitting,
  isBlocked,
  quotaCost,
  onFileSelect,
  onCameraSelect,
  onUseMockPhoto,
  onModeChange,
  onOpenCatalog,
  onGenerate,
  onDownload,
  onShare,
  onTryAnother,
  onChangePhoto,
}: TryOnWorkspaceProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-6 lg:gap-8">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-[20px] font-semibold text-[#11100F]">Ảnh của bạn / Kết quả</h2>
          <p className="text-body-sm text-neutral-500 mt-0.5">Khung ảnh toàn thân, giữ nguyên tỷ lệ để dễ so sánh.</p>
        </div>

        <div className="relative">
          {resultPhotoUrl ? (
            <ComparisonSlider before={resultSourcePhotoUrl || userPhotoUrl || ''} after={resultPhotoUrl} />
          ) : (
            <UploadZone onFileSelect={onFileSelect} uploadedImage={userPhotoUrl} onCameraSelect={onCameraSelect} disabled={isLoading} error={inputError} />
          )}

          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#FDFAF7]/90 text-center backdrop-blur-sm border border-[#CDBCAB]" role="status" aria-live="polite">
              <Loader2 className="h-9 w-9 animate-spin text-[#38140C] motion-reduce:animate-none" />
              <div>
                <p className="text-body-md font-semibold text-[#11100F]">Đang thử trang phục</p>
                <p className="text-body-sm text-neutral-600">Vui lòng giữ nguyên ảnh và trang phục trong lúc xử lý.</p>
              </div>
            </div>
          )}
        </div>

        {!userPhotoUrl && !resultPhotoUrl && (
          <button onClick={onUseMockPhoto} type="button" className="text-label-sm text-[#38140C] hover:text-[#38140C]/80 font-semibold underline underline-offset-2 text-left bg-transparent border-0 cursor-pointer">
            Dùng ảnh minh họa để xem bố cục
          </button>
        )}

        {resultPhotoUrl && (
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
            <button onClick={onDownload} type="button" className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#CDBCAB] rounded-xl text-label-sm font-medium text-neutral-700 hover:bg-white transition-colors cursor-pointer bg-[#FDFAF7]">
              <Download className="w-4 h-4 text-[#38140C]" /> Tải về
            </button>
            <button onClick={onShare} type="button" className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#CDBCAB] rounded-xl text-label-sm font-medium text-neutral-700 hover:bg-white transition-colors cursor-pointer bg-[#FDFAF7]">
              <Share2 className="w-4 h-4 text-[#38140C]" /> Chia sẻ
            </button>
            <Link href="/profile/history" className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#CDBCAB] rounded-xl text-label-sm font-medium text-neutral-700 hover:bg-white transition-colors bg-[#FDFAF7]">
              <Bookmark className="w-4 h-4 text-[#38140C]" /> Lịch sử
            </Link>
            <button onClick={onTryAnother} type="button" className="px-4 py-2.5 text-label-sm font-semibold text-[#38140C] hover:underline border border-transparent bg-transparent cursor-pointer">
              Thử bộ khác
            </button>
            <button onClick={onChangePhoto} type="button" className="col-span-2 px-4 py-2.5 text-label-sm font-semibold text-[#38140C] hover:underline border border-transparent bg-transparent cursor-pointer sm:ml-auto sm:col-span-1">
              Đổi ảnh
            </button>
          </div>
        )}

        <div className="flex items-start gap-3 px-4 py-3 bg-[#FDFAF7] rounded-xl border border-[#CDBCAB]">
          <Info className="w-4 h-4 text-[#38140C] shrink-0 mt-0.5" />
          <p className="text-body-sm text-neutral-700">Ảnh minh họa chỉ để xem bố cục. Hãy tải ảnh cá nhân PNG/JPG dưới 10MB, toàn thân rõ nét để tạo kết quả thử đồ.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[#CDBCAB] bg-[#FDFAF7] p-4 md:p-5 self-start lg:sticky lg:top-24">
        <div>
          <h2 className="text-[20px] font-semibold text-[#11100F]">Trang phục</h2>
          <p className="text-body-sm text-neutral-500 mt-0.5">Chọn một món hoặc phối áo với quần/váy.</p>
        </div>

        <div className="flex p-1 bg-[#EFE9E1] rounded-xl w-full">
          <button type="button" disabled={isLoading} onClick={() => onModeChange('single')} className={`flex-1 px-4 py-2 rounded-lg text-label-sm font-medium transition-all border-0 disabled:cursor-not-allowed disabled:opacity-60 ${garmentMode === 'single' ? 'bg-white text-[#38140C] shadow-sm' : 'text-neutral-600 hover:text-neutral-800 bg-transparent'}`}>
            Một món
          </button>
          <button type="button" disabled={isLoading} onClick={() => onModeChange('combo')} className={`flex-1 px-4 py-2 rounded-lg text-label-sm font-medium transition-all border-0 flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60 ${garmentMode === 'combo' ? 'bg-white text-[#38140C] shadow-sm' : 'text-neutral-600 hover:text-neutral-800 bg-transparent'}`}>
            <Layers className="w-3.5 h-3.5" /> Phối bộ
          </button>
        </div>

        {garmentMode === 'single' ? (
          <div className="flex flex-col gap-4">
            <SelectedProductCard product={selectedProduct} onReplace={() => onOpenCatalog('single')} />
            <div className="rounded-xl overflow-hidden border border-[#CDBCAB] bg-white flex items-center justify-center relative aspect-[4/3]">
              <Image src={selectedProduct.image} alt={selectedProduct.name} fill sizes="(max-width: 1024px) 100vw, 50vw" unoptimized className="object-contain p-4" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <GarmentSlot
              title="Món 1: Áo / Blazer (Upper)"
              product={upperProduct}
              actionLabel={upperProduct ? 'Đổi áo khác' : '+ Chọn áo'}
              emptyLabel="Chưa chọn áo"
              onSelect={() => onOpenCatalog('upper')}
            />
            <GarmentSlot
              title="Món 2: Quần / Chân váy (Lower)"
              product={lowerProduct}
              actionLabel={lowerProduct ? 'Đổi quần/váy' : '+ Chọn quần/váy'}
              emptyLabel="Chưa chọn quần hoặc váy"
              onSelect={() => onOpenCatalog('lower')}
            />
            <div className="p-3.5 bg-white rounded-xl border border-[#CDBCAB] text-[13px] text-neutral-600 flex items-center justify-between">
              <span>Phối bộ sẽ dùng:</span>
              <span className="font-bold text-[#38140C]">2 lượt thử</span>
            </div>
          </div>
        )}

        <GenerateButton canGenerate={canGenerate} isSubmitting={isSubmitting} isBlocked={isBlocked} quotaCost={quotaCost} onGenerate={onGenerate} />
      </div>
    </div>
  );
}

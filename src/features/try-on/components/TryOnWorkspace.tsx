import type { Product } from '@/features/products/types/products';
import { SelectedProductCard } from '@/features/try-on/components/CatalogModal';
import { UploadZone } from '@/features/try-on/components/UploadZone';
import type { TryOnWorkspaceProps } from '@/features/try-on/types/try-on-workspace';
import { Info, Layers } from 'lucide-react';
import Image from 'next/image';

function GarmentSlot({ title, product, actionLabel, emptyLabel, onSelect }: { title: string; product: Product | null; actionLabel: string; emptyLabel: string; onSelect: () => void }) {
  return (
    <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-bold text-brand-navy uppercase tracking-wider">{title}</span>
        <button type="button" onClick={onSelect} className="text-[12px] font-bold text-[#5D1C34] hover:underline">{actionLabel}</button>
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
  garmentMode,
  selectedProduct,
  upperProduct,
  lowerProduct,
  onFileSelect,
  onCameraSelect,
  onUseMockPhoto,
  onModeChange,
  onOpenCatalog,
}: TryOnWorkspaceProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-heading-h3 font-semibold text-neutral-900">Ảnh của bạn</h2>
          <p className="text-body-sm text-neutral-500 mt-0.5">Upload ảnh toàn thân rõ mặt</p>
        </div>

        <UploadZone onFileSelect={onFileSelect} uploadedImage={userPhotoUrl} onCameraSelect={onCameraSelect} />

        {!userPhotoUrl && (
          <button onClick={onUseMockPhoto} type="button" className="text-label-sm text-brand-gold hover:text-brand-gold/80 font-semibold underline underline-offset-2 text-left bg-transparent border-0 cursor-pointer">
            Dùng ảnh mẫu để xem thử →
          </button>
        )}

        <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
          <Info className="w-4 h-4 text-semantic-info shrink-0 mt-0.5" />
          <p className="text-body-sm text-blue-700">Chụp ảnh toàn thân, đứng thẳng trước gương hoặc camera sau điện thoại, nền sáng, trang phục ôm sát để có kết quả tốt nhất.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-heading-h3 font-semibold text-neutral-900">Trang phục thử đồ</h2>
          <p className="text-body-sm text-neutral-500 mt-0.5">Chọn 1 món đơn hoặc phối combo 2 món (Áo + Quần/Váy)</p>
        </div>

        <div className="flex p-1 bg-neutral-100 rounded-xl w-fit">
          <button type="button" onClick={() => onModeChange('single')} className={`px-4 py-2 rounded-lg text-label-sm font-medium transition-all border-0 ${garmentMode === 'single' ? 'bg-white text-brand-navy shadow-sm' : 'text-neutral-500 hover:text-neutral-700 bg-transparent'}`}>
            1 Món đơn (1 quota)
          </button>
          <button type="button" onClick={() => onModeChange('combo')} className={`px-4 py-2 rounded-lg text-label-sm font-medium transition-all border-0 flex items-center gap-1.5 ${garmentMode === 'combo' ? 'bg-white text-brand-navy shadow-sm' : 'text-neutral-500 hover:text-neutral-700 bg-transparent'}`}>
            <Layers className="w-3.5 h-3.5" /> Combo 2 món (2 quota)
          </button>
        </div>

        {garmentMode === 'single' ? (
          <div className="flex flex-col gap-4">
            <SelectedProductCard product={selectedProduct} onReplace={() => onOpenCatalog('single')} />
            <div className="rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 flex items-center justify-center relative" style={{ height: 312 }}>
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
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-[12px] text-neutral-600 flex items-center justify-between">
              <span>⚡ Thử Combo 2 món sẽ trừ:</span>
              <span className="font-bold text-brand-navy">2 lượt quota</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

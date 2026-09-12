import { HangerIcon } from '@/components/ui/HangerIcon';
import { COMBO_OPTIONS } from '@/features/products/constants/product-detail-config';
import { getComboDiscount, getComboDisplayPrice, getComboOriginalPrice, getComboPrice } from '@/features/products/services/combo-pricing';
import type { ProductPurchasePanelProps } from '@/features/products/types/product-purchase-panel';
import { StarRating } from '@/features/reviews/components/StarRating';
import { AlertCircle, ChevronRight, MessageSquare, Minus, Plus, Ruler, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';

function ProductPrice({ product, selectedType, isComboSuit }: Pick<ProductPurchasePanelProps, 'product' | 'selectedType' | 'isComboSuit'>) {
  return (
    <div className="flex items-end gap-3 mb-6">
      <span className="text-[22px] font-bold text-brand-navy">
        {isComboSuit ? getComboDisplayPrice(selectedType) : product.price}
      </span>
      {isComboSuit ? (
        <>
          <span className="text-[16px] text-[#8B8880] line-through mb-1">{getComboOriginalPrice(selectedType)}</span>
          <span className="px-2.5 py-1 bg-semantic-error/10 text-semantic-error rounded-full text-label-sm font-bold tracking-wider mb-1">
            {getComboDiscount(selectedType)}
          </span>
        </>
      ) : (
        product.id === 'p3' && (
          <>
            <span className="text-[16px] text-[#8B8880] line-through mb-1">690.000đ</span>
            <span className="px-2.5 py-1 bg-semantic-error/10 text-semantic-error rounded-full text-label-sm font-bold tracking-wider mb-1">-20%</span>
          </>
        )
      )}
    </div>
  );
}

function MeasurementSummary({ isMeasurementComplete, measurements, catCompleteness }: Pick<ProductPurchasePanelProps, 'isMeasurementComplete' | 'measurements' | 'catCompleteness'>) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-2 mb-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
        <div className="flex items-start gap-2 text-body-sm font-bold text-brand-navy leading-snug min-w-0">
          <Ruler className="mt-0.5 w-4 h-4 shrink-0 text-[#5D1C34]" />
          <div className="min-w-0">
            <span>Hình thức: </span>
            <span className="text-[#5D1C34]">May đo theo số đo</span>
            <span className="hidden sm:inline text-[#5D1C34]"> cơ thể (Made-to-measure)</span>
          </div>
        </div>
        <Link href="/profile/measurements" className="inline-flex w-fit items-center gap-1 text-[12px] font-bold text-[#5D1C34] hover:underline min-[420px]:shrink-0">
          Cập nhật số đo <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {isMeasurementComplete ? (
        <div className="p-3.5 sm:p-4 bg-[#FDFBF7] border border-[#E5DFD5] rounded-xl animate-in fade-in duration-200">
          <div className="flex flex-col gap-1.5 mb-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
            <div className="text-[13px] font-bold text-green-700 flex items-start gap-1.5 leading-snug">
              <span className="shrink-0">✓</span>
              <span>Số đo đã sẵn sàng cho may đo</span>
            </div>
            <span className="text-[11px] text-neutral-500 font-medium">Tự động áp dụng khi đặt hàng</span>
          </div>
          <div className="grid grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-6 gap-2 text-[11px] font-medium text-neutral-600 bg-white p-2.5 rounded-lg border border-[#F0EEE9]">
            <div className="rounded-md bg-neutral-50 px-2 py-1.5 sm:bg-transparent sm:p-0">Ngực: <strong className="text-brand-navy">{measurements?.chest || '—'}cm</strong></div>
            <div className="rounded-md bg-neutral-50 px-2 py-1.5 sm:bg-transparent sm:p-0">Eo: <strong className="text-brand-navy">{measurements?.waist || '—'}cm</strong></div>
            <div className="rounded-md bg-neutral-50 px-2 py-1.5 sm:bg-transparent sm:p-0">Hông: <strong className="text-brand-navy">{measurements?.hip || '—'}cm</strong></div>
            <div className="rounded-md bg-neutral-50 px-2 py-1.5 sm:bg-transparent sm:p-0">Vai: <strong className="text-brand-navy">{measurements?.shoulder || '—'}cm</strong></div>
            <div className="rounded-md bg-neutral-50 px-2 py-1.5 sm:bg-transparent sm:p-0">Cao: <strong className="text-brand-navy">{measurements?.height || '—'}cm</strong></div>
            <div className="rounded-md bg-neutral-50 px-2 py-1.5 sm:bg-transparent sm:p-0">Nặng: <strong className="text-brand-navy">{measurements?.weight || '—'}kg</strong></div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-amber-800">Cần bổ sung số đo trước khi đặt may</p>
              <p className="text-[12px] text-amber-700 mt-1">
                Còn thiếu: <strong className="font-semibold">{catCompleteness?.missing?.map(m => m.label).join(', ') || 'số đo bắt buộc'}</strong>.
              </p>
              <Link
                href="/profile/measurements"
                className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 bg-amber-700 text-white rounded-lg text-[12px] font-bold hover:bg-amber-800 transition-colors shadow-2xs"
              >
                <Ruler className="w-3.5 h-3.5" /> Bổ sung số đo ngay
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductPurchasePanel({
  product,
  selectedType,
  selectedColor,
  quantity,
  isComboSuit,
  isMeasurementComplete,
  measurements,
  catCompleteness,
  reviewStats,
  pinned,
  isRackMutating,
  onSelectType,
  onSelectColor,
  onQuantityChange,
  onAddToCart,
  onTogglePin,
}: ProductPurchasePanelProps) {
  const subtotal = (isComboSuit ? getComboPrice(selectedType) : product.numericPrice) * quantity;

  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <div className="text-[11px] font-bold text-[#8B8880] uppercase tracking-widest mb-3">{product.brand || 'FASHIONAI COLLECTION'}</div>
        <div className="inline-block px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-[12px] font-medium mb-4">{product.category}</div>
        <h1 className="text-[32px] font-bold text-brand-navy leading-tight tracking-tight mb-4">{product.name}</h1>
        <button type="button" onClick={() => document.getElementById('product-reviews')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 cursor-pointer group text-left" title="Cuộn xuống xem đánh giá chi tiết">
          <StarRating value={reviewStats?.avgRating || 0} size="sm" readOnly />
          <span className="font-semibold text-brand-navy text-body-sm group-hover:underline">{reviewStats?.avgRating ? Number(reviewStats.avgRating).toFixed(1) : '5.0'}</span>
          <span className="text-body-sm text-neutral-500 group-hover:text-brand-navy transition-colors underline decoration-neutral-300 underline-offset-4">({reviewStats?.reviewCount || 0} đánh giá)</span>
        </button>
      </div>

      <ProductPrice product={product} selectedType={selectedType} isComboSuit={isComboSuit} />
      <div className="w-full h-px bg-neutral-200 mb-6"></div>

      {isComboSuit && (
        <div className="mb-6">
          <div className="text-body-sm font-semibold text-brand-navy mb-3">Phân loại sản phẩm:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {COMBO_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => onSelectType(opt.value)} className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${selectedType === opt.value ? 'border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy' : 'border-neutral-200 hover:border-neutral-400 bg-white'}`}>
                <div className="text-body-sm font-bold text-brand-navy">{opt.label}</div>
                <div className="text-[13px] text-neutral-500 mt-1 font-medium">{opt.price.toLocaleString('vi-VN')}đ</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="text-body-sm font-medium text-brand-navy mb-3">Màu sắc: <span className="font-normal text-neutral-600">{selectedColor}</span></div>
        <div className="flex gap-3">
          {product.colors?.map((col) => (
            <button key={col.name} type="button" onClick={() => onSelectColor(col.name)} className={`w-8 h-8 rounded-full border transition-all cursor-pointer ${selectedColor === col.name ? 'ring-2 ring-brand-navy ring-offset-2 scale-105' : 'border-neutral-200 hover:border-neutral-400'}`} style={{ backgroundColor: col.hex }} title={col.name} />
          )) || (
              <>
                <button className="w-8 h-8 rounded-full bg-white border-2 border-brand-navy ring-2 ring-white ring-offset-1 shadow-sm"></button>
                <button className="w-8 h-8 rounded-full bg-[#111111] border border-neutral-200 hover:border-neutral-400 transition-colors"></button>
              </>
            )}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-[#E5DFD5] bg-[#FDFBF7] p-3.5 shadow-sm sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <div className="text-body-sm font-bold text-brand-navy">Chọn số lượng</div>
            <div className="text-[11px] text-neutral-500">Có thể đặt nhiều sản phẩm cùng số đo</div>
          </div>
          <div className="flex items-center border border-neutral-200 rounded-xl h-[44px] overflow-hidden bg-white shadow-xs">
            <button onClick={() => onQuantityChange(Math.max(1, quantity - 1))} className="w-11 h-full flex items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:text-brand-navy transition-colors" aria-label="Giảm số lượng">
              <Minus className="w-4 h-4" />
            </button>
            <div className="w-12 h-full flex items-center justify-center text-body-sm font-medium text-brand-navy border-x border-neutral-200">{quantity}</div>
            <button onClick={() => onQuantityChange(quantity + 1)} className="w-11 h-full flex items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:text-brand-navy transition-colors" aria-label="Tăng số lượng">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-body-sm border border-neutral-100">
          <span className="text-neutral-600">Tạm tính</span>
          <span className="font-bold text-brand-navy">{subtotal.toLocaleString('vi-VN')}đ</span>
        </div>

        <button onClick={onAddToCart} className="w-full h-[52px] bg-brand-navy text-white text-body-md font-bold rounded-xl hover:bg-brand-navy/90 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer">
          <ShoppingBag className="w-5 h-5" /> Thêm vào giỏ hàng
        </button>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-neutral-600">
          <div className="rounded-lg bg-white px-2 py-2 border border-neutral-100">May đo riêng</div>
          <div className="rounded-lg bg-white px-2 py-2 border border-neutral-100">Tư vấn size</div>
          <div className="rounded-lg bg-white px-2 py-2 border border-neutral-100">3-5 ngày</div>
        </div>
      </div>

      <MeasurementSummary isMeasurementComplete={isMeasurementComplete} measurements={measurements} catCompleteness={catCompleteness} />

      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-semantic-success"></div>
        <span className="text-body-sm text-semantic-success font-medium">✓ Nhận may theo số đo riêng (3-5 ngày làm việc)</span>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={`/try-on?productId=${product.id}`}
            className="h-[48px] bg-gradient-to-r from-[#5D1C34] to-[#A67D44] text-white text-body-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Thử đồ ảo ngay
          </Link>
          <Link
            href={`/chat?productId=${product.id}&message=${encodeURIComponent('Tư vấn giúp tôi về kích thước và cách phối đồ với sản phẩm ' + product.name)}`}
            className="h-[48px] bg-white border border-brand-navy/30 text-brand-navy hover:bg-brand-navy/5 text-body-sm font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-brand-gold fill-brand-gold" /> Tư vấn với AI
          </Link>
        </div>

        <button type="button" onClick={onTogglePin} disabled={isRackMutating} className={`w-full h-[48px] border rounded-xl font-semibold text-body-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${pinned ? 'border-[#5D1C34] bg-[#5D1C34]/10 text-[#5D1C34] hover:bg-[#5D1C34]/15' : 'border-dashed border-[#5D1C34]/40 text-[#5D1C34] hover:bg-[#5D1C34]/5'}`}>
          <HangerIcon className="w-4 h-4" />
          {pinned ? '✓ Đã ghim trên Giá treo — Bấm để bỏ ghim' : 'Ghim vào Giá treo đồ (Phối đồ)'}
        </button>
      </div>

      <Link
        href="/profile/measurements"
        className="flex items-center justify-between p-4 bg-[#EEF0FD] border border-[#AFA9EC] rounded-xl text-[#3C3489] hover:bg-[#E0E4FC] transition-colors group cursor-pointer"
      >
        <div className="flex items-center gap-2 text-body-sm font-medium">
          <span className="text-[16px]">💡</span> Xem và chỉnh sửa số đo cá nhân trong Profile
        </div>
        <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </Link>
    </div>
  );
}

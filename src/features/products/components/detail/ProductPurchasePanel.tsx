import { COMBO_OPTIONS } from '@/features/products/constants/product-detail-config';
import { getComboDiscount, getComboDisplayPrice, getComboOriginalPrice, getComboPrice } from '@/features/products/services/combo-pricing';
import type { ProductPurchasePanelProps } from '@/features/products/types/product-purchase-panel';
import { StarRating } from '@/features/reviews/components/StarRating';
import { cn } from '@/lib/utils';
import { AlertCircle, Check, ChevronRight, MessageSquare, Minus, Plus, Ruler, Shirt, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';
const labelText = 'text-[11px] font-semibold uppercase tracking-[0.2em]';
const primaryButton = cn(
  'inline-flex h-12 items-center justify-center gap-2 rounded-[2px] bg-landing-oxblood px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-paper',
  'transition-colors hover:bg-landing-obsidian disabled:cursor-not-allowed disabled:opacity-50',
  focusRing,
);
const outlineButton = cn(
  'inline-flex h-11 items-center justify-center gap-2 rounded-[2px] border border-landing-line px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-landing-obsidian',
  'transition-colors hover:border-landing-oxblood hover:text-landing-oxblood disabled:cursor-not-allowed disabled:opacity-50',
  focusRing,
);

const MEASUREMENT_FIELDS = [
  { label: 'Ngực', key: 'chest', unit: 'cm' },
  { label: 'Eo', key: 'waist', unit: 'cm' },
  { label: 'Hông', key: 'hip', unit: 'cm' },
  { label: 'Vai', key: 'shoulder', unit: 'cm' },
  { label: 'Cao', key: 'height', unit: 'cm' },
  { label: 'Nặng', key: 'weight', unit: 'kg' },
] as const;

function isLightHex(hex: string) {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return false;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return (red * 299 + green * 587 + blue * 114) / 1000 > 200;
}

function ProductPrice({ product, selectedType, isComboSuit }: Pick<ProductPurchasePanelProps, 'product' | 'selectedType' | 'isComboSuit'>) {
  const displayPrice = isComboSuit ? getComboDisplayPrice(selectedType) : product.price;
  const originalPrice = isComboSuit
    ? getComboOriginalPrice(selectedType)
    : product.originalPriceFormatted || (product.originalPrice ? `${product.originalPrice.toLocaleString('vi-VN')}đ` : null);
  const discount = isComboSuit
    ? getComboDiscount(selectedType)
    : product.originalPrice && product.numericPrice < product.originalPrice
      ? `-${Math.round(((product.originalPrice - product.numericPrice) / product.originalPrice) * 100)}%`
      : null;

  return (
    <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-2">
      <span className="font-mono text-2xl font-medium tracking-[0.02em] text-landing-oxblood">{displayPrice}</span>
      {originalPrice ? <span className="font-mono text-sm text-landing-muted line-through">{originalPrice}</span> : null}
      {discount ? (
        <span className="bg-landing-oxblood px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-landing-paper">
          {discount}
        </span>
      ) : null}
    </div>
  );
}

function MeasurementSummary({ isMeasurementComplete, measurements, catCompleteness }: Pick<ProductPurchasePanelProps, 'isMeasurementComplete' | 'measurements' | 'catCompleteness'>) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex flex-col gap-2 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
        <div className="flex min-w-0 items-start gap-2 text-sm text-landing-obsidian">
          <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-landing-oxblood" strokeWidth={1.75} aria-hidden="true" />
          <p className="min-w-0 leading-snug">
            <span className="font-semibold">Hình thức: </span>
            <span className="text-landing-oxblood">May đo theo số đo cơ thể</span>
          </p>
        </div>
        <Link
          href="/profile/measurements"
          className={cn('inline-flex w-fit items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-landing-oxblood hover:underline', focusRing)}
        >
          Cập nhật số đo
          <ChevronRight className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>

      {isMeasurementComplete ? (
        <div className="border border-landing-line bg-landing-ivory p-3.5 sm:p-4">
          <div className="mb-3 flex flex-col gap-1.5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
            <div className="flex items-start gap-2 text-xs font-semibold text-landing-sage-ink">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>Số đo đã sẵn sàng cho may đo</span>
            </div>
            <span className="text-[11px] text-landing-muted">Tự động áp dụng khi đặt hàng</span>
          </div>
          <div className="grid grid-cols-2 gap-2 border border-landing-line/70 bg-landing-paper p-2.5 text-[11px] font-medium text-landing-muted min-[420px]:grid-cols-3 sm:grid-cols-6">
            {MEASUREMENT_FIELDS.map((field) => (
              <div key={field.key} className="min-w-0">
                <span className="block text-[10px] uppercase tracking-[0.12em] text-landing-muted">{field.label}</span>
                <strong className="mt-0.5 block font-mono text-[11px] font-medium text-landing-obsidian">
                  {measurements?.[field.key] || '--'}{field.unit}
                </strong>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-destructive/30 bg-landing-ivory p-3.5 sm:p-4">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" strokeWidth={1.75} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-landing-obsidian">Cần bổ sung số đo trước khi đặt may</p>
              <p className="mt-1 text-xs leading-relaxed text-landing-muted">
                Còn thiếu:{' '}
                <strong className="font-semibold text-landing-obsidian">
                  {catCompleteness?.missing?.map((item) => item.label).join(', ') || 'số đo bắt buộc'}
                </strong>
                .
              </p>
              <Link
                href="/profile/measurements"
                className={cn('mt-3 inline-flex h-10 items-center gap-2 rounded-[2px] bg-landing-oxblood px-3.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-landing-paper transition-colors hover:bg-landing-obsidian', focusRing)}
              >
                <Ruler className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                Bổ sung số đo
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
  const reviewCount = reviewStats?.reviewCount ?? 0;
  const averageRating = reviewStats?.avgRating ?? 0;
  const tryOnHref = product.colors?.length && selectedColor
    ? `/try-on?productId=${product.id}&color=${encodeURIComponent(selectedColor)}`
    : `/try-on?productId=${product.id}`;
  const stylistHref = `/chat?productId=${product.id}&message=${encodeURIComponent(`Tư vấn giúp tôi về kích thước và cách phối đồ với sản phẩm ${product.name}`)}`;

  return (
    <div className="flex flex-col border border-landing-line bg-landing-ivory p-5 md:p-7">
      <div className="mb-6">
        <p className={cn('text-landing-brass-ink', labelText)}>{product.brand || 'StAie. Signature'}</p>
        <span className="mt-3 inline-flex border border-landing-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-landing-muted">
          {product.category}
        </span>
        <h1 className="product-name-title mt-4 text-landing-obsidian">{product.name}</h1>
        <button
          type="button"
          onClick={() => document.getElementById('product-reviews')?.scrollIntoView({ behavior: 'smooth' })}
          className={cn('group mt-3 flex items-center gap-2 text-left', focusRing)}
          aria-label="Xem đánh giá sản phẩm"
        >
          {reviewCount > 0 ? (
            <>
              <StarRating value={averageRating} size="sm" readOnly tone="landing" />
              <span className="font-mono text-xs text-landing-obsidian">{Number(averageRating).toFixed(1)}</span>
              <span className="text-xs text-landing-muted underline decoration-landing-line underline-offset-4 transition-colors group-hover:text-landing-obsidian">
                ({reviewCount} đánh giá)
              </span>
            </>
          ) : (
            <span className="text-xs text-landing-muted underline decoration-landing-line underline-offset-4 transition-colors group-hover:text-landing-obsidian">
              Chưa có đánh giá
            </span>
          )}
        </button>
      </div>

      <ProductPrice product={product} selectedType={selectedType} isComboSuit={isComboSuit} />
      <div className="mb-6 h-px w-full bg-landing-line" />

      {isComboSuit && (
        <div className="mb-6">
          <p className="mb-3 text-sm font-medium text-landing-obsidian">Phân loại sản phẩm</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {COMBO_OPTIONS.map((option) => {
              const active = selectedType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSelectType(option.value)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-[2px] border p-3.5 text-left transition-colors',
                    active ? 'border-landing-oxblood bg-landing-ivory' : 'border-landing-line bg-transparent hover:border-landing-brass',
                    focusRing,
                  )}
                >
                  <span className="block text-sm font-semibold text-landing-obsidian">{option.label}</span>
                  <span className="mt-1 block font-mono text-xs text-landing-muted">{option.price.toLocaleString('vi-VN')}đ</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-6">
        {product.colors?.length ? (
          <>
            <p className="mb-3 text-sm font-medium text-landing-obsidian">
              Màu sắc: <span className="font-normal text-landing-muted">{selectedColor}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.colors.map((color) => {
                const active = selectedColor === color.name;
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => onSelectColor(color.name)}
                    aria-label={`Chọn màu ${color.name}`}
                    aria-pressed={active}
                    className={cn(
                      'flex min-h-[44px] w-16 flex-col items-center gap-1.5 rounded-[2px] border px-1 py-1.5 transition-colors',
                      active ? 'border-landing-oxblood' : 'border-transparent hover:border-landing-line',
                      focusRing,
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'block h-6 w-6 rounded-full border',
                        active ? 'ring-2 ring-landing-oxblood ring-offset-2 ring-offset-landing-ivory' : '',
                        isLightHex(color.hex) ? 'border-landing-taupe' : 'border-landing-line/60',
                      )}
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className={cn('text-[10px] leading-none', active ? 'font-semibold text-landing-obsidian' : 'text-landing-muted')}>
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-landing-obsidian">Màu sắc</p>
            <p className="mt-2 text-xs text-landing-muted">Màu tiêu chuẩn theo thiết kế.</p>
          </>
        )}
      </div>

      <div className="mb-6 border border-landing-line bg-landing-ivory p-3.5 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-landing-obsidian">Chọn số lượng</p>
            <p className="text-[11px] text-landing-muted">Có thể đặt nhiều sản phẩm cùng số đo</p>
          </div>
          <div className="flex h-11 items-center overflow-hidden border border-landing-line bg-landing-paper">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              aria-label="Giảm số lượng"
              className={cn('flex h-full w-11 items-center justify-center text-landing-muted transition-colors hover:bg-landing-ivory hover:text-landing-obsidian disabled:cursor-not-allowed disabled:opacity-40', focusRing)}
            >
              <Minus className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <span className="flex h-full w-11 items-center justify-center border-x border-landing-line font-mono text-sm text-landing-obsidian">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              aria-label="Tăng số lượng"
              className={cn('flex h-full w-11 items-center justify-center text-landing-muted transition-colors hover:bg-landing-ivory hover:text-landing-obsidian', focusRing)}
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between border border-landing-line/70 bg-landing-paper px-3 py-2.5 text-sm">
          <span className="text-landing-muted">Tạm tính</span>
          <span className="font-mono font-medium text-landing-obsidian">{subtotal.toLocaleString('vi-VN')}đ</span>
        </div>

        <button type="button" onClick={onAddToCart} className={cn('w-full', primaryButton)}>
          <ShoppingBag className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          Thêm vào giỏ
        </button>

        <div className="mt-3 grid grid-cols-1 gap-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-landing-muted sm:grid-cols-3">
          <div className="border border-landing-line px-2 py-2">May đo riêng</div>
          <div className="border border-landing-line px-2 py-2">Tư vấn số đo</div>
          <div className="border border-landing-line px-2 py-2">Đổi trả 7 ngày</div>
        </div>
      </div>

      <MeasurementSummary
        isMeasurementComplete={isMeasurementComplete}
        measurements={measurements}
        catCompleteness={catCompleteness}
      />

      <div className="mb-6 flex items-start gap-2">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-landing-sage-ink" strokeWidth={2} aria-hidden="true" />
        <p className="text-sm text-landing-sage-ink">Nhận may theo số đo riêng đã lưu trong hồ sơ.</p>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Link href={tryOnHref} className={primaryButton}>
            <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Thử đồ AI
          </Link>
          <Link href={stylistHref} className={outlineButton}>
            <MessageSquare className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Hỏi AI Stylist
          </Link>
        </div>

        <button
          type="button"
          onClick={onTogglePin}
          disabled={isRackMutating}
          aria-pressed={pinned}
          className={cn(
            'w-full',
            outlineButton,
            pinned
              ? 'border-landing-oxblood text-landing-oxblood'
              : 'border-dashed border-landing-line text-landing-oxblood hover:border-landing-oxblood',
          )}
        >
          <Shirt className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          {pinned ? 'Đã ghim trên Giá treo' : 'Ghim vào Giá treo đồ'}
        </button>
      </div>
    </div>
  );
}

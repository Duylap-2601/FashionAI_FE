'use client';

import { CART_IMAGE_FALLBACK, formatCartPrice } from '@/features/cart/components/cart-line';
import { PaymentMethodSelector } from '@/features/checkout/components/payment-method-selector';
import type { CheckoutSummaryProps } from '@/features/checkout/types/checkout-summary';
import { accountButtonClassName } from '@/features/profile/components/account-ui';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useState } from 'react';

function SummaryThumb({ src, alt }: { src: string; alt: string }) {
  const [imageSrc, setImageSrc] = useState(src || CART_IMAGE_FALLBACK);
  return (
    <span className="relative block h-[60px] w-12 shrink-0 overflow-hidden rounded-[2px] bg-landing-paper">
      <Image src={imageSrc} alt={alt} fill sizes="48px" className="object-cover" onError={() => setImageSrc(CART_IMAGE_FALLBACK)} />
    </span>
  );
}

function Row({ label, children, tone }: { label: string; children: React.ReactNode; tone?: 'muted' | 'error' | 'success' }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-landing-muted">{label}</dt>
      <dd
        className={cn(
          'text-right',
          tone === 'error' ? 'text-destructive' : tone === 'success' ? 'text-landing-sage-ink' : tone === 'muted' ? 'text-landing-muted' : 'text-landing-obsidian',
        )}
      >
        {children}
      </dd>
    </div>
  );
}

export function CheckoutSummary({
  items,
  totalPrice,
  saleDiscount = 0,
  shippingFee,
  discount,
  total,
  isSubmitting,
  submitLabel,
  isPricingLoading,
  pricingError,
  couponError,
  coupon,
  setCoupon,
  setDiscount,
  handleApplyCoupon,
}: CheckoutSummaryProps) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isIdle = !isSubmitting && !pricingError;

  return (
    <aside className="flex flex-col gap-8 lg:sticky lg:top-[97px]">
      <div className="border border-landing-line bg-landing-ivory/60 p-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-[1.375rem] leading-tight text-landing-obsidian">Đơn hàng</h2>
          <span className="text-xs text-landing-muted">
            <span className="font-mono text-landing-obsidian">{itemCount}</span> sản phẩm
          </span>
        </div>

        <ul className="mt-4 divide-y divide-landing-line/60 border-y border-landing-line/60">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <SummaryThumb src={item.image} alt={item.name} />
              <div className="min-w-0 flex-1">
                <p className="product-name-line line-clamp-1 text-landing-obsidian">{item.name}</p>
                <p className="mt-0.5 text-xs text-landing-muted">
                  Màu: {item.color || 'Mặc định'} · SL <span className="font-mono">{item.quantity}</span>
                </p>
              </div>
              <span className="shrink-0 font-mono text-sm text-landing-obsidian">{formatCartPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="border-b border-landing-line/70 py-4">
          <PaymentMethodSelector
            coupon={coupon}
            setCoupon={setCoupon}
            discount={discount}
            setDiscount={setDiscount}
            handleApplyCoupon={handleApplyCoupon}
            couponError={couponError}
          />
        </div>

        <dl className="space-y-2.5 border-b border-landing-line/70 py-4 text-sm">
          <Row label="Tạm tính">
            <span className="font-mono">{formatCartPrice(totalPrice)}</span>
          </Row>
          {saleDiscount > 0 ? (
            <Row label="Giảm giá sale" tone="success">
              <span className="font-mono">-{formatCartPrice(saleDiscount)}</span>
            </Row>
          ) : null}
          <Row label="Phí giao hàng (GHN)" tone={shippingFee === null ? (pricingError ? 'error' : 'muted') : undefined}>
            {shippingFee === null ? (
              isPricingLoading ? 'Đang tính' : pricingError ? 'Cần kiểm tra' : 'Tính theo địa chỉ'
            ) : shippingFee === 0 ? (
              'Miễn phí'
            ) : (
              <span className="font-mono">{formatCartPrice(shippingFee)}</span>
            )}
          </Row>
          {discount > 0 ? (
            <Row label="Mã giảm giá" tone="success">
              <span className="font-mono">-{formatCartPrice(discount)}</span>
            </Row>
          ) : null}
        </dl>
        {pricingError ? (
          <p role="alert" className="mt-4 border-l-2 border-destructive pl-3 text-xs leading-relaxed text-destructive">
            {pricingError}
          </p>
        ) : null}

        <div className="flex items-baseline justify-between gap-4 py-4">
          <span>
            <span className="block font-medium text-landing-obsidian">Tổng cộng</span>
            <span className="text-xs text-landing-muted">
              {shippingFee === null ? 'Chưa gồm phí giao hàng' : 'Đã gồm VAT'}
            </span>
          </span>
          <span aria-busy={isPricingLoading} className={cn('font-mono text-2xl text-landing-oxblood transition-opacity', isPricingLoading && 'opacity-50')}>
            {formatCartPrice(total)}
          </span>
        </div>

        <button type="submit" disabled={isSubmitting} className={cn(accountButtonClassName('primary'), 'h-12 w-full')}>
          {isSubmitting && !pricingError ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : null}
          {submitLabel}
          {isIdle ? <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" /> : null}
        </button>
      </div>
    </aside>
  );
}

'use client';

import type { PaymentMethodSelectorProps } from '@/features/checkout/types/payment-method-selector';

export function PaymentMethodSelector({ coupon, setCoupon, discount, setDiscount, handleApplyCoupon }: PaymentMethodSelectorProps) {
  return (
    <section>
      <h2 className="text-[20px] font-bold text-brand-navy mb-6">Mã giảm giá</h2>
      <div className="flex gap-3 max-w-[400px]">
        <input
          type="text"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="Nhập mã giảm giá..."
          className="flex-1 h-[48px] px-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all uppercase"
          disabled={discount > 0}
        />
        {discount > 0 ? (
          <button type="button" onClick={() => { setDiscount(0); setCoupon('') }} className="px-6 h-[48px] border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors">
            Hủy
          </button>
        ) : (
          <button type="button" onClick={handleApplyCoupon} className="px-6 h-[48px] bg-brand-navy text-white font-medium rounded-xl hover:bg-brand-navy/90 transition-colors">
            Áp dụng
          </button>
        )}
      </div>
      {discount > 0 && (
        <p className="text-[13px] text-semantic-success mt-2">✓ Đã áp dụng mã giảm giá 100,000đ</p>
      )}
    </section>
  );
}

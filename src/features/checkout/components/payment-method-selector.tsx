'use client';

import type { PaymentMethodSelectorProps } from '@/features/checkout/types/payment-method-selector';
import { accountButtonClassName, accountInputClassName, accountLabelClassName } from '@/features/profile/components/account-ui';
import { cn } from '@/lib/utils';

/** Ô nhập mã giảm giá (tên file giữ theo lịch sử). */
export function PaymentMethodSelector({
  coupon,
  setCoupon,
  discount,
  setDiscount,
  handleApplyCoupon,
  couponError,
}: PaymentMethodSelectorProps) {
  const applied = discount > 0;
  return (
    <div>
      <label htmlFor="checkout-coupon" className={accountLabelClassName}>
        Mã giảm giá
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="checkout-coupon"
          type="text"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (!applied) handleApplyCoupon();
            }
          }}
          placeholder="Nhập mã"
          autoComplete="off"
          disabled={applied}
          className={cn(accountInputClassName, 'min-w-0 flex-1 font-mono uppercase placeholder:font-sans placeholder:normal-case')}
        />
        {applied ? (
          <button
            type="button"
            onClick={() => {
              setDiscount(0);
              setCoupon('');
            }}
            className={accountButtonClassName('outline')}
          >
            Bỏ mã
          </button>
        ) : (
          <button type="button" onClick={handleApplyCoupon} disabled={!coupon.trim()} className={accountButtonClassName('outline')}>
            Áp dụng
          </button>
        )}
      </div>
      {couponError && !applied ? <p className="mt-2 text-xs text-destructive">{couponError}</p> : null}
      {applied ? (
        <p className="mt-2 text-xs text-landing-sage-ink">
          Đã giảm <span className="font-mono">{discount.toLocaleString('vi-VN')}đ</span>
        </p>
      ) : null}
    </div>
  );
}

'use client';

import type { CheckoutOptionProps } from '@/features/checkout/types/checkout-option';
import { cn } from '@/lib/utils';

/** Ô chọn vuông có radio thật (địa chỉ giao hàng, phương thức thanh toán). */
export function CheckoutOption({ name, value, checked, onSelect, children }: CheckoutOptionProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-[2px] border px-4 py-3.5 transition-colors',
        'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-landing-oxblood',
        checked ? 'border-landing-oxblood bg-landing-ivory' : 'border-landing-line bg-landing-ivory/50 hover:border-landing-brass',
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onSelect} className="sr-only" />
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
          checked ? 'border-landing-oxblood' : 'border-landing-taupe',
        )}
      >
        {checked ? <span className="h-2 w-2 rounded-full bg-landing-oxblood" /> : null}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}

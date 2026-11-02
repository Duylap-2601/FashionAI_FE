'use client';

import { CheckoutOption } from '@/features/checkout/components/checkout-option';
import type { CheckoutPaymentMethod, DeliveryOptionsProps } from '@/features/checkout/types/delivery-options';
import { Landmark, WalletCards, type LucideIcon } from 'lucide-react';

const PAYMENT_OPTIONS: { value: CheckoutPaymentMethod; label: string; description: string; icon: LucideIcon }[] = [
  {
    value: 'zalopay',
    label: 'ZaloPay',
    description: 'Quét QR hoặc mở ứng dụng ZaloPay. Trang tự cập nhật khi thanh toán xong.',
    icon: WalletCards,
  },
  {
    value: 'sepay',
    label: 'Chuyển khoản ngân hàng',
    description: 'Qua cổng SePay. Ghi đúng nội dung chuyển khoản để đơn được xác nhận tự động.',
    icon: Landmark,
  },
];

/** Chọn phương thức thanh toán (tên file giữ theo lịch sử, nội dung là cổng thanh toán). */
export function DeliveryOptions({ paymentMethod, setPaymentMethod }: DeliveryOptionsProps) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="sr-only">Phương thức thanh toán</legend>
      {PAYMENT_OPTIONS.map(({ value, label, description, icon: Icon }) => (
        <CheckoutOption
          key={value}
          name="payment-method"
          value={value}
          checked={paymentMethod === value}
          onSelect={() => setPaymentMethod(value)}
        >
          <span className="flex items-center gap-2 text-sm font-medium text-landing-obsidian">
            <Icon className="h-4 w-4 text-landing-oxblood" strokeWidth={1.75} aria-hidden="true" />
            {label}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-landing-muted">{description}</span>
        </CheckoutOption>
      ))}
    </fieldset>
  );
}

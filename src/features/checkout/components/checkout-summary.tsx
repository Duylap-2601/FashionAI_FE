'use client';

import type { CheckoutSummaryProps } from '@/features/checkout/types/checkout-summary';
import { PaymentMethodSelector } from '@/features/checkout/components/payment-method-selector';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function CheckoutSummary({
  items,
  totalPrice,
  shippingFee,
  discount,
  total,
  isSubmitting,
  coupon,
  setCoupon,
  setDiscount,
  handleApplyCoupon,
}: CheckoutSummaryProps) {
  return (
    <div className="lg:sticky lg:top-[100px]">
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-[20px] font-bold text-brand-navy mb-6">Đơn hàng của bạn</h2>

        <div className="flex flex-col gap-4 mb-6">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 items-center">
              <div className="relative">
                <img src={item.image} alt={item.name} className="w-[64px] h-[64px] object-cover rounded-lg bg-neutral-100" />
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                  {item.quantity}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-body-sm font-medium text-brand-navy line-clamp-1">{item.name}</h3>
                <p className="text-[12px] text-neutral-500">Màu: {item.color || 'Mặc định'} · May đo</p>
              </div>
              <div className="text-body-sm font-medium text-brand-navy">
                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
              </div>
            </div>
          ))}
        </div>

        <div className="w-full h-px bg-neutral-200 mb-4"></div>

        <div className="mb-5">
          <PaymentMethodSelector
            coupon={coupon}
            setCoupon={setCoupon}
            discount={discount}
            setDiscount={setDiscount}
            handleApplyCoupon={handleApplyCoupon}
          />
        </div>

        <div className="w-full h-px bg-neutral-200 mb-4"></div>

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex justify-between text-body-sm text-neutral-600">
            <span>Tạm tính</span>
            <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between text-body-sm text-neutral-600">
            <span>Vận chuyển</span>
            {shippingFee === 0 ? (
              <span className="text-semantic-success font-medium">Miễn phí</span>
            ) : (
              <span>{shippingFee.toLocaleString('vi-VN')}đ</span>
            )}
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-body-sm text-semantic-error">
              <span>Giảm giá</span>
              <span>-{discount.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
        </div>

        <div className="w-full h-px border-t border-dashed border-neutral-300 mb-4"></div>

        <div className="flex justify-between items-end mb-8">
          <span className="text-body-md font-medium text-brand-navy">Tổng cộng</span>
          <div className="text-right">
            <div className="text-[12px] text-neutral-500 mb-1">Đã bao gồm VAT</div>
            <div className="text-[24px] font-bold text-brand-navy leading-none">
              {total.toLocaleString('vi-VN')}đ
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="hidden lg:flex w-full h-[52px] bg-brand-navy text-white text-body-md font-bold rounded-xl items-center justify-center hover:bg-brand-navy/90 transition-colors mb-6 shadow-sm disabled:opacity-50">
          {isSubmitting ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng \u2192'}
        </button>

        <div className="bg-[#EEF0FD] rounded-xl p-4 flex items-start gap-3 border border-[#AFA9EC]">
          <div className="mt-0.5 text-brand-navy"><Sparkles className="w-5 h-5" /></div>
          <div>
            <h4 className="text-body-sm font-bold text-[#3C3489] mb-1">Thử đồ trước khi thanh toán</h4>
            <p className="text-[12px] text-[#3C3489]/80 mb-2 leading-relaxed">
              Xem trước form dáng trang phục công sở trên cơ thể hoặc mannequin để chọn đúng size!
            </p>
            <Link href="/try-on" className="text-[12px] font-semibold text-brand-navy hover:underline">
              Dùng Try-On ngay &rarr;
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

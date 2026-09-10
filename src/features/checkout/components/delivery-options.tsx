'use client';

import type { DeliveryOptionsProps } from '@/features/checkout/types/delivery-options';
import { Building2, CheckCircle2 } from 'lucide-react';

export function DeliveryOptions({ paymentMethod, setPaymentMethod }: DeliveryOptionsProps) {
  return (
    <section className="mt-6">
      <div className="flex flex-col items-center">
        <div className="bg-[#f0ece5] p-6 rounded-[24px] border border-[#e5dfd5] w-full shadow-sm">
          <h2 className="text-[20px] font-bold text-brand-navy mb-5">Phương thức thanh toán</h2>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={`relative p-4 rounded-[16px] cursor-pointer transition-all flex items-center gap-4 bg-white border ${paymentMethod === 'bank' ? 'border-brand-navy' : 'border-transparent hover:border-neutral-200'} shadow-sm`}>
                <input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="peer sr-only" />
                <div className={`w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center ${paymentMethod === 'bank' ? 'border-brand-navy' : 'border-[#b5b0a8]'}`}>
                  {paymentMethod === 'bank' && <div className="w-[10px] h-[10px] rounded-full bg-brand-navy"></div>}
                </div>
                <Building2 className="w-5 h-5 text-brand-navy" />
                <span className="text-[15px] font-medium text-brand-navy">Chuyển khoản ngân hàng (QR Pay / VietQR / SePay)</span>
              </label>
              {paymentMethod === 'bank' && (
                <div className="text-[12px] text-green-700 font-semibold px-4 py-3 bg-green-50 border border-green-200 rounded-xl animate-in slide-in-from-top-1 duration-200 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Đơn may đo mới cần thanh toán online 100% trước khi sản xuất</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 pl-5">Sau khi bấm &quot;Xác nhận đặt hàng&quot;, hệ thống sẽ cung cấp mã QR chuyển khoản chính xác.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

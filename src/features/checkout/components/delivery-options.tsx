'use client';

import type { DeliveryOptionsProps } from '@/features/checkout/types/delivery-options';
import { Landmark, WalletCards } from 'lucide-react';

export function DeliveryOptions({ paymentMethod, setPaymentMethod }: DeliveryOptionsProps) {
  return (
    <section className="mt-6">
      <div className="flex flex-col items-center">
        <div className="bg-[#f0ece5] p-6 rounded-[24px] border border-[#e5dfd5] w-full shadow-sm">
          <h2 className="text-[20px] font-bold text-brand-navy mb-5">Phương thức thanh toán</h2>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={`relative p-4 rounded-[16px] cursor-pointer transition-all flex items-start gap-4 bg-white border ${paymentMethod === 'zalopay' ? 'border-brand-navy' : 'border-transparent hover:border-neutral-200'} shadow-sm`}>
                <input type="radio" name="payment" value="zalopay" checked={paymentMethod === 'zalopay'} onChange={() => setPaymentMethod('zalopay')} className="peer sr-only" />
                <div className={`mt-0.5 w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center ${paymentMethod === 'zalopay' ? 'border-brand-navy' : 'border-[#b5b0a8]'}`}>
                  {paymentMethod === 'zalopay' && <div className="w-[10px] h-[10px] rounded-full bg-brand-navy"></div>}
                </div>
                <WalletCards className="mt-0.5 w-5 h-5 text-brand-navy" />
                <div>
                  <span className="text-[15px] font-medium text-brand-navy">ZaloPay</span>
                  <p className="mt-1 text-[12px] text-neutral-500">Quét QR hoặc mở ZaloPay, trang sẽ tự kiểm tra trạng thái.</p>
                </div>
              </label>
              <label className={`relative p-4 rounded-[16px] cursor-pointer transition-all flex items-start gap-4 bg-white border ${paymentMethod === 'sepay' ? 'border-brand-navy' : 'border-transparent hover:border-neutral-200'} shadow-sm`}>
                <input type="radio" name="payment" value="sepay" checked={paymentMethod === 'sepay'} onChange={() => setPaymentMethod('sepay')} className="peer sr-only" />
                <div className={`mt-0.5 w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center ${paymentMethod === 'sepay' ? 'border-brand-navy' : 'border-[#b5b0a8]'}`}>
                  {paymentMethod === 'sepay' && <div className="w-[10px] h-[10px] rounded-full bg-brand-navy"></div>}
                </div>
                <Landmark className="mt-0.5 w-5 h-5 text-brand-navy" />
                <div>
                  <span className="text-[15px] font-medium text-brand-navy">Chuyển khoản ngân hàng</span>
                  <p className="mt-1 text-[12px] text-neutral-500">Thanh toán qua cổng SePay, cần dùng đúng nội dung chuyển khoản.</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

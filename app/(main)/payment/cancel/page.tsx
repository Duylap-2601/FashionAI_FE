'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PaymentCancelPage() {
  const router = useRouter();

  const handleRetry = () => {
    router.push('/checkout');
  };

  const handleBackToCart = () => {
    router.push('/cart');
  };

  return (
    <div className="bg-white min-h-screen py-16 px-4">
      <div className="max-w-[560px] mx-auto">
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-[24px] font-bold text-brand-navy mb-3">Thanh toán đã bị hủy</h1>
          <p className="text-neutral-600 mb-8">
            Bạn đã hủy thanh toán tại cổng SePay/PayOS. Đơn hàng vẫn được giữ ở trạng thái 
            <strong className="text-amber-600">chờ thanh toán</strong> trong 24h.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-semibold">Đơn hàng chưa bị hủy</span>
            </div>
            <p className="text-[13px] text-amber-600">
              Bạn có thể quay lại trang thanh toán để hoàn tất, hoặc thanh toán lại từ trang đơn hàng.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="w-full sm:flex-1 h-[52px] bg-brand-navy text-white text-body-md font-bold rounded-xl flex items-center justify-center hover:bg-brand-navy/90 transition-colors shadow-sm gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Thanh toán lại ngay
            </button>
            <Link
              href="/cart"
              className="w-full sm:flex-1 h-[52px] bg-white border border-neutral-200 text-neutral-700 text-body-md font-semibold rounded-xl flex items-center justify-center hover:bg-neutral-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Quay lại giỏ hàng
            </Link>
          </div>

          <Link
            href="/profile/orders"
            className="mt-4 inline-block text-body-sm text-brand-navy hover:underline underline-offset-2"
          >
            Xem danh sách đơn hàng của tôi
          </Link>
        </div>
      </div>
    </div>
  );
}
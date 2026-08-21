'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ChevronLeft, RotateCcw, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

function PaymentErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error') || searchParams.get('code');
  const errorMessage = searchParams.get('message') || searchParams.get('desc');

  const handleRetry = () => {
    router.push('/checkout');
  };

  return (
    <div className="bg-white min-h-screen py-16 px-4">
      <div className="max-w-[560px] mx-auto">
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-[24px] font-bold text-brand-navy mb-3">Thanh toán thất bại</h1>
          <p className="text-neutral-600 mb-6">
            Có lỗi xảy ra trong quá trình xử lý thanh toán. Đơn hàng vẫn ở trạng thái 
            <strong className="text-red-600">chờ thanh toán</strong>.
          </p>

          {(errorCode || errorMessage) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <Info className="w-4 h-4" />
                <span className="font-semibold">Mã lỗi / Chi tiết</span>
              </div>
              {errorCode && (
                <div className="text-[13px] font-mono text-red-600 mb-2">
                  Mã: <code>{errorCode}</code>
                </div>
              )}
              {errorMessage && (
                <div className="text-[13px] text-red-600">
                  {decodeURIComponent(errorMessage)}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="w-full sm:flex-1 h-[52px] bg-brand-navy text-white text-body-md font-bold rounded-xl flex items-center justify-center hover:bg-brand-navy/90 transition-colors shadow-sm gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Thử thanh toán lại
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

export default function PaymentErrorPage() {
  return (
    <React.Suspense
      fallback={
        <div className="bg-white min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentErrorContent />
    </React.Suspense>
  );
}
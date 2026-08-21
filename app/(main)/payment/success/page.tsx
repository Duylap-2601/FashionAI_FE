'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, ChevronRight, CreditCard, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useOrder } from '@/hooks/useOrders';
import { toast } from 'sonner';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderCode = searchParams.get('orderCode') || searchParams.get('code');
  const status = searchParams.get('status') || 'success';
  const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(true);

  const { order, isLoading, refetch } = useOrder(resolvedOrderId || '');

  useEffect(() => {
    if (orderCode) {
      const findOrder = async () => {
        try {
          const res = await fetch(`/api/orders?orderCode=${orderCode}`);
          const data = await res.json();
          if (data.data && data.data.length > 0) {
            setResolvedOrderId(data.data[0].id);
          } else {
            setResolvedOrderId(orderCode);
          }
        } catch {
          setResolvedOrderId(orderCode);
        } finally {
          setIsResolving(false);
        }
      };
      findOrder();
    } else {
      setIsResolving(false);
    }
  }, [orderCode]);

  const isPaid = order?.status === 'PAID';

  if (isResolving || (resolvedOrderId && isLoading)) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-brand-navy animate-spin" />
          <p className="text-body-sm text-neutral-600">Đang kiểm tra trạng thái thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-16 px-4">
      <div className="max-w-[560px] mx-auto">
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm text-center">
          {isPaid ? (
            <>
              <div className="w-16 h-16 rounded-full bg-semantic-success flex items-center justify-center mx-auto mb-6 shadow-[0_0_0_12px_rgba(16,185,129,0.1)]">
                <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
              <h1 className="text-[24px] font-bold text-brand-navy mb-3">Thanh toán thành công!</h1>
              <p className="text-neutral-600 mb-6">
                Đơn hàng <strong className="text-brand-navy">#{resolvedOrderId?.substring(0, 8).toUpperCase()}</strong> đã được thanh toán.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-semibold">Đã xác nhận thanh toán</span>
                </div>
                <p className="text-[13px] text-green-600">
                  Hệ thống đã ghi nhận thanh toán qua SePay/PayOS. Đơn hàng sẽ được xử lý sớm nhất.
                </p>
              </div>
            </>
          ) : status === 'cancel' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h1 className="text-[24px] font-bold text-brand-navy mb-3">Thanh toán bị hủy</h1>
              <p className="text-neutral-600 mb-6">Bạn đã hủy thanh toán. Đơn hàng vẫn ở trạng thái chờ thanh toán.</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-[24px] font-bold text-brand-navy mb-3">Thanh toán thất bại</h1>
              <p className="text-neutral-600 mb-6">Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.</p>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={resolvedOrderId ? `/orders/${resolvedOrderId}` : '/profile/orders'}
              className="w-full sm:flex-1 h-[52px] bg-brand-navy text-white text-body-md font-bold rounded-xl flex items-center justify-center hover:bg-brand-navy/90 transition-colors shadow-sm"
            >
              <CreditCard className="w-4 h-4 mr-2" /> Xem đơn hàng
            </Link>
            <Link
              href="/products"
              className="w-full sm:flex-1 h-[52px] bg-white border border-neutral-200 text-neutral-700 text-body-md font-semibold rounded-xl flex items-center justify-center hover:bg-neutral-50 transition-colors"
            >
              Tiếp tục mua sắm <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {status === 'cancel' || status === 'error' ? (
            <button
              onClick={() => {
                if (resolvedOrderId) {
                  router.push(`/checkout?reorder=${resolvedOrderId}`);
                } else {
                  router.push('/checkout');
                }
              }}
              className="mt-4 w-full sm:flex-1 h-[48px] bg-[#FDFBF7] border border-[#E5DFD5] text-[#5D1C34] text-body-sm font-semibold rounded-xl hover:bg-[#F5EAD4] transition-colors flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4" /> Thử thanh toán lại
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-brand-navy animate-spin" />
            <p className="text-body-sm text-neutral-600">Đang kiểm tra trạng thái thanh toán...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
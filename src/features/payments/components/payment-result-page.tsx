'use client';

import { usePaymentStatus } from '@/features/payments/hooks/usePayments';
import { useAuthStore } from '@/features/auth/store/authStore';
import { AlertCircle, CheckCircle2, Clock, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const authStatus = useAuthStore((state) => state.status);
  const { data: payment, isLoading, isError } = usePaymentStatus(paymentId);

  if (!paymentId || isError) {
    return <ResultShell icon="error" title="Không tìm thấy thanh toán" message="Vui lòng đăng nhập lại hoặc mở trang đơn hàng để kiểm tra trạng thái." />;
  }

  if (authStatus === 'loading' || isLoading || !payment) {
    return <LoadingState />;
  }

  if (authStatus === 'unauthenticated') {
    return <ResultShell icon="error" title="Cần đăng nhập" message="Vui lòng đăng nhập lại để kiểm tra trạng thái thanh toán." />;
  }

  if (payment.status === 'PAID') {
    return <ResultShell icon="success" title="Thanh toán thành công" message={`Đơn hàng #${payment.orderCode} đã được xác minh bởi hệ thống.`} orderId={payment.orderId} />;
  }

  if (payment.status === 'FAILED') {
    return <ResultShell icon="error" title="Thanh toán thất bại" message={payment.failureReason || 'Giao dịch chưa được cổng thanh toán xác nhận thành công.'} orderId={payment.orderId} />;
  }

  if (payment.status === 'REFUND_REQUIRED') {
    return <ResultShell icon="error" title="Thanh toán cần hoàn tiền" message="Hệ thống đã nhận tiền nhưng chưa thể ghi nhận cho đơn hàng này. Khoản tiền sẽ được xử lý hoàn lại." orderId={payment.orderId} />;
  }

  return <ResultShell icon="pending" title="Đang xác nhận thanh toán" message="Hệ thống đang kiểm tra thanh toán. Bạn có thể xem đơn hàng để theo dõi trạng thái." orderId={payment.orderId} />;
}

function LoadingState() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-brand-navy animate-spin" />
        <p className="text-body-sm text-neutral-600">Đang kiểm tra trạng thái thanh toán...</p>
      </div>
    </div>
  );
}

function ResultShell({ icon, title, message, orderId }: { icon: 'success' | 'pending' | 'error'; title: string; message: string; orderId?: string }) {
  const Icon = icon === 'success' ? CheckCircle2 : icon === 'pending' ? Clock : AlertCircle;
  const colorClass = icon === 'success' ? 'bg-semantic-success text-white' : icon === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600';

  return (
    <div className="bg-white min-h-screen py-16 px-4">
      <div className="max-w-[560px] mx-auto">
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm text-center">
          <div className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center mx-auto mb-6`}>
            <Icon className="w-8 h-8" strokeWidth={3} />
          </div>
          <h1 className="text-[24px] font-bold text-brand-navy mb-3">{title}</h1>
          <p className="text-neutral-600 mb-6">{message}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={orderId ? `/orders/${orderId}` : '/profile/orders'} className="w-full sm:flex-1 h-[52px] bg-brand-navy text-white text-body-md font-bold rounded-xl flex items-center justify-center hover:bg-brand-navy/90 transition-colors shadow-sm">
              <CreditCard className="w-4 h-4 mr-2" /> Xem đơn hàng
            </Link>
            <Link href="/products" className="w-full sm:flex-1 h-[52px] bg-white border border-neutral-200 text-neutral-700 text-body-md font-semibold rounded-xl flex items-center justify-center hover:bg-neutral-50 transition-colors">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PaymentResultContent />
    </Suspense>
  );
}

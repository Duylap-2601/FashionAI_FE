'use client';

import { useAuthStore } from '@/features/auth/store/authStore';
import { PaymentLoading, PaymentStatusCard } from '@/features/payments/components/payment-outcome';
import { usePaymentStatus } from '@/features/payments/hooks/usePayments';
import { isPaymentSettled } from '@/features/payments/services/payments-utils';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const authStatus = useAuthStore((state) => state.status);
  const { data: payment, isLoading, isError } = usePaymentStatus(paymentId);
  const orders = { href: '/profile/orders', label: 'Xem đơn hàng của tôi' };

  if (!paymentId || isError) {
    return (
      <PaymentStatusCard
        title="Không tìm thấy thanh toán"
        status={{ tone: 'error', label: 'Không xác định' }}
        description={<p>Vui lòng đăng nhập lại hoặc mở trang đơn hàng để kiểm tra trạng thái.</p>}
        primary={orders}
      />
    );
  }

  if (authStatus === 'loading' || isLoading || !payment) {
    return <PaymentLoading />;
  }

  if (authStatus === 'unauthenticated') {
    return (
      <PaymentStatusCard
        title="Cần đăng nhập"
        description={<p>Vui lòng đăng nhập lại để kiểm tra trạng thái thanh toán.</p>}
        primary={{ href: '/login', label: 'Đăng nhập' }}
      />
    );
  }

  const order = payment.orderId ? { href: `/orders/${payment.orderId}`, label: 'Xem đơn hàng' } : orders;

  if (payment.status === 'PAID') {
    return (
      <PaymentStatusCard
        title="Thanh toán thành công"
        orderCode={payment.orderCode}
        status={{ tone: 'done', label: 'Đã thanh toán' }}
        description={<p>Shop đã nhận được thanh toán. Đơn chuyển sang bước duyệt số đo trước khi may.</p>}
        primary={order}
      />
    );
  }

  // Đơn đã được thanh toán bằng cách khác (vd. admin xác nhận chuyển khoản) trong khi lần
  // này còn chờ hoặc đã hết hạn ở cổng: báo đã thanh toán, không báo thất bại.
  if (isPaymentSettled(payment)) {
    return (
      <PaymentStatusCard
        title="Đơn hàng đã được thanh toán"
        orderCode={payment.orderCode}
        status={{ tone: 'done', label: 'Đã thanh toán' }}
        description={<p>Shop đã xác nhận thanh toán cho đơn này, bạn không cần quét mã nữa. Theo dõi các bước tiếp theo ở trang đơn hàng.</p>}
        primary={order}
      />
    );
  }

  if (payment.status === 'FAILED') {
    return (
      <PaymentStatusCard
        title="Thanh toán chưa thành công"
        orderCode={payment.orderCode}
        status={{ tone: 'error', label: 'Thất bại' }}
        description={<p>{payment.failureReason || 'Cổng thanh toán chưa xác nhận giao dịch. Đơn vẫn chờ thanh toán, bạn có thể thử lại từ trang đơn hàng.'}</p>}
        primary={payment.orderId ? { href: `/orders/${payment.orderId}`, label: 'Thanh toán lại' } : orders}
      />
    );
  }

  if (payment.status === 'REFUND_REQUIRED') {
    return (
      <PaymentStatusCard
        title="Khoản thanh toán cần hoàn lại"
        orderCode={payment.orderCode}
        status={{ tone: 'attention', label: 'Cần hoàn tiền' }}
        description={<p>Shop đã nhận tiền nhưng không ghi nhận được cho đơn này, thường do đơn đã được thanh toán trước đó. Khoản này sẽ được hoàn lại cho bạn.</p>}
        primary={order}
      />
    );
  }

  return (
    <PaymentStatusCard
      title="Đang xác nhận thanh toán"
      orderCode={payment.orderCode}
      status={{ tone: 'attention', label: 'Đang xác nhận' }}
      description={<p>Hệ thống đang chờ cổng thanh toán xác nhận. Bạn có thể mở đơn hàng để theo dõi trạng thái.</p>}
      primary={order}
    />
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentResultContent />
    </Suspense>
  );
}

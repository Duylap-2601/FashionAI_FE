'use client';

import { useAuthStore } from '@/features/auth/store/authStore';
import { PaymentLoading, PaymentStatusCard } from '@/features/payments/components/payment-outcome';
import { usePaymentStatus } from '@/features/payments/hooks/usePayments';
import { invalidateAfterPayment } from '@/features/payments/services/payment-cache';
import { getSubscriptionActivatedMessage, isSubscriptionPurchase } from '@/features/payments/services/payment-copy';
import { isPaymentSettled } from '@/features/payments/services/payments-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

/** Gói thành viên: quay về trang gói để xem hạn dùng mới, không có bước duyệt số đo. */
const SUBSCRIPTION_TARGET = { href: '/subscription', label: 'Xem gói của tôi', retryLabel: 'Chọn lại gói' };

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const paymentId = searchParams.get('paymentId');
  const authStatus = useAuthStore((state) => state.status);
  const { data: payment, isLoading, isError } = usePaymentStatus(paymentId);
  const orders = { href: '/profile/orders', label: 'Xem đơn hàng của tôi' };
  // BE gắn kind=subscription cho đơn mua gói; ngoài ra payment.targetTier chỉ có ở lần
  // thanh toán gói thành viên.
  const isSubscription = isSubscriptionPurchase({
    kind: searchParams.get('kind'),
    targetTier: payment?.targetTier,
  });
  const isSettled = isPaymentSettled(payment);

  // Thanh toán gói vừa xong: gói thành viên / hạn mức AI / danh sách đơn đã đổi ở BE
  // nhưng cache còn hạn 60s, phải xoá để trang gói hiển thị đúng ngay.
  useEffect(() => {
    if (!isSettled) return;
    void invalidateAfterPayment(queryClient);
  }, [isSettled, queryClient]);

  if (!paymentId || isError) {
    return (
      <PaymentStatusCard
        title="Không tìm thấy thanh toán"
        status={{ tone: 'error', label: 'Không xác định' }}
        description={<p>Vui lòng đăng nhập lại hoặc mở trang đơn hàng để kiểm tra trạng thái.</p>}
        primary={isSubscription ? SUBSCRIPTION_TARGET : orders}
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
    if (isSubscription) {
      return (
        <PaymentStatusCard
          title="Thanh toán thành công"
          orderCode={payment.orderCode}
          status={{ tone: 'success', label: 'Đã thanh toán' }}
          description={<p>{getSubscriptionActivatedMessage(payment.targetTier)}</p>}
          primary={SUBSCRIPTION_TARGET}
        />
      );
    }

    return (
      <PaymentStatusCard
        title="Thanh toán thành công"
        orderCode={payment.orderCode}
        status={{ tone: 'success', label: 'Đã thanh toán' }}
        description={<p>Shop đã nhận được thanh toán. Đơn chuyển sang bước duyệt số đo trước khi may.</p>}
        primary={order}
      />
    );
  }

  // Đơn đã được thanh toán bằng cách khác (vd. admin xác nhận chuyển khoản) trong khi lần
  // này còn chờ hoặc đã hết hạn ở cổng: báo đã thanh toán, không báo thất bại.
  if (isSettled) {
    return (
      <PaymentStatusCard
        title={isSubscription ? 'Gói thành viên đã được thanh toán' : 'Đơn hàng đã được thanh toán'}
        orderCode={payment.orderCode}
        status={{ tone: 'success', label: 'Đã thanh toán' }}
        description={
          <p>
            {isSubscription
              ? 'Shop đã xác nhận thanh toán cho lần mua gói này, bạn không cần quét mã nữa. Mở trang gói thành viên để xem hạn dùng.'
              : 'Shop đã xác nhận thanh toán cho đơn này, bạn không cần quét mã nữa. Theo dõi các bước tiếp theo ở trang đơn hàng.'}
          </p>
        }
        primary={isSubscription ? SUBSCRIPTION_TARGET : order}
      />
    );
  }

  if (payment.status === 'FAILED') {
    return (
      <PaymentStatusCard
        title="Thanh toán chưa thành công"
        orderCode={payment.orderCode}
        status={{ tone: 'error', label: 'Thất bại' }}
        description={
          <p>
            {payment.failureReason
              || (isSubscription
                ? 'Cổng thanh toán chưa xác nhận giao dịch nên gói chưa được kích hoạt. Bạn có thể chọn lại gói và thanh toán lại.'
                : 'Cổng thanh toán chưa xác nhận giao dịch. Đơn vẫn chờ thanh toán, bạn có thể thử lại từ trang đơn hàng.')}
          </p>
        }
        primary={isSubscription
          ? SUBSCRIPTION_TARGET
          : payment.orderId ? { href: `/orders/${payment.orderId}`, label: 'Thanh toán lại' } : orders}
      />
    );
  }

  if (payment.status === 'REFUND_REQUIRED') {
    return (
      <PaymentStatusCard
        title="Khoản thanh toán cần hoàn lại"
        orderCode={payment.orderCode}
        status={{ tone: 'attention', label: 'Cần hoàn tiền' }}
        description={<p>Shop đã nhận tiền nhưng không ghi nhận được cho lần thanh toán này, thường do đã được thanh toán trước đó. Khoản này sẽ được hoàn lại cho bạn.</p>}
        primary={isSubscription ? SUBSCRIPTION_TARGET : order}
      />
    );
  }

  return (
    <PaymentStatusCard
      title="Đang xác nhận thanh toán"
      orderCode={payment.orderCode}
      status={{ tone: 'attention', label: 'Đang xác nhận' }}
      description={
        <p>
          {isSubscription
            ? 'Hệ thống đang chờ cổng thanh toán xác nhận. Gói thành viên sẽ được kích hoạt ngay khi nhận được xác nhận.'
            : 'Hệ thống đang chờ cổng thanh toán xác nhận. Bạn có thể mở đơn hàng để theo dõi trạng thái.'}
        </p>
      }
      primary={isSubscription ? SUBSCRIPTION_TARGET : order}
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

'use client';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useOrder } from '@/features/orders/hooks/useOrders';
import { PaymentLoading, PaymentStatusCard } from '@/features/payments/components/payment-outcome';
import { invalidateAfterPayment } from '@/features/payments/services/payment-cache';
import { getSubscriptionActivatedMessage, isSubscriptionPurchase } from '@/features/payments/services/payment-copy';
import { fetchPaymentOrderByCode } from '@/features/payments/services/queries';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

/** Thanh toán ở các trạng thái này chắc chắn thất bại/hủy, không phải "đang chờ xác nhận". */
const FAILED_PAYMENT_STATUSES = ['EXPIRED', 'FAILED'];
/** IPN webhook của SePay/PayOS gọi ngược vào server độc lập với redirect trình
 * duyệt và có thể đến sau vài giây; poll trong lúc chờ để không báo "thất bại"
 * nhầm khi đơn vẫn PENDING ngay lúc trang vừa mở. */
const CONFIRM_TIMEOUT_MS = 20_000;
const CONFIRM_POLL_INTERVAL_MS = 2_000;

/** Gói thành viên: quay về trang gói để xem hạn dùng mới, không có bước duyệt số đo. */
const SUBSCRIPTION_TARGET = { href: '/subscription', label: 'Xem gói của tôi', retryLabel: 'Chọn lại gói' };

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const authStatus = useAuthStore((state) => state.status);
  const orderCode = searchParams.get('orderCode') || searchParams.get('code');
  // SePay trả kèm orderId (BE thêm vào URL trả về); link cũ chỉ có orderCode.
  const orderIdParam = searchParams.get('orderId');
  const status = searchParams.get('status') || 'success';
  // BE luôn gắn kind=subscription cho đơn mua gói thành viên.
  const subscriptionFromUrl = searchParams.get('kind') === 'subscription';
  const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(true);

  const { order, isLoading, refetch } = useOrder(resolvedOrderId || '');
  const [confirmTimedOut, setConfirmTimedOut] = useState(false);

  useEffect(() => {
    if (orderIdParam) {
      setResolvedOrderId(orderIdParam);
      setIsResolving(false);
      return;
    }

    if (!orderCode) {
      setIsResolving(false);
      return;
    }

    // Khách chưa đăng nhập không đọc được /orders (401); hiển thị nhánh "Cần đăng nhập".
    if (authStatus !== 'authenticated') {
      setIsResolving(authStatus === 'loading');
      return;
    }

    let cancelled = false;
    const findOrder = async () => {
      try {
        const found = await fetchPaymentOrderByCode(orderCode);
        // Không rơi về orderCode như id đơn: link /orders/<orderCode> trả 404 và trang
        // sẽ báo "Thất bại" sai. Không tìm thấy thì hiển thị trạng thái trung tính.
        if (!cancelled) setResolvedOrderId(found?.id ?? null);
      } catch {
        if (!cancelled) setResolvedOrderId(null);
      } finally {
        if (!cancelled) setIsResolving(false);
      }
    };
    findOrder();

    return () => {
      cancelled = true;
    };
  }, [authStatus, orderCode, orderIdParam]);

  const isPaid = order?.paymentStatus === 'PAID';
  const isFailed = order
    ? order.status === 'CANCELLED' || FAILED_PAYMENT_STATUSES.includes(order.paymentStatus ?? '')
    : false;
  const isAwaitingConfirmation = status !== 'cancel' && status !== 'error' && !!order && !isPaid && !isFailed;
  const isSubscription = subscriptionFromUrl || isSubscriptionPurchase({ targetTier: order?.targetTier });

  // Gói thành viên / hạn mức AI / danh sách đơn vừa đổi ở BE: xoá cache để trang gói
  // hiển thị ngay sau khi quay về từ cổng thanh toán.
  useEffect(() => {
    if (!isPaid) return;
    void invalidateAfterPayment(queryClient);
  }, [isPaid, queryClient]);

  // IPN có thể đến sau khi trình duyệt vừa redirect về đây; poll nhanh trong
  // ít giây trước khi chấp nhận là chưa xác nhận được (không coi là thất bại).
  useEffect(() => {
    if (!isAwaitingConfirmation) return;

    setConfirmTimedOut(false);
    const deadline = Date.now() + CONFIRM_TIMEOUT_MS;

    const interval = setInterval(() => {
      if (Date.now() >= deadline) {
        clearInterval(interval);
        setConfirmTimedOut(true);
        return;
      }
      refetch();
    }, CONFIRM_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isAwaitingConfirmation, resolvedOrderId, refetch]);

  if (authStatus === 'loading' || isResolving || (resolvedOrderId && isLoading)) {
    return <PaymentLoading />;
  }

  const code = order?.orderCode ?? orderCode;

  // Khách (chưa đăng nhập) vừa thanh toán ở cổng: không có phiên để đọc đơn, nhưng
  // không được báo "Thất bại" khi cổng đã trả về status=success.
  if (authStatus === 'unauthenticated') {
    return (
      <PaymentStatusCard
        title={status === 'success' ? 'Đã nhận thanh toán' : 'Chưa xác nhận được thanh toán'}
        orderCode={code}
        status={status === 'success' ? { tone: 'success', label: 'Đã thanh toán' } : { tone: 'attention', label: 'Đang xác nhận' }}
        description={
          <p>
            {isSubscription
              ? 'Gói thành viên đã được kích hoạt cho tài khoản đã thanh toán. Đăng nhập lại để xem hạn dùng và lượt sử dụng.'
              : 'Đăng nhập lại để xem trạng thái đơn và các bước tiếp theo của đơn hàng.'}
          </p>
        }
        primary={{ href: isSubscription ? SUBSCRIPTION_TARGET.href : '/login', label: isSubscription ? SUBSCRIPTION_TARGET.label : 'Đăng nhập' }}
      />
    );
  }

  const orderHref = resolvedOrderId ? `/orders/${resolvedOrderId}` : '/profile/orders';

  // Link cũ chỉ có orderCode mà tra không ra đơn, hoặc không đọc được đơn: giữ trạng thái
  // trung tính thay vì kết luận thất bại (trước đây orderCode bị dùng như id đơn → 404).
  if (!resolvedOrderId || !order) {
    return (
      <PaymentStatusCard
        title="Đang xác nhận thanh toán"
        orderCode={code}
        status={{ tone: 'attention', label: 'Chưa tìm thấy đơn' }}
        description={
          <p>
            {isSubscription
              ? 'Hệ thống chưa tìm thấy đơn cho mã này. Nếu bạn vừa thanh toán gói thành viên, hãy mở trang gói thành viên để kiểm tra hạn dùng.'
              : 'Hệ thống chưa tìm thấy đơn cho mã này. Nếu bạn vừa thanh toán, hãy mở danh sách đơn hàng để kiểm tra lại.'}
          </p>
        }
        primary={isSubscription ? { href: SUBSCRIPTION_TARGET.href, label: SUBSCRIPTION_TARGET.label } : { href: '/profile/orders', label: 'Xem đơn hàng của tôi' }}
      />
    );
  }

  if (isPaid) {
    if (isSubscription) {
      return (
        <PaymentStatusCard
          title="Thanh toán thành công"
          orderCode={code}
          status={{ tone: 'success', label: 'Đã thanh toán' }}
          description={<p>{getSubscriptionActivatedMessage(order?.targetTier)}</p>}
          primary={{ href: SUBSCRIPTION_TARGET.href, label: SUBSCRIPTION_TARGET.label }}
        />
      );
    }

    return (
      <PaymentStatusCard
        title="Thanh toán thành công"
        orderCode={code}
        status={{ tone: 'success', label: 'Đã thanh toán' }}
        description={<p>Shop đã nhận được thanh toán. Đơn chuyển sang bước duyệt số đo trước khi may.</p>}
        primary={{ href: orderHref, label: 'Xem đơn hàng' }}
      />
    );
  }

  if (status === 'cancel') {
    return (
      <PaymentStatusCard
        title="Thanh toán đã bị hủy"
        orderCode={code}
        status={{ tone: 'attention', label: 'Chờ thanh toán' }}
        description={
          <p>
            {isSubscription
              ? 'Bạn đã hủy ở cổng thanh toán nên gói chưa được kích hoạt. Chọn lại gói khi bạn sẵn sàng thanh toán.'
              : 'Bạn đã hủy ở cổng thanh toán. Đơn vẫn được giữ ở trạng thái chờ thanh toán, bạn có thể thanh toán lại từ trang đơn hàng.'}
          </p>
        }
        primary={isSubscription ? { href: SUBSCRIPTION_TARGET.href, label: SUBSCRIPTION_TARGET.retryLabel } : { href: orderHref, label: 'Thanh toán lại' }}
      />
    );
  }

  if (isAwaitingConfirmation && !confirmTimedOut) {
    return (
      <PaymentStatusCard
        title="Đang xác nhận thanh toán"
        orderCode={code}
        status={{ tone: 'attention', label: 'Đang xác nhận' }}
        description={
          <p>
            {isSubscription
              ? 'Cổng thanh toán đang gửi xác nhận về hệ thống. Gói thành viên sẽ được kích hoạt ngay khi nhận được, trang sẽ tự cập nhật.'
              : 'Cổng thanh toán đang gửi xác nhận về hệ thống. Vui lòng đợi trong ít giây, trang sẽ tự cập nhật.'}
          </p>
        }
        primary={isSubscription ? { href: SUBSCRIPTION_TARGET.href, label: SUBSCRIPTION_TARGET.label } : { href: orderHref, label: 'Xem đơn hàng' }}
      />
    );
  }

  return (
    <PaymentStatusCard
      title="Thanh toán chưa thành công"
      orderCode={code}
      status={{ tone: 'error', label: 'Thất bại' }}
      description={
        <p>
          {isSubscription
            ? 'Cổng thanh toán chưa xác nhận giao dịch nên gói chưa được kích hoạt. Bạn có thể chọn lại gói và thanh toán lại.'
            : 'Cổng thanh toán chưa xác nhận giao dịch. Đơn vẫn chờ thanh toán, bạn có thể thử lại từ trang đơn hàng.'}
        </p>
      }
      primary={isSubscription ? { href: SUBSCRIPTION_TARGET.href, label: SUBSCRIPTION_TARGET.retryLabel } : { href: orderHref, label: 'Thanh toán lại' }}
    />
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

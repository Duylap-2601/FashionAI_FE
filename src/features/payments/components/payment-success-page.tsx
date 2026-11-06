'use client';

import { useOrder } from '@/features/orders/hooks/useOrders';
import { PaymentLoading, PaymentStatusCard } from '@/features/payments/components/payment-outcome';
import { fetchPaymentOrderByCodeResponse } from '@/features/payments/services/queries';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

/** Thanh toán ở các trạng thái này chắc chắn thất bại/hủy, không phải "đang chờ xác nhận". */
const FAILED_PAYMENT_STATUSES = ['EXPIRED', 'FAILED'];
/** IPN webhook của SePay/PayOS gọi ngược vào server độc lập với redirect trình
 * duyệt và có thể đến sau vài giây; poll trong lúc chờ để không báo "thất bại"
 * nhầm khi đơn vẫn PENDING ngay lúc trang vừa mở. */
const CONFIRM_TIMEOUT_MS = 20_000;
const CONFIRM_POLL_INTERVAL_MS = 2_000;

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('orderCode') || searchParams.get('code');
  // SePay trả kèm orderId (BE thêm vào URL trả về); link cũ chỉ có orderCode.
  const orderIdParam = searchParams.get('orderId');
  const status = searchParams.get('status') || 'success';
  const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(true);

  const { order, isLoading, refetch } = useOrder(resolvedOrderId || '');
  const [confirmTimedOut, setConfirmTimedOut] = useState(false);

  useEffect(() => {
    if (orderIdParam) {
      setResolvedOrderId(orderIdParam);
      setIsResolving(false);
    } else if (orderCode) {
      const findOrder = async () => {
        try {
          const res = await fetchPaymentOrderByCodeResponse(orderCode);
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
  }, [orderCode, orderIdParam]);

  const isPaid = order?.paymentStatus === 'PAID';
  const isFailed = order
    ? order.status === 'CANCELLED' || FAILED_PAYMENT_STATUSES.includes(order.paymentStatus ?? '')
    : false;
  const isAwaitingConfirmation = status !== 'cancel' && status !== 'error' && !!order && !isPaid && !isFailed;

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

  if (isResolving || (resolvedOrderId && isLoading)) {
    return <PaymentLoading />;
  }

  const orderHref = resolvedOrderId ? `/orders/${resolvedOrderId}` : '/profile/orders';
  const code = order?.orderCode ?? orderCode;

  if (isPaid) {
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
        description={<p>Bạn đã hủy ở cổng thanh toán. Đơn vẫn được giữ ở trạng thái chờ thanh toán, bạn có thể thanh toán lại từ trang đơn hàng.</p>}
        // Thanh toán lại ở trang đơn; /checkout sẽ tạo thêm một đơn mới.
        primary={{ href: orderHref, label: 'Thanh toán lại' }}
      />
    );
  }

  if (isAwaitingConfirmation && !confirmTimedOut) {
    return (
      <PaymentStatusCard
        title="Đang xác nhận thanh toán"
        orderCode={code}
        status={{ tone: 'attention', label: 'Đang xác nhận' }}
        description={<p>Cổng thanh toán đang gửi xác nhận về hệ thống. Vui lòng đợi trong ít giây, trang sẽ tự cập nhật.</p>}
        primary={{ href: orderHref, label: 'Xem đơn hàng' }}
      />
    );
  }

  return (
    <PaymentStatusCard
      title="Thanh toán chưa thành công"
      orderCode={code}
      status={{ tone: 'error', label: 'Thất bại' }}
      description={<p>Cổng thanh toán chưa xác nhận giao dịch. Đơn vẫn chờ thanh toán, bạn có thể thử lại từ trang đơn hàng.</p>}
      primary={{ href: orderHref, label: 'Thanh toán lại' }}
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

'use client';

import { PaymentOutcome } from '@/features/payments/components/payment-outcome';

export default function PaymentCancelPage() {
  return (
    <PaymentOutcome
      title="Thanh toán đã bị hủy"
      status={{ tone: 'attention', label: 'Đã hủy' }}
      description={<p>Bạn đã hủy ở cổng thanh toán. Đơn vẫn được giữ ở trạng thái chờ thanh toán, bạn có thể thanh toán lại từ trang đơn hàng.</p>}
    />
  );
}

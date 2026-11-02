'use client';

import { PaymentOutcome } from '@/features/payments/components/payment-outcome';

export default function PaymentErrorPage() {
  return (
    <PaymentOutcome
      title="Thanh toán chưa thành công"
      description={<p>Cổng thanh toán báo lỗi nên chưa trừ tiền cho đơn này. Đơn vẫn chờ thanh toán, bạn có thể thử lại từ trang đơn hàng.</p>}
    >
      {(params) => {
        const code = params.get('error') || params.get('code');
        const message = params.get('message') || params.get('desc');
        if (!code && !message) return null;
        return (
          <div className="mt-5 border-l-2 border-destructive bg-landing-paper/60 px-4 py-3 text-xs text-destructive">
            {code ? <p className="font-mono">Mã lỗi: {code}</p> : null}
            {message ? <p className="mt-1">{message}</p> : null}
          </div>
        );
      }}
    </PaymentOutcome>
  );
}

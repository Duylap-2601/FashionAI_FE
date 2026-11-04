'use client';

import { DeliveryOptions } from '@/features/checkout/components/delivery-options';
import type { CheckoutPaymentMethod } from '@/features/checkout/types/delivery-options';
import { queryKeys as ordersQueryKeys } from '@/features/orders/services/query-keys';
import { getOrderCode, getOrderTotal } from '@/features/orders/services/order-display';
import type { Order } from '@/features/orders/types/orders';
import { PaymentDialog } from '@/features/payments/components/payment-dialog';
import { useCheckout } from '@/features/payments/hooks/usePayments';
import type { CheckoutResponse } from '@/features/payments/types/payments';
import { AccountDialog, accountButtonClassName, accountLabelClassName } from '@/features/profile/components/account-ui';
import { getErrorMessage } from '@/lib/errors';
import { cn, formatPrice } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Đơn đã tạo nhưng chưa trả tiền: chọn lại cổng và mở QR / chuyển khoản. BE dùng lại
 * link còn hạn của cổng đó, hết hạn thì tạo link mới.
 */
export function OrderPaymentAction({ order }: { order: Order }) {
  const queryClient = useQueryClient();
  const { checkout, isLoading } = useCheckout();
  const [isChoosing, setIsChoosing] = useState(false);
  const [method, setMethod] = useState<CheckoutPaymentMethod>(order.paymentProvider === 'SEPAY' ? 'sepay' : 'zalopay');
  const [payment, setPayment] = useState<CheckoutResponse | null>(null);
  const total = getOrderTotal(order);

  const startPayment = async () => {
    try {
      const result = await checkout({ orderId: order.id, provider: method === 'sepay' ? 'SEPAY' : 'ZALOPAY' });
      if (!result.checkoutUrl) throw new Error('Không nhận được link thanh toán');
      setIsChoosing(false);
      setPayment(result);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không tạo được thanh toán lúc này. Vui lòng thử lại.'));
    }
  };

  const refreshOrder = () => {
    void queryClient.invalidateQueries({ queryKey: ordersQueryKeys.order(order.id) });
    void queryClient.invalidateQueries({ queryKey: ordersQueryKeys.orders() });
  };

  return (
    <>
      <button type="button" onClick={() => setIsChoosing(true)} className={accountButtonClassName('primary')}>
        Thanh toán
      </button>

      <AccountDialog
        open={isChoosing}
        onOpenChange={(open) => {
          if (!isLoading) setIsChoosing(open);
        }}
        eyebrow="Thanh toán"
        title={`Đơn ${getOrderCode(order)}`}
        description="Chọn cách thanh toán. Đơn được xác nhận ngay khi cổng báo đã nhận tiền."
      >
        <div className="flex flex-col gap-5">
          <DeliveryOptions paymentMethod={method} setPaymentMethod={setMethod} />
          <div className="flex items-baseline justify-between gap-4 border-t border-landing-line/70 pt-4">
            <span className={accountLabelClassName}>Số tiền</span>
            <span className="font-mono text-xl text-landing-oxblood">{formatPrice(total)}</span>
          </div>
          <button type="button" onClick={startPayment} disabled={isLoading} className={cn(accountButtonClassName('primary'), 'w-full')}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} aria-hidden="true" /> : null}
            {isLoading ? 'Đang tạo thanh toán' : 'Tiếp tục thanh toán'}
          </button>
        </div>
      </AccountDialog>

      {payment ? (
        <PaymentDialog
          checkoutResult={payment}
          total={total}
          onClose={() => {
            setPayment(null);
            refreshOrder();
          }}
          onPaid={refreshOrder}
        />
      ) : null}
    </>
  );
}

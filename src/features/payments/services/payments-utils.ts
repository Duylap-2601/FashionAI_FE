import type { PaymentStatusResponse } from '@/features/payments/types/payments';
import { getErrorMessage } from '@/lib/errors';

export function extractErrorMessage(error: unknown): string {
  if (!error) return 'Không xác định được lỗi.';
  return getErrorMessage(error, 'Đã xảy ra lỗi không xác định.');
}

/**
 * Đơn đã được thanh toán: bằng chính lần thanh toán này, hoặc bằng đường khác (vd. admin
 * xác nhận chuyển khoản thủ công) trong khi lần này vẫn chờ cổng thanh toán.
 */
export function isPaymentSettled(payment?: Pick<PaymentStatusResponse, 'status' | 'paymentStatus' | 'orderStatus'> | null): boolean {
  if (!payment) return false;
  if (payment.status === 'PAID') return true;
  return payment.status === 'PENDING' && (payment.paymentStatus === 'PAID' || payment.orderStatus === 'PAID');
}

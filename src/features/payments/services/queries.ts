import type { PaymentOrder, PaymentStatusResponse } from '@/features/payments/types/payments';
import { http } from '@/lib/http';

export async function fetchPaymentOrders() {
  const data = await http.get<PaymentOrder[]>('/payments/orders');
  return data || [];
}

export function fetchPaymentOrderByCodeResponse(id: string) {
  return fetch(`/api/orders?orderCode=${id}`);
}

export async function fetchPaymentStatus(paymentId: string) {
  return http.get<PaymentStatusResponse>(`/payments/${paymentId}`);
}

export { queryKeys } from './query-keys';

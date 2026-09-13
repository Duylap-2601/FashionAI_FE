import type { PaymentOrder } from '@/features/payments/types/payments';
import { http } from '@/lib/http';

export async function fetchPaymentOrders() {
  const data = await http.get<PaymentOrder[]>('/payments/orders');
  return data || [];
}

export function fetchPaymentOrderByCodeResponse(id: string) {
  return fetch(`/api/orders?orderCode=${id}`);
}

export { queryKeys } from './query-keys';

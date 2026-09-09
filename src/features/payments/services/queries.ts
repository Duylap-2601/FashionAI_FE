import type { PaymentOrder } from '@/features/payments/types/payments';
import { api } from '@/lib/api';

export async function fetchPaymentOrders() {
  const res = await api.get('/payments/orders');
  return (res.data || []) as PaymentOrder[];
}

export function fetchPaymentOrderByCodeResponse(id: string) {
  return fetch(`/api/orders?orderCode=${id}`);
}

export { queryKeys } from './query-keys';

import { mapOrder } from '@/features/orders/services/orders-utils';
import type { BackendOrder } from '@/features/orders/types/orders';
import { api } from '@/lib/api';

export async function fetchOrders() {
  const res = await api.get('/orders');
  return ((res.data || []) as BackendOrder[]).map(mapOrder);
}

export async function fetchOrder(id: string) {
  const res = await api.get(`/orders/${id}`);
  return mapOrder(res.data as BackendOrder);
}

export { queryKeys } from './query-keys';

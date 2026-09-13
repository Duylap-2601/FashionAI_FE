import { mapOrder } from '@/features/orders/services/orders-utils';
import type { BackendOrder } from '@/features/orders/types/orders';
import { http } from '@/lib/http';

export async function fetchOrders() {
  const data = await http.get<BackendOrder[]>('/orders');
  return (data || []).map(mapOrder);
}

export async function fetchOrder(id: string) {
  const data = await http.get<BackendOrder>(`/orders/${id}`);
  return mapOrder(data);
}

export { queryKeys } from './query-keys';

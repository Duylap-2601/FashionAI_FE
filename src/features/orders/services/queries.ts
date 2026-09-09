import { mapOrder } from '@/features/orders/services/orders-utils';
import type { BackendOrder } from '@/features/orders/types/orders';
import { api } from '@/lib/api';

export async function fetchOrders() {
  const res = await api.get('/orders');
  return ((res.data || []) as BackendOrder[]).map(mapOrder);
}

export async function fetchOrder(id: string) {
  try {
    const res = await api.get(`/orders/${id}`);
    return mapOrder(res.data as BackendOrder);
  } catch {
    const res = await api.get('/orders');
    const order = (res.data || []).find((item: BackendOrder) => item.id === id);
    if (!order) throw new Error('Không tìm thấy đơn hàng');
    return mapOrder(order);
  }
}

export { queryKeys } from './query-keys';

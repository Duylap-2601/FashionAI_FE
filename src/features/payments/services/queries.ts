import { fetchOrdersPage } from '@/features/orders/services/queries';
import type { Order } from '@/features/orders/types/orders';
import type { PaymentOrder, PaymentStatusResponse } from '@/features/payments/types/payments';
import { http } from '@/lib/http';

export async function fetchPaymentOrders() {
  const data = await http.get<PaymentOrder[]>('/payments/orders');
  return data || [];
}

/**
 * Cổng thanh toán chỉ trả về `orderCode` (link cũ, không có `orderId`). Backend
 * `OrdersService.findAll` nhận `search` số và so khớp `orderCode`, nên tra ở đó thay vì
 * đoán mã đơn. Trả `null` khi không có đơn nào khớp — nơi gọi không được coi orderCode là id.
 */
export async function fetchPaymentOrderByCode(orderCode: string): Promise<Order | null> {
  const search = orderCode.trim();
  if (!search) return null;

  const { orders } = await fetchOrdersPage({ search, limit: 5 });
  const numericCode = Number(search);
  if (Number.isFinite(numericCode)) {
    return orders.find((order) => order.orderCode === numericCode) ?? null;
  }
  return orders.length === 1 ? orders[0] : null;
}

export async function fetchPaymentStatus(paymentId: string) {
  return http.get<PaymentStatusResponse>(`/payments/${paymentId}`);
}

export { queryKeys } from './query-keys';

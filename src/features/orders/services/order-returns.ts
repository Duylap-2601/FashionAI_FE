import type { OrderHistoryEvent } from '@/features/orders/types/orders';

export const RETURN_FLOW_STATUSES = ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNING', 'RETURNED'];

/** Sự kiện thuộc luồng đổi trả & hoàn tiền: báo lỗi, duyệt, gửi hàng về, hoàn tiền. */
export function isReturnHistoryEvent(event: Pick<OrderHistoryEvent, 'type' | 'toStatus'>): boolean {
  if (event.toStatus && RETURN_FLOW_STATUSES.includes(event.toStatus)) return true;
  return /ISSUE|REFUND|RETURN/.test(event.type ?? '');
}

export function orderReturnsHref(orderId: string | number): string {
  return `/orders/${orderId}/returns`;
}

import type { BackendOrder, CreateOrderIssuePayload, CreateOrderRequest, OrderIssue, OrderQuote } from '@/features/orders/types/orders';
import { http } from '@/lib/http';

function toCreateOrderBody(payload: CreateOrderRequest) {
  return {
    items: payload.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      color: item.color,
      price: item.price,
    })),
    shippingInfo: payload.shippingInfo ? {
      name: payload.shippingInfo.name,
      phone: payload.shippingInfo.phone,
      address: payload.shippingInfo.address,
      provinceName: payload.shippingInfo.provinceName,
      wardName: payload.shippingInfo.wardName,
      note: payload.shippingInfo.notes ?? payload.shippingInfo.note,
      notes: payload.shippingInfo.notes ?? payload.shippingInfo.note,
      ghnProvinceV3Id: payload.shippingInfo.ghnProvinceV3Id,
      ghnWardV3Id: payload.shippingInfo.ghnWardV3Id,
    } : undefined,
    shippingAddressId: payload.shippingAddressId,
    addressVersion: payload.addressVersion,
    shippingNote: payload.shippingNote,
    quoteToken: payload.quoteToken,
    idempotencyKey: payload.idempotencyKey,
    paymentMethod: payload.paymentMethod,
    provider: payload.provider,
    couponCode: payload.couponCode,
    totalAmount: payload.totalAmount,
  };
}

export async function createOrder(payload: CreateOrderRequest) {
  return http.post<BackendOrder>('/orders', toCreateOrderBody(payload));
}

export async function quoteOrder(payload: CreateOrderRequest) {
  return http.post<OrderQuote>('/orders/quote', toCreateOrderBody(payload));
}

export async function cancelOrder(id: string) {
  return http.patch(`/orders/${id}/cancel`);
}

export async function confirmDelivery({ id, note }: { id: string; note?: string }) {
  return http.post<BackendOrder>(`/orders/${id}/confirm-delivery`, { note });
}

export async function createOrderIssue(payload: CreateOrderIssuePayload): Promise<OrderIssue> {
  const fd = new FormData();
  fd.append('reason', payload.reason);
  fd.append('description', payload.description);
  fd.append('desiredResolution', payload.desiredResolution);
  if (payload.evidenceImages) {
    for (const file of payload.evidenceImages) {
      fd.append('evidenceImages', file);
    }
  }
  return http.post<OrderIssue>(
    `/orders/${payload.orderId}/items/${payload.orderItemId}/issues`,
    fd,
    { timeout: 30000 }
  );
}

export { mutationKeys } from './mutation-keys';

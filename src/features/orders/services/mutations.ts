import type { BackendOrder, CreateOrderIssuePayload, CreateOrderRequest, OrderIssue, OrderQuote } from '@/features/orders/types/orders';
import { http } from '@/lib/http';

function toCreateOrderBody(payload: CreateOrderRequest) {
  return {
    items: payload.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      color: item.color,
      comboType: item.comboType,
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

export async function updateOrderItemMeasurement({
  orderId,
  itemId,
  measurementSnapshot,
  syncToProfile,
}: {
  orderId: string;
  itemId: string;
  measurementSnapshot: Record<string, number | null>;
  syncToProfile?: boolean;
}) {
  return http.patch<BackendOrder>(`/orders/${orderId}/items/${itemId}/measurement`, {
    measurementSnapshot,
    syncToProfile,
  });
}

export async function sendOrderChatMessage({
  orderId,
  content,
  images,
  clientMessageId,
}: {
  orderId: string;
  content?: string;
  images?: File[];
  clientMessageId?: string;
}) {
  const formData = new FormData();
  if (content) formData.append('content', content);
  if (clientMessageId) formData.append('clientMessageId', clientMessageId);
  for (const image of images ?? []) {
    formData.append('images', image);
  }
  return http.post(`/orders/${orderId}/chat/messages`, formData, { timeout: 30000 });
}

export async function createDeliveryDispute({
  orderId,
  description,
  images,
}: {
  orderId: string;
  description: string;
  images?: File[];
}) {
  const formData = new FormData();
  formData.append('description', description);
  for (const image of images ?? []) {
    formData.append('evidenceImages', image);
  }
  return http.post(`/orders/${orderId}/delivery-dispute`, formData, { timeout: 30000 });
}

export async function confirmRefundReceived(orderId: string) {
  return http.post(`/orders/${orderId}/refund/confirm-received`);
}

export async function markOrderChatRead(orderId: string, upToMessageId?: string) {
  return http.post(`/orders/${orderId}/chat/read`, { upToMessageId });
}

export async function createOrderIssue(payload: CreateOrderIssuePayload): Promise<OrderIssue> {
  const fd = new FormData();
  fd.append('reason', payload.reason);
  fd.append('description', payload.description);
  fd.append('desiredResolution', payload.desiredResolution);
  if (payload.desiredResolution === 'REFUND') {
    if (payload.bankName) fd.append('bankName', payload.bankName);
    if (payload.accountNumber) fd.append('accountNumber', payload.accountNumber);
    if (payload.accountHolder) fd.append('accountHolder', payload.accountHolder);
  }
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

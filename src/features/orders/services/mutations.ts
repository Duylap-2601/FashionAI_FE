import type { BackendOrder, CreateOrderRequest, OrderQuote } from '@/features/orders/types/orders';
import { http } from '@/lib/http';

function toCreateOrderBody(payload: CreateOrderRequest) {
  return {
    items: payload.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      color: item.color,
      price: item.price,
    })),
    shippingInfo: {
      name: payload.shippingInfo.name,
      phone: payload.shippingInfo.phone,
      address: payload.shippingInfo.address,
      provinceName: payload.shippingInfo.provinceName,
      districtName: payload.shippingInfo.districtName,
      wardName: payload.shippingInfo.wardName,
      note: payload.shippingInfo.notes ?? payload.shippingInfo.note,
      notes: payload.shippingInfo.notes ?? payload.shippingInfo.note,
      ghnProvinceId: payload.shippingInfo.ghnProvinceId,
      ghnDistrictId: payload.shippingInfo.ghnDistrictId,
      ghnWardCode: payload.shippingInfo.ghnWardCode,
    },
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

export { mutationKeys } from './mutation-keys';

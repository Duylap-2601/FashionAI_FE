import type { BackendOrder, CreateOrderRequest, OrderQuote } from '@/features/orders/types/orders';
import { api } from '@/lib/api';

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
  const res = await api.post('/orders', toCreateOrderBody(payload));
  return res.data as BackendOrder;
}

export async function quoteOrder(payload: CreateOrderRequest) {
  const res = await api.post('/orders/quote', toCreateOrderBody(payload));
  return res.data as OrderQuote;
}

export async function cancelOrder(id: string) {
  const res = await api.patch(`/orders/${id}/cancel`);
  return res.data;
}

export async function confirmDelivery({ id, note }: { id: string; note?: string }) {
  const res = await api.post(`/orders/${id}/confirm-delivery`, { note });
  return res.data as BackendOrder;
}

export { mutationKeys } from './mutation-keys';

import type { BackendOrder, CreateOrderRequest } from '@/features/orders/types/orders';
import { api } from '@/lib/api';

export async function createOrder(payload: CreateOrderRequest) {
  const res = await api.post('/orders', {
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
      note: payload.shippingInfo.notes,
    },
    paymentMethod: payload.paymentMethod,
    provider: payload.provider,
    couponCode: payload.couponCode,
    discountAmount: payload.discountAmount,
    shippingFee: payload.shippingFee,
    totalAmount: payload.totalAmount,
  });
  return res.data as BackendOrder;
}

export async function cancelOrder(id: string) {
  const res = await api.patch(`/orders/${id}/cancel`);
  return res.data;
}

export { mutationKeys } from './mutation-keys';

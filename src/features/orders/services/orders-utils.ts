import type { BackendOrder, Order, ShippingInfo } from '@/features/orders/types/orders';

export function mapOrder(order: BackendOrder): Order {
  const shippingInfo = order.shippingInfo ?? ({} as ShippingInfo);
  return {
    id: order.id,
    orderCode: order.orderCode,
    status: order.status,
    totalAmount: Number(order.amount),
    shippingInfo: {
      name: shippingInfo.name || '',
      phone: shippingInfo.phone || '',
      address: shippingInfo.address || '',
      notes: shippingInfo.notes,
    },
    paymentMethod: order.payments?.[0]?.provider || 'COD',
    createdAt: order.createdAt,
    items: (order.items || []).map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      color: item.color || '',
      price: Number(item.price),
      measurementSnapshot: item.measurementSnapshot || undefined,
      product: item.product
        ? {
          name: item.product.name,
          images: item.product.images?.map((img) => img.imageUrl) || [],
        }
        : undefined,
    })),
  };
}

import type { BackendOrder, Order, ShippingInfo } from '@/features/orders/types/orders';

export function mapOrder(order: BackendOrder): Order {
  const shippingInfo = order.shippingInfo ?? ({} as ShippingInfo);
  const itemsTotal = Number(order.itemsTotal ?? (order.items || []).reduce((sum, item) => sum + Number(item.price) * item.quantity, 0));
  return {
    id: order.id,
    orderCode: order.orderCode,
    status: order.status,
    paymentStatus: order.paymentStatus,
    refundStatus: order.refundStatus,
    fulfillmentFlowVersion: order.fulfillmentFlowVersion,
    totalAmount: Number(order.amount),
    itemsTotal,
    shippingFee: Number(order.shippingFee ?? 0),
    discountAmount: Number(order.discountAmount ?? 0),
    shippingInfo: {
      name: shippingInfo.name || '',
      phone: shippingInfo.phone || '',
      address: shippingInfo.address || '',
      notes: shippingInfo.notes || shippingInfo.note,
      note: shippingInfo.note,
      ghnProvinceId: shippingInfo.ghnProvinceId,
      ghnDistrictId: shippingInfo.ghnDistrictId,
      ghnWardCode: shippingInfo.ghnWardCode,
    },
    paymentMethod: order.paymentMethod || order.payments?.[0]?.provider || 'Chưa xác định',
    paymentProvider: order.paymentProvider,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: (order.items || []).map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      color: item.color || '',
      price: Number(item.price),
      measurementSnapshot: item.measurementSnapshot || undefined,
      measurementReview: item.measurementReview || undefined,
      productNameSnapshot: item.productNameSnapshot,
      fabricSnapshot: item.fabricSnapshot,
      product: item.product
        ? {
          name: item.productNameSnapshot || item.product.name,
          images: item.product.images?.map((img) => img.imageUrl) || [],
        }
        : undefined,
    })),
    shipment: order.shipment,
    history: order.history || [],
    allowedActions: order.allowedActions,
  };
}

export function isTerminalOrderStatus(status: string) {
  return ['DELIVERED', 'CANCELLED', 'RETURNED', 'EXPIRED', 'FAILED'].includes(status);
}

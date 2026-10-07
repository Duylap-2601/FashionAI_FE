import type { BackendOrder, Order, ShippingInfo } from '@/features/orders/types/orders';

export function mapOrder(order: BackendOrder): Order {
  const shippingInfo = order.shippingInfo ?? ({} as ShippingInfo);
  const itemsTotal = Number(order.itemsTotal ?? (order.items || []).reduce((sum, item) => sum + Number(item.price) * item.quantity, 0));
  return {
    id: order.id,
    orderCode: order.orderCode,
    userId: order.userId || order.user?.id,
    status: order.status,
    displayStatus: order.displayStatus,
    paymentStatus: order.paymentStatus,
    refundStatus: order.refundStatus,
    fulfillmentFlowVersion: order.fulfillmentFlowVersion,
    currency: order.currency || 'VND',
    itemsSubtotalVnd: order.itemsSubtotalVnd !== undefined && order.itemsSubtotalVnd !== null ? Number(order.itemsSubtotalVnd) : undefined,
    shippingFeeVnd: order.shippingFeeVnd !== undefined && order.shippingFeeVnd !== null ? Number(order.shippingFeeVnd) : undefined,
    discountVnd: order.discountVnd !== undefined && order.discountVnd !== null ? Number(order.discountVnd) : undefined,
    taxVnd: order.taxVnd !== undefined && order.taxVnd !== null ? Number(order.taxVnd) : undefined,
    totalVnd: order.totalVnd !== undefined && order.totalVnd !== null ? Number(order.totalVnd) : undefined,
    amountPaidVnd: order.amountPaidVnd !== undefined && order.amountPaidVnd !== null ? Number(order.amountPaidVnd) : undefined,
    amountRefundedVnd: order.amountRefundedVnd !== undefined && order.amountRefundedVnd !== null ? Number(order.amountRefundedVnd) : undefined,
    shippingAddressSnapshot: order.shippingAddressSnapshot ?? null,
    shippingQuoteSnapshot: order.shippingQuoteSnapshot ?? null,
    refundEvidence: order.refundEvidence ?? null,
    totalAmount: Number(order.amount),
    itemsTotal,
    shippingFee: Number(order.shippingFee ?? 0),
    discountAmount: Number(order.discountAmount ?? 0),
    shippingInfo: {
      name: shippingInfo.name || '',
      phone: shippingInfo.phone || '',
      address: shippingInfo.address || '',
      provinceName: shippingInfo.provinceName,
      districtName: shippingInfo.districtName,
      wardName: shippingInfo.wardName,
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
      productSkuSnapshot: item.productSkuSnapshot,
      productImageSnapshot: item.productImageSnapshot,
      productCategorySnapshot: item.productCategorySnapshot,
      brandSnapshot: item.brandSnapshot,
      unitPriceVnd: item.unitPriceVnd !== undefined && item.unitPriceVnd !== null ? Number(item.unitPriceVnd) : Number(item.price),
      lineTotalVnd: item.lineTotalVnd !== undefined && item.lineTotalVnd !== null ? Number(item.lineTotalVnd) : Number(item.price) * item.quantity,
      measurementSnapshot: item.measurementSnapshot || undefined,
      measurementDisplay: Array.isArray(item.measurementDisplay) ? item.measurementDisplay : undefined,
      measurementReview: item.measurementReview || undefined,
      productNameSnapshot: item.productNameSnapshot,
      fabricSnapshot: item.fabricSnapshot,
      product: item.product || item.productImageSnapshot
        ? {
          name: item.productNameSnapshot || item.product?.name || `Sản phẩm #${item.productId}`,
          images: item.productImageSnapshot
            ? [item.productImageSnapshot, ...(item.product?.images?.map((img) => img.imageUrl).filter((u) => u !== item.productImageSnapshot) || [])]
            : item.product?.images?.map((img) => img.imageUrl) || [],
        }
        : undefined,
    })),
    payments: order.payments?.map((p) => ({
      id: p.id,
      provider: p.provider,
      transactionId: p.transactionId,
      status: p.status,
      amountVnd: p.amountVnd !== undefined && p.amountVnd !== null ? Number(p.amountVnd) : undefined,
      createdAt: p.createdAt,
    })) || [],
    refunds: order.refunds || [],
    shipment: order.currentShipment ?? order.shipment,
    activeShipment: order.activeShipment ?? null,
    currentShipment: order.currentShipment ?? order.shipment ?? null,
    shipmentHistory: order.shipmentHistory ?? (order.shipment ? [order.shipment] : []),
    history: order.history || [],
    allowedActions: order.allowedActions,
  };
}

export function isTerminalOrderStatus(status: string) {
  return ['COMPLETED', 'CANCELLED'].includes(status);
}

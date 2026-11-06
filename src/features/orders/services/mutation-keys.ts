export const mutationKeys = {
  createOrder: () => ['orders', 'createOrder'] as const,
  cancelOrder: () => ['orders', 'cancelOrder'] as const,
  confirmDelivery: () => ['orders', 'confirmDelivery'] as const,
  createOrderIssue: () => ['orders', 'createOrderIssue'] as const,
  updateItemMeasurement: () => ['orders', 'updateItemMeasurement'] as const,
  sendOrderChatMessage: () => ['orders', 'sendOrderChatMessage'] as const,
  markOrderChatRead: () => ['orders', 'markOrderChatRead'] as const,
  createDeliveryDispute: () => ['orders', 'createDeliveryDispute'] as const,
  confirmRefundReceived: () => ['orders', 'confirmRefundReceived'] as const,
};

export const mutationKeys = {
  createOrder: () => ['orders', 'createOrder'] as const,
  cancelOrder: () => ['orders', 'cancelOrder'] as const,
  confirmDelivery: () => ['orders', 'confirmDelivery'] as const,
  updateOrderItemMeasurement: () => ['orders', 'updateOrderItemMeasurement'] as const,
  createOrderIssue: () => ['orders', 'createOrderIssue'] as const,
};

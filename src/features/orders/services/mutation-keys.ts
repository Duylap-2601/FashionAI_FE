export const mutationKeys = {
  createOrder: () => ['orders', 'createOrder'] as const,
  cancelOrder: () => ['orders', 'cancelOrder'] as const,
  confirmDelivery: (orderId?: string) => ['orders', 'confirmDelivery', ...(orderId ? [orderId] : [])] as const,
};

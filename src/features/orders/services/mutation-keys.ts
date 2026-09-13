export const mutationKeys = {
  createOrder: () => ['orders', 'createOrder'] as const,
  cancelOrder: () => ['orders', 'cancelOrder'] as const,
  confirmDelivery: () => ['orders', 'confirmDelivery'] as const,
};

export const mutationKeys = {
  createOrder: () => ['orders', 'createOrder'] as const,
  cancelOrder: () => ['orders', 'cancelOrder'] as const,
};

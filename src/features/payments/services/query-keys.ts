// Preserve existing cache prefixes and parameter order, including partial invalidation.
export const queryKeys = {
  paymentOrders: <T extends readonly unknown[]>(...params: T) => ['payment-orders', ...params] as const,
};

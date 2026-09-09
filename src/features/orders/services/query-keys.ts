// Preserve existing cache prefixes and parameter order, including partial invalidation.
export const queryKeys = {
  orders: <T extends readonly unknown[]>(...params: T) => ['orders', ...params] as const,
  order: <T extends readonly unknown[]>(...params: T) => ['order', ...params] as const,
};

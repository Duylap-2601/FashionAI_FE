// Preserve existing cache prefixes and parameter order, including partial invalidation.
export const queryKeys = {
  products: <T extends readonly unknown[]>(...params: T) => ['products', ...params] as const,
  product: <T extends readonly unknown[]>(...params: T) => ['product', ...params] as const,
};

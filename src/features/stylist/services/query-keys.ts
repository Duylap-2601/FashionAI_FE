// Preserve existing cache prefixes and parameter order, including partial invalidation.
export const queryKeys = {
  stylistHistory: <T extends readonly unknown[]>(...params: T) => ['stylist-history', ...params] as const,
};

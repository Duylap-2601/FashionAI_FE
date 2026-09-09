// Preserve existing cache prefixes and parameter order, including partial invalidation.
export const queryKeys = {
  tryOnHistory: <T extends readonly unknown[]>(...params: T) => ['try-on-history', ...params] as const,
};

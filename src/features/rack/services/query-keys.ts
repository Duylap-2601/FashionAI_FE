// Preserve existing cache prefixes and parameter order, including partial invalidation.
export const queryKeys = {
  rack: <T extends readonly unknown[]>(...params: T) => ['rack', ...params] as const,
};

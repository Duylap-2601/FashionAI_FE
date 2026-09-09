// Preserve existing cache prefixes and parameter order, including partial invalidation.
export const queryKeys = {
  notifications: <T extends readonly unknown[]>(...params: T) => ['notifications', ...params] as const,
};

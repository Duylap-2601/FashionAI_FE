// Preserve existing cache prefixes and parameter order, including partial invalidation.
export const queryKeys = {
  profile: <T extends readonly unknown[]>(...params: T) => ['profile', ...params] as const,
};

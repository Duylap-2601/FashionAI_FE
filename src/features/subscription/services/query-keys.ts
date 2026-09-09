// Preserve existing cache prefixes and parameter order, including partial invalidation.
export const queryKeys = {
  quota: <T extends readonly unknown[]>(...params: T) => ['quota', ...params] as const,
  subscriptionPlans: <T extends readonly unknown[]>(...params: T) => ['subscription-plans', ...params] as const,
  subscriptionMe: <T extends readonly unknown[]>(...params: T) => ['subscription-me', ...params] as const,
  subscriptionHistory: <T extends readonly unknown[]>(...params: T) => ['subscription-history', ...params] as const,
};

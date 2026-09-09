// Preserve existing cache prefixes and parameter order, including partial invalidation.
export const queryKeys = {
  reviews: <T extends readonly unknown[]>(...params: T) => ['reviews', ...params] as const,
  replies: <T extends readonly unknown[]>(...params: T) => ['replies', ...params] as const,
  reviewStats: <T extends readonly unknown[]>(...params: T) => ['review-stats', ...params] as const,
  myReviews: <T extends readonly unknown[]>(...params: T) => ['my-reviews', ...params] as const,
  adminReviews: <T extends readonly unknown[]>(...params: T) => ['admin-reviews', ...params] as const,
};

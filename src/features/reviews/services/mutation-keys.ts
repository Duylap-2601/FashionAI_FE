export const mutationKeys = {
  createReview: () => ['reviews', 'createReview'] as const,
  updateReview: () => ['reviews', 'updateReview'] as const,
  deleteReview: () => ['reviews', 'deleteReview'] as const,
  adminDeleteReview: () => ['reviews', 'adminDeleteReview'] as const,
  createReply: () => ['reviews', 'createReply'] as const,
  updateReply: () => ['reviews', 'updateReply'] as const,
  deleteReply: () => ['reviews', 'deleteReply'] as const,
};

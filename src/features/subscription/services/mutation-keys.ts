export const mutationKeys = {
  cancelSubscription: () => ['subscription', 'cancelSubscription'] as const,
  resumeSubscription: () => ['subscription', 'resumeSubscription'] as const,
  cancelScheduledSubscription: () => ['subscription', 'cancelScheduledSubscription'] as const,
};

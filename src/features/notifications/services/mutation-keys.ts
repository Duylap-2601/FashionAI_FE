export const mutationKeys = {
  markNotificationAsRead: () => ['notifications', 'markNotificationAsRead'] as const,
  markAllNotificationsAsRead: () => ['notifications', 'markAllNotificationsAsRead'] as const,
};

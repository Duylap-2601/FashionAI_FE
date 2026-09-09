import { AppNotification } from '@/features/notifications/types/notification';

export interface NotificationStore {
  unreadCount: number;
  recentNotifications: AppNotification[];
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
  setUnreadCount: (count: number) => void;
  incrementUnread: (delta?: number) => void;
  decrementUnread: (delta?: number) => void;
  addNotification: (notification: AppNotification) => void;
  setRecentNotifications: (notifications: AppNotification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

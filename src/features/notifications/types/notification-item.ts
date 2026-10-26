import type { AppNotification } from '@/features/notifications/types/notification';
import type { NotificationTone } from '@/features/notifications/types/notification-tone';

export interface NotificationItemProps {
  notification: AppNotification;
  onItemClick?: () => void;
  tone?: NotificationTone;
}

import { AppNotification } from '@/features/notifications/types/notification';

export interface NotificationItemProps {
  notification: AppNotification;
  onItemClick?: () => void;
}

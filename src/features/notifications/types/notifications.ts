import { NotificationType } from '@/features/notifications/types/notification';

export interface UseNotificationsOptions {
  page?: number;
  limit?: number;
  type?: NotificationType;
  enabled?: boolean;
}

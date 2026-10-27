import type { NotificationTone } from '@/features/notifications/types/notification-tone';

export interface NotificationPanelProps {
  onClose?: () => void;
  tone?: NotificationTone;
}

import { api } from '@/lib/api';

export function markNotificationRead(id: string) {
  return api.patch(`/notifications/${id}/read`);
}

export function markAllNotificationsRead() {
  return api.patch('/notifications/read-all');
}

export { mutationKeys } from './mutation-keys';

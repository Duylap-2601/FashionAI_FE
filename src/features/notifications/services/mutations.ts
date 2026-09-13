import { http } from '@/lib/http';

export function markNotificationRead(id: string) {
  return http.patch(`/notifications/${id}/read`);
}

export function markAllNotificationsRead() {
  return http.patch('/notifications/read-all');
}

export { mutationKeys } from './mutation-keys';

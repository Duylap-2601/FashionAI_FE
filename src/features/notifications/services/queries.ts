import type { NotificationType } from '@/features/notifications/types/notification';
import { AppNotification, NotificationMeta } from '@/features/notifications/types/notification';
import { api } from '@/lib/api';

export async function fetchNotifications(page: number, limit: number, type: NotificationType | undefined) {
  const params: Record<string, string | number> = { page, limit };
  if (type) params.type = type;

  const res = await api.get('/notifications', { params });
  const rawData = res.data;

  let items: AppNotification[] = [];
  let meta: NotificationMeta = {
    total: 0,
    unread: 0,
    page,
    limit,
    totalPages: 1,
  };

  if (Array.isArray(rawData)) {
    items = rawData;
    meta.total = rawData.length;
  } else if (rawData && typeof rawData === 'object') {
    items = Array.isArray(rawData.items) ? rawData.items : [];
    if (rawData.meta) {
      meta = { ...meta, ...rawData.meta };
    } else if (rawData.__meta) {
      meta = { ...meta, ...rawData.__meta };
    }
  }

  return { items, meta };
}

export async function fetchUnreadCount() {
  const res = await api.get('/notifications/unread-count');
  const data = res.data;
  if (typeof data === 'number') return data;
  if (data && typeof data.unread === 'number') return data.unread;
  return 0;
}

export { queryKeys } from './query-keys';

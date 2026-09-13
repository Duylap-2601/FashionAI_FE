import type { NotificationType } from '@/features/notifications/types/notification';
import { AppNotification, NotificationMeta } from '@/features/notifications/types/notification';
import { http } from '@/lib/http';

export async function fetchNotifications(page: number, limit: number, type: NotificationType | undefined) {
  const params: Record<string, string | number> = { page, limit };
  if (type) params.type = type;

  const rawData = await http.get<AppNotification[] | { items?: AppNotification[]; meta?: Partial<NotificationMeta>; __meta?: Partial<NotificationMeta> }>('/notifications', { params });

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
  const data = await http.get<number | { unread?: number }>('/notifications/unread-count');
  if (typeof data === 'number') return data;
  if (data && typeof data.unread === 'number') return data.unread;
  return 0;
}

export { queryKeys } from './query-keys';

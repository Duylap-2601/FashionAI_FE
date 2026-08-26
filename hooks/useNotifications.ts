'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { AppNotification, NotificationMeta, NotificationType } from '@/types/notification';
import { useNotificationStore } from '@/store/notificationStore';

interface UseNotificationsOptions {
  page?: number;
  limit?: number;
  type?: NotificationType;
  enabled?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { page = 1, limit = 20, type, enabled = true } = options;
  const { status } = useSession();
  const setRecentNotifications = useNotificationStore((s) => s.setRecentNotifications);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const query = useQuery<{ items: AppNotification[]; meta: NotificationMeta }>({
    queryKey: ['notifications', { page, limit, type }],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit };
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
    },
    enabled: status === 'authenticated' && enabled,
  });

  useEffect(() => {
    if (query.data && page === 1 && !type) {
      setRecentNotifications(query.data.items);
      if (typeof query.data.meta.unread === 'number') {
        setUnreadCount(query.data.meta.unread);
      }
    }
  }, [query.data, page, type, setRecentNotifications, setUnreadCount]);

  return {
    notifications: query.data?.items || [],
    meta: query.data?.meta,
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useUnreadCount() {
  const { status } = useSession();
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const query = useQuery<number>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await api.get('/notifications/unread-count');
      const data = res.data;
      if (typeof data === 'number') return data;
      if (data && typeof data.unread === 'number') return data.unread;
      return 0;
    },
    enabled: status === 'authenticated',
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (typeof query.data === 'number') {
      setUnreadCount(query.data);
    }
  }, [query.data, setUnreadCount]);

  return {
    unreadCount: unreadCount ?? query.data ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const markAsReadStore = useNotificationStore((s) => s.markAsRead);

  return useMutation({
    mutationFn: async (id: string) => {
      // Optimistic update
      markAsReadStore(id);
      const res = await api.patch(`/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const markAllAsReadStore = useNotificationStore((s) => s.markAllAsRead);

  return useMutation({
    mutationFn: async () => {
      // Optimistic update
      markAllAsReadStore();
      const res = await api.patch('/notifications/read-all');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

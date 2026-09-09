'use client';

import { mutationKeys } from '@/features/notifications/services/mutation-keys';
import { queryKeys as notificationsQueryKeys } from '@/features/notifications/services/query-keys';
import { markAllNotificationsRead, markNotificationRead } from '@/features/notifications/services/mutations';
import { fetchNotifications, fetchUnreadCount } from '@/features/notifications/services/queries';
import type { UseNotificationsOptions } from '@/features/notifications/types/notifications';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';
import { AppNotification, NotificationMeta } from '@/features/notifications/types/notification';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { page = 1, limit = 20, type, enabled = true } = options;
  const status = useAuthStore((state) => state.status);
  const setRecentNotifications = useNotificationStore((s) => s.setRecentNotifications);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const query = useQuery<{ items: AppNotification[]; meta: NotificationMeta }>({
    queryKey: notificationsQueryKeys.notifications({ page, limit, type }),
    queryFn: () => fetchNotifications(page, limit, type),
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
  const status = useAuthStore((state) => state.status);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const query = useQuery<number>({
    queryKey: notificationsQueryKeys.notifications('unread-count'),
    queryFn: fetchUnreadCount,
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
    mutationKey: mutationKeys.markNotificationAsRead(),
    mutationFn: async (id: string) => {
      // Optimistic update
      markAsReadStore(id);
      const res = await markNotificationRead(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.notifications() });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const markAllAsReadStore = useNotificationStore((s) => s.markAllAsRead);

  return useMutation({
    mutationKey: mutationKeys.markAllNotificationsAsRead(),
    mutationFn: async () => {
      // Optimistic update
      markAllAsReadStore();
      const res = await markAllNotificationsRead();
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.notifications() });
    },
  });
}

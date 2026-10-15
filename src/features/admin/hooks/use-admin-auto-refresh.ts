'use client';

import {
  ADMIN_REALTIME_DEBOUNCE_MS,
  ADMIN_REALTIME_EVENTS,
  ADMIN_REFRESH_INTERVAL_MS,
  ADMIN_SOCKET_CHECK_MS,
} from '@/features/admin/constants/admin-dashboard-page';
import { useLatestRef } from '@/features/admin/hooks/use-latest-ref';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';
import { getRealtimeSocket } from '@/lib/realtimeSocket';
import type { Socket } from 'socket.io-client';
import { useCallback, useEffect, useRef } from 'react';

interface UseAdminAutoRefreshOptions {
  /** Đơn/vận đơn vừa đổi (socket event, notification) hoặc tới chu kỳ đồng bộ. */
  onRefresh: () => void;
  /** Phần tải thêm riêng cho notification mới, chạy cùng lượt với onRefresh. */
  onNotification?: () => void;
}

/**
 * Giữ dashboard đồng bộ: socket event và notification mới (gộp thành một lần tải trong
 * ADMIN_REALTIME_DEBOUNCE_MS), cùng chu kỳ ADMIN_REFRESH_INTERVAL_MS khi tab trình duyệt đang hiển thị.
 */
export function useAdminAutoRefresh(options: UseAdminAutoRefreshOptions) {
  const optionsRef = useLatestRef(options);
  const latestNotifId = useNotificationStore((s) => s.recentNotifications[0]?.id);
  // Notification đã có sẵn khi mở trang không cần tải lại: lần tải đầu đã gồm nó.
  const seenNotifIdRef = useRef(latestNotifId);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingNotificationRef = useRef(false);

  // Một thay đổi thường bắn nhiều event (order:updated, order_status, notification): gộp lại.
  const scheduleRefresh = useCallback((fromNotification = false) => {
    pendingNotificationRef.current ||= fromNotification;
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      const { onRefresh, onNotification } = optionsRef.current;
      onRefresh();
      if (pendingNotificationRef.current) onNotification?.();
      pendingNotificationRef.current = false;
    }, ADMIN_REALTIME_DEBOUNCE_MS);
  }, [optionsRef]);

  useEffect(() => () => clearTimeout(debounceTimerRef.current), []);

  useEffect(() => {
    if (!latestNotifId || latestNotifId === seenNotifIdRef.current) return;
    seenNotifIdRef.current = latestNotifId;
    scheduleRefresh(true);
  }, [latestNotifId, scheduleRefresh]);

  useEffect(() => {
    let socket: Socket | null = null;
    const handleRealtimeChange = () => scheduleRefresh();

    // RealtimeProvider tạo socket bất đồng bộ (thường sau khi trang đã mount) và tạo lại khi đổi
    // token, nên định kỳ gắn listener sang socket hiện tại.
    const attachToCurrentSocket = () => {
      const current = getRealtimeSocket();
      if (current === socket) return;
      ADMIN_REALTIME_EVENTS.forEach(event => socket?.off(event, handleRealtimeChange));
      socket = current;
      ADMIN_REALTIME_EVENTS.forEach(event => socket?.on(event, handleRealtimeChange));
    };

    attachToCurrentSocket();
    const socketCheck = setInterval(attachToCurrentSocket, ADMIN_SOCKET_CHECK_MS);
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') optionsRef.current.onRefresh();
    }, ADMIN_REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(socketCheck);
      clearInterval(refreshInterval);
      ADMIN_REALTIME_EVENTS.forEach(event => socket?.off(event, handleRealtimeChange));
    };
  }, [optionsRef, scheduleRefresh]);
}

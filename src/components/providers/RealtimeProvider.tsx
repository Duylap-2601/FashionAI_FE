'use client';
import { queryKeys as reviewsQueryKeys } from '@/features/reviews/services/query-keys';
import { handleRemoteCartChange } from '@/features/cart/services/cart-sync';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';
import { AppNotification, NotificationType } from '@/features/notifications/types/notification';
import { getValidAccessToken } from '@/lib/api';
import { disconnectRealtimeSocket, initRealtimeSocket } from '@/lib/realtimeSocket';
import { useQueryClient } from '@tanstack/react-query';
import { CreditCard, Info, MessageSquare, Package, Tag } from 'lucide-react';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

// Socket là singleton (lib/realtimeSocket) nên giữ handler 'reconnect' ở module để gỡ đúng
// handler cũ khi effect chạy lại.
let reconnectCartHandler: (() => void) | null = null;

function getToastIcon(type: NotificationType) {
  switch (type) {
    case 'ORDER_STATUS':
      return <Package className="w-5 h-5 text-blue-600" />;
    case 'PAYMENT':
      return <CreditCard className="w-5 h-5 text-emerald-600" />;
    case 'PROMOTION':
      return <Tag className="w-5 h-5 text-[#5D1C34]" />;
    case 'REVIEW':
      return <MessageSquare className="w-5 h-5 text-amber-600" />;
    case 'SYSTEM':
    default:
      return <Info className="w-5 h-5 text-neutral-600" />;
  }
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (status !== 'authenticated') {
      disconnectRealtimeSocket();
      return;
    }

    let isMounted = true;

    async function setupSocket() {
      try {
        const token = await getValidAccessToken();
        if (!token || !isMounted) return;

        const socket = initRealtimeSocket(token);

        const handleNotification = (rawNotification: Partial<AppNotification> & Record<string, unknown>) => {
          const notification: AppNotification = {
            id: (rawNotification.id as string) || String(Date.now()),
            userId: (rawNotification.userId as string) || '',
            type: (rawNotification.type as NotificationType) || 'SYSTEM',
            title: (rawNotification.title as string) || 'Thông báo mới',
            message: (rawNotification.message as string) || '',
            data: rawNotification.data as AppNotification['data'],
            isRead: Boolean(rawNotification.isRead),
            createdAt: (rawNotification.createdAt as string) || new Date().toISOString(),
          };

          addNotification(notification);

          // Tự động làm mới dữ liệu reviews/replies theo thời gian thực
          if (notification.type === 'REVIEW') {
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.reviews() });
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.replies() });
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.reviewStats() });
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.myReviews() });
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.adminReviews() });
          }

          // Show Toast
          toast(notification.title, {
            description: notification.message,
            icon: getToastIcon(notification.type),
            duration: 6000,
          });
        };

        // Giỏ đổi ở thiết bị khác (hoặc BE vừa bỏ món đã thanh toán): tải lại giỏ. Kết nối
        // lại sau khi rớt mạng cũng tải lại vì có thể đã lỡ event trong lúc mất kết nối.
        const handleCartUpdated = () => handleRemoteCartChange(queryClient);

        socket.off('notification');
        socket.on('notification', handleNotification);
        socket.off('cart:updated');
        socket.on('cart:updated', handleCartUpdated);
        // off() không truyền handler sẽ gỡ mọi listener 'reconnect', nên chỉ gỡ handler cũ của mình.
        if (reconnectCartHandler) socket.io.off('reconnect', reconnectCartHandler);
        reconnectCartHandler = handleCartUpdated;
        socket.io.on('reconnect', reconnectCartHandler);
      } catch (err) {
        console.warn('[Realtime] Failed to initialize socket:', err);
      }
    }

    setupSocket();

    return () => {
      isMounted = false;
    };
  }, [status, addNotification, queryClient]);

  return <>{children}</>;
}

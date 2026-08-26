'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Package, CreditCard, Tag, Info } from 'lucide-react';
import { initRealtimeSocket, disconnectRealtimeSocket } from '@/lib/realtimeSocket';
import { getValidAccessToken } from '@/lib/api';
import { useNotificationStore } from '@/store/notificationStore';
import { AppNotification, NotificationType } from '@/types/notification';

function getToastIcon(type: NotificationType) {
  switch (type) {
    case 'ORDER_STATUS':
      return <Package className="w-5 h-5 text-blue-600" />;
    case 'PAYMENT':
      return <CreditCard className="w-5 h-5 text-emerald-600" />;
    case 'PROMOTION':
      return <Tag className="w-5 h-5 text-[#5D1C34]" />;
    case 'SYSTEM':
    default:
      return <Info className="w-5 h-5 text-neutral-600" />;
  }
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
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

        const handleNotification = (rawNotification: any) => {
          const notification: AppNotification = {
            id: rawNotification.id || String(Date.now()),
            userId: rawNotification.userId || '',
            type: rawNotification.type || 'SYSTEM',
            title: rawNotification.title || 'Thông báo mới',
            message: rawNotification.message || '',
            data: rawNotification.data,
            isRead: Boolean(rawNotification.isRead),
            createdAt: rawNotification.createdAt || new Date().toISOString(),
          };

          addNotification(notification);

          // Show Toast
          toast(notification.title, {
            description: notification.message,
            icon: getToastIcon(notification.type),
            duration: 6000,
          });
        };

        socket.off('notification');
        socket.on('notification', handleNotification);
      } catch (err) {
        console.warn('[Realtime] Failed to initialize socket:', err);
      }
    }

    setupSocket();

    return () => {
      isMounted = false;
    };
  }, [status, addNotification]);

  return <>{children}</>;
}

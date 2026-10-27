'use client';

import { useMarkNotificationAsRead } from '@/features/notifications/hooks/useNotifications';
import type { AppNotification } from '@/features/notifications/types/notification';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/** Đánh dấu đã đọc rồi điều hướng tới nơi liên quan (trang khách hoặc tab trong admin dashboard). */
export function useOpenNotification() {
  const router = useRouter();
  const { mutate: markRead } = useMarkNotificationAsRead();

  return useCallback((notification: AppNotification) => {
    if (!notification.isRead) {
      markRead(notification.id);
    }

    // Smart routing for Admin Dashboard
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    if (isAdmin) {
      if (notification.type === 'REVIEW') {
        window.dispatchEvent(
          new CustomEvent('admin:navigate', {
            detail: {
              tab: 'reviews',
              reviewId: notification.data?.reviewId,
              productId: notification.data?.productId,
            },
          })
        );
        return;
      }
      if (
        notification.type === 'ORDER_STATUS' ||
        notification.type === 'PAYMENT' ||
        notification.data?.orderCode ||
        notification.data?.orderId
      ) {
        window.dispatchEvent(
          new CustomEvent('admin:navigate', {
            detail: { tab: 'orders', orderCode: notification.data?.orderCode, orderId: notification.data?.orderId },
          })
        );
        return;
      }
    }

    // Smart routing for Customer
    if (notification.type === 'ORDER_STATUS' || notification.type === 'PAYMENT') {
      const orderId = notification.data?.orderId as string | undefined;
      router.push(orderId ? `/orders/${orderId}` : '/profile/orders');
    } else if (notification.type === 'PROMOTION') {
      router.push('/products');
    } else if (notification.type === 'REVIEW') {
      const prodId = notification.data?.productId as string | undefined;
      if (prodId) {
        router.push(`/products/${prodId}#product-reviews`);
      } else {
        router.push('/profile/reviews');
      }
    }
  }, [markRead, router]);
}

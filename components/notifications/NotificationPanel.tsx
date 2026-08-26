'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Loader2, ArrowRight } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { useNotifications, useMarkAllNotificationsAsRead } from '@/hooks/useNotifications';
import { useNotificationStore } from '@/store/notificationStore';

interface NotificationPanelProps {
  onClose?: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { notifications, isLoading } = useNotifications({ page: 1, limit: 10 });
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const handleMarkAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (unreadCount > 0 && !isMarkingAll) {
      markAllAsRead();
    }
  };

  return (
    <div className="w-full max-w-[380px] sm:w-[380px] bg-white rounded-2xl shadow-xl border border-neutral-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Panel Header */}
      <div className="px-4 py-3.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-body-md text-neutral-900">Thông báo</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-bold bg-[#5D1C34] text-white rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount} mới
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={isMarkingAll}
            className="text-xs font-medium text-[#5D1C34] hover:text-[#5D1C34]/80 flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Đánh dấu tất cả là đã đọc"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Đọc tất cả</span>
          </button>
        )}
      </div>

      {/* Panel Body */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-100">
        {isLoading && notifications.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-neutral-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#5D1C34]" />
            <span className="text-body-xs">Đang tải thông báo...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-2">
              <Bell className="w-6 h-6" />
            </div>
            <p className="font-medium text-body-sm text-neutral-800">Chưa có thông báo nào</p>
            <p className="text-body-xs text-neutral-500 mt-0.5">
              Các cập nhật đơn hàng và ưu đãi sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : (
          notifications.map((item) => (
            <NotificationItem key={item.id} notification={item} onItemClick={onClose} />
          ))
        )}
      </div>

      {/* Panel Footer */}
      <div className="p-2.5 border-t border-neutral-100 bg-neutral-50/50">
        <Link
          href="/notifications"
          onClick={onClose}
          className="w-full py-2 px-3 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200/80 text-center text-body-xs font-medium text-neutral-700 hover:text-neutral-900 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>Xem tất cả thông báo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

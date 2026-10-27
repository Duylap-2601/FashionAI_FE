'use client';

import type { NotificationPanelProps } from '@/features/notifications/types/notification-panel';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';
import { useMarkAllNotificationsAsRead, useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';
import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { ArrowRight, Bell, CheckCheck, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export function NotificationPanel({ onClose, tone = 'landing' }: NotificationPanelProps) {
  const { notifications, isLoading } = useNotifications({ page: 1, limit: 10 });
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const unreadNotifications = notifications.filter((item) => !item.isRead);
  const hasUnreadNotifications = unreadCount > 0 || unreadNotifications.length > 0;

  const handleMarkAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasUnreadNotifications && !isMarkingAll) {
      markAllAsRead();
    }
  };

  if (tone === 'landing') {
    return (
      <div className="flex max-h-[min(80vh,520px)] w-[380px] flex-col overflow-hidden rounded-[2px] border border-landing-line bg-landing-paper text-landing-obsidian shadow-md animate-in fade-in duration-150">
        <div className="flex items-center justify-between gap-3 border-b border-landing-line/70 px-4 py-3">
          <div className="flex items-baseline gap-3">
            <h3 className="font-display text-xl leading-tight">Thông báo</h3>
            {unreadCount > 0 ? (
              <span className="font-mono text-[11px] text-landing-oxblood">{unreadCount > 99 ? '99+' : unreadCount} mới</span>
            ) : null}
          </div>
          {hasUnreadNotifications ? (
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={isMarkingAll}
              className="inline-flex min-h-8 items-center gap-1.5 text-xs text-landing-muted transition-colors hover:text-landing-oxblood disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
            >
              <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              Đọc tất cả
            </button>
          ) : null}
        </div>

        <div className="no-scrollbar min-h-0 flex-1 divide-y divide-landing-line/60 overflow-y-auto">
          {isLoading && notifications.length === 0 ? (
            <div className="flex items-center justify-center gap-2 p-8 text-xs text-landing-muted" role="status">
              <Loader2 className="h-4 w-4 animate-spin text-landing-oxblood" strokeWidth={1.75} aria-hidden="true" />
              Đang tải thông báo…
            </div>
          ) : unreadNotifications.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="font-display text-lg leading-tight">Không có thông báo mới</p>
              <p className="mt-1 text-xs text-landing-muted">Thông báo đã đọc vẫn xem được ở trang Thông báo.</p>
            </div>
          ) : (
            unreadNotifications.map((item) => (
              <NotificationItem key={item.id} notification={item} onItemClick={onClose} tone="landing" />
            ))
          )}
        </div>

        <Link
          href="/notifications"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 border-t border-landing-line/70 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-obsidian transition-colors hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-landing-oxblood"
        >
          Xem tất cả thông báo
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden md:h-auto md:max-h-[min(80vh,520px)] md:w-[380px] md:rounded-2xl md:border md:border-neutral-200 md:shadow-xl animate-in fade-in zoom-in-95 duration-200">
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

        <div className="flex items-center gap-1.5">
          {hasUnreadNotifications && (
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
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-neutral-500 hover:text-brand-navy rounded-full hover:bg-neutral-100 transition-colors md:hidden"
            aria-label="Đóng thông báo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 md:max-h-[380px] md:flex-none">
        {isLoading && notifications.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-neutral-400 gap-2">
            <AtelierLoader size="sm" label="Đang may thông báo" />
          </div>
        ) : unreadNotifications.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-2">
              <Bell className="w-6 h-6" />
            </div>
            <p className="font-medium text-body-sm text-neutral-800">Không có thông báo mới</p>
            <p className="text-body-xs text-neutral-500 mt-0.5">
              Thông báo đã đọc có thể xem trong trang chi tiết.
            </p>
          </div>
        ) : (
          unreadNotifications.map((item) => (
            <NotificationItem key={item.id} notification={item} onItemClick={onClose} tone="admin" />
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

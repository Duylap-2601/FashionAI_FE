'use client';

import { useOpenNotification } from '@/features/notifications/hooks/use-open-notification';
import { useMarkAllNotificationsAsRead, useNotifications } from '@/features/notifications/hooks/useNotifications';
import { formatRelativeTime } from '@/features/notifications/services/format-relative-time';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';
import type { AppNotification, NotificationType } from '@/features/notifications/types/notification';
import { AccountShell } from '@/features/profile/components/account-shell';
import {
  AccountPagination,
  AccountStatePanel,
  accountButtonClassName,
  accountFocusRing,
} from '@/features/profile/components/account-ui';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { CheckCheck, CreditCard, Info, MessageSquare, Package, Tag } from 'lucide-react';
import { useState } from 'react';

const PAGE_SIZE = 15;

const TYPE_META: Record<NotificationType, { icon: LucideIcon; label: string; tone: string }> = {
  ORDER_STATUS: { icon: Package, label: 'Đơn hàng', tone: 'text-landing-oxblood' },
  PAYMENT: { icon: CreditCard, label: 'Thanh toán', tone: 'text-landing-sage-ink' },
  PROMOTION: { icon: Tag, label: 'Khuyến mãi', tone: 'text-landing-brass-ink' },
  REVIEW: { icon: MessageSquare, label: 'Đánh giá', tone: 'text-landing-brass-ink' },
  SYSTEM: { icon: Info, label: 'Hệ thống', tone: 'text-landing-muted' },
};

function NotificationRow({ notification, onOpen }: { notification: AppNotification; onOpen: (notification: AppNotification) => void }) {
  const meta = TYPE_META[notification.type] ?? TYPE_META.SYSTEM;
  const Icon = meta.icon;
  const unread = !notification.isRead;

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className={cn(
          'grid w-full grid-cols-[36px_minmax(0,1fr)] gap-x-4 gap-y-1 px-4 py-4 text-left transition-colors sm:grid-cols-[36px_minmax(0,1fr)_auto] sm:px-5',
          unread ? 'bg-landing-ivory hover:bg-landing-ivory/60' : 'hover:bg-landing-ivory/60',
          accountFocusRing,
        )}
      >
        <span className={cn('row-span-2 flex h-9 w-9 items-center justify-center border border-landing-line bg-landing-paper', meta.tone)}>
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </span>

        <span className="min-w-0">
          <span className="flex items-baseline gap-2">
            {unread ? (
              <>
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 -translate-y-0.5 rounded-full bg-landing-oxblood" />
                <span className="sr-only">Chưa đọc:</span>
              </>
            ) : null}
            <span className={cn('text-sm', unread ? 'font-semibold text-landing-obsidian' : 'text-landing-obsidian/80')}>{notification.title}</span>
          </span>
          <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-landing-muted">{notification.message}</span>
          {notification.data?.orderCode ? (
            <span className="mt-2 block font-mono text-[11px] text-landing-obsidian/70">Mã đơn #{String(notification.data.orderCode)}</span>
          ) : null}
        </span>

        <span className="col-start-2 flex items-center gap-2 text-[11px] text-landing-muted sm:col-start-3 sm:row-start-1 sm:flex-col sm:items-end sm:gap-1 sm:whitespace-nowrap">
          <span className={cn('font-semibold uppercase tracking-[0.16em]', meta.tone)}>{meta.label}</span>
          <span aria-hidden="true" className="sm:hidden">·</span>
          <time dateTime={notification.createdAt}>{formatRelativeTime(notification.createdAt)}</time>
        </span>
      </button>
    </li>
  );
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const openNotification = useOpenNotification();

  // GET /notifications chưa lọc theo loại, nên trang không có tab lọc; loại hiện trên từng dòng.
  const { notifications, meta, isLoading, isError, refetch } = useNotifications({ page, limit: PAGE_SIZE });

  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const totalPages = meta?.totalPages || 1;

  return (
    <AccountShell
      title="Thông báo"
      description="Cập nhật về đơn hàng, thanh toán và ưu đãi. Bấm vào một thông báo để mở nơi liên quan."
      actions={
        unreadCount > 0 ? (
          <button type="button" onClick={() => markAllAsRead()} disabled={isMarkingAll} className={accountButtonClassName('outline')}>
            <CheckCheck className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Đánh dấu đã đọc hết
          </button>
        ) : null
      }
    >
      {!isLoading && !isError && notifications.length > 0 ? (
        <p className="mb-4 text-xs text-landing-muted">
          <span className="font-mono text-landing-obsidian">{meta?.total ?? notifications.length}</span> thông báo
          {unreadCount > 0 ? (
            <>
              {' · '}
              <span className="font-mono text-landing-oxblood">{unreadCount}</span> chưa đọc
            </>
          ) : null}
        </p>
      ) : null}

      {isLoading ? (
        <div className="divide-y divide-landing-line/70 border border-landing-line" aria-hidden="true">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="flex gap-4 px-5 py-4">
              <div className="h-9 w-9 animate-pulse bg-landing-taupe/40" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 animate-pulse bg-landing-taupe/40" />
                <div className="h-3 w-2/3 animate-pulse bg-landing-taupe/30" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <AccountStatePanel
          tone="error"
          title="Không tải được thông báo"
          description="Kiểm tra kết nối rồi thử lại."
          action={
            <button type="button" onClick={() => refetch()} className={accountButtonClassName('outline')}>
              Thử lại
            </button>
          }
        />
      ) : notifications.length === 0 ? (
        <AccountStatePanel
          title="Chưa có thông báo nào"
          description="Khi đơn hàng, thanh toán hoặc ưu đãi có cập nhật, thông báo sẽ xuất hiện ở đây."
        />
      ) : (
        <>
          <ul className="divide-y divide-landing-line/70 border border-landing-line">
            {notifications.map((item) => (
              <NotificationRow key={item.id} notification={item} onOpen={openNotification} />
            ))}
          </ul>
          <AccountPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </AccountShell>
  );
}

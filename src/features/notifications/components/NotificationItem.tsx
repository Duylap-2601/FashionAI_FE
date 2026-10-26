'use client';

import type { NotificationItemProps } from '@/features/notifications/types/notification-item';
import { useOpenNotification } from '@/features/notifications/hooks/use-open-notification';
import { formatRelativeTime } from '@/features/notifications/services/format-relative-time';
import { NotificationType } from '@/features/notifications/types/notification';
import { CreditCard, Info, MessageSquare, Package, Tag } from 'lucide-react';

function getNotificationMeta(type: NotificationType) {
  switch (type) {
    case 'ORDER_STATUS':
      return {
        icon: Package,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      };
    case 'PAYMENT':
      return {
        icon: CreditCard,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
      };
    case 'PROMOTION':
      return {
        icon: Tag,
        color: 'text-[#5D1C34]',
        bgColor: 'bg-[#5D1C34]/10',
        borderColor: 'border-[#5D1C34]/20',
      };
    case 'REVIEW':
      return {
        icon: MessageSquare,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
      };
    case 'SYSTEM':
    default:
      return {
        icon: Info,
        color: 'text-neutral-600',
        bgColor: 'bg-neutral-100',
        borderColor: 'border-neutral-200',
      };
  }
}

const LANDING_TONE: Record<NotificationType, string> = {
  ORDER_STATUS: 'text-landing-oxblood',
  PAYMENT: 'text-landing-sage-ink',
  PROMOTION: 'text-landing-brass-ink',
  REVIEW: 'text-landing-brass-ink',
  SYSTEM: 'text-landing-muted',
};

export function NotificationItem({ notification, onItemClick, tone = 'landing' }: NotificationItemProps) {
  const openNotification = useOpenNotification();
  const meta = getNotificationMeta(notification.type);
  const Icon = meta.icon;
  const unread = !notification.isRead;

  const handleClick = () => {
    openNotification(notification);
    onItemClick?.();
  };

  if (tone === 'landing') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-landing-oxblood ${unread ? 'bg-landing-ivory hover:bg-landing-ivory/60' : 'hover:bg-landing-ivory/60'}`}
      >
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center border border-landing-line bg-landing-paper ${LANDING_TONE[notification.type] ?? LANDING_TONE.SYSTEM}`}>
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-3">
            <span className={`truncate text-sm ${unread ? 'font-semibold text-landing-obsidian' : 'text-landing-obsidian/80'}`}>
              {unread ? <span className="sr-only">Chưa đọc: </span> : null}
              {notification.title}
            </span>
            <time dateTime={notification.createdAt} className="shrink-0 text-[11px] text-landing-muted">
              {formatRelativeTime(notification.createdAt)}
            </time>
          </span>
          <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-landing-muted">{notification.message}</span>
          {notification.data?.orderCode ? (
            <span className="mt-1.5 block font-mono text-[11px] text-landing-obsidian/70">Mã đơn #{String(notification.data.orderCode)}</span>
          ) : null}
        </span>
        {unread ? <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-landing-oxblood" /> : null}
      </button>
    );
  }

  return (
    <div
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer border-b border-neutral-100 last:border-0 hover:bg-neutral-50/80 ${unread ? 'bg-[#5D1C34]/[0.03]' : 'bg-white'
        }`}
    >
      <div
        className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center ${meta.bgColor} ${meta.color}`}
      >
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <h4
            className={`text-body-sm truncate ${unread ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'
              }`}
          >
            {notification.title}
          </h4>
          <span className="text-[11px] text-neutral-400 shrink-0">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        <p className="text-body-xs text-neutral-600 line-clamp-2 leading-relaxed mb-1">
          {notification.message}
        </p>

        {notification.data?.orderCode && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-100 text-[11px] font-mono text-neutral-600">
            Mã đơn: #{notification.data.orderCode}
          </div>
        )}
      </div>

      {unread && (
        <div className="w-2 h-2 rounded-full bg-[#5D1C34] shrink-0 mt-2" title="Chưa đọc" />
      )}
    </div>
  );
}

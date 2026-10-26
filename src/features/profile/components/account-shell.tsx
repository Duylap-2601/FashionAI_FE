'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';
import { accountFocusRing, accountLabelClassName } from '@/features/profile/components/account-ui';
import {
  ACCOUNT_PRIMARY_NAV,
  ACCOUNT_SECONDARY_NAV,
  ACCOUNT_TIER_LABELS,
  type AccountNavItem,
} from '@/features/profile/constants/account-nav';
import { useUserProfile } from '@/features/profile/hooks/use-profile';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';

function formatUnread(count: number) {
  return count > 99 ? '99+' : String(count);
}

function DesktopNavLink({ item, active, unread }: { item: AccountNavItem; active: boolean; unread: number }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        '-ml-px flex min-h-10 items-center justify-between gap-3 border-l-2 py-2 pl-4 text-sm transition-colors',
        active
          ? 'border-landing-oxblood font-medium text-landing-oxblood'
          : 'border-transparent text-landing-obsidian/75 hover:text-landing-oxblood',
        accountFocusRing,
      )}
    >
      {item.label}
      {item.showUnread && unread > 0 ? (
        <span className="font-mono text-[11px] text-landing-oxblood" aria-label={`${unread} chưa đọc`}>
          {formatUnread(unread)}
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Khung chung cho các trang tài khoản: menu dọc dính bên trái từ `lg`, hàng tab cuộn ngang dưới `lg`,
 * và đầu trang (nhãn, tiêu đề display, mô tả, hành động).
 */
export function AccountShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const authUser = useAuthStore((state) => state.user);
  // Tên từ /users/me (đúng UTF-8) ưu tiên hơn tên trong phiên.
  const { profile } = useUserProfile();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = profile?.name || authUser?.name || 'Tài khoản';
  const tier = String(profile?.tier || authUser?.tier || 'FREE').toUpperCase();
  const tierLabel = ACCOUNT_TIER_LABELS[tier] ?? ACCOUNT_TIER_LABELS.FREE;
  const allItems = [...ACCOUNT_PRIMARY_NAV, ...ACCOUNT_SECONDARY_NAV];

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await logout();
  };

  return (
    <div className="landing-paper-texture">
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-6 md:px-8 md:pt-10 lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-14 lg:pt-12">
        <aside className="hidden lg:block">
          <div className="sticky top-[105px]">
            <p className="font-display text-xl leading-tight text-landing-obsidian">{displayName}</p>
            <p className={cn(accountLabelClassName, 'mt-2')}>Gói {tierLabel}</p>

            <nav aria-label="Tài khoản" className="mt-8">
              <div className="flex flex-col border-l border-landing-line">
                {ACCOUNT_PRIMARY_NAV.map((item) => (
                  <DesktopNavLink key={item.href} item={item} active={pathname === item.href} unread={unreadCount} />
                ))}
              </div>
              <p className={cn(accountLabelClassName, 'mb-2 mt-8')}>Lưu trữ & gói</p>
              <div className="flex flex-col border-l border-landing-line">
                {ACCOUNT_SECONDARY_NAV.map((item) => (
                  <DesktopNavLink key={item.href} item={item} active={pathname === item.href} unread={unreadCount} />
                ))}
              </div>
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={cn(
                'mt-8 inline-flex min-h-10 items-center gap-2 text-sm text-landing-muted transition-colors hover:text-destructive disabled:opacity-50',
                accountFocusRing,
              )}
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              {isLoggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          <nav
            aria-label="Tài khoản"
            className="no-scrollbar -mx-4 mb-8 flex gap-6 overflow-x-auto border-b border-landing-line px-4 md:-mx-8 md:px-8 lg:hidden"
          >
            {allItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap text-sm transition-colors',
                    active
                      ? 'font-medium text-landing-oxblood after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-landing-oxblood'
                      : 'text-landing-obsidian/70 hover:text-landing-oxblood',
                    accountFocusRing,
                  )}
                >
                  {item.label}
                  {item.showUnread && unreadCount > 0 ? (
                    <span className="font-mono text-[11px] text-landing-oxblood">{formatUnread(unreadCount)}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className={accountLabelClassName}>Tài khoản</p>
              <h1 className="mt-3 font-display text-landing-h2 text-landing-obsidian">{title}</h1>
              {description ? <p className="mt-3 max-w-xl text-landing-body text-landing-muted">{description}</p> : null}
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}

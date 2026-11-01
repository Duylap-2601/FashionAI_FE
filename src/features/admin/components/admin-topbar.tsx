'use client';

import { ADMIN_PAGE_TITLES } from '@/features/admin/constants/admin-dashboard-page';
import type { AdminTopbarProps } from '@/features/admin/types/admin-topbar';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { Menu, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

export const AdminTopbar = React.memo(function AdminTopbar({
  activeTab,
  adminName,
  avatarUrl,
  isRefreshing,
  onRefresh,
  onOpenSidebar,
}: AdminTopbarProps) {
  const adminInitial = adminName.charAt(0).toUpperCase() || 'A';

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-landing-line bg-landing-paper/95 px-4 backdrop-blur-md md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        {/* Hamburger - chỉ hiện trên mobile */}
        <button
          onClick={onOpenSidebar}
          className="border border-landing-line p-2 text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood lg:hidden"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <div className="min-w-0">
          <p className="text-[8px] font-semibold uppercase leading-none tracking-[0.22em] text-landing-brass-ink">
            Bảng quản trị
          </p>
          <p className="mt-1 truncate font-display text-[1.05rem] leading-tight text-landing-obsidian">
            {ADMIN_PAGE_TITLES[activeTab]}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Làm mới dữ liệu"
          aria-label="Làm mới dữ liệu"
          className="border border-landing-line p-2 text-landing-muted transition-colors hover:border-landing-oxblood hover:text-landing-oxblood disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={1.75} />
        </button>

        {/* Chuông thông báo Realtime Notification Bell */}
        <div className="relative flex items-center justify-center">
          <NotificationBell tone="admin" />
        </div>

        <div className="h-5 w-px bg-landing-line" />

        {/* Admin User Info */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-landing-line bg-landing-obsidian text-xs font-semibold text-landing-paper">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={adminName} width={32} height={32} unoptimized className="h-full w-full object-cover" />
            ) : (
              adminInitial
            )}
          </div>
          <div className="hidden flex-col text-left md:flex">
            <span className="text-[13px] font-semibold leading-tight text-landing-obsidian">{adminName}</span>
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-landing-brass-ink">
              Quản trị viên
            </span>
          </div>
        </div>
      </div>
    </header>
  );
});

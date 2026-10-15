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
    <header className="h-16 px-4 md:px-8 bg-white border-b border-neutral-200 flex items-center justify-between shrink-0 z-30 sticky top-0 shadow-2xs">
      <div className="flex items-center gap-2 md:gap-3">
        {/* Hamburger - chỉ hiện trên mobile */}
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 border-0 bg-transparent cursor-pointer"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-body-sm font-bold text-brand-navy">{ADMIN_PAGE_TITLES[activeTab]}</span>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Làm mới dữ liệu"
          className="p-2 rounded-full hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer border-0 bg-transparent"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Chuông thông báo Realtime Notification Bell */}
        <div className="relative flex items-center justify-center">
          <NotificationBell />
        </div>

        <div className="h-5 w-px bg-neutral-200" />

        {/* Admin User Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={adminName} width={32} height={32} unoptimized className="w-full h-full object-cover" />
            ) : (
              adminInitial
            )}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-[13px] font-bold text-neutral-800 leading-tight">{adminName}</span>
            <span className="text-[10px] font-bold text-brand-navy uppercase tracking-wider">Quản trị viên</span>
          </div>
        </div>
      </div>
    </header>
  );
});

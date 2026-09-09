'use client';

import type { Tab } from '@/features/measurements/types/profile-measurements-page';
import { useQuota } from '@/features/subscription/hooks/useQuota';
import {
  Camera,
  Package,
  Ruler,
  Shirt,
  User
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export function Sidebar({
  activeTab,
  setActiveTab,
  userName,
  userEmail,
  userTier,
}: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  userName: string;
  userEmail: string;
  userTier: string;
}) {
  const { quota } = useQuota();

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: <User className="w-4 h-4" /> },
    { id: 'measurements', label: 'Số đo cơ thể', icon: <Ruler className="w-4 h-4" /> },
    { id: 'sizes', label: 'Cỡ tham khảo', icon: <Shirt className="w-4 h-4" /> },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(-2)
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'US';
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'admin': return 'Administrator';
      case 'vip': return 'VIP Member';
      case 'member': return 'Gold Member';
      default: return 'Free Account';
    }
  };

  const quotaPercent = quota && quota.limit !== null ? Math.min(100, Math.round((quota.used / quota.limit) * 100)) : 0;

  return (
    <aside className="w-full md:w-[240px] shrink-0 flex flex-col gap-3">
      {/* Avatar card */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="w-16 h-16 bg-brand-navy/10 text-brand-navy rounded-full flex items-center justify-center text-heading-h3 font-bold">
            {getInitials(userName)}
          </div>
        </div>
        <h2 className="text-body-md font-semibold text-neutral-900">{userName}</h2>
        <p className="text-label-sm text-neutral-500 mt-0.5">{userEmail}</p>
        <div className="mt-3 bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase">
          {getTierLabel(userTier)}
        </div>
      </div>

      {/* Nav */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-2 flex flex-col gap-0.5">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium transition-colors text-left w-full ${activeTab === item.id
                ? 'bg-brand-navy/8 text-brand-navy'
                : 'text-neutral-600 hover:bg-neutral-50'
              }`}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-navy rounded-r-full" />
            )}
            {item.icon}
            {item.label}
          </button>
        ))}

        <div className="h-px bg-neutral-100 my-1" />

        <Link
          href="/profile/history"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          <Camera className="w-4 h-4" /> Lịch sử Try-On
        </Link>
        <Link
          href="/profile/orders"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          <Package className="w-4 h-4" /> Đơn hàng
        </Link>
      </div>

      {/* Quota */}
      {quota && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
          <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Try-On hôm nay</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-sm text-neutral-700">Đã dùng</span>
            <span className="text-body-sm font-bold text-brand-navy">
              {quota.limit === null ? `${quota.used} / Không giới hạn` : `${quota.used} / ${quota.limit} lượt`}
            </span>
          </div>
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-navy rounded-full transition-all" style={{ width: `${quotaPercent}%` }} />
          </div>
          <p className="text-label-sm text-neutral-400 mt-2">Reset lúc 00:00 hằng ngày</p>
        </div>
      )}
    </aside>
  );
}

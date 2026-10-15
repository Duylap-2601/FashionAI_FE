'use client';

import { ADMIN_NAV_ITEMS } from '@/features/admin/constants/admin-dashboard-page';
import type { AdminSidebarProps } from '@/features/admin/types/admin-sidebar';
import { LogOut } from 'lucide-react';
import React from 'react';

export const AdminSidebar = React.memo(function AdminSidebar({
  activeTab,
  isOpen,
  onNavigate,
  onClose,
  onLogout,
}: AdminSidebarProps) {
  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* h-dvh: 100vh trên trình duyệt mobile cao hơn vùng nhìn thấy, che mất nút đăng xuất ở đáy */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[240px] shrink-0 bg-brand-navy flex flex-col h-dvh lg:h-full transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-5 pt-6 pb-5 border-b border-white/10 flex flex-col gap-1 shrink-0">
          <span className="text-white font-bold text-heading-h3 tracking-wide">FashionAI</span>
          <span className="inline-flex items-center self-start px-2 py-0.5 bg-brand-gold text-brand-navy text-[9px] font-bold tracking-widest rounded-full uppercase">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto min-h-0 no-scrollbar">
          {ADMIN_NAV_ITEMS.map(item => {
            const IconComponent = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-body-sm font-medium transition-all text-left w-full border-0 cursor-pointer ${active ? 'bg-white text-brand-navy shadow-xs font-semibold' : 'text-white/75 hover:text-white hover:bg-white/10 bg-transparent'
                  }`}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col gap-2 border-t border-white/10 pt-3 shrink-0">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-body-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-colors w-full border-0 bg-transparent cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
});

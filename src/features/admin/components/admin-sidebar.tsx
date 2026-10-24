'use client';

import { ADMIN_NAV_ENTRIES } from '@/features/admin/constants/admin-dashboard-page';
import type { AdminSidebarProps } from '@/features/admin/types/admin-sidebar';
import { ChevronDown, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';

export const AdminSidebar = React.memo(function AdminSidebar({
  activeTab,
  isOpen,
  onNavigate,
  onClose,
  onLogout,
}: AdminSidebarProps) {
  // Quản lý trạng thái mở/đóng của các nhóm tab
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ADMIN_NAV_ENTRIES.forEach((entry) => {
      if (entry.children && entry.children.some((child) => child.id === activeTab)) {
        initial[entry.id] = true;
      }
    });
    return initial;
  });

  // Tự động mở nhóm tab nếu tab hiện tại thuộc nhóm đó (khi chuyển tab từ topbar / URL)
  useEffect(() => {
    ADMIN_NAV_ENTRIES.forEach((entry) => {
      if (entry.children && entry.children.some((child) => child.id === activeTab)) {
        setOpenGroups((prev) => (prev[entry.id] ? prev : { ...prev, [entry.id]: true }));
      }
    });
  }, [activeTab]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

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

        <nav className="flex-1 px-3 py-3 flex flex-col gap-1 overflow-y-auto min-h-0 custom-scrollbar">
          {ADMIN_NAV_ENTRIES.map((entry, index) => {
            const isFirstSingleAfterGroups =
              !entry.children &&
              entry.id !== 'dashboard' &&
              Boolean(ADMIN_NAV_ENTRIES[index - 1]?.children);

            // Trường hợp: Tab đơn (không có nhóm con)
            if (!entry.children) {
              const IconComponent = entry.icon;
              const active = activeTab === entry.id;
              return (
                <React.Fragment key={entry.id}>
                  {isFirstSingleAfterGroups && (
                    <div className="my-1.5 border-t border-white/10" />
                  )}
                  <button
                    onClick={() => onNavigate(entry.id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-body-sm font-medium transition-all text-left w-full border-0 cursor-pointer ${
                      active
                        ? 'bg-white text-brand-navy shadow-xs font-semibold'
                        : 'text-white/75 hover:text-white hover:bg-white/10 bg-transparent'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span className="truncate">{entry.label}</span>
                  </button>
                </React.Fragment>
              );
            }

            // Trường hợp: Nhóm tab có thể sổ ra / thu gọn (Accordion)
            const GroupIcon = entry.icon;
            const isExpanded = Boolean(openGroups[entry.id]);
            const hasActiveChild = entry.children.some((child) => child.id === activeTab);

            return (
              <div key={entry.id} className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => toggleGroup(entry.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-body-sm font-medium transition-all text-left w-full border-0 cursor-pointer ${
                    hasActiveChild
                      ? 'text-white bg-white/10 font-semibold'
                      : 'text-white/75 hover:text-white hover:bg-white/10 bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <GroupIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{entry.label}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-white/60 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {/* Submenu sổ ra khi click */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden flex flex-col pl-4"
                    >
                      <div className="border-l border-white/15 pl-2 flex flex-col gap-0.5 my-1">
                        {entry.children.map((child) => {
                          const ChildIcon = child.icon;
                          const active = activeTab === child.id;
                          return (
                            <button
                              key={child.id}
                              onClick={() => onNavigate(child.id)}
                              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left w-full border-0 cursor-pointer ${
                                active
                                  ? 'bg-white text-brand-navy shadow-xs font-semibold'
                                  : 'text-white/70 hover:text-white hover:bg-white/10 bg-transparent'
                              }`}
                            >
                              <ChildIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                              <span className="truncate">{child.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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

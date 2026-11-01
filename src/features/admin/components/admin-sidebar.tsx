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
  // Mở sẵn mọi nhóm để toàn bộ mục điều hướng vẫn nhìn thấy sau khi gom nhóm.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ADMIN_NAV_ENTRIES.forEach((entry) => {
      if (entry.children) {
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
          className="fixed inset-0 z-40 bg-landing-obsidian/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* h-dvh: 100vh trên trình duyệt mobile cao hơn vùng nhìn thấy, che mất nút đăng xuất ở đáy */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[240px] shrink-0 bg-landing-obsidian flex flex-col h-dvh transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-5 pt-6 pb-5 border-b border-landing-paper/15 flex flex-col gap-2 shrink-0">
          <span className="font-display text-2xl leading-none tracking-tight text-landing-paper">
            FashionAI
          </span>
          <span className="inline-flex items-center self-start border border-landing-brass/40 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-landing-brass">
            Bảng quản trị
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto min-h-0 custom-scrollbar">
          {ADMIN_NAV_ENTRIES.map((entry) => {
            // Trường hợp: Tab đơn (không có nhóm con)
            if (!entry.children) {
              const IconComponent = entry.icon;
              const active = activeTab === entry.id;
              return (
                <button
                  key={entry.id}
                  onClick={() => onNavigate(entry.id)}
                  className={`flex items-center gap-3 border-l-2 px-3 py-2 text-[13px] font-medium transition-colors text-left w-full ${
                    active
                      ? 'border-landing-brass bg-landing-paper/10 text-landing-paper font-semibold'
                      : 'border-transparent text-landing-paper/65 hover:bg-landing-paper/10 hover:text-landing-paper'
                  }`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{entry.label}</span>
                </button>
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
                  className={`flex items-center justify-between border-l-2 px-3 py-2 text-[13px] font-medium transition-colors text-left w-full ${
                    hasActiveChild
                      ? 'border-landing-brass/60 bg-landing-paper/5 text-landing-paper font-semibold'
                      : 'border-transparent text-landing-paper/65 hover:bg-landing-paper/10 hover:text-landing-paper'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <GroupIcon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{entry.label}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-landing-brass transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : 'text-landing-paper/40'
                    }`}
                    strokeWidth={1.75}
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
                      <div className="border-l border-landing-paper/15 pl-2 flex flex-col gap-0.5 my-1">
                        {entry.children.map((child) => {
                          const ChildIcon = child.icon;
                          const active = activeTab === child.id;
                          return (
                            <button
                              key={child.id}
                              onClick={() => onNavigate(child.id)}
                              className={`flex items-center gap-2.5 border-l px-2.5 py-1.5 text-xs font-medium transition-colors text-left w-full ${
                                active
                                  ? 'border-landing-brass bg-landing-paper/10 text-landing-paper font-semibold'
                                  : 'border-transparent text-landing-paper/60 hover:text-landing-paper hover:bg-landing-paper/5'
                              }`}
                            >
                              <ChildIcon className="w-3.5 h-3.5 shrink-0 opacity-80" strokeWidth={1.75} />
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

        <div className="px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col gap-2 border-t border-landing-paper/15 pt-3 shrink-0">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 border border-landing-paper/15 px-3 py-2 text-[13px] font-medium text-landing-paper/60 transition-colors w-full hover:border-landing-paper/30 hover:text-landing-paper"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.75} /> Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
});

'use client';

import type { NotificationBellProps } from '@/features/notifications/types/notification-bell';
import { NotificationPanel } from '@/features/notifications/components/NotificationPanel';
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';
import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  // Poll / init unread count on mount
  useUnreadCount();

  // Close when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Thông báo"
        className={`relative p-2 rounded-full transition-colors ${isOpen ? 'bg-neutral-100 text-brand-navy' : 'text-neutral-600 hover:bg-neutral-100 hover:text-brand-navy'
          }`}
      >
        <Bell className="w-[18px] h-[18px] md:w-5 md:h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#5D1C34] rounded-full ring-2 ring-white text-[9px] flex items-center justify-center text-white font-bold animate-in zoom-in duration-200">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100] flex md:hidden">
            <div
              className="absolute inset-0 bg-black/40 transition-opacity animate-in fade-in"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-full bg-white shadow-2xl animate-in slide-in-from-right duration-300">
              <NotificationPanel onClose={() => setIsOpen(false)} />
            </div>
          </div>
          <div className="absolute right-0 top-full mt-2 z-50 hidden md:block">
            <NotificationPanel onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}

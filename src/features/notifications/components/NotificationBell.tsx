'use client';

import type { NotificationBellProps } from '@/features/notifications/types/notification-bell';
import { NotificationPanel } from '@/features/notifications/components/NotificationPanel';
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function NotificationBell({ className = '', tone = 'landing' }: NotificationBellProps) {
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

  // Click outside listener for desktop dropdown
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

  const isLanding = tone === 'landing';
  const iconButtonClass = isLanding
    ? 'text-landing-obsidian/80 hover:bg-landing-ivory hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood'
    : 'text-neutral-600 hover:bg-neutral-100 hover:text-brand-navy';
  const badgeClass = isLanding
    ? 'bg-landing-oxblood text-landing-paper ring-landing-paper font-mono'
    : 'bg-[#5D1C34] text-white ring-white font-bold';
  const unreadLabel = unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : 'Thông báo';

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Mobile: Link directly to /notifications screen without trapped broken popup */}
      <Link
        href="/notifications"
        aria-label={unreadLabel}
        className={`relative p-2 rounded-full transition-colors md:hidden flex items-center justify-center ${iconButtonClass}`}
      >
        <Bell className="w-[18px] h-[18px]" strokeWidth={isLanding ? 1.75 : 2} />
        {unreadCount > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full ring-2 text-[9px] flex items-center justify-center animate-in zoom-in duration-200 ${badgeClass}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>

      {/* Desktop: Toggle button for quick dropdown panel */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={unreadLabel}
        aria-expanded={isOpen}
        className={`relative p-2 rounded-full transition-colors hidden md:inline-flex items-center justify-center ${
          isOpen ? (isLanding ? 'bg-landing-ivory text-landing-oxblood' : 'bg-neutral-100 text-brand-navy') : iconButtonClass
        }`}
      >
        <Bell className="w-5 h-5" strokeWidth={isLanding ? 1.75 : 2} />
        {unreadCount > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full ring-2 text-[9px] flex items-center justify-center animate-in zoom-in duration-200 ${badgeClass}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Desktop Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 hidden md:block">
          <NotificationPanel onClose={() => setIsOpen(false)} tone={tone} />
        </div>
      )}
    </div>
  );
}

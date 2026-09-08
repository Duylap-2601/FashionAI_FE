'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FloatingChat } from '../chat/FloatingChat';
import { Logo } from '../ui/Logo';
import {
  ShoppingBag, User as UserIcon, Sparkles,
  History, LogOut, Package, Ruler, Bell, Star
} from 'lucide-react';
import { HangerIcon } from '../ui/HangerIcon';
import { CartSlideOver } from '../cart/CartSlideOver';
import { NotificationBell } from '../notifications/NotificationBell';
import { BottomTabBar } from './BottomTabBar';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useMeasurements';
import { useCart } from '@/store/cartStore';

export type UserRole = 'guest' | 'user' | 'admin';
export type UserTier = 'free' | 'member' | 'vip';

interface User {
  name: string;
  role: UserRole;
  tier?: UserTier;
  avatar?: string;
  quota?: number;
}

export const MOCK_USERS: Record<string, User> = {
  guest: { name: 'Khách', role: 'guest' },
  user: { name: 'Nguyễn An', role: 'user', tier: 'member', quota: 15 },
  admin: { name: 'Admin', role: 'admin' }
};

export function useApp() {
  const { isCartOpen, setIsCartOpen } = useCart();
  return { isCartOpen, setIsCartOpen };
}

export function Navigation() {
  const { currentUser, logout } = useAuth();
  // Lấy name từ API /users/me để tránh mojibake từ session
  const { profile } = useUserProfile();
  const displayName = profile?.name || currentUser.name;
  const displayInitial = displayName ? displayName.charAt(0).toUpperCase() : '?';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isCartOpen, setIsCartOpen, totalItems } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  const tryOnHref = currentUser.role === 'guest' ? '/login' : '/try-on';
  const chatHref = currentUser.role === 'guest' ? '/login?callbackUrl=/chat' : '/chat';
  const navLinks = currentUser.role === 'admin'
    ? [
      { label: 'Dashboard', href: '/admin/dashboard' },
    ]
    : [
      { label: 'Sản phẩm', href: '/products' },
      { label: '✦ Try-On', href: tryOnHref },
      { label: '✦ Stylist', href: currentUser.role === 'guest' ? '/login' : '/ai-stylist' },
      { label: '✦ Trợ lý AI', href: chatHref },
      { label: '🧥 Giá treo', href: currentUser.role === 'guest' ? '/login?callbackUrl=/rack' : '/rack' },
      ...(currentUser.role !== 'guest' ? [{ label: 'Lịch sử', href: '/profile/history' }] : []),
    ];

  const getTierColor = (tier?: UserTier) => {
    switch (tier) {
      case 'vip': return 'text-brand-gold';
      case 'member': return 'text-[#5D1C34]';
      default: return 'text-neutral-500';
    }
  };

  const getTierLabel = (tier?: UserTier) => {
    switch (tier) {
      case 'vip': return 'VIP';
      case 'member': return 'Member';
      default: return 'Free';
    }
  };

  return (
    <>
      <header className="h-[56px] md:h-[64px] px-4 md:px-8 flex items-center justify-between border-b border-neutral-200 bg-white shrink-0 sticky top-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-8 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="md" />
            {currentUser.role === 'admin' && (
              <span className="hidden md:inline-block px-2 py-0.5 bg-semantic-error text-white text-[10px] font-bold uppercase rounded-full tracking-wide">
                Admin
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-label-sm font-medium text-neutral-600">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`transition-colors hover:text-brand-navy ${pathname === link.href ? 'text-brand-navy font-semibold underline underline-offset-[6px] decoration-2' : ''
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-5">
          {currentUser.role !== 'guest' && currentUser.role !== 'admin' && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-full border border-neutral-200">
              <Sparkles className="w-3.5 h-3.5 text-[#5D1C34]" />
              <span className="text-label-sm font-medium text-neutral-700">{currentUser.quota} <span className="text-neutral-500 font-normal">lượt</span></span>
            </div>
          )}

          {currentUser.role !== 'guest' && (
            <NotificationBell />
          )}

          {currentUser.role !== 'admin' && (
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">
              <ShoppingBag className="w-[18px] h-[18px] md:w-5 md:h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-semantic-error rounded-full ring-2 ring-white text-[9px] flex items-center justify-center text-white font-bold animate-in zoom-in duration-200">
                  {totalItems}
                </span>
              )}
            </button>
          )}

          {currentUser.role === 'guest' ? (
            <Link href="/login" className="hidden md:block px-5 py-2 bg-brand-navy text-white text-label-sm font-semibold rounded-full hover:bg-brand-navy/90 transition-colors">
              Đăng nhập
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-8 h-8 md:w-8 md:h-8 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-label-sm ring-2 ring-transparent hover:ring-neutral-200 transition-all"
              >
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={displayName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  displayInitial
                )}
                {currentUser.role === 'admin' && (
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-semantic-error border-2 border-white rounded-full"></div>
                )}
              </button>

              {/* Desktop Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-[240px] bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 hidden md:block">
                  <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-body-md shrink-0">
                      {currentUser.avatar ? <img src={currentUser.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" /> : displayInitial}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-label-md font-semibold text-neutral-900 truncate">{displayName}</span>
                      {currentUser.role === 'admin' ? (
                        <span className="text-xs text-semantic-error font-medium">Admin</span>
                      ) : (
                        <span className={`text-xs font-medium flex items-center gap-1 ${getTierColor(currentUser.tier as UserTier)}`}>
                          {getTierLabel(currentUser.tier as UserTier)} <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        </span>
                      )}
                    </div>
                  </div>

                  {currentUser.role !== 'admin' ? (
                    <div className="py-1 border-b border-neutral-100">
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <UserIcon className="w-4 h-4" /> Hồ sơ của tôi
                      </Link>
                      <Link href="/rack" className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <HangerIcon className="w-4 h-4 text-[#5D1C34]" /> Giá treo đồ
                      </Link>
                      <Link href="/profile/measurements" className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <Ruler className="w-4 h-4" /> Số đo & chi tiết
                      </Link>
                      <Link href="/profile/history" className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <History className="w-4 h-4" /> Lịch sử Try-On
                      </Link>
                      <Link href="/profile/stylist-history" className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <Sparkles className="w-4 h-4" /> Lịch sử AI Stylist
                      </Link>
                      <Link href="/profile/orders" className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <Package className="w-4 h-4" /> Đơn hàng
                      </Link>
                      <Link href="/profile/reviews" className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <Star className="w-4 h-4" /> Đánh giá của tôi
                      </Link>
                      <Link href="/notifications" className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <Bell className="w-4 h-4" /> Thông báo
                      </Link>
                    </div>
                  ) : (
                    <div className="py-1 border-b border-neutral-100">
                      <Link href="/admin/profile" className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <UserIcon className="w-4 h-4" /> Thông tin cá nhân
                      </Link>
                    </div>
                  )}

                  <div className="py-1">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-body-sm text-semantic-error hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* MOBILE BOTTOM TAB BAR */}
      <CartSlideOver isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <BottomTabBar pathname={pathname} />
    </>
  );
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto pb-[64px] md:pb-0">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-body-sm text-neutral-500 text-center md:text-left">
          &copy; 2026 StAle. All rights reserved.
        </div>
        <div className="flex items-center gap-6 text-body-sm font-medium text-neutral-600">
          <Link href="/terms" className="hover:text-brand-navy transition-colors">Điều khoản</Link>
          <Link href="/privacy" className="hover:text-brand-navy transition-colors">Bảo mật</Link>
          <Link href="/support" className="hover:text-brand-navy transition-colors">Hỗ trợ</Link>
        </div>
      </div>
    </footer>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isChat = pathname === '/chat';

  return (
    <div className="flex flex-col min-h-screen bg-[#EFE9E1] font-sans text-neutral-900">
      <Navigation />
      <div className={`flex-1 w-full ${isChat ? 'pb-0' : 'pb-[64px] md:pb-0'}`}>
        {children}
      </div>
      {!isHome && !isChat && <Footer />}
      {!isChat && <FloatingChat />}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  cta,
  breadcrumbs
}: {
  title: string;
  subtitle?: React.ReactNode;
  cta?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}) {
  return (
    <div className="bg-white border-b border-neutral-200 w-full">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-heading-h2 font-semibold text-brand-navy">{title}</h1>
            {subtitle && <p className="text-body-md text-neutral-600 mt-2">{subtitle}</p>}
          </div>
          {cta && <div>{cta}</div>}
        </div>
      </div>
    </div>
  );
}

export function PageContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full max-w-[1200px] mx-auto p-4 md:p-8">
      {children}
    </main>
  );
}

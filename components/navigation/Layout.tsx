'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FloatingChat } from '../chat/FloatingChat';
import { Logo } from '../ui/Logo';
import {
  Menu, X, ShoppingBag, User as UserIcon, Sparkles,
  History, LogOut, Package, Ruler, Home, Bell, Layers
} from 'lucide-react';
import { Drawer } from 'vaul';
import { CartSlideOver } from '../cart/CartSlideOver';
import { NotificationBell } from '../notifications/NotificationBell';
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
  const router = useRouter();

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
        
        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <Drawer.Root direction="left">
            <Drawer.Trigger asChild>
              <button className="p-2 -ml-2 text-neutral-600 hover:text-brand-navy">
                <Menu className="w-6 h-6" />
              </button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
              <Drawer.Content className="bg-white flex flex-col rounded-r-[24px] h-full w-[280px] mt-24 fixed bottom-0 left-0 z-50 outline-none">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <Logo size="sm" />
                    <Drawer.Close asChild>
                      <button className="p-2 -mr-2 text-neutral-400 hover:text-neutral-900 rounded-full bg-neutral-100">
                        <X className="w-4 h-4" />
                      </button>
                    </Drawer.Close>
                  </div>

                  {currentUser.role !== 'guest' && (
                    <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl mb-6 border border-neutral-100">
                      <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-body-md shrink-0">
                        {currentUser.avatar ? <img src={currentUser.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" /> : displayInitial}
                      </div>
                      <div className="flex-col flex">
                        <span className="font-semibold text-neutral-900 text-body-sm">{displayName}</span>
                        {currentUser.role === 'admin' ? (
                          <span className="text-xs text-semantic-error font-medium">Admin</span>
                        ) : (
                          <span className={`text-xs font-medium flex items-center gap-1 ${getTierColor(currentUser.tier as UserTier)}`}>
                            {getTierLabel(currentUser.tier as UserTier)} <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <nav className="flex flex-col gap-2 flex-1">
                    {navLinks.map((link) => (
                      <Link 
                        key={link.label} 
                        href={link.href}
                        className={`px-4 py-3 rounded-xl font-medium transition-colors text-body-sm flex items-center gap-3 ${
                          pathname === link.href ? 'bg-[#5D1C34]/10 text-[#5D1C34]' : 'text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                    
                    {currentUser.role !== 'guest' && currentUser.role !== 'admin' && (
                      <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-col gap-2">
                        <Link href="/profile" className="px-4 py-3 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 transition-colors text-body-sm flex items-center gap-3">
                          <UserIcon className="w-4 h-4" /> Hồ sơ của tôi
                        </Link>
                        <Link href="/rack" className="px-4 py-3 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 transition-colors text-body-sm flex items-center gap-3">
                          <Layers className="w-4 h-4 text-[#5D1C34]" /> Giá treo đồ
                        </Link>
                        <Link href="/profile/measurements" className="px-4 py-3 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 transition-colors text-body-sm flex items-center gap-3">
                          <Ruler className="w-4 h-4" /> Số đo & chi tiết
                        </Link>
                        <Link href="/profile/stylist-history" className="px-4 py-3 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 transition-colors text-body-sm flex items-center gap-3">
                          <Sparkles className="w-4 h-4" /> Lịch sử AI Stylist
                        </Link>
                        <Link href="/profile/orders" className="px-4 py-3 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 transition-colors text-body-sm flex items-center gap-3">
                          <Package className="w-4 h-4" /> Đơn hàng
                        </Link>
                        <Link href="/notifications" className="px-4 py-3 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 transition-colors text-body-sm flex items-center gap-3">
                          <Bell className="w-4 h-4" /> Thông báo
                        </Link>
                      </div>
                    )}
                  </nav>

                  {currentUser.role !== 'guest' && (
                    <div className="mt-auto pt-6 border-t border-neutral-100">
                      {currentUser.role !== 'admin' && currentUser.quota !== undefined && (
                        <div className="mb-4 flex items-center justify-between px-4 py-3 bg-neutral-50 rounded-xl">
                          <span className="text-body-sm font-medium text-neutral-700">Lượt Try-On</span>
                          <span className="text-body-sm font-bold text-[#5D1C34]">{currentUser.quota} lượt</span>
                        </div>
                      )}
                      <button onClick={handleLogout} className="w-full px-4 py-3 flex items-center gap-3 text-semantic-error font-medium hover:bg-red-50 rounded-xl transition-colors text-body-sm">
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  )}
                  {currentUser.role === 'guest' && (
                    <div className="mt-auto pt-6 border-t border-neutral-100">
                      <Link href="/login" className="w-full py-3 bg-brand-navy text-white text-center rounded-xl font-semibold mb-3 block">
                        Đăng nhập
                      </Link>
                    </div>
                  )}
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>

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
                className={`transition-colors hover:text-brand-navy ${
                  pathname === link.href ? 'text-brand-navy font-semibold underline underline-offset-[6px] decoration-2' : ''
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
                        <Layers className="w-4 h-4 text-[#5D1C34]" /> Giá treo đồ
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-neutral-200 flex items-center justify-around px-2 pb-safe z-50">
        <Link href="/" className="flex flex-col items-center gap-1 p-2 min-w-[64px] relative">
          <div className={`p-1 rounded-xl transition-colors ${pathname === '/' ? 'bg-[#5D1C34]/10' : ''}`}>
            <Home className={`w-[22px] h-[22px] ${pathname === '/' ? 'text-[#5D1C34]' : 'text-neutral-500'}`} />
          </div>
          <span className={`text-[10px] font-medium ${pathname === '/' ? 'text-[#5D1C34]' : 'text-neutral-500'}`}>
            Home
          </span>
          {pathname === '/' && <div className="w-1 h-1 rounded-full bg-[#5D1C34] absolute bottom-1.5" />}
        </Link>

        <Link href="/products" className="flex flex-col items-center gap-1 p-2 min-w-[64px] relative">
          <div className={`p-1 rounded-xl transition-colors ${pathname.startsWith('/products') ? 'bg-[#5D1C34]/10' : ''}`}>
            <Package className={`w-[22px] h-[22px] ${pathname.startsWith('/products') ? 'text-[#5D1C34]' : 'text-neutral-500'}`} />
          </div>
          <span className={`text-[10px] font-medium ${pathname.startsWith('/products') ? 'text-[#5D1C34]' : 'text-neutral-500'}`}>
            Sản phẩm
          </span>
          {pathname.startsWith('/products') && <div className="w-1 h-1 rounded-full bg-[#5D1C34] absolute bottom-1.5" />}
        </Link>

        <Link href="/try-on" className="flex flex-col items-center gap-1 p-2 min-w-[64px] relative">
          <div className={`p-1.5 rounded-xl transition-colors ${pathname === '/try-on' ? 'bg-[#5D1C34]/10' : ''}`}>
            <Sparkles className={`w-[22px] h-[22px] ${pathname === '/try-on' ? 'text-[#5D1C34]' : 'text-neutral-500'}`} />
          </div>
          <span className={`text-[10px] font-medium ${pathname === '/try-on' ? 'text-[#5D1C34]' : 'text-neutral-500'}`}>
            Try-On
          </span>
          {pathname === '/try-on' && <div className="w-1 h-1 rounded-full bg-[#5D1C34] absolute bottom-1.5" />}
        </Link>

        <Link href="/profile/measurements" className="flex flex-col items-center gap-1 p-2 min-w-[64px] relative">
          <div className={`p-1 rounded-xl transition-colors ${pathname.startsWith('/profile') ? 'bg-[#5D1C34]/10' : ''}`}>
            <UserIcon className={`w-[22px] h-[22px] ${pathname.startsWith('/profile') ? 'text-[#5D1C34]' : 'text-neutral-500'}`} />
          </div>
          <span className={`text-[10px] font-medium ${pathname.startsWith('/profile') ? 'text-[#5D1C34]' : 'text-neutral-500'}`}>
            Profile
          </span>
          {pathname.startsWith('/profile') && <div className="w-1 h-1 rounded-full bg-[#5D1C34] absolute bottom-1.5" />}
        </Link>
      </nav>
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

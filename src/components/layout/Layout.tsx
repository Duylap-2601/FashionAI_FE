'use client';

import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { HangerIcon } from '@/components/ui/HangerIcon';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { UserTier } from '@/features/auth/types/auth';
import { CartSlideOver } from '@/features/cart/components/CartSlideOver';
import { useCart } from '@/features/cart/store/cartStore';
import { FloatingChat } from '@/features/chat/components/FloatingChat';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { HeaderSearch } from '@/features/products/components/HeaderSearch';
import { useUserProfile } from '@/features/profile/hooks/use-profile';
import {
  Bell,
  Clock,
  History, LogOut, Mail, MapPin, Menu, Package, Phone, Ruler,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Search,
  User as UserIcon,
  X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

type LayoutVariant = 'app' | 'landing';
type FooterVariant = 'simple' | 'marketing' | 'none';

interface NavigationProps {
  variant?: LayoutVariant;
  onOpenCart: () => void;
  totalItems: number;
}

interface AppLayoutProps {
  children: React.ReactNode;
  variant?: LayoutVariant;
  footerVariant?: FooterVariant;
  beforeHeader?: React.ReactNode;
  showFloatingChat?: boolean;
  showBottomTab?: boolean;
  showFooter?: boolean;
  contentClassName?: string;
}

export function Navigation({ variant = 'app', onOpenCart, totalItems }: NavigationProps) {
  const { currentUser, logout } = useAuth();
  // Lấy name từ API /users/me để tránh mojibake từ session
  const { profile } = useUserProfile();
  const displayName = profile?.name || currentUser.name;
  const displayInitial = displayName ? displayName.charAt(0).toUpperCase() : '?';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setSearchQuery('');
    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
        setIsNavMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
    setIsNavMenuOpen(false);
  }, [pathname]);

  const tryOnHref = currentUser.role === 'guest' ? '/login?callbackUrl=/try-on' : '/try-on';
  const chatHref = currentUser.role === 'guest' ? '/login?callbackUrl=/chat' : '/chat';
  const stylistHref = currentUser.role === 'guest' ? '/login?callbackUrl=/ai-stylist' : '/ai-stylist';
  const rackHref = currentUser.role === 'guest' ? '/login?callbackUrl=/rack' : '/rack';
  const searchInputWidth = variant === 'landing'
    ? 'w-[260px] focus:w-[300px] lg:w-[360px] lg:focus:w-[400px]'
    : 'w-[220px] focus:w-[260px] lg:w-[320px] lg:focus:w-[360px]';
  const navLinks = currentUser.role === 'admin'
    ? [
      { label: 'Dashboard', href: '/admin/dashboard' },
    ]
    : [
      { label: 'Sản phẩm', href: '/products' },
      { label: 'Try-On', href: tryOnHref },
      { label: 'Stylist', href: stylistHref },
      { label: 'Trợ lý AI', href: chatHref },
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
      <header className="sticky top-0 z-50 shrink-0 border-b border-neutral-200 bg-white/95 backdrop-blur-md transition-all duration-300">
        <div className="relative mx-auto flex h-[68px] max-w-[1400px] items-center gap-3 px-4 md:gap-4 md:px-8">
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-2 md:gap-8">
          <Link href="/" className="group flex flex-col items-center py-1">
            <Logo size="md" />
            <span className="mt-0.5 hidden text-[9px] font-medium uppercase tracking-widest text-neutral-400 transition-colors group-hover:text-brand-navy sm:block">
              Chuẩn dáng từ đầu, đẹp từng đường may
            </span>
            {currentUser.role === 'admin' && (
              <span className="hidden md:inline-block px-2 py-0.5 bg-semantic-error text-white text-[10px] font-bold uppercase rounded-full tracking-wide">
                Admin
              </span>
            )}
          </Link>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex min-w-0 items-center justify-end gap-1.5 md:gap-3 lg:gap-4">
          {currentUser.role !== 'guest' && currentUser.role !== 'admin' && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-full border border-neutral-200">
              <Sparkles className="w-3.5 h-3.5 text-[#5D1C34]" />
              <span className="text-label-sm font-medium text-neutral-700">{currentUser.quota} <span className="text-neutral-500 font-normal">lượt</span></span>
            </div>
          )}

          <HeaderSearch className="order-2 shrink-0 sm:hidden" />

          <form
            onSubmit={handleSearchSubmit}
            className="relative order-2 hidden min-w-0 shrink-0 items-center sm:flex md:order-none"
          >
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Bạn đang tìm sản phẩm gì?"
              className={`h-10 rounded-full border border-neutral-200 bg-neutral-100 pl-11 pr-10 text-body-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-brand-navy focus:bg-white focus:outline-none ${searchInputWidth}`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700"
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {currentUser.role !== 'admin' && (
            <Link
              href={rackHref}
              className="order-3 hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-brand-navy sm:flex md:order-none"
              aria-label="Giá treo đồ"
            >
              <HangerIcon className="h-5 w-5" />
            </Link>
          )}

          {currentUser.role !== 'guest' && (
            <NotificationBell className="order-3 shrink-0 md:order-none" />
          )}

          {currentUser.role !== 'admin' && (
            <button
              onClick={onOpenCart}
              className="relative order-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-brand-navy md:order-none"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-[18px] h-[18px] md:w-5 md:h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-semantic-error rounded-full ring-2 ring-white text-[9px] flex items-center justify-center text-white font-bold animate-in zoom-in duration-200">
                  {totalItems}
                </span>
              )}
            </button>
          )}

          {currentUser.role === 'guest' ? (
            <>
              <Link
                href="/login"
                className="order-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-brand-navy"
                aria-label="Đăng nhập"
              >
                <UserIcon className="h-[18px] w-[18px]" />
              </Link>
              <Link href="/login" className="hidden rounded-full bg-brand-navy px-5 py-2 text-label-sm font-semibold text-white transition-colors hover:bg-brand-navy/90 md:order-none md:block">
              Đăng nhập
            </Link>
            </>
          ) : (
            <div className="relative order-1 hidden shrink-0 md:order-none md:block" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy text-label-sm font-bold text-white ring-2 ring-transparent transition-all hover:ring-neutral-200 md:h-8 md:w-8"
                aria-label="Tài khoản"
              >
                {currentUser.avatar ? (
                  <Image src={currentUser.avatar} alt={displayName} width={32} height={32} unoptimized className="w-full h-full rounded-full object-cover" />
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
                      {currentUser.avatar ? <Image src={currentUser.avatar} alt="Avatar" width={40} height={40} unoptimized className="w-full h-full rounded-full object-cover" /> : displayInitial}
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

          <div className="relative order-6 hidden shrink-0 md:block" ref={navMenuRef}>
            <button
              type="button"
              onClick={() => setIsNavMenuOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-brand-navy"
              aria-label="Má»Ÿ menu Ä‘iá»u hÆ°á»›ng"
              aria-expanded={isNavMenuOpen}
            >
              {isNavMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {isNavMenuOpen && (
              <nav className="absolute right-0 top-full z-50 mt-3 w-[240px] rounded-xl border border-neutral-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`block rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors hover:bg-neutral-50 hover:text-brand-navy ${pathname === link.href ? 'bg-brand-navy/5 text-brand-navy' : 'text-neutral-700'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>
        </div>
      </header>
    </>
  );
}

export function SiteFooter({ variant = 'simple' }: { variant?: Exclude<FooterVariant, 'none'> }) {
  if (variant === 'marketing') {
    return <MarketingFooter />;
  }

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

function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-neutral-800 bg-[#0B1118] pt-16 pb-[96px] text-white md:pb-8">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-neutral-800/80 pb-14 md:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col items-start lg:col-span-4">
            <div className="mb-4">
              <Logo size="md" variant="light" />
            </div>
            <p className="mb-6 max-w-sm text-body-sm leading-relaxed text-neutral-400">
              Nền tảng thời trang công sở cao cấp tiên phong ứng dụng công nghệ thử đồ ảo AI. Chuẩn dáng từ đầu, đẹp từng đường may.
            </p>

            <div className="inline-flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-neutral-300">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <div className="text-[11px] font-bold text-white">ĐÃ ĐĂNG KÝ BỘ CÔNG THƯƠNG</div>
                <div className="text-[10px] text-neutral-400">Chứng nhận website thương mại điện tử</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
              BỘ SƯU TẬP & SẢN PHẨM
            </h4>
            <ul className="flex flex-col gap-3 text-body-sm text-neutral-400">
              <li><a href="#collections" className="transition-colors hover:text-white">Bộ sưu tập mới 2026</a></li>
              <li><Link href="/products" className="transition-colors hover:text-white">Blazer Nữ Công Sở</Link></li>
              <li><Link href="/products" className="transition-colors hover:text-white">Suit Nguyên Bộ May Đo</Link></li>
              <li><Link href="/products" className="transition-colors hover:text-white">Áo Sơ Mi Cao Cấp</Link></li>
              <li><Link href="/products" className="transition-colors hover:text-white">Quần Tây & Chân Váy</Link></li>
              <li><Link href="/try-on" className="font-medium text-brand-gold transition-colors hover:text-white">✦ Phòng Thử Đồ AI Virtual Try-On</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
              CHÍNH SÁCH
            </h4>
            <ul className="flex flex-col gap-3 text-body-sm text-neutral-400">
              <li><Link href="/support" className="transition-colors hover:text-white">Chính sách đổi trả 7 ngày</Link></li>
              <li><Link href="/profile/measurements" className="transition-colors hover:text-white">Hướng dẫn chọn size</Link></li>
              <li><Link href="/privacy" className="transition-colors hover:text-white">Chính sách bảo mật</Link></li>
              <li><Link href="/terms" className="transition-colors hover:text-white">Điều khoản dịch vụ</Link></li>
              <li><Link href="/profile/orders" className="transition-colors hover:text-white">Tra cứu đơn hàng</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
              THÔNG TIN LIÊN HỆ
            </h4>
            <div className="flex flex-col gap-3 text-body-sm text-neutral-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                <span>Số 126 Nguyễn Thị Minh Khai, Phường 6, Quận 3, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-neutral-500" />
                <span>Hotline: 1900 6868 (8:30 - 22:00)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-neutral-500" />
                <span>contact@fashionai.vn</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-neutral-500" />
                <span>Mở cửa tất cả các ngày trong tuần</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Phương thức thanh toán
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {['VNPAY', 'MoMo', 'Visa', 'Mastercard', 'COD'].map((item) => (
                  <span key={item} className="rounded border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-[10px] font-bold text-neutral-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-neutral-500 sm:flex-row">
          <div>
            &copy; 2026 StAle. FashionAI. Bản quyền thuộc về FashionAI Team. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-neutral-300">Bảo mật</Link>
            <Link href="/terms" className="transition-colors hover:text-neutral-300">Điều khoản</Link>
            <Link href="/products" className="transition-colors hover:text-neutral-300">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function AppLayout({
  children,
  variant = 'app',
  footerVariant = 'simple',
  beforeHeader,
  showFloatingChat,
  showBottomTab = true,
  showFooter,
  contentClassName = '',
}: AppLayoutProps) {
  const pathname = usePathname();
  const isChat = pathname === '/chat';
  const { isCartOpen, setIsCartOpen, totalItems } = useCart();
  const shouldShowFloatingChat = showFloatingChat ?? !isChat;
  const shouldShowFooter = showFooter ?? (footerVariant !== 'none' && !isChat);
  const resolvedFooterVariant = footerVariant === 'none' ? 'simple' : footerVariant;
  const contentPadding = isChat || !showBottomTab ? 'pb-0' : 'pb-[64px] md:pb-0';

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-neutral-900 selection:bg-brand-navy selection:text-white">
      {beforeHeader}
      <Navigation variant={variant} onOpenCart={() => setIsCartOpen(true)} totalItems={totalItems} />
      <div className={`flex-1 w-full ${contentPadding} ${contentClassName}`}>
        {children}
      </div>
      {shouldShowFooter && <SiteFooter variant={resolvedFooterVariant} />}
      {shouldShowFloatingChat && <FloatingChat />}
      <CartSlideOver isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      {showBottomTab && <BottomTabBar pathname={pathname} />}
    </div>
  );
}

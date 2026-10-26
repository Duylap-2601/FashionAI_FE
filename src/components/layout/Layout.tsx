'use client';

import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { HangerIcon } from '@/components/ui/HangerIcon';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { UserTier } from '@/features/auth/types/auth';
import { CartSlideOver } from '@/features/cart/components/CartSlideOver';
import { useCart } from '@/features/cart/hooks/use-cart';
import { FloatingChat } from '@/features/chat/components/FloatingChat';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { HeaderSearch } from '@/features/products/components/HeaderSearch';
import { SEARCH_HISTORY_KEY } from '@/features/products/constants/header-search';
import { ACCOUNT_TIER_LABELS } from '@/features/profile/constants/account-nav';
import { useUserProfile } from '@/features/profile/hooks/use-profile';
import {
  Banknote,
  Bell,
  Clock,
  Landmark,
  LogOut, Mail, MapPin, Menu, Package, Phone, Ruler,
  ShoppingBag,
  Star,
  Search,
  User as UserIcon,
  X
} from 'lucide-react';
import { openCookieSettings } from '@/lib/analytics';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

type LayoutVariant = 'app' | 'landing';
type FooterVariant = 'simple' | 'marketing' | 'none';

interface NavLink {
  label: string;
  href: string;
  sectionId?: string;
}

interface NavigationProps {
  variant?: LayoutVariant;
  onOpenCart: () => void;
  totalItems: number;
  showInlineNav?: boolean;
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
  showInlineNav?: boolean;
}

export function Navigation({
  variant = 'app',
  onOpenCart,
  totalItems,
  showInlineNav,
}: NavigationProps) {
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
  const isLandingPage = pathname === '/';
  const shouldShowInlineNav = showInlineNav ?? (isLandingPage && variant === 'landing');
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    try {
      const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY);
      const parsed: string[] = raw ? JSON.parse(raw) : [];
      const filtered = Array.isArray(parsed)
        ? parsed.filter((item) => typeof item === 'string' && item.toLowerCase() !== trimmed.toLowerCase())
        : [];
      const updated = [trimmed, ...filtered].slice(0, 12);
      window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }

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
  const isLandingVariant = variant === 'landing';
  const accountMenuItemClass = isLandingVariant
    ? 'flex items-center gap-3 px-4 py-2.5 text-body-sm text-landing-obsidian/80 transition-colors hover:bg-landing-ivory hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-landing-oxblood'
    : 'flex items-center gap-3 px-4 py-2.5 text-body-sm text-neutral-700 hover:bg-neutral-50 transition-colors';
  const accountMenuDividerClass = isLandingVariant ? 'border-landing-line/70' : 'border-neutral-100';
  const accountMenuIconProps = { className: 'w-4 h-4', strokeWidth: isLandingVariant ? 1.75 : 2 };
  const chatHref = currentUser.role === 'guest' ? '/login?callbackUrl=/chat' : '/chat';
  const stylistHref = currentUser.role === 'guest' ? '/login?callbackUrl=/ai-stylist' : '/ai-stylist';
  const rackHref = currentUser.role === 'guest' ? '/login?callbackUrl=/rack' : '/rack';
  // /products có ô tìm kiếm riêng trong toolbar (lọc ngay khi gõ), nên header không lặp lại ô tìm.
  const shouldShowHeaderSearch = pathname !== '/products';
  const searchInputWidth = variant === 'landing'
    ? 'w-[220px] focus:w-[260px] lg:w-[280px] lg:focus:w-[320px]'
    : 'w-[220px] focus:w-[260px] lg:w-[320px] lg:focus:w-[360px]';
  const landingNavLinks: NavLink[] = [
    { label: 'Bộ sưu tập', href: '#collections', sectionId: 'collections' },
    { label: 'Sản phẩm', href: '#featured-products', sectionId: 'featured-products' },
    { label: 'Lookbook', href: '#lookbook', sectionId: 'lookbook' },
    { label: 'AI Stylist', href: '#ai-stylist', sectionId: 'ai-stylist' },
    { label: 'Try-On', href: '#ai-try-on', sectionId: 'ai-try-on' },
  ];
  const landingMenuLinks: NavLink[] = [
    { label: 'Bộ sưu tập', href: '/products' },
    { label: 'AI Stylist', href: stylistHref },
    { label: 'Try-On', href: tryOnHref },
  ];
  const navLinks: NavLink[] = currentUser.role === 'admin'
    ? [
      { label: 'Dashboard', href: '/admin/dashboard' },
    ]
    : [
      { label: 'Sản phẩm', href: '/products' },
      { label: 'Try-On', href: tryOnHref },
      { label: 'AI Stylist', href: stylistHref },
      { label: 'Trợ lý AI', href: chatHref },
    ];

  const handleSectionScroll = (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    event.preventDefault();
    const target = document.getElementById(sectionId);
    if (!target) {
      router.push(`/#${sectionId}`);
      return;
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${sectionId}`);
    setIsNavMenuOpen(false);
  };

  const getTierColor = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case 'vip': return 'text-[#5D1C34] font-bold';
      case 'member': return 'text-[#5D1C34] font-medium';
      default: return 'text-neutral-500';
    }
  };

  const getTierLabel = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case 'vip': return 'VIP';
      case 'member': return 'Member';
      default: return 'Free';
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-50 shrink-0 border-b backdrop-blur-md transition-all duration-300 ${variant === 'landing' ? 'border-landing-line/70 bg-landing-paper/90' : 'border-neutral-200 bg-white/95'} ${pathname === '/search' ? 'hidden md:block' : ''}`}>
        <div className={`relative mx-auto flex max-w-[1400px] items-center gap-3 px-4 md:gap-4 md:px-8 ${variant === 'landing' ? 'h-[72px]' : 'h-[68px]'}`}>
          {/* Logo */}
          <div className="flex shrink-0 items-center gap-2 md:gap-8">
            <Link href="/" className="group flex flex-col items-center py-1 px-2">
              <Logo size="md" />
              <span className={`mt-0.5 hidden text-[9px] font-medium uppercase tracking-widest transition-colors sm:block ${variant === 'landing' ? 'text-landing-muted/75 group-hover:text-landing-oxblood' : 'text-neutral-400 group-hover:text-brand-navy'}`}>
                Chuẩn dáng từ đầu, đẹp từng đường may
              </span>
              {currentUser.role === 'admin' && (
                <span className="hidden md:inline-block px-2 py-0.5 bg-semantic-error text-white text-[10px] font-bold uppercase rounded-full tracking-wide">
                  Admin
                </span>
              )}
            </Link>
          </div>

          {shouldShowInlineNav && currentUser.role !== 'admin' ? (
            <nav className="hidden items-center gap-5 xl:flex" aria-label="Điều hướng landing">
              {landingNavLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(event) => {
                    if (link.sectionId) handleSectionScroll(event, link.sectionId);
                  }}
                  className="text-[10px] font-semibold uppercase tracking-[0.16em] text-landing-obsidian/65 transition-colors hover:text-landing-oxblood"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          ) : null}

          {/* Right Actions */}
          <div className="ml-auto flex min-w-0 items-center justify-end gap-1.5 md:gap-3 lg:gap-4">
            {shouldShowHeaderSearch && <HeaderSearch className="order-2 shrink-0 sm:hidden" />}

            {shouldShowHeaderSearch && (
              <form
                onSubmit={handleSearchSubmit}
                className="relative order-2 hidden min-w-0 shrink-0 items-center sm:flex md:order-none"
              >
                <Search className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${variant === 'landing' ? 'text-landing-muted' : 'text-neutral-400'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Bạn đang tìm sản phẩm gì?"
                  className={`h-10 border pl-11 pr-10 text-body-sm transition-all focus:outline-none ${variant === 'landing' ? 'rounded-none border-landing-line/70 bg-landing-ivory/70 text-landing-obsidian placeholder:text-landing-muted/70 focus:border-landing-oxblood focus:bg-landing-ivory' : 'rounded-full border-neutral-200 bg-neutral-100 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-navy focus:bg-white'} ${searchInputWidth}`}
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
            )}

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
                  <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-semantic-error rounded-full ring-2 text-[9px] flex items-center justify-center text-white font-bold animate-in zoom-in duration-200 ${variant === 'landing' ? 'ring-landing-paper' : 'ring-white'}`}>
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
                <Link
                  href="/login"
                  className={`hidden px-5 py-2 text-label-sm font-semibold transition-colors md:order-none md:block ${variant === 'landing' ? 'rounded-none border border-landing-obsidian bg-transparent text-landing-obsidian hover:bg-landing-obsidian hover:text-landing-paper' : 'rounded-full bg-brand-navy text-white hover:bg-brand-navy/90'}`}
                >
                  Đăng nhập
                </Link>
              </>
            ) : (
              <div className="relative order-1 hidden shrink-0 md:order-none md:block" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setIsNavMenuOpen(false);
                    setIsDropdownOpen((open) => !open);
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-label-sm font-bold ring-2 ring-transparent transition-all md:h-8 md:w-8 ${isLandingVariant ? 'bg-landing-oxblood text-landing-paper hover:ring-landing-taupe' : 'bg-brand-navy text-white hover:ring-neutral-200'}`}
                  aria-label="Tài khoản"
                  aria-expanded={isDropdownOpen}
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
                  <div className={`absolute right-0 top-full mt-2 w-[240px] border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 hidden md:block ${isLandingVariant ? 'rounded-[2px] border-landing-line bg-landing-paper shadow-md' : 'rounded-xl border-neutral-200 bg-white shadow-lg'}`}>
                    <div className={`px-4 py-3 border-b flex items-center gap-3 ${accountMenuDividerClass}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-body-md shrink-0 ${isLandingVariant ? 'bg-landing-oxblood text-landing-paper' : 'bg-brand-navy text-white'}`}>
                        {currentUser.avatar ? <Image src={currentUser.avatar} alt="Avatar" width={40} height={40} unoptimized className="w-full h-full rounded-full object-cover" /> : displayInitial}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className={`truncate ${isLandingVariant ? 'font-display text-base leading-tight text-landing-obsidian' : 'text-label-md font-semibold text-neutral-900'}`}>{displayName}</span>
                        {currentUser.role === 'admin' ? (
                          <span className="text-xs text-semantic-error font-medium">Admin</span>
                        ) : isLandingVariant ? (
                          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-landing-brass-ink">
                            Gói {ACCOUNT_TIER_LABELS[String(currentUser.tier).toUpperCase()] ?? ACCOUNT_TIER_LABELS.FREE}
                          </span>
                        ) : (
                          <span className={`text-xs font-medium flex items-center gap-1 ${getTierColor(currentUser.tier as UserTier)}`}>
                            {getTierLabel(currentUser.tier as UserTier)} <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          </span>
                        )}
                      </div>
                    </div>

                    {currentUser.role !== 'admin' ? (
                      <div className={`py-1 border-b ${accountMenuDividerClass}`}>
                        <Link href="/profile" className={accountMenuItemClass}>
                          <UserIcon {...accountMenuIconProps} /> Hồ sơ của tôi
                        </Link>
                        <Link href="/profile/measurements" className={accountMenuItemClass}>
                          <Ruler {...accountMenuIconProps} /> Số đo & chi tiết
                        </Link>
                        <Link href="/profile/orders" className={accountMenuItemClass}>
                          <Package {...accountMenuIconProps} /> Đơn hàng
                        </Link>
                        <Link href="/profile/reviews" className={accountMenuItemClass}>
                          <Star {...accountMenuIconProps} /> Đánh giá của tôi
                        </Link>
                        <Link href="/notifications" className={accountMenuItemClass}>
                          <Bell {...accountMenuIconProps} /> Thông báo
                        </Link>
                      </div>
                    ) : (
                      <div className={`py-1 border-b ${accountMenuDividerClass}`}>
                        <Link href="/admin/profile" className={accountMenuItemClass}>
                          <UserIcon {...accountMenuIconProps} /> Thông tin cá nhân
                        </Link>
                      </div>
                    )}

                    <div className="py-1">
                      <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-2.5 text-body-sm transition-colors ${isLandingVariant ? 'text-destructive hover:bg-destructive/5' : 'text-semantic-error hover:bg-red-50'}`}>
                        <LogOut {...accountMenuIconProps} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="relative order-6 hidden shrink-0 md:block" ref={navMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsNavMenuOpen((open) => !open);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-brand-navy"
                aria-label="Mở menu điều hướng"
                aria-expanded={isNavMenuOpen}
              >
                {isNavMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {isNavMenuOpen && (
                <nav className={`absolute right-0 top-full z-50 mt-3 w-[240px] rounded-xl border p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 ${variant === 'landing' ? 'border-landing-line bg-landing-paper' : 'border-neutral-200 bg-white'}`}>
                  {navLinks.map((link) => {
                    const className = `block rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors ${variant === 'landing' ? 'text-landing-obsidian hover:bg-landing-ivory hover:text-landing-oxblood' : 'text-neutral-700 hover:bg-neutral-50 hover:text-brand-navy'} ${pathname === link.href ? (variant === 'landing' ? 'bg-landing-ivory text-landing-oxblood' : 'bg-brand-navy/5 text-brand-navy') : ''
                      }`;
                    const sectionId = link.sectionId;

                    if (sectionId) {
                      return (
                        <a
                          key={link.label}
                          href={link.href}
                          onClick={(event) => handleSectionScroll(event, sectionId)}
                          className={className}
                        >
                          {link.label}
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        className={className}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
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
          <button type="button" onClick={openCookieSettings} className="hover:text-brand-navy transition-colors">Cài đặt cookie</button>
        </div>
      </div>
    </footer>
  );
}

function PaymentMethodIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center border border-landing-paper/15 bg-landing-paper/[0.03] text-landing-paper/55 transition-colors hover:border-landing-brass/60 hover:bg-landing-brass/10 hover:text-landing-paper"
    >
      {children}
    </span>
  );
}

function ZaloPayMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#0068FF" />
      <path d="M7.5 6.5h9v2.4l-5.6 6.2h5.6v2.4h-9v-2.4l5.6-6.2H7.5V6.5Z" fill="#fff" />
    </svg>
  );
}

function MarketingFooter() {
  return (
    <footer className="mt-auto overflow-hidden border-t border-landing-paper/10 bg-landing-obsidian pt-16 pb-[104px] text-landing-paper md:pb-10">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-landing-paper/10 pb-14 md:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col items-start lg:col-span-4">
            <Logo size="md" variant="light" />
            <p className="mt-5 max-w-sm font-display text-2xl leading-tight text-landing-paper">
              Chuẩn dáng từ đầu. Đẹp từng đường may.
            </p>
            <p className="mt-4 max-w-sm text-body-sm leading-relaxed text-landing-paper/55">
              Thời trang công sở may đo, tuyển chọn cho nhịp sống hiện đại. Thử phom dáng bằng AI trước khi quyết định.
            </p>
          </div>

          <div className="lg:col-span-3">
            <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-landing-brass">
              Khám phá
            </h4>
            <ul className="flex flex-col gap-3 text-body-sm text-landing-paper/55">
              <li><Link href="/#collections" className="transition-colors hover:text-landing-paper">Bộ sưu tập mới 2026</Link></li>
              <li><Link href="/products" className="transition-colors hover:text-landing-paper">Toàn bộ sản phẩm</Link></li>
              <li><Link href="/try-on" className="transition-colors hover:text-landing-paper">Phòng thử đồ AI</Link></li>
              <li><Link href="/ai-stylist" className="transition-colors hover:text-landing-paper">AI Stylist</Link></li>
              <li><Link href="/products" className="transition-colors hover:text-landing-paper">Blazer và suit</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-landing-brass">
              Chính sách
            </h4>
            <ul className="flex flex-col gap-3 text-body-sm text-landing-paper/55">
              <li><Link href="/return-policy" className="transition-colors hover:text-landing-paper">Đổi trả 7 ngày</Link></li>
              <li><Link href="/warranty" className="transition-colors hover:text-landing-paper">Bảo hành</Link></li>
              <li><Link href="/size-guide" className="transition-colors hover:text-landing-paper">Hướng dẫn chọn size</Link></li>
              <li><Link href="/privacy" className="transition-colors hover:text-landing-paper">Bảo mật</Link></li>
              <li><Link href="/terms" className="transition-colors hover:text-landing-paper">Điều khoản</Link></li>
              <li><Link href="/profile/orders" className="transition-colors hover:text-landing-paper">Tra cứu đơn hàng</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-landing-brass">
              Liên hệ
            </h4>
            <div className="flex flex-col gap-3 text-body-sm text-landing-paper/55">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-landing-brass" />
                <span>551/10 Tô Ngọc Vân, Thới An, Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-landing-brass" />
                <span>Hotline: 1900 6868 (8:30 - 22:00)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-landing-brass" />
                <a href="mailto:staie.project@gmail.com" className="transition-colors hover:text-landing-paper">
                  staie.project@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-landing-brass" />
                <span>Mở cửa tất cả các ngày trong tuần</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-landing-paper/40">
                Phương thức thanh toán
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <PaymentMethodIcon label="Thanh toán khi nhận hàng (COD)">
                  <Banknote className="h-[18px] w-[18px]" />
                </PaymentMethodIcon>
                <PaymentMethodIcon label="Chuyển khoản ngân hàng">
                  <Landmark className="h-[18px] w-[18px]" />
                </PaymentMethodIcon>
                <PaymentMethodIcon label="Ví ZaloPay">
                  <ZaloPayMark className="h-5 w-5" />
                </PaymentMethodIcon>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-[11px] text-landing-paper/35 sm:flex-row">
          <div>
            &copy; 2026 StAle. FashionAI. Bản quyền thuộc về FashionAI Team.
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/privacy" className="transition-colors hover:text-landing-paper">Bảo mật</Link>
            <Link href="/terms" className="transition-colors hover:text-landing-paper">Điều khoản</Link>
            <Link href="/" className="transition-colors hover:text-landing-paper">Trang chủ</Link>
            <button type="button" onClick={openCookieSettings} className="transition-colors hover:text-landing-paper">Cài đặt cookie</button>
          </div>
        </div>

        <div aria-hidden="true" className="mt-8 select-none overflow-hidden border-t border-landing-paper/10 pt-6">
          <span className="block font-display text-[clamp(4rem,14vw,13rem)] leading-[0.8] tracking-[-0.05em] text-landing-paper/10">
            StAle.
          </span>
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
  showInlineNav,
}: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, status } = useAuth();
  const isChat = pathname === '/chat';
  const isSearch = pathname === '/search';
  const { isCartOpen, setIsCartOpen, totalItems } = useCart();
  // Phòng thử có thanh điều khiển phiên ở góc dưới; nút chat nổi sẽ đè lên nút Bắt đầu.
  const isTryOn = pathname === '/try-on';
  const shouldShowFloatingChat = showFloatingChat ?? (!isChat && !isSearch && !isTryOn);
  const shouldShowFooter = showFooter ?? (footerVariant !== 'none' && !isChat && !isSearch);
  const resolvedFooterVariant = footerVariant === 'none' ? 'simple' : footerVariant;
  const shouldShowBottomTab = showBottomTab && !isChat && !isSearch;
  const contentPadding = isChat || !shouldShowBottomTab ? 'pb-0' : 'pb-[64px] md:pb-0';

  useEffect(() => {
    if (status !== 'loading' && currentUser.role === 'admin') {
      router.replace('/admin/dashboard');
    }
  }, [currentUser.role, router, status]);

  if (status !== 'loading' && currentUser.role === 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen font-sans ${variant === 'landing' ? 'bg-landing-paper text-landing-obsidian selection:bg-landing-oxblood selection:text-landing-paper' : 'bg-white text-neutral-900 selection:bg-brand-navy selection:text-white'}`}>
      {beforeHeader}
      <Navigation
        variant={variant}
        onOpenCart={() => setIsCartOpen(true)}
        totalItems={totalItems}
        showInlineNav={showInlineNav}
      />
      <div className={`flex-1 w-full ${contentPadding} ${contentClassName}`}>
        {children}
      </div>
      {shouldShowFooter && <SiteFooter variant={resolvedFooterVariant} />}
      {shouldShowFloatingChat && <FloatingChat />}
      <CartSlideOver isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      {shouldShowBottomTab && <BottomTabBar pathname={pathname} />}
    </div>
  );
}

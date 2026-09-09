'use client';

import type { LandingHeaderProps } from '@/features/home/types/landing-header';
import { HangerIcon } from '@/components/ui/HangerIcon';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCart } from '@/features/cart/store/cartStore';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import {
  LogOut, Package,
  Search,
  ShoppingBag,
  Sparkles,
  User as UserIcon,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

export function LandingHeader({ collections }: LandingHeaderProps) {
  const router = useRouter();
  const { currentUser, logout, isLoggedIn } = useAuth();
  const { setIsCartOpen, totalItems } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-all duration-300">
      <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 h-[68px] flex items-center gap-3 md:gap-4">
        {/* Left: Mobile hamburger & Main Navigation */}

        {/* Center: Brand Logo & Slogan */}
        <div className="shrink-0 flex items-center justify-center">
          <Link href="/" className="flex flex-col items-center group py-1">
            <Logo size="md" />
            <span className="text-[9px] tracking-widest text-neutral-400 uppercase font-medium mt-0.5 group-hover:text-[#5D1C34] transition-colors hidden sm:block">
              Chuẩn dáng từ đầu, đẹp từng đường may
            </span>
          </Link>
        </div>

        {/* Right: Actions (Search, Rack, Account, Cart) */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 md:ml-auto md:w-auto md:flex-none md:gap-3 lg:gap-4">
          {/* Search */}
          <div className="relative order-1 min-w-0 flex-1 md:flex-none">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Bạn đang tìm sản phẩm gì?"
                className="h-10 w-full rounded-full border border-neutral-200 bg-neutral-100 pl-10 pr-9 text-body-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-[#5D1C34] focus:bg-white focus:outline-none md:w-56 md:focus:w-64 lg:w-72 lg:focus:w-80"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-neutral-400 hover:text-neutral-700"
                  aria-label="Xoá tìm kiếm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* Virtual Rack / Giá treo đồ */}
          <Link
            href={isLoggedIn ? '/rack' : '/login?callbackUrl=/rack'}
            className="p-2 text-neutral-700 hover:text-[#5D1C34] transition-colors hidden sm:flex items-center md:order-2"
            title="Giá treo đồ đã lưu"
          >
            <HangerIcon className="w-5 h-5" />
          </Link>

          {/* User Account */}
          <div className="relative order-5 shrink-0" ref={userDropdownRef}>
            {isLoggedIn ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="p-1.5 flex items-center gap-1.5 text-neutral-700 hover:text-[#5D1C34] transition-colors"
                aria-label="Tài khoản"
              >
                <div className="w-7 h-7 rounded-full bg-[#5D1C34] text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>
            ) : (
              <Link
                href="/login"
                className="p-2 text-neutral-700 hover:text-[#5D1C34] transition-colors"
                aria-label="Đăng nhập"
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}

            {userDropdownOpen && isLoggedIn && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 px-1 animate-in fade-in duration-150 z-50 md:left-auto md:right-0">
                <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                  <div className="font-semibold text-neutral-900 text-body-sm truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-neutral-500 truncate">{currentUser.email}</div>
                  {currentUser.role === 'admin' && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold bg-semantic-error text-white rounded">ADMIN</span>
                  )}
                </div>

                {currentUser.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm text-brand-navy hover:bg-neutral-50 font-medium"
                  >
                    <Package className="w-4 h-4" /> Dashboard Quản Trị
                  </Link>
                )}

                <Link
                  href="/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <UserIcon className="w-4 h-4" /> Trang cá nhân
                </Link>
                <Link
                  href="/profile/orders"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <Package className="w-4 h-4" /> Đơn hàng của tôi
                </Link>
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm text-semantic-error hover:bg-red-50 text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            )}
          </div>

          {isLoggedIn && (
            <NotificationBell className="order-2 md:order-3" />
          )}

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative order-3 p-2 text-neutral-700 hover:text-[#5D1C34] transition-colors cursor-pointer md:order-4"
            aria-label="Giỏ hàng"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#5D1C34] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[300px] max-w-[85vw] bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <Logo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full bg-neutral-100 text-neutral-500 hover:text-neutral-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-1">
                <div className="text-[11px] font-bold uppercase text-neutral-400 px-3 py-1 tracking-wider">
                  Menu chính
                </div>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-body-md font-medium text-neutral-800 hover:bg-neutral-100"
                >
                  Tất cả sản phẩm
                </Link>
                <Link
                  href="/try-on"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-body-md font-semibold text-[#5D1C34] bg-[#5D1C34]/5 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Thử đồ AI Virtual Try-On
                </Link>
                <Link
                  href="/ai-stylist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-body-md font-medium text-neutral-800 hover:bg-neutral-100"
                >
                  AI Stylist tư vấn
                </Link>
                <Link
                  href="/rack"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-body-md font-medium text-neutral-800 hover:bg-neutral-100 flex items-center gap-2"
                >
                  <HangerIcon className="w-4 h-4 text-[#5D1C34]" /> Giá treo đồ
                </Link>
                <a
                  href="#collections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-body-md font-medium text-neutral-800 hover:bg-neutral-100"
                >
                  Bộ sưu tập mới
                </a>
              </div>

              {/* Collections List in Mobile */}
              <div className="mt-6 pt-4 border-t border-neutral-100">
                <div className="text-[11px] font-bold uppercase text-neutral-400 px-3 py-1 tracking-wider">
                  Bộ sưu tập nổi bật
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  {collections.map((col) => (
                    <a
                      key={col.id}
                      href="#collections"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-body-sm text-neutral-600 hover:text-[#5D1C34] flex items-center justify-between"
                    >
                      <span className="truncate">{col.name}</span>
                      <span className="text-[10px] text-neutral-400">{col.season}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-200">
              {isLoggedIn ? (
                <div className="flex flex-col gap-2">
                  <div className="px-2 text-body-sm font-semibold text-neutral-900">{currentUser.name}</div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-2.5 px-3 rounded-lg text-semantic-error bg-red-50 text-body-sm font-medium flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 bg-[#5D1C34] text-white text-center rounded-xl font-semibold block shadow-md"
                >
                  Đăng nhập / Đăng ký
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

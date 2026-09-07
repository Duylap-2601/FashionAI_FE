'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu, X, ShoppingBag, Search, Sparkles,
  ChevronDown, User as UserIcon, LogOut, Package
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { HangerIcon } from '@/components/ui/HangerIcon';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/store/cartStore';
import { Collection } from '@/types/collection';

interface LandingHeaderProps {
  collections: Collection[];
}

export function LandingHeader({ collections }: LandingHeaderProps) {
  const router = useRouter();
  const { currentUser, logout, isLoggedIn } = useAuth();
  const { setIsCartOpen, totalItems } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionDropdownOpen, setCollectionDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCollectionDropdownOpen(false);
      }
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
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-[68px] flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Main Navigation */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 text-neutral-800 hover:text-brand-navy"
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <nav className="hidden md:flex items-center gap-7 text-[13px] font-semibold uppercase tracking-wider text-neutral-700">
            {/* Collections Dropdown */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setCollectionDropdownOpen(true)}
              onMouseLeave={() => setCollectionDropdownOpen(false)}
            >
              <button
                className="flex items-center gap-1.5 py-2 hover:text-[#5D1C34] transition-colors cursor-pointer"
                onClick={() => setCollectionDropdownOpen(!collectionDropdownOpen)}
              >
                <span>Bộ Sưu Tập</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collectionDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {collectionDropdownOpen && (
                <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-neutral-100 py-2.5 px-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    Các bộ sưu tập mới
                  </div>
                  {collections.map((col) => (
                    <Link
                      key={col.id}
                      href={`/#collections`}
                      onClick={() => setCollectionDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 group transition-colors"
                    >
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-neutral-100 shrink-0">
                        <img src={col.thumbnail} alt={col.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-body-sm font-semibold text-neutral-900 group-hover:text-[#5D1C34] truncate">
                          {col.name}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate">
                          {col.season || '2026 Collection'}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <div className="mt-2 pt-2 border-t border-neutral-100 px-3">
                    <Link
                      href="/products"
                      className="text-[11px] font-bold text-[#5D1C34] hover:underline flex items-center justify-between"
                      onClick={() => setCollectionDropdownOpen(false)}
                    >
                      <span>Xem toàn bộ sản phẩm</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/products" className="py-2 hover:text-[#5D1C34] transition-colors">
              Sản Phẩm
            </Link>

            <Link
              href="/try-on"
              className="py-2 flex items-center gap-1.5 text-[#5D1C34] hover:text-[#7A2445] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 fill-[#5D1C34]/20" />
              <span>Thử Đồ AI</span>
            </Link>

            <Link href="/ai-stylist" className="py-2 hover:text-[#5D1C34] transition-colors">
              AI Stylist
            </Link>

            <a href="#lookbook" className="py-2 hover:text-[#5D1C34] transition-colors">
              Lookbook
            </a>
          </nav>
        </div>

        {/* Center: Brand Logo & Slogan */}
        <div className="flex items-center justify-center">
          <Link href="/" className="flex flex-col items-center group py-1">
            <Logo size="md" />
            <span className="text-[9px] tracking-widest text-neutral-400 uppercase font-medium mt-0.5 group-hover:text-[#5D1C34] transition-colors hidden sm:block">
              Chuẩn dáng từ đầu, đẹp từng đường may
            </span>
          </Link>
        </div>

        {/* Right: Actions (Search, Rack, Account, Cart) */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Search Toggle */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm blazer, suit, sơ mi..."
                  className="w-44 md:w-60 h-9 px-3 text-body-sm bg-neutral-100 rounded-full border border-neutral-300 focus:outline-none focus:border-[#5D1C34] pr-8"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-2.5 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-neutral-700 hover:text-[#5D1C34] transition-colors"
                aria-label="Tìm kiếm"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Virtual Rack / Giá treo đồ */}
          <Link
            href={isLoggedIn ? '/rack' : '/login?callbackUrl=/rack'}
            className="p-2 text-neutral-700 hover:text-[#5D1C34] transition-colors hidden sm:flex items-center"
            title="Giá treo đồ đã lưu"
          >
            <HangerIcon className="w-5 h-5" />
          </Link>

          {/* User Account */}
          <div className="relative" ref={userDropdownRef}>
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
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 px-1 animate-in fade-in duration-150 z-50">
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

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-neutral-700 hover:text-[#5D1C34] transition-colors cursor-pointer"
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

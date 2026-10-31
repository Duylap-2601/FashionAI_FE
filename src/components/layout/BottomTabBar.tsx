'use client';

import { Home, Package, Sparkles, User as UserIcon, Wand2, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface BottomTabItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
}

const bottomTabs: BottomTabItem[] = [
  {
    label: 'Trang chủ',
    href: '/',
    icon: Home,
    isActive: (pathname) => pathname === '/',
  },
  {
    label: 'Sản phẩm',
    href: '/products',
    icon: Package,
    isActive: (pathname) => pathname.startsWith('/products'),
  },
  {
    label: 'Thử đồ',
    href: '/try-on',
    icon: Sparkles,
    isActive: (pathname) => pathname === '/try-on',
  },
  {
    label: 'AI Stylist',
    href: '/ai-stylist',
    icon: Wand2,
    isActive: (pathname) => pathname === '/ai-stylist' || pathname === '/chat',
  },
  {
    label: 'Tài khoản',
    href: '/profile',
    icon: UserIcon,
    isActive: (pathname) => pathname.startsWith('/profile') || pathname === '/notifications',
  },
];

interface BottomTabBarProps {
  pathname: string;
  zIndexClass?: string;
  className?: string;
}

export function BottomTabBar({ pathname, zIndexClass = 'z-[90]', className = '' }: BottomTabBarProps) {
  return (
    <nav
      aria-label="Điều hướng chính"
      className={`fixed inset-x-0 bottom-0 flex h-[64px] items-stretch border-t border-landing-line bg-landing-paper/95 backdrop-blur-md md:hidden ${zIndexClass} ${className}`}
    >
      {bottomTabs.map((tab) => (
        <BottomTabBarItem key={tab.href} tab={tab} pathname={pathname} />
      ))}
    </nav>
  );
}

function BottomTabBarItem({ tab, pathname }: { tab: BottomTabItem; pathname: string }) {
  const isActive = tab.isActive(pathname);
  const Icon = tab.icon;

  return (
    <Link
      href={tab.href}
      aria-current={isActive ? 'page' : undefined}
      className="group relative flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 rounded-[2px] px-1 text-landing-muted transition-colors duration-150 hover:text-landing-obsidian focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-landing-oxblood aria-[current=page]:text-landing-oxblood"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 mx-auto h-[2px] w-8 bg-landing-oxblood transition-opacity duration-150 ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <Icon
        className={`h-5 w-5 transition-colors duration-150 ${isActive ? 'text-landing-oxblood' : 'text-landing-muted group-hover:text-landing-obsidian'}`}
        strokeWidth={1.75}
      />
      <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.1em]">
        {tab.label}
      </span>
    </Link>
  );
}

'use client';

import Link from 'next/link';
import { Home, Package, Sparkles, User as UserIcon, type LucideIcon } from 'lucide-react';

interface BottomTabItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
  iconPadding?: string;
}

const bottomTabs: BottomTabItem[] = [
  {
    label: 'Home',
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
    label: 'Try-On',
    href: '/try-on',
    icon: Sparkles,
    isActive: (pathname) => pathname === '/try-on',
    iconPadding: 'p-1.5',
  },
  {
    label: 'Profile',
    href: '/profile/measurements',
    icon: UserIcon,
    isActive: (pathname) => pathname.startsWith('/profile'),
  },
];

interface BottomTabBarProps {
  pathname: string;
  zIndexClass?: string;
  className?: string;
}

export function BottomTabBar({ pathname, zIndexClass = 'z-[90]', className = '' }: BottomTabBarProps) {
  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-neutral-200 flex items-center justify-around px-2 pb-safe pointer-events-auto ${zIndexClass} ${className}`}>
      {bottomTabs.map((tab) => (
        <BottomTabBarItem key={tab.href} tab={tab} pathname={pathname} />
      ))}
    </nav>
  );
}

function BottomTabBarItem({ tab, pathname }: { tab: BottomTabItem; pathname: string }) {
  const isActive = tab.isActive(pathname);
  const Icon = tab.icon;
  const activeClass = isActive ? 'text-[#5D1C34]' : 'text-neutral-500';

  return (
    <Link href={tab.href} className="flex flex-col items-center gap-1 p-2 min-w-[64px] relative">
      <div className={`${tab.iconPadding ?? 'p-1'} rounded-xl transition-colors ${isActive ? 'bg-[#5D1C34]/10' : ''}`}>
        <Icon className={`w-[22px] h-[22px] ${activeClass}`} />
      </div>
      <span className={`text-[10px] font-medium ${activeClass}`}>
        {tab.label}
      </span>
      {isActive && <div className="w-1 h-1 rounded-full bg-[#5D1C34] absolute bottom-1.5" />}
    </Link>
  );
}

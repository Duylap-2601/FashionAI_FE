'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useAuth } from '@/hooks/useAuth';

export function InstallPrompt() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const { isInstallable, install, dismiss } = usePWAInstall();

  // Chỉ hiển thị ở trang Landing Page ('/') và khi người dùng CHƯA đăng nhập
  const isLandingPage = pathname === '/';
  const shouldShow = isLandingPage && !isLoggedIn && isInstallable;

  // Tự động đóng thông báo sau 5 giây khi xuất hiện
  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => {
        dismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [shouldShow, dismiss]);

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-4 left-4 right-auto md:bottom-6 md:left-6 max-w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-brand-black text-brand-cream border border-brand-taupe/20 rounded-2xl p-4 shadow-xl z-50 flex items-center gap-3 animate-fadeInUp">
      <img src="/icons/icon-96x96.png" alt="FashionAI Logo" className="w-12 h-12 rounded-xl object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">Cài FashionAI về điện thoại</p>
        <p className="text-xs text-brand-cream/60 line-clamp-2">Trải nghiệm ứng dụng mượt mà, tiện lợi hơn</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button 
          onClick={install} 
          className="bg-brand-gold text-brand-black text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
        >
          Cài đặt
        </button>
        <button 
          onClick={dismiss} 
          className="text-brand-cream/40 hover:text-brand-cream/80 text-xs p-1"
          aria-label="Đóng"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

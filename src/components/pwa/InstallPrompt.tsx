'use client';

import { isCapacitorNative, isCapacitorWebView } from '@/lib/platform';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const APK_URL = 'https://apkpure.com/staie/vn.fashionai.app';
const STORAGE_KEY = 'staie_app_prompt_dismissed';

function getSessionDismissed(): boolean {
  try {
    return typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function setSessionDismissed(): void {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }
  } catch {
    // Ignore storage errors in private browsing modes
  }
}

export function InstallPrompt() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Không hiển thị nếu người dùng đã đóng/tương tác trong phiên làm việc này
    if (getSessionDismissed()) {
      return;
    }

    // Không hiển thị nếu đang chạy trong ứng dụng di động (Capacitor native app)
    if (isCapacitorNative() || isCapacitorWebView()) {
      return;
    }

    // Không hiển thị nếu đang mở dưới dạng standalone PWA
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    setIsVisible(true);
  }, []);

  const handleDismiss = () => {
    setSessionDismissed();
    setIsVisible(false);
  };

  const handleInstallClick = () => {
    setSessionDismissed();
    setIsVisible(false);
  };

  // Không hiển thị trên các trang quản trị (admin) hoặc quy trình thanh toán
  const isExcludedRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/payment');

  if (!isVisible || isExcludedRoute) return null;

  return (
    <aside
      aria-label="Cài đặt ứng dụng StAie"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 sm:right-auto md:left-6 max-w-[calc(100vw-2rem)] sm:w-84 md:w-96 bg-brand-black text-brand-cream border border-brand-taupe/20 rounded-2xl p-4 shadow-2xl z-[95] flex items-center gap-3 animate-fadeInUp"
    >
      <Image
        src="/icons/icon-96x96.png"
        alt="StAie Logo"
        width={48}
        height={48}
        className="h-12 w-12 shrink-0 rounded-xl object-cover bg-white/5"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate text-brand-cream">Cài đặt ứng dụng StAie</p>
        <p className="text-xs text-brand-cream/60 line-clamp-2">Trải nghiệm ứng dụng mượt mà, tiện lợi hơn</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href={APK_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleInstallClick}
          className="bg-brand-gold text-brand-black text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 active:scale-95 transition-all whitespace-nowrap inline-flex items-center justify-center cursor-pointer shadow-sm"
        >
          Cài đặt
        </a>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-brand-cream/40 hover:text-brand-cream/80 text-xs p-1.5 rounded-lg transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          ✕
        </button>
      </div>
    </aside>
  );
}

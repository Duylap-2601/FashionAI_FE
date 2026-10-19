'use client';

import { CookieConsentBanner } from '@/features/analytics/components/cookie-consent-banner';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  GA_MEASUREMENT_ID,
  identifyAnalyticsUser,
  logAnalyticsDebug,
  readAnalyticsConsent,
  setAnalyticsDisabled,
} from '@/lib/analytics';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** Đồng bộ người dùng đăng nhập sang GA4 và hiện banner đồng ý cookie. */
export function AnalyticsBootstrap() {
  const pathname = usePathname() ?? '';
  const status = useAuthStore((state) => state.status);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const tier = useAuthStore((state) => state.user?.tier ?? null);
  const isAdmin = useAuthStore((state) => state.user?.role === 'ADMIN');
  const isAdminArea = isAdmin || pathname.startsWith('/admin');

  useEffect(() => {
    const consent = readAnalyticsConsent();
    logAnalyticsDebug(
      `Measurement ID ${GA_MEASUREMENT_ID || '(chưa cấu hình)'} | consent: ${
        consent ?? 'chưa chọn (chỉ gửi ping không cookie, không hiện trong Realtime)'
      }`,
    );
  }, []);

  // Admin thao tác thử trên shop và xem trang quản trị: không tính vào số liệu khách.
  useEffect(() => {
    setAnalyticsDisabled(isAdminArea);
  }, [isAdminArea]);

  useEffect(() => {
    if (status === 'loading') return;
    identifyAnalyticsUser(userId && tier ? { id: userId, tier } : null);
  }, [status, userId, tier]);

  if (!GA_MEASUREMENT_ID || isAdminArea) return null;
  return <CookieConsentBanner />;
}

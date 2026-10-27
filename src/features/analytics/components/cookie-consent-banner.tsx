'use client';

import {
  OPEN_COOKIE_SETTINGS_EVENT,
  readAnalyticsConsent,
  saveAnalyticsConsent,
  type AnalyticsConsent,
} from '@/lib/analytics';
import { useEffect, useState } from 'react';

/**
 * Hỏi đồng ý cookie phân tích (Consent Mode v2). Chưa chọn thì GA4 chỉ gửi ping
 * không cookie; chọn xong thì lưu lại và không hỏi nữa, trừ khi người dùng mở lại
 * từ link "Cài đặt cookie" ở footer.
 */
export function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(readAnalyticsConsent() === null);
    const open = () => setIsOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, open);
  }, []);

  if (!isOpen) return null;

  const choose = (consent: AnalyticsConsent) => {
    saveAnalyticsConsent(consent);
    setIsOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cài đặt cookie"
      className="fixed inset-x-4 bottom-[calc(76px+env(safe-area-inset-bottom))] z-[95] rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl md:inset-x-auto md:bottom-6 md:left-6 md:max-w-[420px]"
    >
      <p className="text-[13px] font-bold text-brand-navy">Cookie phân tích</p>
      <p className="mt-1 text-[12px] leading-relaxed text-neutral-600">
        StAie. dùng Google Analytics để hiểu cách bạn sử dụng website và cải thiện trải nghiệm mua sắm. Bạn có thể
        đổi lựa chọn bất cứ lúc nào qua mục &quot;Cài đặt cookie&quot; ở cuối trang.
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => choose('denied')}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-[12px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Từ chối
        </button>
        <button
          type="button"
          onClick={() => choose('granted')}
          className="rounded-lg bg-brand-navy px-3 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          Đồng ý
        </button>
      </div>
    </div>
  );
}

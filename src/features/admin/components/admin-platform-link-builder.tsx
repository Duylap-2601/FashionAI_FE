'use client';

import { AnalyticsCard } from '@/features/admin/components/admin-analytics-charts';
import { buildPlatformLink, PLATFORM_LINK_OPTIONS } from '@/features/admin/services/platform-links';
import { Check, Copy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const FIELD_CLASS =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[12px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-navy/20';

export function AdminPlatformLinkBuilder() {
  const [baseUrl, setBaseUrl] = useState('');
  const [campaign, setCampaign] = useState('bio');
  const [copied, setCopied] = useState<string | null>(null);

  // window không có khi SSR; đợi mount rồi lấy domain đang chạy admin.
  useEffect(() => {
    setBaseUrl((current) => current || `${window.location.origin}/`);
  }, []);

  useEffect(() => {
    if (copied === null) return;
    const timer = window.setTimeout(() => setCopied(null), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const links = useMemo(
    () =>
      PLATFORM_LINK_OPTIONS.map((option) => ({
        ...option,
        url: buildPlatformLink({ baseUrl, platform: option.value, campaign }),
      })),
    [baseUrl, campaign],
  );

  const copy = async (url: string) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
    } catch {
      // Trình duyệt chặn clipboard (http hoặc thiếu quyền): để admin copy tay từ ô link.
    }
  };

  return (
    <AnalyticsCard
      title="Tạo link nền tảng"
      description="Gắn UTM để GA4 ghi nhận đúng nền tảng khách đến từ. Dán link vào bio, caption hoặc quảng cáo."
    >
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-[12px] font-medium text-neutral-600">
          Trang đích
          <input
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            spellCheck={false}
            className={FIELD_CLASS}
            placeholder="https://fashion-ai-fe.vercel.app/"
          />
        </label>
        <label className="flex flex-col gap-1 text-[12px] font-medium text-neutral-600">
          Chiến dịch (utm_campaign)
          <input
            value={campaign}
            onChange={(event) => setCampaign(event.target.value)}
            spellCheck={false}
            className={FIELD_CLASS}
            placeholder="bio"
          />
        </label>
      </div>

      <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {links.map((link) => (
          <li
            key={link.value}
            className="flex items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50/60 px-3 py-2"
          >
            <span className="w-16 shrink-0 text-[12px] font-semibold text-neutral-700">{link.label}</span>
            <span
              className="min-w-0 flex-1 truncate font-mono text-[11px] text-neutral-500"
              title={link.url || 'Nhập trang đích hợp lệ'}
            >
              {link.url || '—'}
            </span>
            <button
              type="button"
              onClick={() => copy(link.url)}
              disabled={!link.url}
              className="flex shrink-0 items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied === link.url ? <Check className="h-3 w-3" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
              {copied === link.url ? 'Đã copy' : 'Copy'}
            </button>
          </li>
        ))}
      </ul>
    </AnalyticsCard>
  );
}

export interface PlatformLinkOption {
  value: string;
  label: string;
}

export const PLATFORM_LINK_OPTIONS: readonly PlatformLinkOption[] = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'zalo', label: 'Zalo' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'threads', label: 'Threads' },
  { value: 'x', label: 'X' },
  { value: 'shopee', label: 'Shopee' },
];

/** GA4 hiển thị utm_campaign nguyên văn; bỏ dấu và ký tự lạ để số liệu không bị rác. */
export function normalizeCampaign(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Link chia sẻ lên một nền tảng; rỗng khi trang đích không hợp lệ. */
export function buildPlatformLink({
  baseUrl,
  platform,
  campaign,
  medium = 'social',
}: {
  baseUrl: string;
  platform: string;
  campaign: string;
  medium?: string;
}) {
  const trimmed = baseUrl.trim();
  if (!trimmed) return '';

  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    url.searchParams.set('utm_source', platform);
    url.searchParams.set('utm_medium', medium);
    const campaignValue = normalizeCampaign(campaign);
    if (campaignValue) url.searchParams.set('utm_campaign', campaignValue);
    return url.toString();
  } catch {
    return '';
  }
}

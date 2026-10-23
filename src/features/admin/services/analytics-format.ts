import { NOT_SET_LABEL, SOURCE_DOMAIN_LABELS, SOURCE_LABELS } from '@/features/admin/constants/admin-analytics';

const countFormatter = new Intl.NumberFormat('vi-VN');
const compactFormatter = new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 });
const percentFormatter = new Intl.NumberFormat('vi-VN', { style: 'percent', maximumFractionDigits: 1 });

export function formatCount(value: number) {
  return countFormatter.format(value);
}

/** Số gọn cho trục biểu đồ: 1.200 → 1,2 N. */
export function formatCompact(value: number) {
  return value >= 1000 ? compactFormatter.format(value) : countFormatter.format(value);
}

export function formatPercent(ratio: number) {
  return percentFormatter.format(Number.isFinite(ratio) ? ratio : 0);
}

export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest} giây`;
  return rest === 0 ? `${minutes} phút` : `${minutes} phút ${rest} giây`;
}

/** YYYY-MM-DD → 15/10. */
export function formatShortDate(isoDate: string) {
  const [, month, day] = isoDate.split('-');
  return month && day ? `${day}/${month}` : isoDate;
}

/** YYYY-MM-DD → 15/10/2026. */
export function formatLongDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-');
  return year && month && day ? `${day}/${month}/${year}` : isoDate;
}

/** Thay đổi tương đối so với kỳ trước; null khi kỳ trước bằng 0 (không so được). */
export function percentChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return (current - previous) / previous;
}

export function safeRatio(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : 0;
}

/** Nhãn tiếng Việt cho giá trị GA4; "(not set)" và chuỗi rỗng thành "Không xác định". */
export function labelOf(labels: Record<string, string>, value: string) {
  if (!value || value === '(not set)' || value === '(other)') return NOT_SET_LABEL;
  return labels[value] ?? value;
}

/** Bỏ scheme/đường dẫn và "www." để so tên miền; trả chuỗi rỗng nếu không phải host. */
function toHost(value: string) {
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`);
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Nền tảng từ `sessionSource`: nhận utm_source (facebook, ig, ...) hoặc tên miền
 * giới thiệu (l.facebook.com, accounts.google.com, ...), gộp tên miền con về một nền tảng.
 */
export function platformLabelOf(source: string) {
  const value = source.trim().toLowerCase();
  if (!value || value === '(not set)' || value === '(other)') return NOT_SET_LABEL;

  const host = toHost(value);
  const label = SOURCE_LABELS[value] ?? (host ? SOURCE_LABELS[host] : undefined);
  if (label) return label;

  const domain = host || value;
  const match = SOURCE_DOMAIN_LABELS.find(([suffix]) => domain === suffix || domain.endsWith(`.${suffix}`));
  return match?.[1] ?? domain;
}

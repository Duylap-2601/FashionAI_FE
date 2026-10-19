import type { AnalyticsFeatureEvent, AnalyticsFunnelEvent, AnalyticsRange } from '@/features/admin/types/admin-analytics';

export const ANALYTICS_RANGE_OPTIONS: { value: AnalyticsRange; label: string; days: number }[] = [
  { value: '7d', label: '7 ngày', days: 7 },
  { value: '28d', label: '28 ngày', days: 28 },
  { value: '90d', label: '90 ngày', days: 90 },
];

export const ANALYTICS_REALTIME_REFRESH_MS = 60 * 1000;

export const GA4_CONSOLE_URL = 'https://analytics.google.com/analytics/web/';

export const FUNNEL_LABELS: Record<AnalyticsFunnelEvent, string> = {
  view_item: 'Xem sản phẩm',
  add_to_cart: 'Thêm vào giỏ',
  begin_checkout: 'Bắt đầu thanh toán',
  purchase: 'Mua hàng',
};

export const FEATURE_LABELS: Record<AnalyticsFeatureEvent, string> = {
  try_on_generate: 'Thử đồ AI bằng ảnh',
  live_try_on_start: 'Thử đồ trực tiếp',
  stylist_analyze: 'AI Stylist phân tích',
  chat_message_send: 'Tin nhắn gửi chat AI',
  add_to_wishlist: 'Ghim vào Giá treo đồ',
  search: 'Lượt tìm kiếm',
};

// GA4 trả tên kênh và thiết bị bằng tiếng Anh; giá trị lạ thì giữ nguyên.
export const CHANNEL_LABELS: Record<string, string> = {
  Direct: 'Truy cập trực tiếp',
  'Organic Search': 'Tìm kiếm tự nhiên',
  'Paid Search': 'Tìm kiếm trả phí',
  'Organic Social': 'Mạng xã hội',
  'Paid Social': 'Mạng xã hội trả phí',
  'Organic Video': 'Video',
  Referral: 'Website giới thiệu',
  Email: 'Email',
  Display: 'Quảng cáo hiển thị',
  Unassigned: 'Chưa phân loại',
};

export const DEVICE_LABELS: Record<string, string> = {
  mobile: 'Điện thoại',
  desktop: 'Máy tính',
  tablet: 'Máy tính bảng',
  'smart tv': 'Smart TV',
};

export const NOT_SET_LABEL = 'Không xác định';

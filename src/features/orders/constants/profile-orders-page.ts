import type { BackendOrderStatus } from '@/features/orders/types/orders';

export type OrderStatusTone = 'attention' | 'active' | 'done' | 'closed' | 'error';

/** Màu chấm và chữ cho từng nhóm trạng thái, theo token Atelier Paper. */
export const ORDER_STATUS_TONE_CLASSES: Record<OrderStatusTone, { dot: string; text: string }> = {
  attention: { dot: 'bg-landing-brass', text: 'text-landing-brass-ink' },
  active: { dot: 'bg-landing-oxblood', text: 'text-landing-obsidian' },
  done: { dot: 'bg-landing-sage', text: 'text-landing-sage-ink' },
  closed: { dot: 'bg-landing-taupe', text: 'text-landing-muted' },
  error: { dot: 'bg-destructive', text: 'text-destructive' },
};

/**
 * Nhãn ngắn của trạng thái đơn. `step` là vị trí trên ORDER_STEPS, -1 khi đơn đã dừng.
 * Luồng thật ở backend: CREATED → MEASUREMENT_REVIEW → MEASUREMENT_CONFIRMED → TAILORING →
 * READY_TO_SHIP → SHIPPING → DELIVERED → COMPLETED.
 */
export const STATUS_CONFIG: Record<BackendOrderStatus, { label: string; tone: OrderStatusTone; step: number }> = {
  CREATED: { label: 'Chờ thanh toán', tone: 'attention', step: 0 },
  PENDING_PAYMENT: { label: 'Chờ thanh toán', tone: 'attention', step: 0 },
  PENDING: { label: 'Chờ thanh toán', tone: 'attention', step: 0 },
  PAID: { label: 'Đã thanh toán', tone: 'active', step: 0 },
  CONFIRMED: { label: 'Đã xác nhận', tone: 'active', step: 0 },
  MEASUREMENT_REVIEW: { label: 'Đang duyệt số đo', tone: 'active', step: 1 },
  MEASUREMENT_CONFIRMED: { label: 'Đã chốt số đo', tone: 'active', step: 1 },
  PROCESSING: { label: 'Đang chuẩn bị', tone: 'active', step: 2 },
  TAILORING: { label: 'Đang may', tone: 'active', step: 2 },
  QUALITY_CHECK: { label: 'Kiểm tra chất lượng', tone: 'active', step: 2 },
  READY_TO_SHIP: { label: 'Chờ giao', tone: 'active', step: 3 },
  SHIPPING: { label: 'Đang giao', tone: 'active', step: 3 },
  DELIVERED: { label: 'Đã giao', tone: 'done', step: 4 },
  COMPLETED: { label: 'Hoàn tất', tone: 'done', step: 4 },
  CANCELLED: { label: 'Đã hủy', tone: 'closed', step: -1 },
  RETURN_REQUESTED: { label: 'Yêu cầu hoàn trả', tone: 'attention', step: -1 },
  RETURN_APPROVED: { label: 'Đã duyệt hoàn trả', tone: 'attention', step: -1 },
  RETURNING: { label: 'Đang hoàn trả', tone: 'attention', step: -1 },
  RETURNED: { label: 'Đã hoàn trả', tone: 'closed', step: -1 },
  EXPIRED: { label: 'Hết hạn thanh toán', tone: 'closed', step: -1 },
  FAILED: { label: 'Thanh toán thất bại', tone: 'error', step: -1 },
};

export const ORDER_STEPS = ['Đã đặt', 'Duyệt số đo', 'Đang may', 'Giao hàng', 'Đã nhận'];

/** Mỗi tab lọc gửi đúng một `status` cho GET /orders (backend lọc theo một giá trị). */
export const FILTER_TABS: { id: string; label: string; status?: BackendOrderStatus }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ thanh toán', status: 'CREATED' },
  { id: 'measurement', label: 'Duyệt số đo', status: 'MEASUREMENT_REVIEW' },
  { id: 'tailoring', label: 'Đang may', status: 'TAILORING' },
  { id: 'ready_to_ship', label: 'Chờ giao', status: 'READY_TO_SHIP' },
  { id: 'shipping', label: 'Đang giao', status: 'SHIPPING' },
  { id: 'delivered', label: 'Đã giao', status: 'DELIVERED' },
  { id: 'completed', label: 'Hoàn tất', status: 'COMPLETED' },
  { id: 'cancelled', label: 'Đã hủy', status: 'CANCELLED' },
];

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thanh toán thất bại',
  EXPIRED: 'Hết hạn thanh toán',
  REFUND_REQUIRED: 'Cần hoàn tiền',
  REFUND_PENDING: 'Đang hoàn tiền',
  REFUNDED: 'Đã hoàn tiền',
  PARTIALLY_REFUNDED: 'Đã hoàn một phần',
  COD_COLLECTED: 'Đã thu khi giao',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: 'Thanh toán khi nhận hàng',
  ZALOPAY: 'ZaloPay',
  BANK_TRANSFER: 'Chuyển khoản',
  BANK: 'Chuyển khoản',
  SEPAY: 'Chuyển khoản',
  MOMO: 'MoMo',
};

export const ORDER_IMAGE_FALLBACK = '/images/731163514_999523332788054_1114320478812927640_n.png';

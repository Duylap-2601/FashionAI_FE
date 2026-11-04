import { ORDER_IMAGE_FALLBACK, PAYMENT_METHOD_LABELS } from '@/features/orders/constants/profile-orders-page';
import type { Order, OrderItem } from '@/features/orders/types/orders';

export function formatVnd(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

export function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** "HH:mm dd/MM/yyyy" in local time, for order events, issues and refunds. */
export function formatOrderDateTime(iso?: string | null) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/**
 * Phương thức thanh toán hiển thị: cổng của lần thanh toán đã thành công, rồi cổng khách
 * chọn ở bước thanh toán (`paymentProvider`). `paymentMethod` của đơn luôn là BANK_TRANSFER
 * nên chỉ dùng khi chưa có hai thông tin trên.
 */
export function getPaymentMethodLabel(order: Pick<Order, 'paymentMethod' | 'paymentProvider' | 'payments'>): string {
  const paidProvider = order.payments?.find(payment => payment.status === 'PAID')?.provider;
  const code = paidProvider || order.paymentProvider || order.paymentMethod;
  return (code && PAYMENT_METHOD_LABELS[code]) || code || 'Chưa xác định';
}

export function getOrderCode(order: Pick<Order, 'orderCode'>) {
  return `ORD-${order.orderCode}`;
}

export function getOrderTotal(order: Pick<Order, 'totalVnd' | 'totalAmount'>) {
  return order.totalVnd ?? order.totalAmount;
}

export function getOrderItemName(item: OrderItem) {
  return item.productNameSnapshot || item.product?.name || 'Sản phẩm may đo';
}

export function getOrderItemImage(item: OrderItem): string {
  if (item.productImageSnapshot) return item.productImageSnapshot;
  const images: unknown = item.product?.images;
  try {
    const parsed: unknown = typeof images === 'string' ? JSON.parse(images) : images;
    if (Array.isArray(parsed) && parsed.length > 0) {
      const first: unknown = parsed[0];
      if (typeof first === 'string' && first) return first;
      if (first && typeof first === 'object' && 'url' in first && typeof first.url === 'string') return first.url;
    }
  } catch {
    // Ảnh hỏng thì dùng ảnh dự phòng bên dưới.
  }
  return ORDER_IMAGE_FALLBACK;
}

const SHIPMENT_RAW_STATUS_LABELS: Record<string, string> = {
  ready_to_pick: 'Chờ lấy hàng',
  picking: 'Đang lấy hàng',
  money_collect_picking: 'Đang thu tiền khi lấy hàng',
  picked: 'Đã lấy hàng',
  storing: 'Đang lưu kho',
  sorting: 'Đang phân loại',
  transporting: 'Đang trung chuyển',
  delivering: 'Đang giao hàng',
  money_collect_delivering: 'Đang thu tiền khi giao hàng',
  delivered: 'Đã giao hàng',
  delivery_fail: 'Giao hàng không thành công',
  waiting_to_return: 'Chờ hoàn hàng',
  return: 'Đang hoàn hàng',
  return_transporting: 'Đang trung chuyển hoàn hàng',
  return_sorting: 'Đang phân loại hoàn hàng',
  returning: 'Đang trả hàng',
  return_fail: 'Hoàn hàng không thành công',
  returned: 'Đã hoàn hàng',
  cancel: 'Vận đơn đã hủy',
  exception: 'Vận đơn gặp sự cố',
  lost: 'Thất lạc hàng',
  damage: 'Hàng bị hư hỏng',
  scrap: 'Hàng bị hủy',
};

const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ tạo vận đơn',
  UNKNOWN: 'Chưa rõ',
  CREATED: 'Đã tạo vận đơn',
  READY_TO_PICK: 'Chờ lấy hàng',
  PICKING: 'Đang lấy hàng',
  PICKED: 'Đã lấy hàng',
  SHIPPING: 'Đang vận chuyển',
  IN_TRANSIT: 'Đang vận chuyển',
  DELIVERING: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  DELIVERY_FAILED: 'Giao hàng không thành công',
  RETURNING: 'Đang hoàn hàng',
  RETURNED: 'Đã hoàn hàng',
  CANCELLED: 'Đã hủy',
  FAILED: 'Tạo vận đơn thất bại',
};

export function shipmentStatusLabel(status?: string | null, rawStatus?: string | null): string {
  const raw = (rawStatus ?? '').trim().toLowerCase();
  if (raw) return SHIPMENT_RAW_STATUS_LABELS[raw] ?? raw;
  if (!status) return '—';
  return SHIPMENT_STATUS_LABELS[status] ?? status;
}

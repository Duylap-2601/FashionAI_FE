import { ORDER_IMAGE_FALLBACK } from '@/features/orders/constants/profile-orders-page';
import type { Order, OrderItem } from '@/features/orders/types/orders';

export function formatVnd(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

export function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

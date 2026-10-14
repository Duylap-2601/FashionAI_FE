import type { CartLineInput, ServerCart, ServerCartItem } from '@/features/cart/types/cart-api';
import type { CartItem } from '@/features/cart/types/cart-store';
import { COMBO_OPTIONS } from '@/features/products/constants/product-detail-config';
import type { ComboType } from '@/features/products/types/product-detail-config';

// Khớp giới hạn BE (CartItem / CreateOrderDto).
export const CART_MAX_LINES = 50;
export const CART_MAX_QUANTITY = 1000;

export const EMPTY_SERVER_CART: ServerCart = { items: [], totalItems: 0 };

// BE validate productId bằng IsUUID('4'); sản phẩm mock (id kiểu "p1") sẽ làm hỏng cả request.
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isComboType(value: unknown): value is ComboType {
  return COMBO_OPTIONS.some((option) => option.value === value);
}

export function clampCartQuantity(quantity: number) {
  return Math.min(CART_MAX_QUANTITY, Math.max(1, quantity));
}

export function toCartItem(item: ServerCartItem): CartItem {
  const combo = item.comboType ? COMBO_OPTIONS.find((option) => option.value === item.comboType) : undefined;
  const color = item.color ?? undefined;
  return {
    id: item.id,
    productId: item.productId,
    name: combo ? `${item.product.name} (${combo.label})` : item.product.name,
    variant: color ? `Màu: ${color} · Đặt may theo số đo` : 'Đặt may theo số đo',
    // BE chưa có giá theo phần combo nên giữ giá hiển thị như trang sản phẩm.
    price: combo ? combo.price : item.product.price,
    quantity: item.quantity,
    image: item.product.imageUrl,
    color,
    type: item.comboType ?? undefined,
    available: item.available,
  };
}

export function toCartLineInput(item: Pick<CartItem, 'productId' | 'quantity' | 'color' | 'type'>): CartLineInput {
  return {
    productId: item.productId,
    quantity: item.quantity,
    ...(item.color ? { color: item.color } : {}),
    ...(isComboType(item.type) ? { comboType: item.type } : {}),
  };
}

// Giỏ khách gửi lên để gộp khi đăng nhập.
export function toMergeLines(items: CartItem[]): CartLineInput[] {
  return items
    .filter((item) => UUID_V4.test(item.productId) && item.quantity > 0)
    .slice(0, CART_MAX_LINES)
    .map((item) => toCartLineInput({ ...item, quantity: clampCartQuantity(item.quantity) }));
}

function withTotals(items: ServerCartItem[]): ServerCart {
  return { items, totalItems: items.reduce((sum, item) => sum + item.quantity, 0) };
}

export function setServerItemQuantity(cart: ServerCart, id: string, quantity: number): ServerCart {
  return withTotals(cart.items.map((item) => (item.id === id ? { ...item, quantity } : item)));
}

export function removeServerItem(cart: ServerCart, id: string): ServerCart {
  return withTotals(cart.items.filter((item) => item.id !== id));
}

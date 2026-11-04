import type { CartLineInput, ServerCart, ServerCartItem } from '@/features/cart/types/cart-api';
import type { CartItem } from '@/features/cart/types/cart-store';
import type { AddServerItemVariables } from '@/features/cart/types/cart-sync';
import { COMBO_OPTIONS } from '@/features/products/constants/product-detail-config';
import type { ComboType } from '@/features/products/types/product-detail-config';

// Khớp giới hạn BE (CartItem / CreateOrderDto).
export const CART_MAX_LINES = 50;
export const CART_MAX_QUANTITY = 1000;

export const EMPTY_SERVER_CART: ServerCart = { items: [], totalItems: 0 };

// Id tạm cho dòng vừa thêm, tới khi response của BE thay bằng id thật.
const PENDING_CART_LINE_PREFIX = 'pending:';

export function isPendingCartLine(id: string) {
  return id.startsWith(PENDING_CART_LINE_PREFIX);
}

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
  const sale = item.product.sale;
  return {
    id: item.id,
    productId: item.productId,
    name: combo ? `${item.product.name} (${combo.label})` : item.product.name,
    variant: color ? `Màu: ${color} · Đặt may theo số đo` : 'Đặt may theo số đo',
    // BE chưa có giá theo phần combo nên giữ giá hiển thị như trang sản phẩm.
    price: combo ? combo.price : (sale?.salePrice ?? item.product.price),
    listPrice: combo ? undefined : (sale ? item.product.price : undefined),
    salePercent: combo ? undefined : sale?.percent,
    quantity: item.quantity,
    image: item.product.imageUrl,
    color,
    type: item.comboType ?? undefined,
    available: item.available,
    ...(isPendingCartLine(item.id) ? { pending: true } : {}),
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

// BE gộp theo sản phẩm + màu (không phân biệt hoa thường) + combo.
function isSameLine(item: ServerCartItem, line: CartLineInput) {
  return (
    item.productId === line.productId &&
    (item.color ?? '').toLowerCase() === (line.color ?? '').toLowerCase() &&
    (item.comboType ?? null) === (line.comboType ?? null)
  );
}

/** Thêm vào giỏ server ngay trên cache: cộng vào dòng sẵn có, hoặc thêm một dòng tạm. */
export function addServerItemOptimistic(cart: ServerCart, { line, item }: AddServerItemVariables): ServerCart {
  const existing = cart.items.find((current) => isSameLine(current, line));
  if (existing) return setServerItemQuantity(cart, existing.id, clampCartQuantity(existing.quantity + line.quantity));

  const combo = line.comboType ? COMBO_OPTIONS.find((option) => option.value === line.comboType) : undefined;
  const comboSuffix = combo ? ` (${combo.label})` : '';
  const { listPrice } = item;
  const hasSale = listPrice !== undefined && listPrice > item.price;
  const now = new Date().toISOString();
  return withTotals([
    ...cart.items,
    {
      id: `${PENDING_CART_LINE_PREFIX}${line.productId}:${line.color ?? ''}:${line.comboType ?? ''}`,
      productId: line.productId,
      color: line.color ?? null,
      comboType: line.comboType ?? null,
      quantity: clampCartQuantity(line.quantity),
      available: true,
      product: {
        id: line.productId,
        // toCartItem tự gắn nhãn combo vào tên.
        name: comboSuffix && item.name.endsWith(comboSuffix) ? item.name.slice(0, -comboSuffix.length) : item.name,
        price: hasSale ? listPrice : item.price,
        sale: hasSale ? { percent: item.salePercent ?? 0, salePrice: item.price } : null,
        status: 'ACTIVE',
        category: '',
        garmentType: null,
        colors: null,
        imageUrl: item.image,
      },
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

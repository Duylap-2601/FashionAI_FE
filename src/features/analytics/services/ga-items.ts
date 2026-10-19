import type { CartItem } from '@/features/cart/types/cart-store';
import { COMBO_OPTIONS } from '@/features/products/constants/product-detail-config';
import type { Product } from '@/features/products/types/products';
import type { SuggestedProduct } from '@/features/stylist/types/outfit-suggestion';
import type { GaItem, GaItemList } from '@/lib/analytics';

// Item GA4 phía FE chỉ gồm id/tên/biến thể/giá: category và brand do BE gửi kèm
// purchase từ snapshot đơn hàng, FE đang dùng nhãn hiển thị khác nên không gửi để
// báo cáo theo category không bị tách làm hai.

function toVariant(type?: string, color?: string) {
  return [type, color].filter(Boolean).join(' / ') || undefined;
}

/** Bỏ nhãn combo khỏi tên dòng giỏ để item_name khớp với view_item và purchase. */
function toProductName(item: Pick<CartItem, 'name' | 'type'>) {
  const combo = COMBO_OPTIONS.find((option) => option.value === item.type);
  const suffix = combo ? ` (${combo.label})` : '';
  return suffix && item.name.endsWith(suffix) ? item.name.slice(0, -suffix.length) : item.name;
}

export function productToGaItem(product: Pick<Product, 'id' | 'name' | 'numericPrice'>, quantity = 1): GaItem {
  return { item_id: product.id, item_name: product.name, price: product.numericPrice, quantity };
}

/** Sản phẩm AI gợi ý, kèm list và vị trí trong list (view_item_list / select_item / add_to_cart). */
export function suggestedProductToGaItem(
  product: Pick<SuggestedProduct, 'id' | 'name' | 'price'>,
  list: GaItemList,
  index: number,
): GaItem {
  return { item_id: product.id, item_name: product.name, price: product.price, quantity: 1, index, ...list };
}

export function cartItemToGaItem(
  item: Pick<CartItem, 'productId' | 'name' | 'type' | 'color' | 'price' | 'quantity'>,
  quantity = item.quantity,
): GaItem {
  return {
    item_id: item.productId,
    item_name: toProductName(item),
    item_variant: toVariant(item.type, item.color),
    price: item.price,
    quantity,
  };
}

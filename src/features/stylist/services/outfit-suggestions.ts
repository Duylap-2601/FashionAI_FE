import type { CartItem } from '@/features/cart/types/cart-store';
import { GARMENT_TYPE_TABS } from '@/features/products/constants/product-filters';
import type { GarmentType } from '@/features/products/types/products';
import type {
  OutfitRole,
  OutfitSuggestion,
  OutfitSuggestionItem,
  SuggestedProduct,
  SuggestedProductCategory,
} from '@/features/stylist/types/outfit-suggestion';
import { isRecord } from '@/lib/errors';

// Gợi ý do BE hydrate sẵn, nhưng vẫn lọc phần tử hỏng (payload WS, cache localStorage
// cũ) để một món lỗi không làm vỡ cả khối gợi ý.

const OUTFIT_ROLES: readonly OutfitRole[] = ['outer', 'top', 'dress', 'bottom'];
const CATEGORY_ROLES: Record<SuggestedProductCategory, OutfitRole> = {
  UPPER: 'top',
  LOWER: 'bottom',
  FULL_BODY: 'dress',
};

function isOutfitRole(value: unknown): value is OutfitRole {
  return OUTFIT_ROLES.some((role) => role === value);
}

function isCategory(value: unknown): value is SuggestedProductCategory {
  return Object.keys(CATEGORY_ROLES).some((category) => category === value);
}

function isGarmentType(value: unknown): value is GarmentType {
  return GARMENT_TYPE_TABS.some((tab) => tab.garmentType !== undefined && tab.garmentType === value);
}

function toNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function toPrice(value: unknown): number {
  const price = typeof value === 'string' ? Number(value) : value;
  return typeof price === 'number' && Number.isFinite(price) ? price : 0;
}

function toSuggestedProduct(value: unknown): SuggestedProduct | null {
  if (!isRecord(value)) return null;
  const id = toNonEmptyString(value.id);
  const name = toNonEmptyString(value.name);
  if (!id || !name) return null;
  return {
    id,
    name,
    price: toPrice(value.price),
    image: toNonEmptyString(value.image),
    color: toNonEmptyString(value.color),
    garmentType: isGarmentType(value.garmentType) ? value.garmentType : null,
    category: isCategory(value.category) ? value.category : 'UPPER',
    available: value.available !== false,
  };
}

function toOutfitItem(value: unknown): OutfitSuggestionItem | null {
  if (!isRecord(value)) return null;
  const product = toSuggestedProduct(value.product);
  if (!product) return null;
  return {
    role: isOutfitRole(value.role) ? value.role : CATEGORY_ROLES[product.category],
    note: toNonEmptyString(value.note),
    product,
  };
}

export function toSuggestedProducts(value: unknown): SuggestedProduct[] {
  if (!Array.isArray(value)) return [];
  return value.map(toSuggestedProduct).filter((product): product is SuggestedProduct => product !== null);
}

export function toOutfitSuggestions(value: unknown): OutfitSuggestion[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).flatMap((outfit) => {
    const items = Array.isArray(outfit.items)
      ? outfit.items.map(toOutfitItem).filter((item): item is OutfitSuggestionItem => item !== null)
      : [];
    if (items.length === 0) return [];
    return [{
      name: typeof outfit.name === 'string' ? outfit.name : '',
      reason: typeof outfit.reason === 'string' ? outfit.reason : '',
      items,
      extras: Array.isArray(outfit.extras)
        ? outfit.extras.filter((extra): extra is string => typeof extra === 'string' && extra.trim() !== '')
        : [],
      totalPrice: typeof outfit.totalPrice === 'number' && Number.isFinite(outfit.totalPrice)
        ? outfit.totalPrice
        : items.reduce((sum, item) => sum + (item.product.available ? item.product.price : 0), 0),
    }];
  });
}

/** Sản phẩm còn bán theo thứ tự hiển thị (các bộ phối rồi tới món lẻ), mỗi sản phẩm một lần. */
export function collectSuggestedProducts(outfits: OutfitSuggestion[], products: SuggestedProduct[] = []) {
  const seen = new Set<string>();
  return [...outfits.flatMap((outfit) => outfit.items.map((item) => item.product)), ...products]
    .filter((product) => {
      if (!product.available || seen.has(product.id)) return false;
      seen.add(product.id);
      return true;
    });
}

/** Dòng giỏ cho sản phẩm gợi ý, giống thêm nhanh sản phẩm liên quan ở trang chi tiết. */
export function suggestedProductToCartItem(product: SuggestedProduct): Omit<CartItem, 'id'> {
  const color = product.color ?? undefined;
  return {
    productId: product.id,
    name: product.name,
    price: product.price,
    quantity: 1,
    image: product.image ?? '',
    color,
    variant: `Màu: ${color || 'Mặc định'} · May đo`,
  };
}

/**
 * Đường dẫn Phòng thử cho một bộ phối. Phòng thử nhận tối đa 2 món (áo + quần/váy, hoặc một
 * chiếc đầm) qua cùng tham số `rackIds` mà Giá treo đồ dùng: bộ có đầm thì thử đầm, không thì
 * thử lớp áo ngoài cùng (áo khoác/blazer trước, rồi tới áo) với quần/váy. Null khi không còn món nào bán.
 */
export function outfitTryOnHref(outfit: OutfitSuggestion): string | null {
  const available = outfit.items.filter((item) => item.product.available);
  const pick = (role: OutfitSuggestion['items'][number]['role']) => available.find((item) => item.role === role);

  const dress = pick('dress');
  const ids = dress
    ? [dress.product.id]
    : [(pick('outer') ?? pick('top'))?.product.id, pick('bottom')?.product.id].filter((id): id is string => Boolean(id));
  if (ids.length === 0) return null;
  return ids.length === 1 ? `/try-on?productId=${ids[0]}` : `/try-on?rackIds=${ids.join(',')}`;
}

import type { Product } from '@/features/products/types/products';
import type { BackendProduct } from '@/features/products/types/products-hook';

export function parseImages(product: BackendProduct): string[] {
  const list: string[] = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    // isMain lên đầu để ảnh đại diện (gallery[0]) luôn đúng, tránh rơi vào ảnh
    // placeholder cũ (raw.githubusercontent) nằm trước ảnh isMain trong mảng gốc.
    const sorted = [...product.images].sort((a, b) => {
      const aMain = typeof a === 'object' && a?.isMain ? 1 : 0;
      const bMain = typeof b === 'object' && b?.isMain ? 1 : 0;
      return bMain - aMain;
    });
    sorted.forEach((item) => {
      if (typeof item === 'string') {
        list.push(item);
      } else if (item && typeof item === 'object') {
        const url = item.imageUrl || item.url;
        if (url) list.push(url);
      }
    });
  }
  if (list.length === 0 && product.garmentUrl) {
    list.push(product.garmentUrl);
  }
  if (list.length === 0) {
    list.push('/images/731163514_999523332788054_1114320478812927640_n.png');
  }
  return list;
}

export function parseColors(product: BackendProduct): { name: string; hex: string }[] {
  if (Array.isArray(product.colors) && product.colors.length > 0) {
    return product.colors.map((c) => {
      if (typeof c === 'string') {
        return { name: c, hex: guessColorHex(c) };
      }
      return { name: c.name || 'Mặc định', hex: c.hex || guessColorHex(c.name || '') };
    });
  }
  if (product.color) {
    return [{ name: product.color, hex: guessColorHex(product.color) }];
  }
  return [
    { name: 'Đen', hex: '#111111' },
    { name: 'Trắng', hex: '#FFFFFF' },
  ];
}

export function mapProduct(product: BackendProduct): Product {
  const gallery = parseImages(product);
  const mainImage = gallery[0];
  const priceNumber = Number(product.price);
  const origPriceNumber = product.originalPrice ? Number(product.originalPrice) : undefined;
  const colors = parseColors(product);

  return {
    id: product.id,
    name: product.name,
    brand: product.brand || 'StAle. SIGNATURE',
    price: Number.isFinite(priceNumber) ? `${priceNumber.toLocaleString('vi-VN')} ₫` : `${product.price}`,
    numericPrice: Number.isFinite(priceNumber) ? priceNumber : 0,
    originalPrice: origPriceNumber,
    originalPriceFormatted: origPriceNumber ? `${origPriceNumber.toLocaleString('vi-VN')} ₫` : undefined,
    category: mapCategory(product.category),
    garmentCategory: toBackendCategory(product.category),
    image: mainImage,
    gallery,
    colors,
    isGuest: false,
    description: product.description || undefined,
    material: product.material || undefined,
    stock: typeof product.stock === 'number' ? product.stock : 99,
    soldCount: typeof product.soldCount === 'number' ? product.soldCount : undefined,
    rating: product.avgRating != null ? Number(product.avgRating) : undefined,
    reviewCount: typeof product.reviewCount === 'number' ? product.reviewCount : undefined,
  };
}

export function toBackendCategory(cat?: string | null): 'UPPER' | 'LOWER' | 'FULL_BODY' {
  if (!cat) return 'UPPER';
  const c = cat.trim();
  const cUpper = c.toUpperCase();
  if (
    c === 'Suit đầy đủ' ||
    cUpper.includes('FULL_BODY') ||
    cUpper.includes('SUIT') ||
    cUpper.includes('ONE-PIECE') ||
    cUpper.includes('TOAN THAN') ||
    cUpper.includes('COMBO')
  ) {
    return 'FULL_BODY';
  }
  if (
    c === 'Quần & Váy' ||
    cUpper.includes('LOWER') ||
    cUpper.includes('BOTTOM') ||
    cUpper.includes('QUAN') ||
    cUpper.includes('VAY')
  ) {
    return 'LOWER';
  }
  return 'UPPER';
}

export function mapCategory(category?: string | null): string {
  if (!category) return 'Áo';
  const c = category.toUpperCase();
  if (c.includes('FULL_BODY') || c.includes('ONE-PIECE') || c.includes('SUIT') || c.includes('TOAN THAN')) {
    return 'Suit đầy đủ';
  }
  if (c.includes('LOWER') || c.includes('BOTTOM') || c.includes('QUAN') || c.includes('VAY')) {
    return 'Quần & Váy';
  }
  if (c.includes('UPPER') || c.includes('TOP') || c.includes('AO') || c.includes('BLAZER') || c.includes('SHIRT')) {
    return 'Áo';
  }
  return category;
}

export function guessColorHex(color: string) {
  const normalized = color.toLowerCase();
  if (normalized.includes('navy') || normalized.includes('xanh')) return '#1f2a44';
  if (normalized.includes('trang') || normalized.includes('white')) return '#ffffff';
  if (normalized.includes('den') || normalized.includes('black')) return '#111111';
  if (normalized.includes('khaki') || normalized.includes('be') || normalized.includes('kem')) return '#c8ad7f';
  if (normalized.includes('xam') || normalized.includes('gray') || normalized.includes('grey')) return '#5E6469';
  if (normalized.includes('burgundy') || normalized.includes('do') || normalized.includes('red')) return '#5D1C34';
  return '#8b8f98';
}

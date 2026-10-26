import type { BackendRackProduct } from '@/features/rack/types/rack';

export const RACK_IMAGE_FALLBACK = '/images/731163514_999523332788054_1114320478812927640_n.png';

/** Ảnh chính của sản phẩm trên giá treo: ảnh `isMain`, rồi ảnh đầu, rồi ảnh garment. */
export function getRackProductImage(product: BackendRackProduct): string {
  if (Array.isArray(product?.images) && product.images.length > 0) {
    const main = product.images.find((img) => typeof img === 'object' && img?.isMain);
    if (main && typeof main === 'object') {
      const url = main.imageUrl || main.url;
      if (url) return url;
    }
    const first = product.images[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object') {
      const url = first.imageUrl || first.url;
      if (url) return url;
    }
  }
  if (product?.garmentUrl) return product.garmentUrl;
  return RACK_IMAGE_FALLBACK;
}

export function formatRackPrice(price: string | number): string {
  const num = Number(price);
  return Number.isFinite(num) ? `${num.toLocaleString('vi-VN')}đ` : String(price || '0');
}

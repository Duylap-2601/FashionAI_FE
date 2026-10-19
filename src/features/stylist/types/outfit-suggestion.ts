import type { GarmentType } from '@/features/products/types/products';

/** Vị trí món đồ trong bộ phối; BE suy ra từ garmentType/category và đã sắp theo thứ tự này. */
export type OutfitRole = 'outer' | 'top' | 'dress' | 'bottom';

export type SuggestedProductCategory = 'UPPER' | 'LOWER' | 'FULL_BODY';

/** Sản phẩm thật trong catalog do AI gợi ý (AI Stylist và AI Chat), BE đã hydrate sẵn. */
export interface SuggestedProduct {
  id: string;
  name: string;
  /** VND. */
  price: number;
  image: string | null;
  /** Màu mặc định khi thêm vào giỏ; null = sản phẩm không khai báo màu, không gửi color. */
  color: string | null;
  garmentType: GarmentType | null;
  category: SuggestedProductCategory;
  /** false khi sản phẩm đã ngừng bán (lịch sử cũ): không thêm vào giỏ, không tính vào tổng. */
  available: boolean;
}

export interface OutfitSuggestionItem {
  role: OutfitRole;
  note: string | null;
  product: SuggestedProduct;
}

export interface OutfitSuggestion {
  name: string;
  reason: string;
  items: OutfitSuggestionItem[];
  /** Phụ kiện ngoài catalog, chỉ hiển thị dạng chữ. */
  extras: string[];
  /** Tổng giá các món còn bán (BE đã bỏ món ngừng bán). */
  totalPrice: number;
}

/** Một cách thử bộ phối trong Phòng thử: tối đa 1 áo + 1 quần/váy, hoặc 1 đầm. */
export interface OutfitTryOnOption {
  href: string;
  /** Món sẽ được thử, áo trước. */
  products: SuggestedProduct[];
}

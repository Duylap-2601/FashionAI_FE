import type { ComboType } from '@/features/products/types/product-detail-config';

export type CartProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface ServerCartProduct {
  id: string;
  name: string;
  price: number;
  sale: { percent: number; salePrice: number } | null;
  status: CartProductStatus;
  category: string;
  garmentType: string | null;
  colors: unknown;
  imageUrl: string;
}

export interface ServerCartItem {
  id: string;
  productId: string;
  color: string | null;
  comboType: ComboType | null;
  quantity: number;
  available: boolean;
  product: ServerCartProduct;
  createdAt: string;
  updatedAt: string;
}

export interface ServerCart {
  items: ServerCartItem[];
  totalItems: number;
}

export type CartMergeSkipReason = 'PRODUCT_UNAVAILABLE' | 'INVALID_COLOR' | 'CART_LINE_LIMIT';

export interface CartMergeSkippedLine {
  productId: string;
  color: string | null;
  comboType: ComboType | null;
  reason: CartMergeSkipReason;
}

export interface MergeCartResponse extends ServerCart {
  skipped: CartMergeSkippedLine[];
}

// Body gửi BE: chỉ các field BE whitelist (ValidationPipe forbidNonWhitelisted).
export interface CartLineInput {
  productId: string;
  quantity: number;
  color?: string;
  comboType?: ComboType;
}

export interface MergeCartBody {
  items: CartLineInput[];
}

export interface UpdateCartItemBody {
  quantity: number;
}

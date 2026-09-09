export interface BackendRackProduct {
  id: string;
  name: string;
  brand?: string | null;
  category: string;
  price: string | number;
  originalPrice?: string | number | null;
  images?: ({ imageUrl?: string; url?: string; isMain?: boolean } | string)[] | null;
  garmentUrl?: string | null;
  description?: string | null;
}

export interface RackItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: BackendRackProduct;
}

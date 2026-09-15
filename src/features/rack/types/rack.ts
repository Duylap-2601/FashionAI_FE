export interface BackendRackProduct {
  id: string;
  name: string;
  brand?: string | null;
  category: string;
  garmentType?: string | null;
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

export interface CanvasPlacedItem {
  instanceId: string;
  rackItem: RackItem;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
  rotation?: number;
}

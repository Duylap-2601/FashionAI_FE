export interface BackendProduct {
  id: string;
  name: string;
  description?: string | null;
  material?: string | null;
  category: string;
  brand?: string | null;
  color?: string | null;
  colors?: ({ name: string; hex?: string } | string)[] | null;
  price: string | number;
  originalPrice?: string | number | null;
  stock?: number | null;
  soldCount?: number | null;
  garmentUrl?: string | null;
  images?: ({ imageUrl?: string; url?: string; isMain?: boolean } | string)[] | null;
  avgRating?: number | string | null;
  reviewCount?: number | null;
}

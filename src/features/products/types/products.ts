export interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  numericPrice: number;
  originalPrice?: number;
  originalPriceFormatted?: string;
  category: string;
  garmentCategory?: 'UPPER' | 'LOWER' | 'FULL_BODY';
  image: string;
  gallery: string[];
  colors: { name: string; hex: string }[];
  isGuest: boolean;
  description?: string;
  material?: string;
  stock?: number;
  soldCount?: number;
  isNew?: boolean;
  rating?: number;
  reviewCount?: number;
}

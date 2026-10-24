export type GarmentType = 'SHIRT' | 'VEST' | 'JACKET' | 'PANTS' | 'SKIRT' | 'DRESS' | 'JUMPSUIT';

export type LayerRole = 'OUTER' | 'INNER' | 'BASE' | 'BOTTOM';

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
  garmentType?: GarmentType;
  layerRole?: LayerRole | null;
  image: string;
  gallery: string[];
  imageItems?: { url: string; colorName?: string | null; isMain?: boolean }[];
  colors: { name: string; hex: string }[];
  isGuest: boolean;
  description?: string;
  material?: string;
  soldCount?: number;
  isNew?: boolean;
  rating?: number;
  reviewCount?: number;
}

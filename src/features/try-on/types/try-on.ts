export interface TryOnGarment {
  category: 'UPPER' | 'LOWER' | 'FULL_BODY' | string;
  productId?: string | null;
  image?: string | null;
}

export interface TryOnResult {
  id: string;
  productId?: string;
  category: string;
  resultUrl: string;
  garments?: TryOnGarment[];
  mode?: string;
  createdAt: string;
  isCached?: boolean;
  isCacheHit?: boolean;
  product?: {
    name: string;
    price: number;
  };
}

export interface GarmentSlotInput {
  garmentCategory: 'UPPER' | 'LOWER' | 'FULL_BODY';
  productId?: string;
  garmentImage?: File;
  imageUrl?: string;
}

export interface TryOnRequest {
  humanImage: File;
  garments?: GarmentSlotInput[];
  // Backward compatibility for single garment
  productId?: string;
  garmentImage?: File;
  garmentCategory?: 'UPPER' | 'LOWER' | 'FULL_BODY';
}

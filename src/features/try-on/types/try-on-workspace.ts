import type { Product } from '@/features/products/types/products';
import type { GarmentMode } from '@/features/try-on/types/try-on-types';

export interface TryOnWorkspaceProps {
  userPhotoUrl: string | null;
  garmentMode: GarmentMode;
  selectedProduct: Product;
  upperProduct: Product | null;
  lowerProduct: Product | null;
  onFileSelect: (file: File | null) => void;
  onCameraSelect: () => void;
  onUseMockPhoto: () => void;
  onModeChange: (mode: GarmentMode) => void;
  onOpenCatalog: (slot: 'single' | 'upper' | 'lower') => void;
}

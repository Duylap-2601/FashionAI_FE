import type { Product } from '@/features/products/types/products';
import type { CatalogSlot, GarmentMode } from '@/features/try-on/types/try-on-types';

export interface TryOnWorkspaceProps {
  userPhotoUrl: string | null;
  resultPhotoUrl: string | null;
  resultSourcePhotoUrl: string | null;
  isLoading: boolean;
  inputError: string | null;
  garmentMode: GarmentMode;
  selectedProduct: Product;
  selectedColor?: string | null;
  outerProduct?: Product | null;
  upperProduct: Product | null;
  lowerProduct: Product | null;
  outerColor?: string | null;
  upperColor?: string | null;
  lowerColor?: string | null;
  onSelectColor?: (color: string) => void;
  onSelectOuterColor?: (color: string) => void;
  onSelectUpperColor?: (color: string) => void;
  onSelectLowerColor?: (color: string) => void;
  onClearOuter?: () => void;
  canGenerate: boolean;
  isSubmitting: boolean;
  isBlocked: boolean;
  quotaCost: number;
  onFileSelect: (file: File | null) => void;
  onCameraSelect: () => void;
  onUseMockPhoto: () => void;
  onModeChange: (mode: GarmentMode) => void;
  onOpenCatalog: (slot: CatalogSlot) => void;
  onGenerate: () => void;
  onDownload: () => void;
  onShare: () => void;
  onTryAnother: () => void;
  onChangePhoto: () => void;
}

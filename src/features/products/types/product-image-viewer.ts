export interface ProductImageViewerProps {
  images: string[];
  productName: string;
  brand?: string;
  activeThumb: number;
  onSelectThumb: (index: number) => void;
  fallbackImage?: string;
}

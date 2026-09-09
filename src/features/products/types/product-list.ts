import type { Product } from '@/features/products/types/products';
import React from 'react';

export interface ProductListProps {
  apiProductsLength: number;
  isError: boolean;
  isLoading: boolean;
  isSidebarOpen: boolean;
  filteredProducts: Product[];
  visibleProducts: Product[];
  hasMoreProducts: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isPinned: (productId: string) => boolean;
  onRetry: () => void;
  onClearAll: () => void;
  onLoadMore: () => void;
  onToggleRack: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

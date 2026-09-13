import type { Product } from '@/features/products/types/products';
import React from 'react';

export interface ProductListProps {
  apiProductsLength: number;
  isError: boolean;
  isLoading: boolean;
  isFetching?: boolean;
  isFetchingNextPage?: boolean;
  isMobile: boolean;
  isSidebarOpen: boolean;
  products: Product[];
  totalCount: number;
  hasMoreProducts: boolean;
  currentPage: number;
  totalPages: number;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isPinned: (productId: string) => boolean;
  onRetry: () => void;
  onClearAll: () => void;
  onLoadMore: () => void;
  onPageChange: (page: number) => void;
  onToggleRack: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

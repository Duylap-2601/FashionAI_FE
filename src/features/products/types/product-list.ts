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
  onRetry: () => void;
  onClearAll: () => void;
  onLoadMore: () => void;
  onPageChange: (page: number) => void;
  onAddToCart: (product: Product) => void;
}

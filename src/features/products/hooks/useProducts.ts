'use client';

import { queryKeys as productsQueryKeys } from '@/features/products/services/query-keys';
import { fetchProduct, fetchProducts } from '@/features/products/services/queries';
import type { Product } from '@/features/products/types/products';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useProducts() {
  const query = useQuery<Product[]>({
    queryKey: productsQueryKeys.products(),
    queryFn: fetchProducts,
  });

  return {
    products: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useProduct(id?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Product>({
    queryKey: productsQueryKeys.product(id),
    queryFn: () => fetchProduct(id),
    enabled: !!id,
    initialData: () => {
      if (!id) return undefined;
      const cached = queryClient.getQueryData<Product[]>(productsQueryKeys.products());
      return cached?.find(p => p.id === id);
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(productsQueryKeys.products())?.dataUpdatedAt,
  });

  return {
    product: query.data,
    isLoading: query.isLoading && !query.data,
    isError: query.isError,
    refetch: query.refetch,
  };
}

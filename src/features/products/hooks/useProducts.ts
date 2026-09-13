'use client';

import { queryKeys as productsQueryKeys } from '@/features/products/services/query-keys';
import { fetchProduct, fetchProductsPage, normalizeProductListParams } from '@/features/products/services/queries';
import type { Product } from '@/features/products/types/products';
import {
  DEFAULT_PRODUCT_LIST_META,
  type ProductListParams,
  type ProductListResult,
} from '@/features/products/types/products-hook';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';

export function useProducts(params: ProductListParams = {}) {
  const enabled = params.enabled ?? true;
  const queryParams = normalizeProductListParams({ page: 1, limit: 100, ...params });
  const query = useQuery<ProductListResult>({
    queryKey: productsQueryKeys.products('page', queryParams),
    queryFn: () => fetchProductsPage({ page: 1, limit: 100, ...params }),
    enabled,
  });

  return {
    products: query.data?.products || [],
    meta: query.data?.meta || {
      ...DEFAULT_PRODUCT_LIST_META,
      page: params.page ?? 1,
      limit: params.limit ?? 100,
    },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useInfiniteProducts(params: Omit<ProductListParams, 'page'> = {}) {
  const enabled = params.enabled ?? true;
  const queryParams = normalizeProductListParams(params);
  const query = useInfiniteQuery<ProductListResult>({
    queryKey: productsQueryKeys.products('infinite', queryParams),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchProductsPage({ ...params, page: Number(pageParam) }),
    getNextPageParam: (lastPage) => (
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined
    ),
    enabled,
  });

  const pages = query.data?.pages || [];
  const meta = pages[pages.length - 1]?.meta || {
    ...DEFAULT_PRODUCT_LIST_META,
    limit: params.limit ?? DEFAULT_PRODUCT_LIST_META.limit,
  };

  return {
    products: pages.flatMap((page) => page.products),
    meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}

export function useProductCatalog(limit = 100) {
  return useProducts({ page: 1, limit });
}

export function useProduct(id?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Product>({
    queryKey: productsQueryKeys.product(id),
    queryFn: () => fetchProduct(id),
    enabled: !!id,
    initialData: () => {
      if (!id) return undefined;
      const cachedQueries = queryClient.getQueriesData<ProductListResult>({
        queryKey: productsQueryKeys.products(),
      });

      for (const [, cached] of cachedQueries) {
        const found = cached?.products?.find(p => p.id === id);
        if (found) return found;
      }

      const legacyCached = queryClient.getQueryData<Product[]>(productsQueryKeys.products());
      return legacyCached?.find(p => p.id === id);
    },
  });

  return {
    product: query.data,
    isLoading: query.isLoading && !query.data,
    isError: query.isError,
    refetch: query.refetch,
  };
}

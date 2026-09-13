import { mapProduct } from '@/features/products/services/products-utils';
import {
  DEFAULT_PRODUCT_LIST_META,
  type BackendProduct,
  type ProductListParams,
  type ProductListResult,
} from '@/features/products/types/products-hook';
import { api } from '@/lib/api';

export function normalizeProductListParams(params: ProductListParams = {}) {
  const queryParams: Partial<ProductListParams> = { ...params };
  delete queryParams.enabled;
  return Object.fromEntries(
    Object.entries(queryParams).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

export async function fetchProductsPage(params: ProductListParams = {}): Promise<ProductListResult> {
  const queryParams = normalizeProductListParams(params);
  const res = await api.get('/products', { params: queryParams });
  const rawList = Array.isArray(res.data) ? res.data : res.data?.items || [];
  const responseMeta = (res as typeof res & { meta?: unknown }).meta as Partial<ProductListResult['meta']> | undefined;
  const fallbackLimit = Number(queryParams.limit) || DEFAULT_PRODUCT_LIST_META.limit;
  const fallbackPage = Number(queryParams.page) || DEFAULT_PRODUCT_LIST_META.page;

  return {
    products: (rawList as BackendProduct[]).map(mapProduct),
    meta: {
      total: Number(responseMeta?.total ?? rawList.length),
      page: Number(responseMeta?.page ?? fallbackPage),
      limit: Number(responseMeta?.limit ?? fallbackLimit),
      totalPages: Math.max(1, Number(responseMeta?.totalPages ?? Math.ceil(rawList.length / fallbackLimit))),
    },
  };
}

export async function fetchProducts(params: ProductListParams = {}) {
  const result = await fetchProductsPage({ page: 1, limit: 100, ...params });
  return result.products;
}

export async function fetchProduct(id: string | undefined) {
  const res = await api.get(`/products/${id}`);
  return mapProduct(res.data as BackendProduct);
}

export { queryKeys } from './query-keys';

import { mapProduct } from '@/features/products/services/products-utils';
import {
  DEFAULT_PRODUCT_LIST_META,
  type BackendProduct,
  type ProductListParams,
  type ProductListResult,
} from '@/features/products/types/products-hook';
import { http } from '@/lib/http';

export function normalizeProductListParams(params: ProductListParams = {}) {
  const queryParams: Partial<ProductListParams> = { ...params };
  delete queryParams.enabled;
  return Object.fromEntries(
    Object.entries(queryParams).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

export async function fetchProductsPage(params: ProductListParams = {}): Promise<ProductListResult> {
  const queryParams = normalizeProductListParams(params);
  const data = await http.get<(BackendProduct[] & { __meta?: Partial<ProductListResult['meta']> }) | { items?: BackendProduct[]; __meta?: Partial<ProductListResult['meta']> }>('/products', { params: queryParams });
  const rawList = Array.isArray(data) ? data : data.items || [];
  const responseMeta = data.__meta;
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
  const data = await http.get<BackendProduct>(`/products/${id}`);
  return mapProduct(data);
}

export { queryKeys } from './query-keys';

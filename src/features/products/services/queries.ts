import { mapProduct } from '@/features/products/services/products-utils';
import type { BackendProduct } from '@/features/products/types/products-hook';
import { api } from '@/lib/api';

export async function fetchProducts() {
  const res = await api.get('/products', { params: { limit: 100 } });
  const rawList = Array.isArray(res.data) ? res.data : res.data?.items || [];
  return (rawList as BackendProduct[]).map(mapProduct);
}

export async function fetchProduct(id: string | undefined) {
  const res = await api.get(`/products/${id}`);
  return mapProduct(res.data as BackendProduct);
}

export { queryKeys } from './query-keys';

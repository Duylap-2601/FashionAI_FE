import { mapProduct } from '@/features/products/services/products-utils';
import type { BackendProduct } from '@/features/products/types/products-hook';
import { http } from '@/lib/http';

export async function fetchProducts() {
  const data = await http.get<BackendProduct[] | { items?: BackendProduct[] }>('/products', { params: { limit: 100 } });
  const rawList = Array.isArray(data) ? data : data.items || [];
  return (rawList as BackendProduct[]).map(mapProduct);
}

export async function fetchProduct(id: string | undefined) {
  const data = await http.get<BackendProduct>(`/products/${id}`);
  return mapProduct(data);
}

export { queryKeys } from './query-keys';

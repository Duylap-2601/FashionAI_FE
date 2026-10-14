import type { ServerCart } from '@/features/cart/types/cart-api';
import { http } from '@/lib/http';

export async function fetchCart(): Promise<ServerCart> {
  return http.get<ServerCart>('/cart');
}

export { queryKeys } from './query-keys';

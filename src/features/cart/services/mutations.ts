import type {
  CartLineInput,
  MergeCartBody,
  MergeCartResponse,
  ServerCart,
  UpdateCartItemBody,
} from '@/features/cart/types/cart-api';
import { http } from '@/lib/http';

export async function addCartItem(body: CartLineInput) {
  return http.post<ServerCart, CartLineInput>('/cart/items', body);
}

export async function updateCartItem({ id, quantity }: { id: string; quantity: number }) {
  return http.patch<ServerCart, UpdateCartItemBody>(`/cart/items/${id}`, { quantity });
}

export async function removeCartItem(id: string) {
  return http.delete<ServerCart>(`/cart/items/${id}`);
}

export async function clearServerCart() {
  return http.delete<ServerCart>('/cart');
}

export async function mergeCart(body: MergeCartBody) {
  return http.post<MergeCartResponse, MergeCartBody>('/cart/merge', body);
}

export { mutationKeys } from './mutation-keys';

import type { PatchOrdersStatusInput, PatchUsersInput, PutProductsInput } from '@/features/admin/types/requests';
import { api } from '@/lib/api';
import type { AxiosRequestConfig } from 'axios';

export function deleteProductImage(productId: string, imageId: string) {
  return api.delete(`/products/${productId}/images/${imageId}`);
}

export function updateProduct(id: string, payload: PutProductsInput) {
  return api.put(`/products/${id}`, payload);
}

export function uploadProductImage(id: string, payload: FormData, config: AxiosRequestConfig) {
  return api.post(`/products/${id}/images`, payload, config);
}

export function createProduct(payload: FormData, config: AxiosRequestConfig) {
  return api.post('/products', payload, config);
}

export function deleteProduct(id: string) {
  return api.delete(`/products/${id}`);
}

export function updateOrderStatus(id: string, payload: PatchOrdersStatusInput) {
  return api.patch(`/orders/${id}/status`, payload);
}

export function updateUser(id: string, payload: PatchUsersInput) {
  return api.patch(`/users/${id}`, payload);
}

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

export function createShipment(id: string, payload?: { requestKey?: string }, config?: AxiosRequestConfig) {
  return api.post(`/orders/${id}/shipment`, payload || {}, config);
}

export function syncAdminShipment(id: string) {
  return api.post(`/admin/shipments/${id}/sync`, {});
}

export function cancelAdminShipment(id: string, payload?: { reason?: string }) {
  return api.post(`/admin/shipments/${id}/cancel`, payload || {});
}

export function simulateAdminShipmentStatus(id: string, payload: { status: string; reason?: string }) {
  return api.post(`/internal/staging/shipments/${id}/status`, payload);
}

export function confirmManualPayment(orderCode: number, payload: { reference: string; note: string }) {
  return api.post(`/payments/admin/orders/${orderCode}/confirm-manual`, payload);
}

export function updateOrderRefund(id: string, payload: { refundStatus: string; evidence?: Record<string, unknown>; internalNote?: string }) {
  return api.patch(`/orders/${id}/refund`, payload);
}

export function resolveWebhookFailure(id: string) {
  return api.patch(`/payments/admin/webhook-failures/${id}/resolve`);
}

export function updateGhnPickupSettings(payload: { provinceId: number; districtId: number; wardCode: string }) {
  return api.put('/admin/settings/ghn-pickup', payload);
}

export function updateUser(id: string, payload: PatchUsersInput) {
  return api.patch(`/users/${id}`, payload);
}

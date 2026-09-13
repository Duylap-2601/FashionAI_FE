import type { PatchOrdersStatusInput, PatchUsersInput, PutProductsInput } from '@/features/admin/types/requests';
import { api } from '@/lib/api';
import { http, type HttpOptions } from '@/lib/http';

export function deleteProductImage(productId: string, imageId: string) {
  return http.delete(`/products/${productId}/images/${imageId}`);
}

export function updateProduct(id: string, payload: PutProductsInput) {
  return api.put(`/products/${id}`, payload);
}

export function uploadProductImage(id: string, payload: FormData, config: HttpOptions) {
  return http.post(`/products/${id}/images`, payload, config);
}

export function createProduct(payload: FormData, config: HttpOptions) {
  return http.post('/products', payload, config);
}

export function deleteProduct(id: string) {
  return http.delete(`/products/${id}`);
}

export function updateOrderStatus(id: string, payload: PatchOrdersStatusInput) {
  return http.patch(`/orders/${id}/status`, payload);
}

export function createShipment(id: string, payload?: { requestKey?: string }, config?: HttpOptions) {
  return http.post(`/orders/${id}/shipment`, payload || {}, config);
}

export function syncAdminShipment(id: string) {
  return http.post(`/admin/shipments/${id}/sync`, {});
}

export function cancelAdminShipment(id: string, payload?: { reason?: string }) {
  return http.post(`/admin/shipments/${id}/cancel`, payload || {});
}

export function simulateAdminShipmentStatus(id: string, payload: { status: string; reason?: string }) {
  return http.post(`/internal/staging/shipments/${id}/status`, payload);
}

export function confirmManualPayment(orderCode: number, payload: { reference: string; note: string }) {
  return http.post(`/payments/admin/orders/${orderCode}/confirm-manual`, payload);
}

export function updateOrderRefund(id: string, payload: { refundStatus: string; evidence?: Record<string, unknown>; internalNote?: string }) {
  return http.patch(`/orders/${id}/refund`, payload);
}

export function resolveWebhookFailure(id: string) {
  return http.patch(`/payments/admin/webhook-failures/${id}/resolve`);
}

export function updateGhnPickupSettings(payload: { provinceId: number; districtId: number; wardCode: string }) {
  return api.put('/admin/settings/ghn-pickup', payload);
}

export function updateUser(id: string, payload: PatchUsersInput) {
  return http.patch(`/users/${id}`, payload);
}

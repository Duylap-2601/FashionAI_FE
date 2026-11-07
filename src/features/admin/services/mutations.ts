import type { UpdateLiveTryOnSettingsInput } from '@/features/admin/types/admin-dashboard-page';
import type { PatchOrdersStatusInput, PatchUsersInput, PutProductsInput } from '@/features/admin/types/requests';
import type { AdminCoupon, CreateCouponPayload, UpdateCouponPayload } from '@/features/admin/types/admin-coupons';
import type {
  AdminSaleCampaign,
  CreateSaleCampaignPayload,
  UpdateSaleCampaignPayload,
} from '@/features/admin/types/admin-sale-campaigns';
import type { OrderIssue, OrderRefundKind } from '@/features/orders/types/orders';
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

export function openOrderMeasurementReview(
  orderId: string,
  itemId: string,
  payload: { message: string; internalNote?: string; fields?: string[] },
) {
  return http.post(`/orders/${orderId}/items/${itemId}/measurement-review`, payload);
}

export function reopenOrderMeasurementReview(
  orderId: string,
  itemId: string,
  payload: { message?: string; fields?: string[] },
) {
  return http.patch(`/orders/${orderId}/items/${itemId}/measurement-review`, payload);
}

export function createShipment(id: string, payload?: { requestKey?: string }, config?: HttpOptions) {
  return http.post(`/orders/${id}/shipment`, payload || {}, config);
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

export function updateOrderRefund(
  id: string,
  payload: {
    refundStatus: string;
    kind?: OrderRefundKind;
    amountVnd?: number;
    evidenceReference?: string;
    internalNote?: string;
    receiptImages?: File[];
  }
) {
  const formData = new FormData();
  formData.append('refundStatus', payload.refundStatus);
  if (payload.kind) {
    formData.append('kind', payload.kind);
  }
  if (payload.amountVnd !== undefined) {
    formData.append('amountVnd', String(payload.amountVnd));
  }
  if (payload.internalNote) {
    formData.append('internalNote', payload.internalNote);
  }
  if (payload.evidenceReference) {
    formData.append('evidenceReference', payload.evidenceReference);
  }
  for (const file of payload.receiptImages ?? []) {
    formData.append('receiptImages', file);
  }
  return http.patch(`/orders/${id}/refund`, formData);
}

export function finalizeRefund(
  refundId: string,
  payload: { outcome: 'COMPLETED' | 'FAILED'; note?: string }
) {
  return http.post(`/payments/admin/refunds/${refundId}/finalize`, payload);
}

export function resolveWebhookFailure(id: string) {
  return http.patch(`/payments/admin/webhook-failures/${id}/resolve`);
}

export function updateGhnPickupSettings(payload: { provinceV3Id: string; wardV3Id: string; addressLine?: string }) {
  return api.put('/admin/settings/ghn-pickup', payload);
}

export function syncGhnLocations() {
  return http.post<{ skipped: boolean; generation?: string; counts?: { provinces: number; wards: number } }>(
    '/shipping/ghn-locations/sync',
    {},
  );
}

export function updateLiveTryOnSettings(payload: UpdateLiveTryOnSettingsInput) {
  return api.put('/admin/settings/live-try-on', payload);
}

export function updateUser(id: string, payload: PatchUsersInput) {
  return http.patch(`/users/${id}`, payload);
}

export function createAdminCoupon(payload: CreateCouponPayload, config?: HttpOptions) {
  return http.post<AdminCoupon>('/coupons', payload, config);
}

export function updateAdminCoupon(id: string, payload: UpdateCouponPayload, config?: HttpOptions) {
  return http.patch<AdminCoupon>(`/coupons/${id}`, payload, config);
}

export function deleteAdminCoupon(id: string, config?: HttpOptions) {
  return http.delete<{ success?: boolean }>(`/coupons/${id}`, config);
}

export function createAdminSaleCampaign(payload: CreateSaleCampaignPayload, config?: HttpOptions) {
  return http.post<AdminSaleCampaign>('/sale-campaigns', payload, config);
}

export function updateAdminSaleCampaign(id: string, payload: UpdateSaleCampaignPayload, config?: HttpOptions) {
  return http.patch<AdminSaleCampaign>(`/sale-campaigns/${id}`, payload, config);
}

export function deleteAdminSaleCampaign(id: string, config?: HttpOptions) {
  return http.delete<{ id?: string }>(`/sale-campaigns/${id}`, config);
}

export type ReviewOrderIssueInput =
  | { decision: 'REJECT'; adminNote: string }
  | {
      decision: 'APPROVE';
      approvedResolution: 'REFUND';
      adminNote?: string;
      refundShipping?: boolean;
      /** Duyệt và hoàn tiền luôn, không cần khách gửi trả hàng (kèm mã giao dịch + ảnh chứng từ). */
      refundNow?: boolean;
      evidenceReference?: string;
    };

export function reviewOrderIssue(
  issueId: string,
  payload: ReviewOrderIssueInput,
  config?: HttpOptions,
  receiptImages?: File[],
) {
  const formData = new FormData();
  formData.append('decision', payload.decision);
  if ('approvedResolution' in payload && payload.approvedResolution) {
    formData.append('approvedResolution', payload.approvedResolution);
  }
  if (payload.adminNote) {
    formData.append('adminNote', payload.adminNote);
  }
  if ('refundShipping' in payload && payload.refundShipping !== undefined) {
    formData.append('refundShipping', String(payload.refundShipping));
  }
  if ('refundNow' in payload && payload.refundNow) {
    formData.append('refundNow', 'true');
    if (payload.evidenceReference) formData.append('evidenceReference', payload.evidenceReference);
  }
  for (const file of receiptImages ?? []) {
    formData.append('receiptImages', file);
  }
  return http.patch<OrderIssue>(`/order-issues/${issueId}/review`, formData, config);
}



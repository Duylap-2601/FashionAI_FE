import { http, type HttpOptions } from '@/lib/http';
import type { LiveTryOnSettings } from '@/features/admin/types/admin-dashboard-page';
import type { UnmatchedTransaction, UnmatchedTransactionsResponse } from '@/features/admin/types/admin-reconciliation';

export function fetchAdminProducts(config: HttpOptions) {
  return http.get('/products', config);
}

export function fetchAdminOrders(config: HttpOptions) {
  return http.get('/orders/all', config);
}

export function fetchAdminShipments(config?: HttpOptions) {
  return http.get('/admin/shipments', config);
}

export function fetchAdminShipmentDetail(id: string) {
  return http.get(`/admin/shipments/${id}`);
}

export function fetchAdminUsers(config: HttpOptions) {
  return http.get('/users', config);
}

export function fetchAdminStats() {
  return http.get('/admin/stats');
}

export function fetchGhnPickupSettings() {
  return http.get('/admin/settings/ghn-pickup');
}

export function fetchLiveTryOnSettings() {
  return http.get<LiveTryOnSettings>('/admin/settings/live-try-on');
}

export function fetchWebhookFailures(config?: HttpOptions) {
  return http.get('/payments/admin/webhook-failures', config);
}

export function fetchUnmatchedTransactions(
  params?: { resolved?: boolean; page?: number; limit?: number },
  config?: HttpOptions,
) {
  const query = new URLSearchParams();
  if (params?.resolved !== undefined) query.set('resolved', String(params.resolved));
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.limit !== undefined) query.set('limit', String(params.limit));
  const qs = query.toString();
  return http.get<UnmatchedTransactionsResponse | UnmatchedTransaction[]>(
    `/payments/admin/unmatched-transactions${qs ? `?${qs}` : ''}`,
    config,
  );
}


import { http, type HttpOptions } from '@/lib/http';
import type { LiveTryOnSettings } from '@/features/admin/types/admin-dashboard-page';
import type { AnalyticsRange, AnalyticsRealtimeResult, AnalyticsReportResult } from '@/features/admin/types/admin-analytics';
import type { UnmatchedTransaction, UnmatchedTransactionsResponse } from '@/features/admin/types/admin-reconciliation';
import type { AdminCoupon, AdminCouponsResponse } from '@/features/admin/types/admin-coupons';
import type { AdminSaleCampaign, AdminSaleCampaignDetail } from '@/features/admin/types/admin-sale-campaigns';
import type { OrderIssue, OrderIssueListMeta, OrderIssueListParams } from '@/features/orders/types/orders';

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

export function fetchAnalyticsReport(range: AnalyticsRange, config?: HttpOptions, refresh = false) {
  return http.get<AnalyticsReportResult>('/admin/analytics/report', {
    ...config,
    params: refresh ? { range, refresh: true } : { range },
  });
}

export function fetchAnalyticsRealtime(config?: HttpOptions) {
  return http.get<AnalyticsRealtimeResult>('/admin/analytics/realtime', config);
}

export function fetchWebhookFailures(config?: HttpOptions) {
  return http.get('/payments/admin/webhook-failures', config);
}

export function fetchUnmatchedTransactions(
  params?: { resolved?: boolean; page?: number; limit?: number },
  config?: HttpOptions,
) {
  const query = new URLSearchParams();
  // Backend validation forbids `resolved` on this endpoint ("property resolved should not exist")
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.limit !== undefined) query.set('limit', String(params.limit));
  const qs = query.toString();
  return http.get<UnmatchedTransactionsResponse | UnmatchedTransaction[]>(
    `/payments/admin/unmatched-transactions${qs ? `?${qs}` : ''}`,
    config,
  );
}

export function fetchAdminCoupons(config?: HttpOptions) {
  return http.get<AdminCouponsResponse | AdminCoupon[]>('/coupons', config);
}

export function fetchAdminCouponDetail(id: string, config?: HttpOptions) {
  return http.get<AdminCoupon>(`/coupons/${id}`, config);
}

export function fetchAdminSaleCampaigns(
  params?: { page?: number; limit?: number; isActive?: boolean; search?: string },
  config?: HttpOptions,
) {
  return http.get<AdminSaleCampaign[] | { items: AdminSaleCampaign[] }>('/sale-campaigns', {
    ...config,
    params,
  });
}

export function fetchAdminSaleCampaignDetail(id: string, config?: HttpOptions) {
  return http.get<AdminSaleCampaignDetail>(`/sale-campaigns/${id}`, config);
}

export function fetchAdminOrderIssues(params?: OrderIssueListParams, config?: HttpOptions<OrderIssueListParams>) {
  return http.get<{ data: OrderIssue[]; meta: OrderIssueListMeta } | OrderIssue[], OrderIssueListParams>('/order-issues', {
    ...config,
    params: params ?? config?.params,
  });
}

export function fetchAdminOrderIssue(issueId: string, config?: HttpOptions) {
  return http.get<OrderIssue>(`/order-issues/${issueId}`, config);
}



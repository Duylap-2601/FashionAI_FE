import { http, type HttpOptions } from '@/lib/http';

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

export function fetchWebhookFailures(config?: HttpOptions) {
  return http.get('/payments/admin/webhook-failures', config);
}

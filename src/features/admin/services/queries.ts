import { api } from '@/lib/api';
import type { AxiosRequestConfig } from 'axios';

export function fetchAdminProducts(config: AxiosRequestConfig) {
  return api.get('/products', config);
}

export function fetchAdminOrders(config: AxiosRequestConfig) {
  return api.get('/orders/all', config);
}

export function fetchAdminUsers(config: AxiosRequestConfig) {
  return api.get('/users', config);
}

export function fetchAdminStats() {
  return api.get('/admin/stats');
}

export function fetchWebhookFailures(config?: AxiosRequestConfig) {
  return api.get('/payments/admin/webhook-failures', config);
}

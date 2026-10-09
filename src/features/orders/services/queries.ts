import { mapOrder } from '@/features/orders/services/orders-utils';
import type { BackendOrder, OrderIssue, OrderIssueListMeta, OrderIssueListParams, OrdersListParams, OrdersListResult } from '@/features/orders/types/orders';
import { http } from '@/lib/http';

type BackendOrderList = BackendOrder[] & { __meta?: OrdersListResult['meta'] };

const DEFAULT_ORDERS_META: OrdersListResult['meta'] = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};

export async function fetchOrdersPage(params: OrdersListParams = {}): Promise<OrdersListResult> {
  const data = await http.get<BackendOrderList, OrdersListParams>('/orders', { params });
  return {
    orders: (data || []).map(mapOrder),
    meta: data.__meta || {
      ...DEFAULT_ORDERS_META,
      page: params.page ?? DEFAULT_ORDERS_META.page,
      limit: params.limit ?? DEFAULT_ORDERS_META.limit,
    },
  };
}

export async function fetchOrders() {
  const data = await fetchOrdersPage({ page: 1, limit: 100 });
  return data.orders;
}

export async function fetchOrder(id: string) {
  const data = await http.get<BackendOrder>(`/orders/${id}`);
  return mapOrder(data);
}

export async function fetchOrderIssues(
  orderId: string,
  params?: OrderIssueListParams,
): Promise<{ data: OrderIssue[]; meta: OrderIssueListMeta }> {
  type ResponseType = (OrderIssue[] & { __meta?: OrderIssueListMeta }) | { data?: OrderIssue[]; meta?: OrderIssueListMeta };
  const res = await http.get<ResponseType, OrderIssueListParams>(`/orders/${orderId}/issues`, { params });
  if (Array.isArray(res)) {
    return {
      data: res,
      meta: (res as { __meta?: OrderIssueListMeta }).__meta || {
        total: res.length,
        page: params?.page ?? 1,
        limit: params?.limit ?? res.length,
        totalPages: 1,
      },
    };
  }
  return {
    data: res?.data || [],
    meta: res?.meta || {
      total: (res?.data || []).length,
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      totalPages: 1,
    },
  };
}

export async function fetchOrderIssue(issueId: string): Promise<OrderIssue> {
  return http.get<OrderIssue>(`/order-issues/${issueId}`);
}

export { queryKeys } from './query-keys';


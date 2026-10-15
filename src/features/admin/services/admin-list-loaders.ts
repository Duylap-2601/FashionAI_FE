import { ADMIN_USERS_FETCH_LIMIT } from '@/features/admin/constants/admin-dashboard-page';
import { filterOrders, filterProducts, paginateLocal } from '@/features/admin/services/admin-list-filters';
import { readAdminList, toAdminOrder, toAdminProduct, toAdminUser } from '@/features/admin/services/admin-mappers';
import { fetchAdminOrderIssues, fetchAdminOrders, fetchAdminProducts, fetchAdminShipments, fetchAdminUsers } from '@/features/admin/services/queries';
import type { AdminListQuery, AdminListResult, AdminOrder, AdminProduct, AdminShipment, AdminUser } from '@/features/admin/types/admin-dashboard-page';
import type { AdminOrderIssueFilters } from '@/features/admin/types/admin-order-issues-panel';
import type { AdminOrderFilters } from '@/features/admin/types/admin-orders-panel';
import type { AdminProductFilters } from '@/features/admin/types/admin-products-panel';
import type { AdminShipmentFilters } from '@/features/admin/types/admin-shipments-panel';
import type { AdminUserFilters } from '@/features/admin/types/admin-users-panel';
import type { AdminOrderDto, AdminShipmentDto, AdminUserDto, AdminProductDto } from '@/features/admin/types/api';
import type { OrderIssue, OrderIssueListMeta } from '@/features/orders/types/orders';

// Mỗi loader: một trang list admin theo query, đã map sang model UI. Khi backend không trả tổng,
// list được lọc/phân trang phía client.

type ListParams = Record<string, string | number>;

function toServerPage<T>(items: T[], total: number, totalPages: number | undefined, pageSize: number): AdminListResult<T> {
  return { items, total, totalPages: totalPages ?? (Math.ceil(total / pageSize) || 1) };
}

export async function loadAdminProducts(
  { page, pageSize, filters }: AdminListQuery<AdminProductFilters>,
  signal?: AbortSignal,
): Promise<AdminListResult<AdminProduct>> {
  const params: ListParams = { page, limit: pageSize };
  if (filters.search) {
    params.search = filters.search;
    params.q = filters.search;
  }
  if (filters.category && filters.category !== 'ALL') params.category = filters.category;
  if (filters.status && filters.status !== 'ALL') params.status = filters.status;

  const { items, serverTotal, serverTotalPages } = readAdminList<AdminProductDto>(await fetchAdminProducts({ params, signal }));
  const products = items.map(toAdminProduct);
  if (serverTotal !== undefined) return toServerPage(products, serverTotal, serverTotalPages, pageSize);
  return paginateLocal(filterProducts(products, filters), page, pageSize);
}

export async function loadAdminOrders(
  { page, pageSize, filters }: AdminListQuery<AdminOrderFilters>,
  signal?: AbortSignal,
): Promise<AdminListResult<AdminOrder>> {
  const params: ListParams = { page, limit: pageSize };
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.status && filters.status !== 'ALL') params.status = filters.status;
  if (filters.paymentStatus && filters.paymentStatus !== 'ALL') params.paymentStatus = filters.paymentStatus;
  if (filters.fromDate?.trim()) params.fromDate = filters.fromDate.trim();
  if (filters.toDate?.trim()) params.toDate = filters.toDate.trim();

  const { items, serverTotal, serverTotalPages } = readAdminList<AdminOrderDto>(await fetchAdminOrders({ params, signal }));
  const orders = items.map(toAdminOrder);
  const filtered = filterOrders(orders, filters);
  if (serverTotal === undefined) return paginateLocal(filtered, page, pageSize);
  // Backend có lúc bỏ qua bộ lọc: lọc lại trang vừa nhận, khi đó tổng chỉ tính trên trang này.
  if (filtered.length !== orders.length) {
    return { items: filtered, total: filtered.length, totalPages: Math.ceil(filtered.length / pageSize) || 1 };
  }
  return toServerPage(orders, serverTotal, serverTotalPages, pageSize);
}

export async function loadAdminShipments(
  { page, pageSize, filters }: AdminListQuery<AdminShipmentFilters>,
  signal?: AbortSignal,
): Promise<AdminListResult<AdminShipment>> {
  const params: ListParams = {
    page,
    limit: pageSize,
    ...Object.fromEntries(
      Object.entries(filters)
        .filter(([, value]) => value !== undefined && value !== '')
        .map(([key, value]) => [key, typeof value === 'boolean' ? String(value) : value]),
    ),
  };

  const { items, serverTotal, serverTotalPages } = readAdminList<AdminShipmentDto>(await fetchAdminShipments({ params, signal }));
  if (serverTotal !== undefined) return toServerPage(items, serverTotal, serverTotalPages, pageSize);
  return paginateLocal(items, page, pageSize);
}

export async function loadAdminOrderIssues(
  { page, pageSize, filters }: AdminListQuery<AdminOrderIssueFilters>,
  signal?: AbortSignal,
): Promise<AdminListResult<OrderIssue>> {
  const res = await fetchAdminOrderIssues(
    { page, limit: pageSize, status: filters.status || undefined, reason: filters.reason || undefined },
    { signal },
  );
  const resObj = res as { data?: OrderIssue[]; meta?: OrderIssueListMeta; items?: OrderIssue[]; total?: number; __meta?: OrderIssueListMeta } | undefined;
  const items = Array.isArray(res) ? res : resObj?.data || resObj?.items || [];
  const meta = resObj?.__meta || resObj?.meta;
  const total = typeof meta?.total === 'number'
    ? meta.total
    : typeof resObj?.total === 'number' ? resObj.total : items.length;
  return toServerPage(items, total, typeof meta?.totalPages === 'number' ? meta.totalPages : undefined, pageSize);
}

/** Tải tối đa ADMIN_USERS_FETCH_LIMIT users; phân trang làm phía client. */
export async function loadAdminUsers(filters: AdminUserFilters, signal?: AbortSignal): Promise<AdminUser[]> {
  const params: ListParams = { page: 1, limit: ADMIN_USERS_FETCH_LIMIT };
  if (filters.search) {
    params.search = filters.search;
    params.q = filters.search;
  }
  if (filters.tier && filters.tier !== 'ALL') params.tier = filters.tier;
  if (filters.role && filters.role !== 'ALL') params.role = filters.role;
  if (filters.isVerified && filters.isVerified !== 'ALL') {
    params.isVerified = filters.isVerified === 'VERIFIED' ? 'true' : 'false';
  }

  const { items } = readAdminList<AdminUserDto>(await fetchAdminUsers({ params, signal }));
  return items.map(toAdminUser);
}

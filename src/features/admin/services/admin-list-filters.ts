import type { AdminListResult, AdminOrder, AdminPagination, AdminProduct, AdminUser } from '@/features/admin/types/admin-dashboard-page';
import type { AdminOrderFilters } from '@/features/admin/types/admin-orders-panel';
import type { AdminProductFilters } from '@/features/admin/types/admin-products-panel';
import type { AdminUserFilters } from '@/features/admin/types/admin-users-panel';

// Các bộ lọc phía client dùng khi backend không phân trang/lọc (hoặc lọc chưa đúng).

const isActiveFilter = (value?: string) => Boolean(value && value !== 'ALL');

export function paginateLocal<T>(list: T[], page: number, pageSize: number): AdminListResult<T> {
  return {
    items: list.slice((page - 1) * pageSize, page * pageSize),
    total: list.length,
    totalPages: Math.ceil(list.length / pageSize) || 1,
  };
}

export function filterProducts(list: AdminProduct[], filters: AdminProductFilters): AdminProduct[] {
  const q = filters.search ? filters.search.toLowerCase() : '';
  return list.filter(p =>
    (!q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) &&
    (!isActiveFilter(filters.category) || p.category === filters.category) &&
    (!isActiveFilter(filters.status) || p.status === filters.status)
  );
}

function matchesOrderSearch(order: AdminOrder, q: string) {
  return order.code.toLowerCase().includes(q) ||
    order.customer.toLowerCase().includes(q) ||
    order.email.toLowerCase().includes(q) ||
    Boolean(order.phone && order.phone.includes(q));
}

/** Lọc lại theo trạng thái, thanh toán, từ khóa. Khoảng ngày chỉ lọc phía server. */
export function filterOrders(list: AdminOrder[], filters: AdminOrderFilters): AdminOrder[] {
  const q = filters.search?.trim().toLowerCase() || '';
  return list.filter(o =>
    (!isActiveFilter(filters.status) || o.status === filters.status) &&
    (!isActiveFilter(filters.paymentStatus) || o.paymentStatus === filters.paymentStatus) &&
    (!q || matchesOrderSearch(o, q))
  );
}

export function filterUsers(list: AdminUser[], filters: AdminUserFilters): AdminUser[] {
  const q = filters.search?.trim().toLowerCase() || '';
  return list.filter(u =>
    (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)) &&
    (!isActiveFilter(filters.tier) || u.tier === filters.tier) &&
    (!isActiveFilter(filters.role) || u.role === filters.role) &&
    (filters.isVerified !== 'VERIFIED' || u.isVerified) &&
    (filters.isVerified !== 'UNVERIFIED' || !u.isVerified)
  );
}

/** Lọc + phân trang users đã tải; trang bị kẹp vào [1, totalPages]. */
export function paginateUsers(
  source: AdminUser[],
  filters: AdminUserFilters,
  page: number,
  pageSize: number,
): { items: AdminUser[]; pagination: AdminPagination } {
  const filtered = filterUsers(Array.isArray(source) ? source : [], filters);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    items: filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    pagination: { page: safePage, pageSize, total, totalPages },
  };
}

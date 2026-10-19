import { NON_REVENUE_STATUSES } from '@/features/admin/constants/admin-dashboard-page';
import type {
  AdminOrder,
  AdminProduct,
  AdminStats,
  AdminUser,
  DashboardMetrics,
  RevenueChart,
  RevenueChartDays,
  RevenueChartPoint,
} from '@/features/admin/types/admin-dashboard-page';

export interface DashboardMetricsInput {
  stats: AdminStats | null;
  orders: AdminOrder[];
  products: AdminProduct[];
  users: AdminUser[];
  allUsers: AdminUser[];
  reviewsCount: number;
  avgRating: number;
}

const asNumber = (value: unknown) => (typeof value === 'number' ? value : undefined);

/**
 * Số liệu thẻ tổng quan. Ưu tiên /admin/stats; khi backend thiếu field thì tính từ list đã tải
 * (backend cũ trả tên field snake_case hoặc tên khác nên phải đọc nhiều khóa).
 */
export function computeDashboardMetrics({
  stats,
  orders,
  products,
  users,
  allUsers,
  reviewsCount,
  avgRating,
}: DashboardMetricsInput): DashboardMetrics {
  const raw = (stats || {}) as Record<string, unknown>;
  const revenueOrders = orders.filter(o => !NON_REVENUE_STATUSES.includes(o.status));
  const fallbackRevenue = revenueOrders.reduce((acc, o) => acc + o.total, 0);

  const totalRevenue = typeof stats?.totalRevenue === 'number' ? stats.totalRevenue : fallbackRevenue;

  const refundedRevenue = Number(
    raw.refundedAmount
    ?? raw.productRefunded
    ?? raw.refundedRevenue
    ?? raw.refunded_revenue
    ?? raw.refundRevenue
    ?? raw.refund_revenue
    ?? 0
  );

  const rawProductRev = raw.productRevenue ?? raw.product_revenue ?? raw.orderRevenue ?? raw.order_revenue;
  const productRevenue = typeof rawProductRev === 'number' ? rawProductRev : fallbackRevenue;

  const rawSubRev = raw.subscriptionRevenue
    ?? raw.subscription_revenue
    ?? raw.subscriptionsRevenue
    ?? raw.subscriptions_revenue
    ?? raw.packageRevenue
    ?? raw.package_revenue
    ?? raw.subRevenue;
  const subscriptionRevenue = typeof rawSubRev === 'number' && rawSubRev > 0
    ? rawSubRev
    : Math.max(0, totalRevenue - productRevenue);

  const netSubscriptionRevenue = asNumber(
    raw.netSubscriptionRevenue ?? raw.net_subscription_revenue ?? raw.netPackageRevenue,
  ) ?? subscriptionRevenue;
  const netProductRevenue = asNumber(
    raw.netProductRevenue ?? raw.net_product_revenue ?? raw.netOrderRevenue,
  ) ?? productRevenue;

  // Backend cũ chỉ trả net của doanh thu sản phẩm: cộng thêm phần gói khi thấy dấu hiệu đó.
  const rawNetRev = raw.netRevenue ?? raw.net_revenue;
  const netRevenue = typeof rawNetRev === 'number' && rawNetRev <= productRevenue && subscriptionRevenue > 0
    ? rawNetRev + netSubscriptionRevenue
    : typeof rawNetRev === 'number' ? rawNetRev : Math.max(0, totalRevenue - refundedRevenue);

  const paidOrders = typeof stats?.paidOrders === 'number' && stats.paidOrders > 0
    ? stats.paidOrders
    : revenueOrders.length;

  const userSource = allUsers.length > 0 ? allUsers : users;

  return {
    totalRevenue,
    refundedRevenue,
    productRevenue,
    subscriptionRevenue,
    netSubscriptionRevenue,
    netProductRevenue,
    netRevenue,
    avgOrderValue: paidOrders > 0 ? Math.round(totalRevenue / paidOrders) : 0,
    totalOrders: stats?.orderCount ?? orders.length,
    pendingOrders: orders.filter(o => o.status === 'PENDING').length,
    shippingOrders: orders.filter(o => o.status === 'SHIPPING' || o.status === 'READY_TO_SHIP').length,
    deliveredOrders: orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED').length,
    cancelledOrders: orders.filter(o => ['CANCELLED', 'FAILED', 'RETURNED', 'EXPIRED'].includes(o.status)).length,
    totalProducts: stats?.productCount ?? products.length,
    activeProducts: products.filter(p => p.status === 'ACTIVE').length,
    userSource,
    totalUsers: stats?.userCount ?? userSource.length,
    memberUsers: userSource.filter(u => u.tier === 'MEMBER').length,
    vipUsers: userSource.filter(u => u.tier === 'VIP').length,
    totalReviews: typeof stats?.reviewCount === 'number' && stats.reviewCount > 0
      ? stats.reviewCount
      : (reviewsCount || (typeof stats?.totalReviews === 'number' ? stats.totalReviews : 0)),
    avgRating: typeof stats?.avgRating === 'number' && stats.avgRating > 0 ? stats.avgRating : avgRating,
    tryOnToday: stats?.tryOnToday ?? 0,
    tryOnCount: stats?.tryOnCount ?? 0,
    stylistCount: stats?.stylistCount ?? 0,
  };
}

// Toạ độ trong viewBox 600x210 của biểu đồ doanh thu.
const CHART_CENTER_X = 300;
const CHART_PADDING_X = 40;
const CHART_PLOT_WIDTH = 600 - CHART_PADDING_X * 2;
const CHART_TOP_Y = 35;
const CHART_BOTTOM_Y = 175;
const CHART_EMPTY_MAX_REVENUE = 500_000;

const pad2 = (value: number) => value.toString().padStart(2, '0');

/** Doanh thu đơn đã thanh toán và số đơn theo từng ngày trong `days` ngày gần nhất. */
export function buildRevenueChart(orders: AdminOrder[], days: RevenueChartDays, now: Date = new Date()): RevenueChart {
  const daily: Omit<RevenueChartPoint, 'x' | 'y'>[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateKey = d.toISOString().substring(0, 10);
    const dayOrders = orders.filter(o => o.date === dateKey);
    daily.push({
      dateKey,
      label: `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`,
      fullDate: `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`,
      revenue: dayOrders.filter(o => o.paymentStatus === 'PAID').reduce((sum, o) => sum + o.total, 0),
      ordersCount: dayOrders.length,
    });
  }

  const peak = Math.max(...daily.map(d => d.revenue), 0);
  const maxRevenue = peak > 0 ? peak : CHART_EMPTY_MAX_REVENUE;
  const plotHeight = CHART_BOTTOM_Y - CHART_TOP_Y;
  const points = daily.map((d, idx) => ({
    ...d,
    x: daily.length <= 1 ? CHART_CENTER_X : CHART_PADDING_X + (idx / (daily.length - 1)) * CHART_PLOT_WIDTH,
    y: CHART_BOTTOM_Y - (d.revenue / maxRevenue) * plotHeight,
  }));

  return {
    points,
    maxRevenue,
    totalRevenue: daily.reduce((sum, d) => sum + d.revenue, 0),
    totalOrders: daily.reduce((sum, d) => sum + d.ordersCount, 0),
  };
}

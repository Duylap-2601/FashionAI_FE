'use client';

import { AdminRevenueChart } from '@/features/admin/components/admin-revenue-chart';
import { AdminLoadingBar } from '@/features/admin/components/admin-loading';
import {
  ADMIN_REFRESH_INTERVAL_MS,
  CATEGORY_LABEL,
  resolveOrderStatusCfg,
} from '@/features/admin/constants/admin-dashboard-page';
import { fmt } from '@/features/admin/services/format';
import type { DashboardOverviewProps } from '@/features/admin/types/dashboard-overview';
import type { OrderDisplayStatus } from '@/features/orders/types/orders';
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Eye,
  Package,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wand2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

type StatusTone = 'brass' | 'oxblood' | 'sage' | 'taupe' | 'error';

const STATUS_TONE_CLS: Record<StatusTone, { dot: string; text: string }> = {
  brass: { dot: 'bg-metric-users', text: 'text-metric-users' },
  oxblood: { dot: 'bg-metric-orders', text: 'text-metric-orders' },
  sage: { dot: 'bg-metric-products', text: 'text-metric-products' },
  taupe: { dot: 'bg-landing-taupe', text: 'text-landing-muted' },
  error: { dot: 'bg-destructive', text: 'text-destructive' },
};

type MetricAccent = 'revenue' | 'orders' | 'products' | 'users' | 'reviews' | 'ai';

const METRIC_ACCENT: Record<MetricAccent, { text: string; rule: string; wash: string }> = {
  revenue: { text: 'text-metric-revenue', rule: 'border-t-metric-revenue', wash: 'bg-metric-revenue/10' },
  orders: { text: 'text-metric-orders', rule: 'border-t-metric-orders', wash: 'bg-metric-orders/10' },
  products: { text: 'text-metric-products', rule: 'border-t-metric-products', wash: 'bg-metric-products/10' },
  users: { text: 'text-metric-users', rule: 'border-t-metric-users', wash: 'bg-metric-users/10' },
  reviews: { text: 'text-metric-reviews', rule: 'border-t-metric-reviews', wash: 'bg-metric-reviews/10' },
  ai: { text: 'text-metric-ai', rule: 'border-t-metric-ai', wash: 'bg-metric-ai/10' },
};

function resolveStatusTone(status: string, displayStatus?: OrderDisplayStatus | null): StatusTone {
  if (displayStatus?.issue) return 'error';
  const code = displayStatus && displayStatus.source !== 'ORDER'
    ? (displayStatus.code || '').toLowerCase()
    : status.toLowerCase();

  if (
    code === 'delivered'
    || code === 'completed'
    || code === 'paid'
    || code === 'confirmed'
    || code === 'measurement_confirmed'
  ) return 'sage';

  if (
    code === 'cancel'
    || code === 'cancelled'
    || code === 'failed'
    || code === 'expired'
    || code === 'returned'
    || code.startsWith('return')
  ) return 'error';

  if (
    code === 'shipping'
    || code === 'delivering'
    || code === 'tailoring'
    || code === 'quality_check'
    || code === 'measurement_review'
    || code === 'ready_to_ship'
    || code === 'ready_to_pick'
    || code === 'picking'
    || code === 'picked'
    || code === 'money_collect_picking'
  ) return 'oxblood';

  if (
    code === 'created'
    || code === 'pending'
    || code === 'storing'
    || code === 'sorting'
    || code === 'transporting'
  ) return 'brass';

  return 'taupe';
}

function SectionHeader({
  chapter,
  title,
  action,
}: {
  chapter: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-landing-line px-5 py-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] tracking-[0.2em] text-landing-brass-ink">{chapter}</span>
        <h2 className="font-display text-[1.15rem] leading-tight text-landing-obsidian">{title}</h2>
      </div>
      {action}
    </header>
  );
}

function TextAction({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-landing-oxblood transition-colors hover:text-landing-obsidian"
    >
      {children}
      <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
    </button>
  );
}

function KpiCell({
  label,
  value,
  note,
  icon: Icon,
  accent,
  onClick,
}: {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  accent: MetricAccent;
  onClick: () => void;
}) {
  const accentCls = METRIC_ACCENT[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex h-full flex-col rounded-[2px] border border-t-2 border-landing-line bg-landing-ivory p-5 text-left transition-colors hover:border-landing-brass-ink ${accentCls.rule}`}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase leading-tight tracking-[0.16em] text-landing-muted">
          {label}
        </span>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center ${accentCls.wash} ${accentCls.text}`}>
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </span>
      <span className={`mt-5 font-mono text-[1.65rem] leading-none tracking-tight ${accentCls.text}`}>
        {value}
      </span>
      <span className="mt-3 block text-[11px] leading-relaxed text-landing-muted">{note}</span>
      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-landing-oxblood group-hover:underline">
        Xem chi tiết
        <ChevronRight className="h-3 w-3" strokeWidth={1.75} />
      </span>
    </button>
  );
}

export function DashboardOverview({
  metrics,
  orders,
  products,
  isLoading,
  setActiveTab,
  openProductEditor,
  chartDays,
  setChartDays,
}: DashboardOverviewProps) {
  const {
    totalRevenue,
    avgOrderValue,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    totalProducts,
    activeProducts,
    totalUsers,
    memberUsers,
    vipUsers,
    userSource: users,
    shippingOrders,
    cancelledOrders,
    refundedRevenue,
    netRevenue,
    subscriptionRevenue,
    productRevenue,
    netSubscriptionRevenue,
    netProductRevenue,
    totalReviews,
    avgRating,
    tryOnToday,
    tryOnCount,
    stylistCount,
  } = metrics;

  const freeUsersCount = Math.max(0, totalUsers - (memberUsers + vipUsers));
  const freePct = totalUsers > 0 ? Math.round((freeUsersCount / totalUsers) * 100) : 0;
  const memberPct = totalUsers > 0 ? Math.round((memberUsers / totalUsers) * 100) : 0;
  const vipPct = totalUsers > 0 ? Math.max(0, 100 - freePct - memberPct) : 0;
  const verifiedUsers = users.filter(u => u.isVerified).length;

  return (
    <div className="flex flex-col gap-8" aria-busy={isLoading}>
      {/* Page header */}
      <header className="border-b border-landing-line pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-landing-brass-ink">
          Bảng điều khiển
        </p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-[clamp(1.9rem,3.2vw,2.75rem)] leading-[1.05] tracking-[-0.025em] text-landing-obsidian">
              Tổng quan kinh doanh
            </h1>
            <p className="mt-2 max-w-xl text-landing-body leading-relaxed text-landing-muted">
              Doanh thu, đơn hàng, sản phẩm và hoạt động AI trong một khung theo dõi.
            </p>
          </div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-landing-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-landing-sage-ink" aria-hidden="true" />
            <span className="font-mono">
              Tự động làm mới {Math.round(ADMIN_REFRESH_INTERVAL_MS / 1000)} giây
            </span>
          </p>
        </div>
      </header>

      {isLoading && <AdminLoadingBar label="Đang tải số liệu tổng quan..." />}

      {/* Headline KPIs: revenue ledger + four drilldowns */}
      <section aria-labelledby="headline-kpis" className="flex flex-col gap-4">
        <h2 id="headline-kpis" className="sr-only">Chỉ số chính</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="flex flex-col rounded-[2px] border border-t-2 border-landing-line border-t-metric-revenue bg-landing-ivory p-5 md:p-6 lg:col-span-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-landing-brass-ink">
                Doanh thu đã thanh toán
              </p>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-metric-revenue/10 text-metric-revenue">
                <CreditCard className="h-4 w-4" strokeWidth={1.75} />
              </span>
            </div>
            <p className="mt-6 break-words font-mono text-[clamp(1.7rem,3vw,2.35rem)] leading-none tracking-tight text-metric-revenue">
              {fmt(totalRevenue)}
            </p>
            <p className="mt-3 text-landing-body leading-relaxed text-landing-muted">
              Giá trị trung bình{' '}
              <span className="font-mono text-landing-obsidian">
                {avgOrderValue > 0 ? fmt(avgOrderValue) : '0đ'}
              </span>{' '}
              mỗi đơn đã thanh toán.
            </p>

            <dl className="mt-5 border-t border-landing-line pt-4 text-[12px]">
              <div
                className="flex items-baseline justify-between gap-3"
                title="Khoản hoàn tiền hoặc khấu trừ credit nâng cấp gói giữa kỳ"
              >
                <dt className="text-landing-muted">Hoàn tiền</dt>
                <dd className="font-mono font-semibold text-metric-users">
                  −{fmt(refundedRevenue)}
                </dd>
              </div>
              <div
                className="mt-2 flex items-baseline justify-between gap-3 border-t border-landing-line pt-2"
                title="Doanh thu thực (net) = Doanh thu đã thanh toán − Hoàn tiền"
              >
                <dt className="font-medium text-landing-obsidian">Doanh thu thực (net)</dt>
                <dd className="font-mono font-semibold text-metric-revenue">{fmt(netRevenue)}</dd>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 pt-2 text-[11px] text-landing-muted">
                <span>
                  Gói{' '}
                  <span className="font-mono text-landing-obsidian">
                    {fmt(netSubscriptionRevenue ?? subscriptionRevenue)}
                  </span>
                </span>
                <span>
                  Đơn{' '}
                  <span className="font-mono text-landing-obsidian">
                    {fmt(netProductRevenue ?? productRevenue)}
                  </span>
                </span>
              </div>
            </dl>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            <KpiCell
              label="Tổng đơn hàng"
              value={totalOrders.toLocaleString('vi-VN')}
              note={`${pendingOrders} đơn chờ duyệt · ${deliveredOrders} đã giao`}
              icon={ShoppingBag}
              accent="orders"
              onClick={() => setActiveTab('orders')}
            />
            <KpiCell
              label="Sản phẩm"
              value={totalProducts.toLocaleString('vi-VN')}
              note={`${activeProducts} sản phẩm đang bán`}
              icon={Package}
              accent="products"
              onClick={() => setActiveTab('products')}
            />
            <KpiCell
              label="Người dùng đăng ký"
              value={totalUsers.toLocaleString('vi-VN')}
              note={`${memberUsers + vipUsers} hội viên · ${verifiedUsers} đã xác thực`}
              icon={Users}
              accent="users"
              onClick={() => setActiveTab('users')}
            />
            <KpiCell
              label="Tổng đánh giá"
              value={totalReviews.toLocaleString('vi-VN')}
              note={avgRating > 0 ? `${avgRating} điểm trung bình` : 'Chưa có điểm trung bình'}
              icon={Star}
              accent="reviews"
              onClick={() => setActiveTab('reviews')}
            />
          </div>
        </div>
      </section>

      {/* Order pipeline */}
      <section className="rounded-[2px] border border-landing-line bg-landing-ivory">
        <SectionHeader
          chapter="01"
          title="Tiến độ xử lý đơn hàng"
          action={<TextAction onClick={() => setActiveTab('orders')}>Quản lý đơn hàng</TextAction>}
        />
        <div className="grid grid-cols-2 gap-px bg-landing-line md:grid-cols-4">
          <div className="bg-landing-ivory p-4">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-metric-users">
              <span className="h-1.5 w-1.5 rounded-full bg-metric-users" aria-hidden="true" />
              Chờ xác nhận
            </p>
            <p className="mt-2 font-mono text-[1.55rem] leading-none text-metric-users">
              {pendingOrders}
            </p>
            <p className="mt-2 text-[11px] text-landing-muted">Cần duyệt và đóng gói</p>
          </div>
          <div className="bg-landing-ivory p-4">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-metric-orders">
              <span className="h-1.5 w-1.5 rounded-full bg-metric-orders" aria-hidden="true" />
              Đang giao hàng
            </p>
            <p className="mt-2 font-mono text-[1.55rem] leading-none text-metric-orders">
              {shippingOrders}
            </p>
            <p className="mt-2 text-[11px] text-landing-muted">Đang vận chuyển</p>
          </div>
          <div className="bg-landing-ivory p-4">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-metric-products">
              <span className="h-1.5 w-1.5 rounded-full bg-metric-products" aria-hidden="true" />
              Đã giao
            </p>
            <p className="mt-2 font-mono text-[1.55rem] leading-none text-metric-products">
              {deliveredOrders}
            </p>
            <p className="mt-2 text-[11px] text-landing-muted">Giao thành công</p>
          </div>
          <div className="bg-landing-ivory p-4">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-destructive">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden="true" />
              Đã hủy hoặc hoàn
            </p>
            <p className="mt-2 font-mono text-[1.55rem] leading-none text-destructive">
              {cancelledOrders}
            </p>
            <p className="mt-2 text-[11px] text-landing-muted">Đơn hủy hoặc trả hàng</p>
          </div>
        </div>
      </section>

      {/* AI activity and member mix */}
      <section className="rounded-[2px] border border-landing-line bg-landing-ivory">
        <SectionHeader
          chapter="02"
          title="Hoạt động AI và phân bổ hội viên"
          action={<TextAction onClick={() => setActiveTab('users')}>Quản lý người dùng</TextAction>}
        />
        <div className="grid grid-cols-2 gap-px bg-landing-line sm:grid-cols-3 lg:grid-cols-5">
          <div className="bg-landing-ivory p-4">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-metric-ai">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
              Try-on hôm nay
            </p>
            <p className="mt-2 font-mono text-[1.45rem] leading-none text-metric-ai">
              {tryOnToday.toLocaleString('vi-VN')}
            </p>
            <p className="mt-2 text-[11px] text-landing-muted">Lượt trong ngày</p>
          </div>
          <div className="bg-landing-ivory p-4">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-metric-ai">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.75} />
              Tổng lượt try-on
            </p>
            <p className="mt-2 font-mono text-[1.45rem] leading-none text-metric-ai">
              {tryOnCount.toLocaleString('vi-VN')}
            </p>
            <p className="mt-2 text-[11px] text-landing-muted">Toàn bộ thời gian</p>
          </div>
          <div className="bg-landing-ivory p-4">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-metric-ai">
              <Wand2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              AI Stylist
            </p>
            <p className="mt-2 font-mono text-[1.45rem] leading-none text-metric-ai">
              {stylistCount.toLocaleString('vi-VN')}
            </p>
            <p className="mt-2 text-[11px] text-landing-muted">Lượt gợi ý outfit</p>
          </div>
          <div className="bg-landing-ivory p-4">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-metric-products">
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Gói Member
            </p>
            <p className="mt-2 font-mono text-[1.45rem] leading-none text-metric-products">
              {memberUsers.toLocaleString('vi-VN')}
            </p>
            <p className="mt-2 text-[11px] text-landing-muted">{memberPct}% tổng tài khoản</p>
          </div>
          <div className="bg-landing-ivory p-4">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-metric-users">
              <Star className="h-3.5 w-3.5" strokeWidth={1.75} />
              Gói VIP
            </p>
            <p className="mt-2 font-mono text-[1.45rem] leading-none text-metric-users">
              {vipUsers.toLocaleString('vi-VN')}
            </p>
            <p className="mt-2 text-[11px] text-landing-muted">{vipPct}% tổng tài khoản</p>
          </div>
        </div>

        <div className="border-t border-landing-line p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">
              Tỷ lệ phân bổ theo gói
            </span>
            <span className="font-mono text-[11px] text-landing-muted">
              Tổng {totalUsers.toLocaleString('vi-VN')} tài khoản
            </span>
          </div>
          <div className="mt-3 flex h-2 w-full overflow-hidden bg-landing-paper">
            {freePct > 0 && (
              <div
                className="h-full bg-landing-taupe"
                style={{ width: `${freePct}%` }}
                title={`Free: ${freeUsersCount} (${freePct}%)`}
              />
            )}
            {memberPct > 0 && (
              <div
                className="h-full bg-metric-products"
                style={{ width: `${memberPct}%` }}
                title={`Member: ${memberUsers} (${memberPct}%)`}
              />
            )}
            {vipPct > 0 && (
              <div
                className="h-full bg-metric-users"
                style={{ width: `${vipPct}%` }}
                title={`VIP: ${vipUsers} (${vipPct}%)`}
              />
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-landing-muted">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 bg-landing-taupe" aria-hidden="true" />
              Free <span className="font-mono text-landing-obsidian">{freeUsersCount}</span>
              <span className="font-mono">({freePct}%)</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 bg-metric-products" aria-hidden="true" />
              Member <span className="font-mono text-landing-obsidian">{memberUsers}</span>
              <span className="font-mono">({memberPct}%)</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 bg-metric-users" aria-hidden="true" />
              VIP <span className="font-mono text-landing-obsidian">{vipUsers}</span>
              <span className="font-mono">({vipPct}%)</span>
            </span>
          </div>
        </div>
      </section>

      {/* Revenue chart */}
      <section className="rounded-[2px] border border-landing-line bg-landing-ivory">
        <header className="flex flex-col gap-4 border-b border-landing-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-landing-brass-ink">03</span>
            <div>
              <h2 className="font-display text-[1.15rem] leading-tight text-landing-obsidian">
                Biến động doanh thu
              </h2>
              <p className="mt-0.5 text-[11px] text-landing-muted">
                Doanh số thực tế tổng hợp theo ngày
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div
              role="group"
              aria-label="Khoảng thời gian"
              className="flex items-center gap-4"
            >
              {([7, 14, 30] as const).map(days => (
                <button
                  key={days}
                  type="button"
                  aria-pressed={chartDays === days}
                  onClick={() => setChartDays(days)}
                  className={`border-0 border-b bg-transparent px-0 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                    chartDays === days
                      ? 'border-landing-oxblood text-landing-oxblood'
                      : 'border-transparent text-landing-muted hover:text-landing-obsidian'
                  }`}
                >
                  {days} ngày
                </button>
              ))}
            </div>
            <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-landing-muted">
              <span className="h-px w-5 bg-metric-revenue" aria-hidden="true" />
              Doanh thu (VNĐ)
            </span>
          </div>
        </header>
        <div className="p-5">
          <AdminRevenueChart orders={orders} days={chartDays} />
        </div>
      </section>

      {/* Recent orders and products */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="flex flex-col overflow-hidden rounded-[2px] border border-landing-line bg-landing-ivory lg:col-span-7">
          <SectionHeader
            chapter="04"
            title="Đơn hàng mới nhất"
            action={<TextAction onClick={() => setActiveTab('orders')}>Xem tất cả</TextAction>}
          />
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <caption className="sr-only">Năm đơn hàng phát sinh gần đây</caption>
              <thead className="border-b border-landing-line text-[9px] font-semibold uppercase tracking-[0.16em] text-landing-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">Mã đơn</th>
                  <th scope="col" className="px-4 py-3">Khách hàng</th>
                  <th scope="col" className="px-4 py-3 text-right">Tổng tiền</th>
                  <th scope="col" className="px-4 py-3">Trạng thái</th>
                  <th scope="col" className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-landing-line">
                {orders.slice(0, 5).map(o => {
                  const cfg = resolveOrderStatusCfg(o.status, o.displayStatus);
                  const tone = STATUS_TONE_CLS[resolveStatusTone(o.status, o.displayStatus)];
                  return (
                    <tr key={o.id} className="transition-colors hover:bg-landing-paper/60">
                      <td className="px-5 py-3 font-mono text-[12px] text-landing-obsidian">{o.code}</td>
                      <td className="px-4 py-3">
                        <p className="line-clamp-1 font-medium text-landing-obsidian">{o.customer}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-landing-muted">{o.date}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-landing-oxblood">
                        {fmt(o.total)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${tone.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/orders/${o.id}/measurements`}
                          className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-landing-oxblood no-underline transition-colors hover:text-landing-obsidian hover:underline"
                          title="Xem chi tiết đơn hàng và số đo"
                        >
                          <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                          <span>Xem</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-landing-muted">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col overflow-hidden rounded-[2px] border border-landing-line bg-landing-ivory lg:col-span-5">
          <SectionHeader
            chapter="05"
            title="Sản phẩm gần đây"
            action={<TextAction onClick={() => setActiveTab('products')}>Quản lý</TextAction>}
          />
          <div className="custom-scrollbar max-h-[380px] flex-1 overflow-y-auto">
            {products.slice(0, 5).map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => openProductEditor(p)}
                className="flex w-full items-center gap-3 border-b border-landing-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-landing-paper/60"
              >
                <Image
                  src={p.image}
                  alt={p.name}
                  width={40}
                  height={40}
                  unoptimized
                  className="h-10 w-10 shrink-0 rounded-[2px] border border-landing-line bg-landing-paper object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-landing-obsidian">
                    {p.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-landing-muted">
                    {CATEGORY_LABEL[p.category] || p.category}
                    {' · '}
                    <span className="font-mono">{fmt(p.price)}</span>
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-landing-muted" strokeWidth={1.75} />
              </button>
            ))}
            {products.length === 0 && (
              <div className="p-10 text-center text-[13px] text-landing-muted">
                Chưa có sản phẩm nào
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

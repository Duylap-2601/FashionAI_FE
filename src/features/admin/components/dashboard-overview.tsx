'use client';

import { CATEGORY_LABEL, ORDER_STATUS_CFG } from '@/features/admin/constants/admin-dashboard-page';
import { fmt } from '@/features/admin/services/format';
import type { DashboardOverviewProps } from '@/features/admin/types/dashboard-overview';
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  Users,
  XCircle
} from 'lucide-react';

export function DashboardOverview({ setIsLoading, fetchProducts, fetchOrders, fetchUsers, fetchStats, totalRevenue, avgOrderValue, totalOrders, pendingOrders, deliveredOrders, totalProducts, activeProducts, outOfStockCount, totalUsers, memberUsers, vipUsers, users, setActiveTab, shippingOrders, cancelledOrders, setChartDays, setHoveredPoint, chartDays, renderRevenueChart, orders, setSelectedOrder, products, openProductEditor }: DashboardOverviewProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-h2 font-bold text-neutral-900">Tổng quan kinh doanh</h1>
          <p className="text-body-sm text-neutral-500 mt-1">Theo dõi doanh thu, trạng thái đơn hàng, kho sản phẩm và thành viên</p>
        </div>
        <button
          onClick={() => { setIsLoading(true); Promise.all([fetchProducts(), fetchOrders(), fetchUsers(), fetchStats()]).finally(() => setIsLoading(false)); }}
          className="px-4 py-2.5 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl text-label-sm font-bold border-0 cursor-pointer flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Doanh thu */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-neutral-500 font-medium">Doanh thu đã thanh toán</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[26px] font-bold text-neutral-900">{fmt(totalRevenue)}</span>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center justify-between">
              <span>Giá trị TB: <strong className="text-neutral-700">{avgOrderValue > 0 ? fmt(avgOrderValue) : '0đ'}</strong>/đơn</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> Đã thu</span>
            </div>
          </div>
        </div>

        {/* Card 2: Đơn hàng */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-neutral-500 font-medium">Tổng đơn hàng</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[26px] font-bold text-neutral-900">{totalOrders.toLocaleString('vi-VN')}</span>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center justify-between">
              <span>{pendingOrders > 0 ? <strong className="text-amber-600 font-bold">{pendingOrders} đơn chờ duyệt</strong> : '0 đơn chờ duyệt'}</span>
              <span className="text-neutral-600 font-medium">{deliveredOrders} đã giao</span>
            </div>
          </div>
        </div>

        {/* Card 3: Sản phẩm trong kho */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-neutral-500 font-medium">Sản phẩm trong kho</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[26px] font-bold text-neutral-900">{totalProducts.toLocaleString('vi-VN')}</span>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center justify-between">
              <span className="text-green-600 font-medium">{activeProducts} đang bán</span>
              {outOfStockCount > 0 ? (
                <span className="text-red-500 font-semibold">{outOfStockCount} hết hàng</span>
              ) : (
                <span className="text-neutral-400">Đủ tồn kho</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Người dùng đăng ký */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-neutral-500 font-medium">Người dùng đăng ký</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[26px] font-bold text-neutral-900">{totalUsers.toLocaleString('vi-VN')}</span>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center justify-between">
              <span className="text-brand-gold font-semibold">{memberUsers + vipUsers} hội viên VIP/Member</span>
              <span className="text-neutral-400">{users.filter(u => u.isVerified).length} đã xác thực</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Order Status Flow */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-label-sm font-bold text-neutral-800 uppercase tracking-wide">Tiến độ xử lý đơn hàng</h4>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-label-sm font-semibold text-brand-navy hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer"
          >
            Quản lý đơn hàng <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => setActiveTab('orders')}
            className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors"
          >
            <div className="flex items-center justify-between text-amber-700 text-label-sm font-semibold mb-1">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Chờ xác nhận</span>
              <span className="text-body-md font-bold">{pendingOrders}</span>
            </div>
            <span className="text-[11px] text-amber-600/80">Cần duyệt & đóng gói</span>
          </div>

          <div
            onClick={() => setActiveTab('orders')}
            className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center justify-between text-blue-700 text-label-sm font-semibold mb-1">
              <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Đang giao hàng</span>
              <span className="text-body-md font-bold">{shippingOrders}</span>
            </div>
            <span className="text-[11px] text-blue-600/80">Đang vận chuyển</span>
          </div>

          <div
            onClick={() => setActiveTab('orders')}
            className="p-3 bg-green-50/70 border border-green-200/60 rounded-xl cursor-pointer hover:bg-green-50 transition-colors"
          >
            <div className="flex items-center justify-between text-green-700 text-label-sm font-semibold mb-1">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Đã giao hàng</span>
              <span className="text-body-md font-bold">{deliveredOrders}</span>
            </div>
            <span className="text-[11px] text-green-600/80">Giao thành công</span>
          </div>

          <div
            onClick={() => setActiveTab('orders')}
            className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors"
          >
            <div className="flex items-center justify-between text-neutral-700 text-label-sm font-semibold mb-1">
              <span className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Đã hủy / Hoàn</span>
              <span className="text-body-md font-bold">{cancelledOrders}</span>
            </div>
            <span className="text-[11px] text-neutral-500">Đơn huỷ hoặc trả hàng</span>
          </div>
        </div>
      </div>

      {/* Chart: Revenue Trend */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-body-lg font-bold text-neutral-900">Biến động doanh thu theo thời gian</h3>
            <p className="text-body-sm text-neutral-500 mt-0.5">Dữ liệu doanh số thực tế tổng hợp theo ngày</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl">
              {([7, 14, 30] as const).map(days => (
                <button
                  key={days}
                  onClick={() => {
                    setChartDays(days);
                    setHoveredPoint(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all border-0 cursor-pointer ${chartDays === days
                      ? 'bg-white text-brand-navy shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-800 bg-transparent'
                    }`}
                >
                  {days} ngày
                </button>
              ))}
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#5D1C34] bg-[#5D1C34]/10 px-2.5 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-[#5D1C34]" /> Doanh thu (VNĐ)
            </span>
          </div>
        </div>
        {renderRevenueChart()}
      </div>

      {/* Two Columns: Recent Orders & Inventory Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="text-body-lg font-bold text-neutral-900">Đơn hàng mới nhất</h3>
              <p className="text-body-sm text-neutral-500 mt-0.5">5 giao dịch phát sinh gần đây</p>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-label-sm font-semibold text-brand-navy hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer"
            >
              Xem tất cả ({orders.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-label-sm font-semibold uppercase">
                <tr>
                  <th className="px-5 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.slice(0, 5).map(o => {
                  const cfg = ORDER_STATUS_CFG[o.status] || ORDER_STATUS_CFG.PENDING;
                  const Icon = cfg.icon;
                  return (
                    <tr key={o.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-neutral-800 font-mono text-[13px]">{o.code}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-neutral-900 line-clamp-1">{o.customer}</p>
                        <p className="text-[11px] text-neutral-400">{o.date}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-brand-navy">{fmt(o.total)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="text-label-sm font-semibold text-brand-navy hover:underline bg-transparent border-0 cursor-pointer"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-400">Chưa có đơn hàng nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Inventory & Products Status (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="text-body-lg font-bold text-neutral-900">Tình trạng kho hàng</h3>
              <p className="text-body-sm text-neutral-500 mt-0.5">Theo dõi số lượng tồn kho sản phẩm</p>
            </div>
            <button
              onClick={() => setActiveTab('products')}
              className="text-label-sm font-semibold text-brand-navy hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer"
            >
              Quản lý ({products.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto max-h-[380px]">
            {products.slice(0, 5).map(p => {
              const stock = p.stock ?? 0;
              const isOutOfStock = stock === 0;
              const isLowStock = stock > 0 && stock < 10;
              return (
                <div
                  key={p.id}
                  className="p-3 bg-neutral-50 hover:bg-neutral-100/80 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                  onClick={() => openProductEditor(p)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-neutral-200 shrink-0 border border-neutral-200"
                    />
                    <div className="min-w-0">
                      <p className="text-body-sm font-semibold text-neutral-900 truncate">{p.name}</p>
                      <p className="text-label-sm text-neutral-500">{CATEGORY_LABEL[p.category] || p.category} • {fmt(p.price)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${isOutOfStock
                        ? 'bg-red-100 text-red-700'
                        : isLowStock
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                      {isOutOfStock ? 'Hết hàng' : isLowStock ? `Còn ${stock}` : `Kho: ${stock}`}
                    </span>
                  </div>
                </div>
              );
            })}
            {products.length === 0 && (
              <div className="p-8 text-center text-neutral-400 text-body-sm">Chưa có sản phẩm trong kho</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

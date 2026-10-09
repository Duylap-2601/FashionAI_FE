'use client';

import { resolveOrderStatusCfg } from '@/features/admin/constants/admin-dashboard-page';
import { fmt, shipmentStatusLabel } from '@/features/admin/services/format';
import type { AdminOrdersPanelProps } from '@/features/admin/types/admin-orders-panel';
import { AdminPagination } from '@/features/admin/components/admin-pagination';
import { Calendar, ChevronDown, Eye, RotateCcw, Search } from 'lucide-react';
import Link from 'next/link';

export function AdminOrdersPanel({
  orders,
  setSelectedOrder,
  filters = {},
  onFilterChange,
  onResetFilters,
  currentPage = 1,
  totalPages = 1,
  totalItems = orders.length,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  isFetching = false,
}: AdminOrdersPanelProps) {
  const isFiltered = Boolean(
    filters.search ||
    (filters.status && filters.status !== 'ALL') ||
    (filters.paymentStatus && filters.paymentStatus !== 'ALL') ||
    filters.fromDate ||
    filters.toDate
  );

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-heading-h2 font-bold text-neutral-900">Quản lý Đơn hàng</h1>
        <p className="text-body-sm text-neutral-500 mt-1">Theo dõi, kiểm tra thanh toán và cập nhật trạng thái đơn may đo</p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        {/* Filter Bar */}
        <div className="p-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-neutral-50/50">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
            {/* Search */}
            <div className="relative min-w-[240px] max-w-sm flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search ?? ''}
                onChange={(e) => onFilterChange?.({ search: e.target.value })}
                placeholder="Tìm mã đơn (0012, ORD-0012), tên, email..."
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm focus:outline-none focus:border-brand-navy"
              />
            </div>

            {/* Order Status Filter */}
            <div className="relative">
              <select
                value={filters.status || 'ALL'}
                onChange={(e) => onFilterChange?.({ status: e.target.value === 'ALL' ? '' : e.target.value })}
                className="appearance-none pl-3.5 pr-8 py-2 border border-neutral-200/90 rounded-xl bg-white text-xs font-medium text-neutral-700 hover:border-neutral-300 focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/10 transition-colors cursor-pointer shadow-2xs"
              >
                <option value="ALL">Tất cả trạng thái đơn</option>
                <option value="CREATED">Đã tạo</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="MEASUREMENT_REVIEW">Kiểm tra số đo</option>
                <option value="MEASUREMENT_CONFIRMED">Chốt số đo</option>
                <option value="TAILORING">Đang may</option>
                <option value="READY_TO_SHIP">Sẵn sàng giao</option>
                <option value="SHIPPING">Đang giao</option>
                <option value="DELIVERED">Đã giao</option>
                <option value="COMPLETED">Hoàn tất</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="RETURN_REQUESTED">Yêu cầu hoàn trả</option>
                <option value="RETURNING">Đang hoàn trả</option>
                <option value="RETURNED">Đã hoàn trả</option>
                <option value="EXPIRED">Hết hạn</option>
                <option value="FAILED">Thất bại</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Payment Status Filter */}
            <div className="relative">
              <select
                value={filters.paymentStatus || 'ALL'}
                onChange={(e) => onFilterChange?.({ paymentStatus: e.target.value === 'ALL' ? '' : e.target.value })}
                className="appearance-none pl-3.5 pr-8 py-2 border border-neutral-200/90 rounded-xl bg-white text-xs font-medium text-neutral-700 hover:border-neutral-300 focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/10 transition-colors cursor-pointer shadow-2xs"
              >
                <option value="ALL">Tất cả thanh toán</option>
                <option value="PAID">Đã thanh toán (PAID)</option>
                <option value="PENDING">Chờ thanh toán (PENDING)</option>
                <option value="FAILED">Thất bại (FAILED)</option>
                <option value="REFUNDED">Đã hoàn tiền (REFUNDED)</option>
                <option value="PARTIALLY_REFUNDED">Hoàn tiền 1 phần</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Date Range Filter (fromDate / toDate) */}
            <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-xl px-2.5 py-1.5 text-body-sm text-neutral-600">
              <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="text-[11px] text-neutral-400 shrink-0">Từ:</span>
              <input
                type="date"
                value={filters.fromDate ?? ''}
                onChange={(e) => onFilterChange?.({ fromDate: e.target.value })}
                className="bg-transparent text-xs text-neutral-700 focus:outline-none cursor-pointer"
              />
              <span className="text-[11px] text-neutral-400 shrink-0">Đến:</span>
              <input
                type="date"
                value={filters.toDate ?? ''}
                onChange={(e) => onFilterChange?.({ toDate: e.target.value })}
                className="bg-transparent text-xs text-neutral-700 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Reset button */}
          {isFiltered && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-xl border border-neutral-200 hover:border-red-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại bộ lọc</span>
            </button>
          )}
        </div>

        {/* Orders Table: Fixed Header + Scrollable Data Body */}
        <div className="overflow-x-auto flex-1 min-h-0 flex flex-col">
          <div className="min-w-[1010px] flex-1 flex flex-col min-h-0">
            {/* Fixed Header */}
            <div className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-label-sm font-semibold uppercase shrink-0 select-none shadow-2xs">
              <div className="grid grid-cols-[130px_minmax(180px,1fr)_140px_160px_130px_150px_130px] items-center">
                <div className="px-6 py-3">Mã đơn</div>
                <div className="px-4 py-3">Khách hàng</div>
                <div className="px-4 py-3 text-right">Tổng tiền</div>
                <div className="px-4 py-3">Vận đơn</div>
                <div className="px-4 py-3">Ngày đặt</div>
                <div className="px-4 py-3">Trạng thái</div>
                <div className="px-6 py-3 text-right"></div>
              </div>
            </div>

            {/* Scrollable Data Body */}
            <div className="overflow-y-auto flex-1 min-h-0 custom-scrollbar divide-y divide-neutral-100 text-body-sm">
              {orders.map((o) => {
                const cfg = resolveOrderStatusCfg(o.status, o.displayStatus);
                const Icon = cfg.icon;
                return (
                  <div
                    key={o.id}
                    className="grid grid-cols-[130px_minmax(180px,1fr)_140px_160px_130px_150px_130px] items-center hover:bg-neutral-50/80 transition-colors"
                  >
                    <div className="px-6 py-3.5 font-semibold text-neutral-800 font-mono truncate">{o.code}</div>
                    <div className="px-4 py-3.5 min-w-0">
                      <div className="flex flex-col">
                        <span className="font-medium text-neutral-900 line-clamp-1 truncate">{o.customer}</span>
                        {o.email && <span className="text-[11px] text-neutral-400 truncate">{o.email}</span>}
                      </div>
                    </div>
                    <div className="px-4 py-3.5 text-right font-mono font-bold text-sm text-neutral-900 tracking-tight truncate">
                      {fmt(o.totalVnd ?? o.total)}
                    </div>
                    <div className="px-4 py-3.5 min-w-0">
                      {o.shipment ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono font-semibold text-neutral-800 text-xs truncate">
                            {o.shipment.providerOrderCode || '—'}
                          </span>
                          <span className="text-label-sm text-neutral-500 truncate">
                            {shipmentStatusLabel(o.shipment.status, o.shipment.rawStatus)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 text-xs">—</span>
                      )}
                    </div>
                    <div className="px-4 py-3.5 text-neutral-500 truncate text-xs">{o.date}</div>

                    {/* Trạng thái - Minimalist Atelier (Micro-dot + Refined Typography) */}
                    <div className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-2 py-0.5">
                        {o.status === 'PENDING' ? (
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.35)]" />
                          </span>
                        ) : o.status === 'PAID' || o.status === 'CONFIRMED' || o.status === 'COMPLETED' || o.status === 'DELIVERED' ? (
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.35)] shrink-0" />
                        ) : o.status === 'SHIPPING' || o.status === 'READY_TO_SHIP' ? (
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.35)] shrink-0" />
                        ) : o.status === 'TAILORING' || o.status === 'MEASUREMENT_REVIEW' || o.status === 'MEASUREMENT_CONFIRMED' ? (
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5D1C34] shadow-[0_0_6px_rgba(93,28,52,0.35)] shrink-0" />
                        ) : o.status === 'CANCELLED' || o.status === 'FAILED' ? (
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shrink-0" />
                        ) : (
                          <span className="inline-flex rounded-full h-2 w-2 bg-neutral-300 shrink-0" />
                        )}
                        <span className="text-xs font-medium text-neutral-800 tracking-tight">
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    <div className="px-6 py-3.5 text-right flex items-center justify-end">
                      <Link
                        href={`/admin/orders/${o.id}/measurements`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-brand-navy bg-brand-navy/5 hover:bg-brand-navy/10 transition-colors no-underline whitespace-nowrap cursor-pointer"
                        title="Xem chi tiết đơn hàng và số đo"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </Link>
                    </div>
                  </div>
                );
              })}

              {orders.length === 0 && (
                <div className="py-16 text-center text-neutral-400">
                  {isFiltered ? 'Không tìm thấy đơn hàng nào phù hợp với bộ lọc' : 'Chưa có đơn hàng nào'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {onPageChange && (
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            itemLabel="đơn hàng"
            isFetching={isFetching}
          />
        )}
      </div>
    </div>
  );
}

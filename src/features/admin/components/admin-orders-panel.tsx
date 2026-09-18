'use client';

import { ORDER_STATUS_CFG } from '@/features/admin/constants/admin-dashboard-page';
import { fmt } from '@/features/admin/services/format';
import type { AdminOrdersPanelProps } from '@/features/admin/types/admin-orders-panel';
import { AdminPagination } from '@/features/admin/components/admin-pagination';
import { RotateCcw, Search } from 'lucide-react';

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
    (filters.paymentStatus && filters.paymentStatus !== 'ALL')
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
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search ?? ''}
                onChange={(e) => onFilterChange?.({ search: e.target.value })}
                placeholder="Tìm mã đơn, tên, SĐT, email..."
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm focus:outline-none focus:border-brand-navy"
              />
            </div>

            {/* Order Status Filter */}
            <select
              value={filters.status || 'ALL'}
              onChange={(e) => onFilterChange?.({ status: e.target.value === 'ALL' ? '' : e.target.value })}
              className="px-3 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm text-neutral-700 focus:outline-none focus:border-brand-navy cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái đơn</option>
              <option value="PENDING">Chờ xử lý (PENDING)</option>
              <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
              <option value="PROCESSING">Đang may (PROCESSING)</option>
              <option value="SHIPPED">Đang giao (SHIPPED)</option>
              <option value="DELIVERED">Đã giao (DELIVERED)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={filters.paymentStatus || 'ALL'}
              onChange={(e) => onFilterChange?.({ paymentStatus: e.target.value === 'ALL' ? '' : e.target.value })}
              className="px-3 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm text-neutral-700 focus:outline-none focus:border-brand-navy cursor-pointer"
            >
              <option value="ALL">Tất cả thanh toán</option>
              <option value="PAID">Đã thanh toán (PAID)</option>
              <option value="PENDING">Chờ thanh toán (PENDING)</option>
              <option value="FAILED">Thất bại (FAILED)</option>
            </select>
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
              <div className="grid grid-cols-[130px_minmax(200px,1fr)_140px_160px_130px_150px_100px] items-center">
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
                const cfg = ORDER_STATUS_CFG[o.status] || ORDER_STATUS_CFG.PENDING;
                const Icon = cfg.icon;
                return (
                  <div
                    key={o.id}
                    className="grid grid-cols-[130px_minmax(200px,1fr)_140px_160px_130px_150px_100px] items-center hover:bg-neutral-50/80 transition-colors"
                  >
                    <div className="px-6 py-3.5 font-semibold text-neutral-800 font-mono truncate">{o.code}</div>
                    <div className="px-4 py-3.5 min-w-0">
                      <div className="flex flex-col">
                        <span className="font-medium text-neutral-900 line-clamp-1 truncate">{o.customer}</span>
                        {o.email && <span className="text-[11px] text-neutral-400 truncate">{o.email}</span>}
                      </div>
                    </div>
                    <div className="px-4 py-3.5 text-right font-bold text-brand-navy truncate">{fmt(o.total)}</div>
                    <div className="px-4 py-3.5 min-w-0">
                      {o.shipment ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono font-semibold text-neutral-800 text-xs truncate">
                            {o.shipment.providerOrderCode || '—'}
                          </span>
                          <span className="text-label-sm text-neutral-500 truncate">
                            {o.shipment.status}
                            {o.shipment.rawStatus ? ` · ${o.shipment.rawStatus}` : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 text-xs">—</span>
                      )}
                    </div>
                    <div className="px-4 py-3.5 text-neutral-500 truncate">{o.date}</div>
                    <div className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold ${cfg.cls}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="text-brand-navy font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                      >
                        Chi tiết
                      </button>
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

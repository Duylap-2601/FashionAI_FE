'use client';

import { fmt } from '@/features/admin/services/format';
import type { AdminShipmentsPanelProps } from '@/features/admin/types/admin-shipments-panel';
import { AdminPagination } from '@/features/admin/components/admin-pagination';
import { RefreshCw, RotateCcw, Search, XCircle } from 'lucide-react';

const STATUS_OPTIONS = ['READY_TO_PICK', 'CREATED', 'PICKING', 'PICKED', 'SHIPPING', 'IN_TRANSIT', 'DELIVERING', 'DELIVERED', 'DELIVERY_FAILED', 'RETURNING', 'RETURNED', 'CANCELLED', 'FAILED'];

export function AdminShipmentsPanel({
  shipments,
  filters,
  setFilters,
  onView,
  onSync,
  onCancel,
  onOpenOrder,
  currentPage = 1,
  totalPages = 1,
  totalItems = shipments.length,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  isFetching = false,
}: AdminShipmentsPanelProps) {
  const updateFilter = (key: keyof typeof filters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const isFiltered = Boolean(
    filters.providerOrderCode ||
    filters.orderCode ||
    filters.status ||
    filters.customer ||
    filters.phone ||
    filters.rawStatus ||
    filters.issueOnly ||
    filters.staleOnly
  );

  const resetFilters = () => {
    setFilters({});
  };

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-heading-h2 font-bold text-neutral-900">Quản lý Vận đơn</h1>
          <p className="text-body-sm text-neutral-500 mt-1">Theo dõi GHN, đồng bộ trạng thái và xử lý ngoại lệ giao hàng</p>
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-xl border border-neutral-200 hover:border-red-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại bộ lọc</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={filters.providerOrderCode || ''}
            onChange={e => updateFilter('providerOrderCode', e.target.value)}
            placeholder="Tìm mã GHN"
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-neutral-300 text-body-sm focus:outline-none focus:border-brand-navy"
          />
        </div>
        <input
          value={filters.orderCode || ''}
          onChange={e => updateFilter('orderCode', e.target.value)}
          placeholder="Mã đơn nội bộ"
          className="h-10 px-3 rounded-lg border border-neutral-300 text-body-sm focus:outline-none focus:border-brand-navy"
        />
        <select
          value={filters.status || ''}
          onChange={e => updateFilter('status', e.target.value)}
          className="h-10 px-3 rounded-lg border border-neutral-300 text-body-sm focus:outline-none focus:border-brand-navy cursor-pointer"
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
        </select>
        <input
          value={filters.customer || ''}
          onChange={e => updateFilter('customer', e.target.value)}
          placeholder="Khách hàng / email"
          className="h-10 px-3 rounded-lg border border-neutral-300 text-body-sm focus:outline-none focus:border-brand-navy"
        />
        <input
          value={filters.phone || ''}
          onChange={e => updateFilter('phone', e.target.value)}
          placeholder="Số điện thoại"
          className="h-10 px-3 rounded-lg border border-neutral-300 text-body-sm focus:outline-none focus:border-brand-navy"
        />
        <input
          value={filters.rawStatus || ''}
          onChange={e => updateFilter('rawStatus', e.target.value)}
          placeholder="Raw GHN status"
          className="h-10 px-3 rounded-lg border border-neutral-300 text-body-sm focus:outline-none focus:border-brand-navy"
        />
        <div className="flex items-center gap-4 text-body-sm text-neutral-700">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={Boolean(filters.issueOnly)} onChange={e => updateFilter('issueOnly', e.target.checked)} />
            Có sự cố
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={Boolean(filters.staleOnly)} onChange={e => updateFilter('staleOnly', e.target.checked)} />
            Chưa sync lâu
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto flex-1 min-h-0 flex flex-col">
          <div className="min-w-[1240px] flex-1 flex flex-col min-h-0">
            {/* Fixed Header */}
            <div className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-label-sm font-semibold uppercase shrink-0 select-none shadow-2xs">
              <div className="grid grid-cols-[140px_100px_minmax(140px,1fr)_110px_90px_120px_100px_100px_110px_130px_110px] items-center">
                <div className="px-5 py-3">Mã GHN</div>
                <div className="px-4 py-3">Mã đơn</div>
                <div className="px-4 py-3">Khách hàng</div>
                <div className="px-4 py-3">Điện thoại</div>
                <div className="px-4 py-3">Provider</div>
                <div className="px-4 py-3">Trạng thái</div>
                <div className="px-4 py-3">Raw</div>
                <div className="px-4 py-3 text-right">Phí</div>
                <div className="px-4 py-3">Dự kiến giao</div>
                <div className="px-4 py-3">Sync cuối</div>
                <div className="px-5 py-3"></div>
              </div>
            </div>

            {/* Scrollable Data Body */}
            <div className="overflow-y-auto flex-1 min-h-0 custom-scrollbar divide-y divide-neutral-100 text-body-sm">
              {shipments.map(shipment => (
                <div
                  key={shipment.id}
                  className={`grid grid-cols-[140px_100px_minmax(140px,1fr)_110px_90px_120px_100px_100px_110px_130px_110px] items-center ${
                    shipment.issue ? 'bg-red-50/40 hover:bg-red-50' : 'hover:bg-neutral-50'
                  } transition-colors`}
                >
                  <div className="px-5 py-3.5 font-mono font-semibold text-neutral-800 truncate">{shipment.providerOrderCode || '—'}</div>
                  <div className="px-4 py-3.5 truncate">
                    <button onClick={() => onOpenOrder(shipment.order.orderCode)} className="text-brand-navy font-semibold hover:underline bg-transparent border-0 cursor-pointer">
                      #{shipment.order.orderCode}
                    </button>
                  </div>
                  <div className="px-4 py-3.5 truncate">{shipment.customer.name || shipment.receiver.name || shipment.customer.email}</div>
                  <div className="px-4 py-3.5 text-neutral-600 truncate">{shipment.receiver.phone || shipment.customer.phone || '—'}</div>
                  <div className="px-4 py-3.5 truncate">{shipment.provider}</div>
                  <div className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-semibold text-label-sm">
                      {shipment.status}
                    </span>
                  </div>
                  <div className="px-4 py-3.5 text-neutral-500 truncate">{shipment.rawStatus || '—'}</div>
                  <div className="px-4 py-3.5 text-right font-semibold truncate">
                    {fmt(shipment.shippingFeeVnd ?? shipment.actualShippingFee ?? shipment.shippingFee ?? 0)}
                  </div>
                  <div className="px-4 py-3.5 text-neutral-500 truncate">{shipment.expectedDeliveryTime?.substring(0, 10) || '—'}</div>
                  <div className="px-4 py-3.5 text-neutral-500 truncate">{shipment.lastSyncedAt?.substring(0, 16).replace('T', ' ') || '—'}</div>
                  <div className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onView(shipment)} className="text-brand-navy font-semibold hover:underline bg-transparent border-0 cursor-pointer">Chi tiết</button>
                      <button onClick={() => onSync(shipment.id)} title="Sync GHN" className="p-1.5 rounded-lg hover:bg-neutral-100 border-0 bg-transparent cursor-pointer"><RefreshCw className="w-4 h-4" /></button>
                      {shipment.canCancel && <button onClick={() => onCancel(shipment)} title="Hủy vận đơn" className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 border-0 bg-transparent cursor-pointer"><XCircle className="w-4 h-4" /></button>}
                    </div>
                  </div>
                </div>
              ))}

              {shipments.length === 0 && (
                <div className="py-16 text-center text-neutral-400">
                  {isFiltered ? 'Không tìm thấy vận đơn nào phù hợp với bộ lọc' : 'Chưa có vận đơn nào'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages !== undefined && onPageChange && (
          <div className="shrink-0">
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              disabled={isFetching}
            />
          </div>
        )}
      </div>
    </div>
  );
}

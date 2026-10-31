'use client';

import { shipmentStatusLabel, fmt } from '@/features/admin/services/format';
import type { AdminShipmentsPanelProps } from '@/features/admin/types/admin-shipments-panel';
import { AdminPagination } from '@/features/admin/components/admin-pagination';
import { AdminLoadingBar, AdminTableLoading } from '@/features/admin/components/admin-loading';
import { PackageCheck, RotateCcw, Search, XCircle } from 'lucide-react';

const STATUS_OPTIONS = ['READY_TO_PICK', 'CREATED', 'PICKING', 'PICKED', 'SHIPPING', 'IN_TRANSIT', 'DELIVERING', 'DELIVERED', 'DELIVERY_FAILED', 'RETURNING', 'RETURNED', 'CANCELLED', 'FAILED'];
const PICKABLE_STATUSES = ['READY_TO_PICK', 'CREATED', 'PICKING'];

export function AdminShipmentsPanel({
  shipments,
  filters,
  setFilters,
  onView,
  onSimulatePicked,
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
    <div className="flex flex-col gap-6">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.08] tracking-[-0.025em] text-landing-obsidian">Quản lý Vận đơn</h1>
          <p className="text-body-sm text-landing-muted mt-1">Theo dõi GHN, đồng bộ trạng thái và xử lý ngoại lệ giao hàng</p>
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-landing-obsidian hover:text-destructive hover:bg-destructive/10 rounded-[2px] border border-landing-line hover:border-destructive/30 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại bộ lọc</span>
          </button>
        )}
      </div>

      <div className="bg-landing-ivory rounded-[2px] border border-landing-line p-4 grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-landing-muted" />
          <input
            value={filters.providerOrderCode || ''}
            onChange={e => updateFilter('providerOrderCode', e.target.value)}
            placeholder="Tìm mã GHN"
            className="w-full h-10 pl-9 pr-3 rounded-[2px] border border-landing-taupe text-body-sm focus:outline-none focus:border-landing-oxblood"
          />
        </div>
        <input
          value={filters.orderCode || ''}
          onChange={e => updateFilter('orderCode', e.target.value)}
          placeholder="Mã đơn nội bộ"
          className="h-10 px-3 rounded-[2px] border border-landing-taupe text-body-sm focus:outline-none focus:border-landing-oxblood"
        />
        <select
          value={filters.status || ''}
          onChange={e => updateFilter('status', e.target.value)}
          className="h-10 px-3 rounded-[2px] border border-landing-taupe text-body-sm focus:outline-none focus:border-landing-oxblood cursor-pointer"
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
        </select>
        <input
          value={filters.customer || ''}
          onChange={e => updateFilter('customer', e.target.value)}
          placeholder="Khách hàng / email"
          className="h-10 px-3 rounded-[2px] border border-landing-taupe text-body-sm focus:outline-none focus:border-landing-oxblood"
        />
        <input
          value={filters.phone || ''}
          onChange={e => updateFilter('phone', e.target.value)}
          placeholder="Số điện thoại"
          className="h-10 px-3 rounded-[2px] border border-landing-taupe text-body-sm focus:outline-none focus:border-landing-oxblood"
        />
        <input
          value={filters.rawStatus || ''}
          onChange={e => updateFilter('rawStatus', e.target.value)}
          placeholder="Raw GHN status"
          className="h-10 px-3 rounded-[2px] border border-landing-taupe text-body-sm focus:outline-none focus:border-landing-oxblood"
        />
        <div className="flex items-center gap-4 text-body-sm text-landing-obsidian">
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

      <div className="bg-landing-ivory rounded-[2px] border border-landing-line overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            {/* Fixed Header */}
            <div className="bg-landing-paper/60 border-b border-landing-line text-landing-muted text-label-sm font-semibold uppercase shrink-0 select-none">
              <div className="grid grid-cols-[130px_100px_minmax(140px,1fr)_140px_100px_150px_110px] items-center">
                <div className="px-5 py-3">Mã GHN</div>
                <div className="px-3 py-3">Mã đơn</div>
                <div className="px-4 py-3">Khách hàng</div>
                <div className="px-3 py-3">Trạng thái</div>
                <div className="px-3 py-3 text-right">Phí vận chuyển</div>
                <div className="px-4 py-3">Thời gian</div>
                <div className="px-5 py-3 text-right">Thao tác</div>
              </div>
            </div>

            {/* Scrollable Data Body */}
            <div className="divide-y divide-landing-line text-body-sm">
              {isFetching && shipments.length > 0 && (
                <AdminLoadingBar label="Đang cập nhật vận đơn..." />
              )}
              {isFetching && shipments.length === 0 && (
                <AdminTableLoading label="Đang tải vận đơn" />
              )}
              {shipments.map(shipment => (
                <div
                  key={shipment.id}
                  className={`grid grid-cols-[130px_100px_minmax(140px,1fr)_140px_100px_150px_110px] items-center ${
                    shipment.issue ? 'bg-destructive/10 hover:bg-destructive/10' : 'hover:bg-landing-paper/60'
                  } transition-colors`}
                >
                  {/* Mã GHN & Provider */}
                  <div className="px-5 py-3.5 min-w-0">
                    <span className="font-mono font-semibold text-landing-obsidian block truncate">
                      {shipment.providerOrderCode || '—'}
                    </span>
                    <span className="text-[10px] text-landing-muted font-bold uppercase tracking-wider block mt-0.5">
                      {shipment.provider || 'GHN'}
                    </span>
                  </div>

                  {/* Mã đơn nội bộ */}
                  <div className="px-3 py-3.5 truncate">
                    <button
                      type="button"
                      onClick={() => onOpenOrder(shipment.order.orderCode)}
                      className="text-landing-oxblood font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      #{shipment.order.orderCode}
                    </button>
                  </div>

                  {/* Khách hàng & SĐT */}
                  <div className="px-4 py-3.5 min-w-0">
                    <div className="font-medium text-landing-obsidian truncate">
                      {shipment.customer.name || shipment.receiver.name || shipment.customer.email}
                    </div>
                    <div className="text-[11px] text-landing-muted font-mono mt-0.5 truncate">
                      {shipment.receiver.phone || shipment.customer.phone || '—'}
                    </div>
                  </div>

                  {/* Trạng thái & Raw Status */}
                  <div className="px-3 py-3.5 min-w-0">
                    <div className="inline-flex items-center gap-1.5 py-0.5 truncate max-w-full">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        shipment.issue ? 'bg-destructive' :
                        shipment.status === 'DELIVERED' ? 'bg-metric-products' :
                        shipment.status === 'SHIPPING' ? 'bg-landing-oxblood' :
                        'bg-landing-taupe'
                      }`} />
                      <span className="text-xs font-medium text-landing-obsidian truncate">
                        {shipmentStatusLabel(shipment.status, shipment.rawStatus)}
                      </span>
                    </div>
                    {shipment.rawStatus && (
                      <span className="text-[10px] text-landing-muted font-mono block mt-0.5 truncate">
                        {shipment.rawStatus}
                      </span>
                    )}
                  </div>

                  {/* Phí vận chuyển */}
                  <div className="px-3 py-3.5 text-right font-semibold text-landing-obsidian truncate">
                    {fmt(shipment.shippingFeeVnd ?? shipment.actualShippingFee ?? shipment.shippingFee ?? 0)}
                  </div>

                  {/* Thời gian: Dự kiến & Sync cuối */}
                  <div className="px-4 py-3.5 min-w-0 text-[12px]">
                    <div className="text-landing-obsidian truncate">
                      {shipment.expectedDeliveryTime ? (
                        <>Dự kiến: <span className="font-medium">{shipment.expectedDeliveryTime.substring(0, 10)}</span></>
                      ) : (
                        '—'
                      )}
                    </div>
                    {shipment.lastSyncedAt && (
                      <div className="text-[11px] text-landing-muted mt-0.5 truncate">
                        Sync: {shipment.lastSyncedAt.substring(5, 16).replace('T', ' ')}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView(shipment)}
                        className="text-landing-oxblood font-semibold hover:underline bg-transparent border-0 cursor-pointer text-body-sm"
                      >
                        Chi tiết
                      </button>
                      {PICKABLE_STATUSES.includes(shipment.status) && (
                        <button
                          type="button"
                          onClick={() => onSimulatePicked(shipment.id)}
                          title="Giả lập shipper đã lấy hàng (staging)"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-metric-products bg-metric-products/10 hover:bg-metric-products/10 border-0 cursor-pointer text-label-sm font-semibold"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Lấy hàng</span>
                        </button>
                      )}
                      {shipment.canCancel && (
                        <button
                          type="button"
                          onClick={() => onCancel(shipment)}
                          title="Hủy vận đơn"
                          className="p-1.5 rounded-[2px] hover:bg-destructive/10 text-destructive border-0 bg-transparent cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {shipments.length === 0 && !isFetching && (
                <div className="py-16 text-center text-landing-muted">
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

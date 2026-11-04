'use client';

import { fmt, fmtDateTime } from '@/features/admin/services/format';
import { shipmentStatusLabel } from '@/features/orders/services/order-display';
import type { AdminShipmentsPanelProps } from '@/features/admin/types/admin-shipments-panel';
import { SHIPMENT_SIMULATIONS } from '@/features/admin/constants/admin-dashboard-page';
import { AdminPagination } from '@/features/admin/components/admin-pagination';
import { AdminLoadingBar, AdminTableLoading } from '@/features/admin/components/admin-loading';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, MoreVertical, RotateCcw, Search, XCircle } from 'lucide-react';
import Link from 'next/link';

const STATUS_OPTIONS = ['READY_TO_PICK', 'CREATED', 'PICKING', 'PICKED', 'SHIPPING', 'IN_TRANSIT', 'DELIVERING', 'DELIVERED', 'DELIVERY_FAILED', 'RETURNING', 'RETURNED', 'CANCELLED', 'FAILED'];
const MENU_CONTENT = 'w-52 rounded-[2px] border-landing-line bg-landing-paper p-1 shadow-md';
const MENU_ITEM = 'cursor-pointer rounded-[2px] px-3 py-2 text-landing-obsidian focus:bg-landing-ivory focus:text-landing-obsidian';

export function AdminShipmentsPanel({
  shipments,
  filters,
  setFilters,
  onSimulateStatus,
  onCancel,
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
          <div className="min-w-[930px]">
            {/* Fixed Header */}
            <div className="bg-landing-paper/60 border-b border-landing-line text-landing-muted text-label-sm font-semibold uppercase shrink-0 select-none">
              <div className="grid grid-cols-[130px_120px_minmax(140px,1fr)_140px_130px_170px_90px] items-center">
                <div className="px-5 py-3">Mã GHN</div>
                <div className="px-3 py-3">Mã đơn</div>
                <div className="px-4 py-3">Khách hàng</div>
                <div className="px-3 py-3">Trạng thái</div>
                <div className="px-3 py-3 text-right">Phí vận chuyển</div>
                <div className="px-4 py-3">Thời gian</div>
                <div className="px-3 py-3 text-right">Thao tác</div>
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
                  className={`grid grid-cols-[130px_120px_minmax(140px,1fr)_140px_130px_170px_90px] items-center ${
                    shipment.issue ? 'bg-destructive/10 hover:bg-destructive/10' : 'hover:bg-landing-paper/60'
                  } transition-colors`}
                >
                  {/* Mã GHN & Provider */}
                  <div className="px-5 py-3.5 min-w-0">
                    <Link
                      href={`/admin/shipments/${shipment.id}`}
                      className="font-mono font-semibold text-landing-obsidian hover:text-landing-oxblood hover:underline block truncate"
                    >
                      {shipment.providerOrderCode || '—'}
                    </Link>
                    <span className="text-[10px] text-landing-muted font-bold uppercase tracking-wider block mt-0.5">
                      {shipment.provider || 'GHN'}
                    </span>
                  </div>

                  {/* Mã đơn nội bộ */}
                  <div className="px-3 py-3.5 truncate">
                    <Link
                      href={`/admin/orders/${shipment.order.id}`}
                      className="text-landing-oxblood font-semibold hover:underline"
                    >
                      #{shipment.order.orderCode}
                    </Link>
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
                        <>Dự kiến: <span className="font-medium">{fmtDateTime(shipment.expectedDeliveryTime, { withTime: false })}</span></>
                      ) : (
                        '—'
                      )}
                    </div>
                    {shipment.lastSyncedAt && (
                      <div className="text-[11px] text-landing-muted mt-0.5 truncate">
                        Sync: {fmtDateTime(shipment.lastSyncedAt, { withYear: false })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-3 py-3.5 flex justify-end">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label={`Thao tác vận đơn ${shipment.providerOrderCode || shipment.order.orderCode}`}
                          className="w-8 h-8 rounded-[2px] border-0 bg-transparent flex items-center justify-center text-landing-muted hover:bg-landing-paper hover:text-landing-oxblood data-[state=open]:bg-landing-paper data-[state=open]:text-landing-oxblood cursor-pointer transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className={MENU_CONTENT}>
                        <DropdownMenuItem asChild className={MENU_ITEM}>
                          <Link href={`/admin/shipments/${shipment.id}`}>
                            <Eye /> Xem chi tiết
                          </Link>
                        </DropdownMenuItem>
                        {SHIPMENT_SIMULATIONS.some(sim => sim.from.includes(shipment.status)) && (
                          <>
                            <DropdownMenuSeparator className="bg-landing-line" />
                            <DropdownMenuLabel className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-landing-muted">
                              Giả lập GHN (staging)
                            </DropdownMenuLabel>
                            {SHIPMENT_SIMULATIONS.filter(sim => sim.from.includes(shipment.status)).map(sim => (
                              <DropdownMenuItem key={sim.status} onSelect={() => onSimulateStatus(shipment.id, sim.status)} className={MENU_ITEM}>
                                <sim.icon /> {sim.label}
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}
                        {shipment.canCancel && (
                          <>
                            <DropdownMenuSeparator className="bg-landing-line" />
                            <DropdownMenuItem variant="destructive" onSelect={() => onCancel(shipment)} className={MENU_ITEM}>
                              <XCircle /> Hủy vận đơn
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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

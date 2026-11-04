'use client';

import { AdminGuard } from '@/features/auth/components/AdminGuard';
import { ORDER_STATUS_CFG, SHIPMENT_SIMULATIONS } from '@/features/admin/constants/admin-dashboard-page';
import { useAdminShipmentDetail } from '@/features/admin/hooks/use-admin-shipment-detail';
import { fmt, fmtDateTime } from '@/features/admin/services/format';
import { shipmentStatusLabel } from '@/features/orders/services/order-display';
import { AtelierLoader } from '@/components/ui/AtelierLoader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertTriangle, ArrowLeft, ChevronDown, ExternalLink, Loader2, Truck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const BACK_HREF = '/admin/dashboard?tab=shipments';
const MENU_CONTENT = 'w-60 rounded-[2px] border-landing-line bg-landing-paper p-1 shadow-md';
const MENU_ITEM = 'cursor-pointer rounded-[2px] px-3 py-2 text-landing-obsidian focus:bg-landing-ivory focus:text-landing-obsidian';
const SECTION_TITLE = 'text-label-sm font-semibold text-landing-muted uppercase tracking-wide mb-2';

export default function AdminShipmentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { shipment, isLoading, isError, busyAction, simulate, cancel } = useAdminShipmentDetail(id);

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-dvh bg-landing-paper flex items-center justify-center">
          <AtelierLoader size="md" label="Đang tải vận đơn" />
        </div>
      </AdminGuard>
    );
  }

  if (isError || !shipment) {
    return (
      <AdminGuard>
        <div className="min-h-dvh bg-landing-paper p-6 flex items-center justify-center">
          <div className="bg-landing-ivory p-8 rounded-[2px] border border-landing-line text-center max-w-md w-full">
            <AlertTriangle className="w-12 h-12 text-metric-users mx-auto mb-3" />
            <h2 className="font-display text-[1.15rem] leading-tight text-landing-oxblood mb-1">Không tìm thấy vận đơn</h2>
            <p className="text-body-sm text-landing-muted mb-6">Vận đơn không tồn tại hoặc bạn không có quyền truy cập.</p>
            <Link
              href={BACK_HREF}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-landing-oxblood text-landing-paper text-xs font-semibold rounded-[2px] hover:bg-landing-obsidian transition-colors no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Quản lý vận đơn</span>
            </Link>
          </div>
        </div>
      </AdminGuard>
    );
  }

  const simulations = SHIPMENT_SIMULATIONS.filter(sim => sim.from.includes(shipment.status));
  const busy = busyAction !== null;
  const simulating = busy && busyAction !== 'cancel';

  return (
    <AdminGuard>
      <div className="min-h-dvh bg-landing-paper text-landing-obsidian font-sans p-4 sm:p-6 md:p-8">
        <div className="max-w-[1180px] mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              href={BACK_HREF}
              className="inline-flex items-center gap-2 text-body-sm font-semibold text-landing-obsidian hover:text-landing-oxblood transition-colors no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Quản lý vận đơn</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2.5">
              {simulations.length > 0 && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      disabled={busy}
                      className="inline-flex items-center gap-2 rounded-[2px] border border-landing-line bg-landing-ivory px-4 py-2 text-xs font-bold text-landing-obsidian hover:border-landing-oxblood/40 hover:bg-landing-paper/60 disabled:cursor-not-allowed disabled:opacity-75 transition-all cursor-pointer"
                    >
                      {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-landing-oxblood" /> : <Truck className="w-3.5 h-3.5 text-landing-oxblood" />}
                      <span>{simulating ? 'Đang giả lập...' : 'Giả lập GHN'}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-landing-muted" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={MENU_CONTENT}>
                    <DropdownMenuLabel className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-landing-muted">
                      Giả lập GHN (staging)
                    </DropdownMenuLabel>
                    {simulations.map(sim => (
                      <DropdownMenuItem key={sim.status} onSelect={() => void simulate(sim.status)} className={MENU_ITEM}>
                        <sim.icon /> {sim.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {shipment.canCancel && (
                <button
                  type="button"
                  onClick={() => void cancel()}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-landing-ivory text-destructive border border-destructive/40 rounded-[2px] text-xs font-bold hover:bg-destructive/10 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {busyAction === 'cancel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  <span>{busyAction === 'cancel' ? 'Đang hủy...' : 'Hủy vận đơn'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-landing-ivory rounded-[2px] border border-landing-line p-6 sm:p-8 md:p-9">
            <div className="border-b border-landing-line pb-6 mb-7 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-landing-oxblood mb-1.5">
                  <Truck className="w-4 h-4 text-landing-oxblood" />
                  <span>Chi tiết vận đơn {shipment.provider || 'GHN'}</span>
                </div>
                <h1 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] font-medium leading-[1.08] tracking-[-0.025em] text-landing-oxblood">
                  {shipment.providerOrderCode || 'Chưa có mã GHN'}
                </h1>
                <p className="text-[12px] text-landing-muted font-mono mt-1">Mã hệ thống: {shipment.id}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-landing-paper text-landing-obsidian text-xs font-bold">
                  {shipmentStatusLabel(shipment.status, shipment.rawStatus)}
                </span>
                {shipment.rawStatus && (
                  <span className="px-3 py-1 rounded-full bg-metric-users/10 text-metric-users text-xs font-semibold font-mono">{shipment.rawStatus}</span>
                )}
                {shipment.issue && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Có sự cố
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="flex flex-col gap-7 min-w-0">
                <section className="rounded-[2px] border border-landing-line p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-label-sm font-semibold text-landing-muted uppercase">Đơn hàng</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">
                        #{shipment.order.orderCode} · {ORDER_STATUS_CFG[shipment.order.status]?.label || shipment.order.status}
                      </p>
                      <p className="text-body-sm text-landing-obsidian mt-1">
                        Thanh toán: {shipment.order.paymentStatus || '—'} · Tổng: {fmt(shipment.order.totalVnd ?? shipment.order.amount)}
                      </p>
                    </div>
                    <Link
                      href={`/admin/orders/${shipment.order.id}`}
                      className="inline-flex items-center gap-1.5 text-landing-oxblood font-semibold hover:underline no-underline shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" /> Mở đơn
                    </Link>
                  </div>
                </section>

                <section>
                  <p className={SECTION_TITLE}>Sản phẩm</p>
                  <div className="divide-y divide-landing-line rounded-[2px] border border-landing-line overflow-hidden">
                    {shipment.items.map(item => (
                      <div key={item.id} className="px-4 py-3 flex justify-between gap-3 text-body-sm">
                        <span className="font-medium text-landing-obsidian">{item.name || item.productId}</span>
                        <span className="text-landing-muted shrink-0">x{item.quantity} · {fmt(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <p className={SECTION_TITLE}>Timeline</p>
                  <div className="flex flex-col gap-3">
                    {shipment.events.map(event => (
                      <div key={event.id} className="rounded-[2px] bg-landing-paper/60 border border-landing-line p-3 text-body-sm">
                        <div className="flex justify-between gap-3">
                          <span className="font-semibold text-landing-obsidian">{event.type}</span>
                          <span className="text-landing-muted shrink-0">{fmtDateTime(event.occurredAt)}</span>
                        </div>
                        <p className="text-landing-obsidian mt-1">{event.publicMessage || event.internalNote || '—'}</p>
                        {(event.fromShipmentStatus || event.toShipmentStatus) && (
                          <p className="text-label-sm text-landing-muted mt-1">{event.fromShipmentStatus || '—'} → {event.toShipmentStatus || '—'}</p>
                        )}
                      </div>
                    ))}
                    {shipment.events.length === 0 && <p className="text-body-sm text-landing-muted">Chưa có timeline vận chuyển.</p>}
                  </div>
                </section>
              </div>

              <aside className="flex flex-col gap-7">
                <section>
                  <p className={SECTION_TITLE}>Người nhận</p>
                  <div className="text-body-sm text-landing-obsidian space-y-1">
                    <p className="font-semibold">{shipment.receiver.name || shipment.customer.name || '—'}</p>
                    <p>Điện thoại: {shipment.receiver.phone || shipment.customer.phone || '—'}</p>
                    <p>Địa chỉ: {shipment.receiver.address || '—'}</p>
                    <p>{[shipment.receiver.wardName, shipment.receiver.provinceName].filter(Boolean).join(', ') || '—'}</p>
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-3">
                  <Info label="Phí quote" value={fmt(shipment.quotedShippingFee ?? 0)} />
                  <Info label="Phí thực tế" value={fmt(shipment.actualShippingFee ?? shipment.shippingFeeVnd ?? 0)} />
                  <Info label="Dự kiến giao" value={fmtDateTime(shipment.expectedDeliveryTime)} />
                  <Info label="Sync cuối" value={fmtDateTime(shipment.lastSyncedAt)} />
                </section>

                <section>
                  <p className={SECTION_TITLE}>Webhook / audit</p>
                  <div className="flex flex-col gap-2">
                    {shipment.webhooks.slice(0, 10).map(webhook => (
                      <div key={webhook.id} className="rounded-[2px] border border-landing-line px-3 py-2 text-label-sm text-landing-obsidian">
                        <span className="font-mono">{webhook.eventType || 'event'}</span> · {webhook.status} · {fmtDateTime(webhook.receivedAt)}
                      </div>
                    ))}
                    {shipment.webhooks.length === 0 && <p className="text-body-sm text-landing-muted">Chưa có webhook audit.</p>}
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[2px] border border-landing-line p-3">
      <p className="text-label-sm text-landing-muted font-semibold">{label}</p>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink mt-1">{value}</p>
    </div>
  );
}

'use client';

import { ORDER_STATUS_CFG } from '@/features/admin/constants/admin-dashboard-page';
import { fmt, shipmentStatusLabel } from '@/features/admin/services/format';
import type { AdminShipmentModalProps } from '@/features/admin/types/admin-shipment-modal';
import { ExternalLink, Loader2, RefreshCw, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export function AdminShipmentModal({ shipment, onClose, onSync, onCancel, onSimulateDelivered, onOpenOrder }: AdminShipmentModalProps) {
  const [busyAction, setBusyAction] = useState<'sync' | 'deliver' | 'cancel' | null>(null);
  const canSimulateDelivered = !['DELIVERED', 'RETURNED', 'CANCELLED'].includes(shipment.status);
  const busy = busyAction !== null;

  const run = async (action: () => Promise<void>, key: 'sync' | 'deliver' | 'cancel') => {
    if (busy) return;
    setBusyAction(key);
    try {
      await action();
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <motion.div className="absolute inset-0 bg-landing-obsidian/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="absolute right-0 top-0 bottom-0 w-full max-w-[560px] bg-landing-ivory flex flex-col z-10" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.28, ease: 'easeInOut' }}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-landing-line">
          <div>
            <p className="text-label-sm text-landing-muted font-semibold uppercase">{shipment.provider}</p>
            <h2 className="font-display text-[1.15rem] leading-tight text-landing-obsidian font-mono">{shipment.providerOrderCode || 'Chưa có mã GHN'}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full bg-landing-paper text-landing-obsidian text-label-sm font-semibold">{shipmentStatusLabel(shipment.status, shipment.rawStatus)}</span>
              {shipment.rawStatus && <span className="px-2 py-0.5 rounded-full bg-metric-users/10 text-metric-users text-label-sm font-semibold">{shipment.rawStatus}</span>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-landing-paper border-0 bg-transparent cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <section className="rounded-[2px] border border-landing-line p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-label-sm font-semibold text-landing-muted uppercase">Đơn hàng</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">#{shipment.order.orderCode} · {ORDER_STATUS_CFG[shipment.order.status]?.label || shipment.order.status}</p>
                <p className="text-body-sm text-landing-obsidian mt-1">Thanh toán: {shipment.order.paymentStatus || '—'} · Tổng: {fmt(shipment.order.totalVnd ?? shipment.order.amount)}</p>
              </div>
              <button onClick={() => onOpenOrder(shipment.order.orderCode)} className="inline-flex items-center gap-1.5 text-landing-oxblood font-semibold hover:underline bg-transparent border-0 cursor-pointer"><ExternalLink className="w-4 h-4" /> Mở đơn</button>
            </div>
          </section>

          <section>
            <p className="text-label-sm font-semibold text-landing-muted uppercase tracking-wide mb-2">Người nhận</p>
            <div className="text-body-sm text-landing-obsidian space-y-1">
              <p className="font-semibold text-landing-obsidian">{shipment.receiver.name || shipment.customer.name || '—'}</p>
              <p>Điện thoại: {shipment.receiver.phone || shipment.customer.phone || '—'}</p>
              <p>Địa chỉ: {shipment.receiver.address || '—'}</p>
              <p>{[shipment.receiver.wardName, shipment.receiver.provinceName].filter(Boolean).join(', ') || '—'}</p>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <Info label="Phí quote" value={fmt(shipment.quotedShippingFee ?? 0)} />
            <Info label="Phí thực tế" value={fmt(shipment.actualShippingFee ?? shipment.shippingFeeVnd ?? 0)} />
            <Info label="Dự kiến giao" value={shipment.expectedDeliveryTime?.substring(0, 16).replace('T', ' ') || '—'} />
            <Info label="Sync cuối" value={shipment.lastSyncedAt?.substring(0, 16).replace('T', ' ') || '—'} />
          </section>

          <section>
            <p className="text-label-sm font-semibold text-landing-muted uppercase tracking-wide mb-2">Sản phẩm</p>
            <div className="divide-y divide-landing-line rounded-[2px] border border-landing-line overflow-hidden">
              {shipment.items.map(item => (
                <div key={item.id} className="px-4 py-3 flex justify-between gap-3 text-body-sm">
                  <span className="font-medium text-landing-obsidian">{item.name || item.productId}</span>
                  <span className="text-landing-muted">x{item.quantity} · {fmt(item.price)}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="text-label-sm font-semibold text-landing-muted uppercase tracking-wide mb-2">Timeline</p>
            <div className="flex flex-col gap-3">
              {shipment.events.map(event => (
                <div key={event.id} className="rounded-[2px] bg-landing-paper/60 border border-landing-line p-3 text-body-sm">
                  <div className="flex justify-between gap-3"><span className="font-semibold text-landing-obsidian">{event.type}</span><span className="text-landing-muted">{event.occurredAt.substring(0, 16).replace('T', ' ')}</span></div>
                  <p className="text-landing-obsidian mt-1">{event.publicMessage || event.internalNote || '—'}</p>
                  {(event.fromShipmentStatus || event.toShipmentStatus) && <p className="text-label-sm text-landing-muted mt-1">{event.fromShipmentStatus || '—'} → {event.toShipmentStatus || '—'}</p>}
                </div>
              ))}
              {shipment.events.length === 0 && <p className="text-body-sm text-landing-muted">Chưa có timeline vận chuyển.</p>}
            </div>
          </section>

          <section>
            <p className="text-label-sm font-semibold text-landing-muted uppercase tracking-wide mb-2">Webhook / audit</p>
            <div className="flex flex-col gap-2">
              {shipment.webhooks.slice(0, 5).map(webhook => (
                <div key={webhook.id} className="rounded-[2px] border border-landing-line px-3 py-2 text-label-sm text-landing-obsidian">
                  <span className="font-mono text-landing-obsidian">{webhook.eventType || 'event'}</span> · {webhook.status} · {webhook.receivedAt.substring(0, 16).replace('T', ' ')}
                </div>
              ))}
              {shipment.webhooks.length === 0 && <p className="text-body-sm text-landing-muted">Chưa có webhook audit.</p>}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-landing-line flex gap-3">
          <button disabled={busy} onClick={() => run(() => onSync(shipment.id), 'sync')} className="flex-1 h-10 rounded-[2px] bg-landing-oxblood text-landing-paper font-semibold text-body-sm hover:opacity-90 disabled:opacity-50 border-0 cursor-pointer inline-flex items-center justify-center gap-2">
            {busyAction === 'sync' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {busyAction === 'sync' ? 'Đang sync...' : 'Sync GHN'}
          </button>
          {canSimulateDelivered && (
            <button disabled={busy} onClick={() => run(() => onSimulateDelivered(shipment.id), 'deliver')} className="flex-1 h-10 rounded-[2px] bg-metric-products text-landing-paper font-semibold text-body-sm hover:bg-landing-obsidian disabled:opacity-50 border-0 cursor-pointer inline-flex items-center justify-center gap-2">
              {busyAction === 'deliver' && <Loader2 className="w-4 h-4 animate-spin" />}
              {busyAction === 'deliver' ? 'Đang xử lý...' : 'Giả lập đã giao'}
            </button>
          )}
          {shipment.canCancel && (
            <button disabled={busy} onClick={() => run(() => onCancel(shipment.id), 'cancel')} className="flex-1 h-10 rounded-[2px] bg-destructive text-landing-paper font-semibold text-body-sm hover:bg-destructive/90 disabled:opacity-50 border-0 cursor-pointer inline-flex items-center justify-center gap-2">
              {busyAction === 'cancel' && <Loader2 className="w-4 h-4 animate-spin" />}
              {busyAction === 'cancel' ? 'Đang hủy...' : 'Hủy vận đơn'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[2px] border border-landing-line p-3"><p className="text-label-sm text-landing-muted font-semibold">{label}</p><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink mt-1">{value}</p></div>;
}

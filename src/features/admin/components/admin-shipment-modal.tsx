'use client';

import { fmt } from '@/features/admin/services/format';
import type { AdminShipmentModalProps } from '@/features/admin/types/admin-shipment-modal';
import { ExternalLink, RefreshCw, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export function AdminShipmentModal({ shipment, onClose, onSync, onCancel, onSimulateDelivered, onOpenOrder }: AdminShipmentModalProps) {
  const [busy, setBusy] = useState(false);
  const canSimulateDelivered = !['DELIVERED', 'RETURNED', 'CANCELLED'].includes(shipment.status);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="absolute right-0 top-0 bottom-0 w-full max-w-[560px] bg-white shadow-2xl flex flex-col z-10" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.28, ease: 'easeInOut' }}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-100">
          <div>
            <p className="text-label-sm text-neutral-500 font-semibold uppercase">{shipment.provider}</p>
            <h2 className="text-body-lg font-bold text-neutral-900 font-mono">{shipment.providerOrderCode || 'Chưa có mã GHN'}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-label-sm font-semibold">{shipment.status}</span>
              {shipment.rawStatus && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-label-sm font-semibold">{shipment.rawStatus}</span>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 border-0 bg-transparent cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <section className="rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-label-sm font-semibold text-neutral-500 uppercase">Đơn hàng</p>
                <p className="text-body-sm font-bold text-neutral-900">#{shipment.order.orderCode} · {shipment.order.status}</p>
                <p className="text-body-sm text-neutral-600 mt-1">Thanh toán: {shipment.order.paymentStatus || '—'} · Tổng: {fmt(shipment.order.totalVnd ?? shipment.order.amount)}</p>
              </div>
              <button onClick={() => onOpenOrder(shipment.order.orderCode)} className="inline-flex items-center gap-1.5 text-brand-navy font-semibold hover:underline bg-transparent border-0 cursor-pointer"><ExternalLink className="w-4 h-4" /> Mở đơn</button>
            </div>
          </section>

          <section>
            <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Người nhận</p>
            <div className="text-body-sm text-neutral-700 space-y-1">
              <p className="font-semibold text-neutral-900">{shipment.receiver.name || shipment.customer.name || '—'}</p>
              <p>Điện thoại: {shipment.receiver.phone || shipment.customer.phone || '—'}</p>
              <p>Địa chỉ: {shipment.receiver.address || '—'}</p>
              <p>{[shipment.receiver.wardName, shipment.receiver.districtName, shipment.receiver.provinceName].filter(Boolean).join(', ') || '—'}</p>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <Info label="Phí quote" value={fmt(shipment.quotedShippingFee ?? 0)} />
            <Info label="Phí thực tế" value={fmt(shipment.actualShippingFee ?? shipment.shippingFeeVnd ?? 0)} />
            <Info label="Dự kiến giao" value={shipment.expectedDeliveryTime?.substring(0, 16).replace('T', ' ') || '—'} />
            <Info label="Sync cuối" value={shipment.lastSyncedAt?.substring(0, 16).replace('T', ' ') || '—'} />
          </section>

          <section>
            <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Sản phẩm</p>
            <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 overflow-hidden">
              {shipment.items.map(item => (
                <div key={item.id} className="px-4 py-3 flex justify-between gap-3 text-body-sm">
                  <span className="font-medium text-neutral-800">{item.name || item.productId}</span>
                  <span className="text-neutral-500">x{item.quantity} · {fmt(item.price)}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Timeline</p>
            <div className="flex flex-col gap-3">
              {shipment.events.map(event => (
                <div key={event.id} className="rounded-xl bg-neutral-50 border border-neutral-100 p-3 text-body-sm">
                  <div className="flex justify-between gap-3"><span className="font-semibold text-neutral-900">{event.type}</span><span className="text-neutral-500">{event.occurredAt.substring(0, 16).replace('T', ' ')}</span></div>
                  <p className="text-neutral-600 mt-1">{event.publicMessage || event.internalNote || '—'}</p>
                  {(event.fromShipmentStatus || event.toShipmentStatus) && <p className="text-label-sm text-neutral-500 mt-1">{event.fromShipmentStatus || '—'} → {event.toShipmentStatus || '—'}</p>}
                </div>
              ))}
              {shipment.events.length === 0 && <p className="text-body-sm text-neutral-400">Chưa có timeline vận chuyển.</p>}
            </div>
          </section>

          <section>
            <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Webhook / audit</p>
            <div className="flex flex-col gap-2">
              {shipment.webhooks.slice(0, 5).map(webhook => (
                <div key={webhook.id} className="rounded-lg border border-neutral-200 px-3 py-2 text-label-sm text-neutral-600">
                  <span className="font-mono text-neutral-900">{webhook.eventType || 'event'}</span> · {webhook.status} · {webhook.receivedAt.substring(0, 16).replace('T', ' ')}
                </div>
              ))}
              {shipment.webhooks.length === 0 && <p className="text-body-sm text-neutral-400">Chưa có webhook audit.</p>}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-neutral-100 flex gap-3">
          <button disabled={busy} onClick={() => run(() => onSync(shipment.id))} className="flex-1 h-10 rounded-xl bg-brand-navy text-white font-semibold text-body-sm hover:opacity-90 disabled:opacity-50 border-0 cursor-pointer inline-flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> Sync GHN</button>
          {canSimulateDelivered && <button disabled={busy} onClick={() => run(() => onSimulateDelivered(shipment.id))} className="flex-1 h-10 rounded-xl bg-emerald-600 text-white font-semibold text-body-sm hover:bg-emerald-700 disabled:opacity-50 border-0 cursor-pointer">Giả lập đã giao</button>}
          {shipment.canCancel && <button disabled={busy} onClick={() => run(() => onCancel(shipment.id))} className="flex-1 h-10 rounded-xl bg-red-600 text-white font-semibold text-body-sm hover:bg-red-700 disabled:opacity-50 border-0 cursor-pointer">Hủy vận đơn</button>}
        </div>
      </motion.div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-neutral-200 p-3"><p className="text-label-sm text-neutral-500 font-semibold">{label}</p><p className="text-body-sm font-bold text-neutral-900 mt-1">{value}</p></div>;
}

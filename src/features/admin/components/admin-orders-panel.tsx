'use client';

import { ORDER_STATUS_CFG } from '@/features/admin/constants/admin-dashboard-page';
import { fmt } from '@/features/admin/services/format';
import type { AdminOrdersPanelProps } from '@/features/admin/types/admin-orders-panel';

export function AdminOrdersPanel({ orders, setSelectedOrder }: AdminOrdersPanelProps) {
  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      <div className="shrink-0">
        <h1 className="text-heading-h2 font-bold text-neutral-900">Quản lý Đơn hàng</h1>
        <p className="text-body-sm text-neutral-500 mt-1">Theo dõi, kiểm tra thanh toán và chuyển trạng thái vận chuyển</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-auto flex-1 min-h-0">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-neutral-50 z-10 shadow-2xs">
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-label-sm font-semibold uppercase">
                <th className="px-6 py-3 bg-neutral-50">Mã đơn</th>
                <th className="px-4 py-3 bg-neutral-50">Khách hàng</th>
                <th className="px-4 py-3 text-right bg-neutral-50">Tổng tiền</th>
                <th className="px-4 py-3 bg-neutral-50">Vận đơn</th>
                <th className="px-4 py-3 bg-neutral-50">Ngày đặt</th>
                <th className="px-4 py-3 bg-neutral-50">Trạng thái</th>
                <th className="px-6 py-3 bg-neutral-50"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-body-sm">
              {orders.map(o => {
                const cfg = ORDER_STATUS_CFG[o.status] || ORDER_STATUS_CFG.PENDING;
                const Icon = cfg.icon;
                return (
                  <tr key={o.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-3.5 font-semibold text-neutral-800">{o.code}</td>
                    <td className="px-4 py-3.5">{o.customer}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-brand-navy">{fmt(o.total)}</td>
                    <td className="px-4 py-3.5">
                      {o.shipment ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono font-semibold text-neutral-800">{o.shipment.providerOrderCode || '—'}</span>
                          <span className="text-label-sm text-neutral-500">{o.shipment.status}{o.shipment.rawStatus ? ` · ${o.shipment.rawStatus}` : ''}</span>
                        </div>
                      ) : <span className="text-neutral-400">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-neutral-500">{o.date}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold ${cfg.cls}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="text-brand-navy font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-neutral-400">Chưa có đơn hàng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

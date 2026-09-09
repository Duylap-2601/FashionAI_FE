'use client';

import type { SubscriptionHistoryProps } from '@/features/subscription/types/subscription-history';
import {
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function SubscriptionHistory({ isHistoryLoading, history, formatDate, getStatusBadge, historyMeta, setHistoryPage, historyPage }: SubscriptionHistoryProps) {
  return (
    <div className="max-w-[960px] mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-heading-h3 font-bold text-brand-navy">Lịch sử giao dịch gói</h3>
            <p className="text-body-sm text-neutral-500 mt-0.5">Danh sách các gói cước bạn đã đăng ký</p>
          </div>
        </div>

        {isHistoryLoading ? (
          <div className="p-12 text-center text-neutral-500">Đang tải lịch sử đăng ký...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            Bạn chưa có lịch sử đăng ký gói trả phí nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                  <th className="py-3.5 px-6">Mã đơn</th>
                  <th className="py-3.5 px-6">Gói cước</th>
                  <th className="py-3.5 px-6">Thời hạn</th>
                  <th className="py-3.5 px-6">Số tiền</th>
                  <th className="py-3.5 px-6">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-neutral-700">
                      #{item.order?.orderCode || item.id.slice(0, 8)}
                    </td>
                    <td className="py-4 px-6 font-bold text-brand-navy">
                      Gói {item.tier}
                    </td>
                    <td className="py-4 px-6 text-neutral-600 text-[13px]">
                      {formatDate(item.startsAt)} &rarr; {formatDate(item.expiresAt)}
                    </td>
                    <td className="py-4 px-6 font-bold text-brand-navy">
                      {item.order?.amount ? `${item.order.amount.toLocaleString('vi-VN')}đ` : '—'}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(item.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {historyMeta && historyMeta.totalPages > 1 && (
          <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-body-sm text-neutral-500">
              Trang {historyMeta.page} / {historyMeta.totalPages} (Tổng {historyMeta.total} đơn)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setHistoryPage((p: number) => Math.max(1, p - 1))}
                disabled={historyPage === 1}
                className="px-3 py-1.5 border border-neutral-200 rounded-lg text-body-sm font-semibold disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setHistoryPage((p: number) => Math.min(historyMeta.totalPages, p + 1))}
                disabled={historyPage === historyMeta.totalPages}
                className="px-3 py-1.5 border border-neutral-200 rounded-lg text-body-sm font-semibold disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

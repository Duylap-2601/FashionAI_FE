'use client';

import { AccountPagination, AccountStatePanel } from '@/features/profile/components/account-ui';
import type { SubscriptionHistoryProps } from '@/features/subscription/types/subscription-history';

export function SubscriptionHistory({ isHistoryLoading, history, formatDate, getStatusBadge, historyMeta, setHistoryPage, historyPage }: SubscriptionHistoryProps) {
  if (isHistoryLoading) {
    return (
      <div className="space-y-2" aria-hidden="true">
        {[0, 1, 2].map((key) => <div key={key} className="h-12 animate-pulse bg-landing-taupe/30" />)}
      </div>
    );
  }

  if (history.length === 0) {
    return <AccountStatePanel title="Chưa có giao dịch nào" description="Các lần mua và gia hạn gói trả phí sẽ hiện ở đây." />;
  }

  return (
    <div>
      <div className="overflow-x-auto border border-landing-line">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">Lịch sử mua gói thành viên</caption>
          <thead>
            <tr className="border-b border-landing-line bg-landing-ivory/60 text-left">
              {['Mã', 'Gói', 'Thời hạn', 'Số tiền', 'Trạng thái'].map((heading) => (
                <th key={heading} scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className="border-b border-landing-line/60 last:border-b-0">
                <td className="px-4 py-3 font-mono text-xs text-landing-obsidian">#{item.order?.orderCode || item.id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-landing-obsidian">{item.tier}</td>
                <td className="px-4 py-3 font-mono text-xs text-landing-muted">{formatDate(item.startsAt)} – {formatDate(item.expiresAt)}</td>
                <td className="px-4 py-3 font-mono text-xs text-landing-oxblood">{item.order?.amount ? `${item.order.amount.toLocaleString('vi-VN')}đ` : 'Chưa có'}</td>
                <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {historyMeta ? (
        <AccountPagination
          page={historyPage}
          totalPages={historyMeta.totalPages}
          onPageChange={setHistoryPage}
          summary={`${historyMeta.total} giao dịch`}
        />
      ) : null}
    </div>
  );
}

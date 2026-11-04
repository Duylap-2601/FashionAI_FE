'use client';

import { REFUND_STATUS_CFG } from '@/features/admin/constants/admin-dashboard-page';
import { fmt, fmtDateTime } from '@/features/admin/services/format';
import type { AdminRefundHistoryProps, RefundFinalizeOutcome } from '@/features/admin/types/admin-refund-history';
import { REFUND_KIND_LABELS } from '@/features/orders/constants/profile-orders-page';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

const OUTCOME_LABEL: Record<RefundFinalizeOutcome, string> = {
  COMPLETED: 'Thành công',
  FAILED: 'Thất bại',
};

/** Refund rows for an order on admin surfaces: paper card, hairline rows, mono figures. */
export function AdminRefundHistory({ refunds, onFinalize, children }: AdminRefundHistoryProps) {
  const [finalizing, setFinalizing] = useState<{ refundId: string; outcome: RefundFinalizeOutcome } | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (refunds.length === 0) return null;

  const startFinalize = (refundId: string, outcome: RefundFinalizeOutcome) => {
    setFinalizing({ refundId, outcome });
    setNote('');
  };

  const submitFinalize = async () => {
    if (!finalizing || !onFinalize) return;
    setSubmitting(true);
    try {
      const ok = await onFinalize(finalizing.refundId, finalizing.outcome, note.trim() || undefined);
      if (ok !== false) {
        setFinalizing(null);
        setNote('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-[2px] border border-landing-line bg-landing-ivory p-5 sm:p-6">
      <header className="mb-4 flex items-center justify-between gap-2 border-b border-landing-line pb-3.5">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-landing-oxblood" />
          <h3 className="font-display text-[1.05rem] leading-tight text-landing-oxblood">Lịch sử hoàn tiền</h3>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-landing-muted">{refunds.length} lượt</span>
      </header>

      <ol className="divide-y divide-landing-line">
        {refunds.map((refund) => {
          const status = REFUND_STATUS_CFG[refund.status] ?? {
            label: refund.status,
            cls: 'bg-landing-paper text-landing-muted border border-landing-line',
          };
          return (
            <li key={refund.id} className="space-y-2 py-3 text-xs first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-baseline gap-2">
                  <span className="font-mono text-sm font-semibold text-destructive">-{fmt(refund.amountVnd)}</span>
                  <span className="text-[11px] text-landing-muted">{REFUND_KIND_LABELS[refund.kind ?? 'GOODS']}</span>
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.cls}`}>{status.label}</span>
              </div>

              <dl className="grid grid-cols-[4.5rem_1fr] gap-x-2 gap-y-1 text-[11px]">
                {refund.reason && (
                  <>
                    <dt className="text-landing-muted">Lý do</dt>
                    <dd className="break-words text-landing-obsidian">{refund.reason}</dd>
                  </>
                )}
                <dt className="text-landing-muted">Cổng</dt>
                <dd className="font-mono text-landing-obsidian">{refund.provider}</dd>
                <dt className="text-landing-muted">Yêu cầu</dt>
                <dd className="font-mono text-landing-obsidian">{fmtDateTime(refund.requestedAt)}</dd>
                {refund.processedAt && (
                  <>
                    <dt className="text-landing-muted">Xử lý</dt>
                    <dd className="font-mono text-landing-obsidian">{fmtDateTime(refund.processedAt)}</dd>
                  </>
                )}
                {refund.failedReason && (
                  <>
                    <dt className="text-landing-muted">Lỗi</dt>
                    <dd className="break-words font-medium text-destructive">{refund.failedReason}</dd>
                  </>
                )}
              </dl>

              {/* Refund MoMo kẹt ở PROCESSING: admin chốt tay kết quả. */}
              {refund.status === 'PROCESSING' && onFinalize && (
                <div className="space-y-2 border-t border-dashed border-landing-line pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-landing-obsidian">Refund MoMo bị kẹt:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => startFinalize(refund.id, 'COMPLETED')}
                        className="cursor-pointer rounded-[2px] border border-metric-products/40 bg-metric-products/10 px-2.5 py-1 text-[11px] font-semibold text-metric-products hover:bg-metric-products/20"
                      >
                        Chốt thành công
                      </button>
                      <button
                        type="button"
                        onClick={() => startFinalize(refund.id, 'FAILED')}
                        className="cursor-pointer rounded-[2px] border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/20"
                      >
                        Chốt thất bại
                      </button>
                    </div>
                  </div>

                  {finalizing?.refundId === refund.id && (
                    <div className="space-y-2 rounded-[2px] border border-landing-line bg-landing-paper/60 p-2.5">
                      <p className="text-[11px] font-semibold text-landing-obsidian">
                        Chốt kết quả: {OUTCOME_LABEL[finalizing.outcome]}
                      </p>
                      <input
                        type="text"
                        placeholder="Ghi chú nội bộ (tùy chọn)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full rounded-[2px] border border-landing-line bg-landing-ivory px-2.5 py-1.5 text-xs focus:border-landing-oxblood focus:outline-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setFinalizing(null)}
                          className="cursor-pointer border-0 bg-transparent px-2 py-1 text-[11px] text-landing-muted hover:text-landing-obsidian"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={submitFinalize}
                          disabled={submitting}
                          className="cursor-pointer rounded-[2px] border-0 bg-landing-oxblood px-3 py-1 text-[11px] font-semibold text-landing-paper hover:bg-landing-oxblood/90 disabled:opacity-50"
                        >
                          {submitting ? 'Đang lưu...' : 'Xác nhận chốt'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {children}
    </section>
  );
}

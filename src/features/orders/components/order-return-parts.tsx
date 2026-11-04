'use client';

import { ToneLabel } from '@/features/orders/components/order-status-label';
import { RefundReceiptImages } from '@/features/orders/components/refund-receipt-images';
import { REFUND_KIND_LABELS, type OrderStatusTone } from '@/features/orders/constants/profile-orders-page';
import { formatOrderDateTime, formatVnd } from '@/features/orders/services/order-display';
import type { Order, OrderHistoryEvent, OrderRefundStatus } from '@/features/orders/types/orders';
import { accountButtonClassName, accountFocusRing } from '@/features/profile/components/account-ui';
import { cn, formatRefundEvidence } from '@/lib/utils';
import type React from 'react';
import { useState } from 'react';

export const REFUND_STATUS: Record<OrderRefundStatus, { label: string; tone: OrderStatusTone }> = {
  PENDING: { label: 'Đang xử lý', tone: 'attention' },
  REQUIRED: { label: 'Chờ chuyển tiền', tone: 'attention' },
  PROCESSING: { label: 'Đang xử lý', tone: 'attention' },
  COMPLETED: { label: 'Đã hoàn', tone: 'done' },
  FAILED: { label: 'Chưa thành công', tone: 'error' },
  CANCELLED: { label: 'Đã hủy', tone: 'closed' },
};

export const RETURN_FLOW_TITLES: Record<string, string> = {
  RETURN_REQUESTED: 'Yêu cầu hoàn trả đã được ghi nhận',
  RETURN_APPROVED: 'Yêu cầu hoàn trả đã được duyệt',
  RETURNING: 'Hàng đang trên đường gửi về cửa hàng',
};

/** Ghi chú có vạch trái: brass cho việc đang chờ, sage cho việc đã xong. */
export function OrderNotice({ tone = 'attention', title, children }: { tone?: 'attention' | 'done'; title: string; children?: React.ReactNode }) {
  return (
    <div className={cn('border-l-2 bg-landing-ivory/70 px-4 py-3', tone === 'done' ? 'border-landing-sage' : 'border-landing-brass')}>
      <p className={cn('text-sm font-medium', tone === 'done' ? 'text-landing-sage-ink' : 'text-landing-obsidian')}>{title}</p>
      {children ? <div className="mt-1.5 space-y-2.5 text-sm leading-relaxed text-landing-muted">{children}</div> : null}
    </div>
  );
}

export function RefundAccount({ order }: { order: Order }) {
  if (!order.refundAccountNumber) return null;
  return (
    <p>
      Tài khoản nhận hoàn: <span className="text-landing-obsidian">{order.refundBankName || 'Ngân hàng'}</span> ·{' '}
      <span className="font-mono text-landing-obsidian">{order.refundAccountNumber}</span>
      {order.refundAccountHolder ? <span className="text-landing-obsidian"> · {order.refundAccountHolder}</span> : null}
    </p>
  );
}

/** Các khoản shop chuyển hoàn (tiền hàng, phí ship) kèm mã giao dịch và ảnh chứng từ. */
export function OrderRefundLines({ order }: { order: Order }) {
  const refundEvidenceText = formatRefundEvidence(order.refundEvidence);
  return (
    <>
      <ol className="divide-y divide-landing-line/60">
        {(order.refunds ?? []).map((refund) => {
          const refundStatus = REFUND_STATUS[refund.status] ?? { label: refund.status, tone: 'closed' as const };
          return (
            <li key={refund.id} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-landing-obsidian">{REFUND_KIND_LABELS[refund.kind ?? 'GOODS']}</p>
                <ToneLabel tone={refundStatus.tone} label={refundStatus.label} />
                {refund.status === 'FAILED' ? (
                  <p className="text-xs text-destructive">Lần chuyển trước chưa thành công, shop đang chuyển lại.</p>
                ) : null}
                <p className="text-xs text-landing-muted">
                  Yêu cầu <span className="font-mono">{formatOrderDateTime(refund.requestedAt)}</span>
                  {refund.processedAt ? (
                    <>
                      {' '}· Hoàn tất <span className="font-mono">{formatOrderDateTime(refund.processedAt)}</span>
                    </>
                  ) : null}
                </p>
              </div>
              <p className="font-mono text-base text-landing-oxblood">{formatVnd(refund.amountVnd)}</p>
            </li>
          );
        })}
      </ol>
      {refundEvidenceText || order.refundEvidence ? (
        <div className="mt-5 space-y-4 border-t border-landing-line/60 pt-5">
          {refundEvidenceText ? (
            /^https?:\/\//i.test(refundEvidenceText) ? (
              <a
                href={refundEvidenceText}
                target="_blank"
                rel="noreferrer"
                className={cn('text-sm text-landing-oxblood underline underline-offset-4', accountFocusRing)}
              >
                Xem chứng từ hoàn tiền
              </a>
            ) : (
              <p className="text-sm text-landing-muted">
                Mã giao dịch: <span className="font-mono text-landing-obsidian">{refundEvidenceText}</span>
              </p>
            )
          ) : null}
          <RefundReceiptImages evidence={order.refundEvidence} label="Ảnh chứng từ chuyển khoản" />
        </div>
      ) : null}
    </>
  );
}

const ISSUE_EVENT_TONE: Record<string, string> = {
  ORDER_ISSUE_REJECTED: 'text-destructive',
  ORDER_ISSUE_REFUND_APPROVED: 'text-landing-sage-ink',
};
const HISTORY_PREVIEW = 5;

/**
 * Dòng thời gian của đơn. Lịch sử dài (đổi trả, hoàn tiền) đẩy trang rất dài nên mặc
 * định chỉ hiện các cập nhật mới nhất. `issueHref` là nơi mở chi tiết báo lỗi.
 */
export function OrderHistoryTimeline({ events, issueHref, emptyText }: { events: OrderHistoryEvent[]; issueHref: string; emptyText: string }) {
  const [showAll, setShowAll] = useState(false);
  if (events.length === 0) return <p className="text-sm text-landing-muted">{emptyText}</p>;
  const visible = showAll ? events : events.slice(-HISTORY_PREVIEW);

  return (
    <>
      {events.length > HISTORY_PREVIEW ? (
        <button type="button" onClick={() => setShowAll((value) => !value)} className={cn(accountButtonClassName('quiet', 'sm'), 'mb-4 h-auto')}>
          {showAll ? 'Chỉ xem các cập nhật mới nhất' : `Xem toàn bộ ${events.length} cập nhật`}
        </button>
      ) : null}
      <ol className="border-l border-landing-line pl-5">
        {visible.map((event, index) => {
          const isLatest = index === visible.length - 1;
          const issueId = (event.metadata as { issueId?: string } | undefined)?.issueId;
          return (
            <li key={event.id} className="relative pb-5 last:pb-0">
              <span
                aria-hidden="true"
                className={cn('absolute -left-[24.5px] top-1.5 h-2 w-2 rounded-full', isLatest ? 'bg-landing-oxblood' : 'bg-landing-taupe')}
              />
              <p className={cn('text-sm leading-relaxed', ISSUE_EVENT_TONE[event.type] ?? 'text-landing-obsidian', isLatest && 'font-medium')}>
                {event.publicMessage || event.toStatus || event.type}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-landing-muted">
                <span className="font-mono">{formatOrderDateTime(event.occurredAt)}</span>
                {issueId ? (
                  <a href={issueHref} className={cn('text-landing-oxblood underline-offset-4 hover:underline', accountFocusRing)}>
                    Xem báo lỗi
                  </a>
                ) : null}
              </p>
            </li>
          );
        })}
      </ol>
    </>
  );
}

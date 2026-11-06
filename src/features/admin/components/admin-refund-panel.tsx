'use client';

import { ImageFilePreviews } from '@/components/ui/image-file-previews';
import { fmt, fmtDateTime } from '@/features/admin/services/format';
import { updateOrderRefund } from '@/features/admin/services/mutations';
import type { AdminRefundPanelProps } from '@/features/admin/types/admin-refund-panel';
import { RefundReceiptImages } from '@/features/orders/components/refund-receipt-images';
import { REFUND_KIND_LABELS } from '@/features/orders/constants/profile-orders-page';
import type { OrderRefund, OrderRefundKind, OrderRefundStatus } from '@/features/orders/types/orders';
import { describeImageFileRejection, useImageFileSelection } from '@/hooks/use-image-file-selection';
import { getErrorMessage } from '@/lib/errors';
import { cn, formatRefundEvidence, getRefundEvidenceImages } from '@/lib/utils';
import { Check, Copy, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

const MAX_REFUND_RECEIPT_IMAGES = 5;
const OPEN_REFUND_STATUSES: OrderRefundStatus[] = ['REQUIRED', 'PENDING', 'PROCESSING'];
const REFUND_KINDS: OrderRefundKind[] = ['GOODS', 'SHIPPING'];
const RETURN_STEPS = ['Khách yêu cầu', 'Duyệt hoàn tiền', 'Nhận hàng hoàn', 'Chuyển khoản'];
const RETURN_STATUSES = ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNING', 'RETURNED'];

const inputClassName =
  'w-full rounded-[2px] border border-landing-line bg-landing-paper/60 px-3 py-2 text-xs text-landing-obsidian placeholder:text-landing-muted focus:border-landing-oxblood focus:outline-none';
const subLabelClassName = 'text-[10.5px] font-semibold uppercase tracking-[0.16em] text-landing-muted';

function PanelColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5 p-5">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-landing-brass-ink">{title}</h3>
      {children}
    </div>
  );
}

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className={subLabelClassName}>{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function MoneyRow({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1 text-xs">
      <span className={strong ? 'font-semibold text-landing-obsidian' : 'text-landing-muted'}>{label}</span>
      <span className={cn('font-mono', strong ? 'text-sm font-semibold text-landing-oxblood' : 'text-landing-obsidian')}>{fmt(value)}</span>
    </div>
  );
}

function refundKind(refund: OrderRefund): OrderRefundKind {
  return refund.kind ?? 'GOODS';
}

/**
 * Chuyển khoản và ghi nhận một khoản hoàn (tiền hàng hoặc phí ship). Mỗi khoản có số
 * tiền, ảnh chứng từ và mã giao dịch riêng; khoản phí ship có thể chọn không hoàn.
 */
function RefundTransferForm({
  orderId,
  kind,
  suggestedVnd,
  approved,
  hasReceipts,
  onRecorded,
}: {
  orderId: string;
  kind: OrderRefundKind;
  suggestedVnd: number;
  approved: boolean;
  hasReceipts: boolean;
  onRecorded: () => Promise<unknown> | void;
}) {
  const [refundAmount, setRefundAmount] = useState('');
  const [refundNote, setRefundNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const receipts = useImageFileSelection({
    maxFiles: MAX_REFUND_RECEIPT_IMAGES,
    onReject: (rejection) => toast.error(describeImageFileRejection(rejection, 'ảnh chứng từ')),
  });
  const title = REFUND_KIND_LABELS[kind];
  const inputId = `refund-receipt-input-${kind.toLowerCase()}`;

  const confirmRefund = async () => {
    if (!refundNote.trim()) {
      toast.error('Vui lòng nhập mã giao dịch hoặc ghi chú chuyển khoản.');
      return;
    }
    if (receipts.files.length === 0 && !hasReceipts) {
      toast.error('Vui lòng đính kèm ảnh chứng từ chuyển khoản hoàn tiền để khách đối chiếu.');
      return;
    }
    const parsedAmount = refundAmount.trim() ? parseInt(refundAmount.trim(), 10) : undefined;
    if (parsedAmount !== undefined && (Number.isNaN(parsedAmount) || parsedAmount < 1)) {
      toast.error('Số tiền hoàn phải là số nguyên từ 1 VNĐ.');
      return;
    }
    setSubmitting(true);
    try {
      await updateOrderRefund(orderId, {
        refundStatus: 'COMPLETED',
        kind,
        amountVnd: parsedAmount,
        evidenceReference: refundNote.trim(),
        internalNote: refundNote.trim(),
        receiptImages: receipts.files,
      });
      toast.success(`Đã ghi nhận hoàn ${title.toLowerCase()}`);
      setRefundNote('');
      setRefundAmount('');
      receipts.clear();
      await onRecorded();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể ghi nhận hoàn tiền.'));
    } finally {
      setSubmitting(false);
    }
  };

  const skipShipping = async () => {
    if (!window.confirm(`Không hoàn phí ship ${fmt(suggestedVnd)} cho đơn này?`)) return;
    setSubmitting(true);
    try {
      await updateOrderRefund(orderId, {
        refundStatus: 'CANCELLED',
        kind,
        internalNote: 'Admin chọn không hoàn phí ship ban đầu',
      });
      toast.success('Đã bỏ khoản hoàn phí ship');
      await onRecorded();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể bỏ khoản hoàn phí ship.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-[2px] border border-landing-line p-4" aria-label={`Hoàn ${title.toLowerCase()}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="text-xs font-semibold text-landing-obsidian">{title}</h4>
        <span className="font-mono text-sm font-semibold text-landing-oxblood">{fmt(suggestedVnd)}</span>
      </div>

      <label className="block">
        <span className={subLabelClassName}>1. Số tiền đã chuyển</span>
        <input
          type="number"
          min={1}
          step={1000}
          value={refundAmount}
          onChange={(e) => setRefundAmount(e.target.value)}
          placeholder={suggestedVnd > 0 ? `Để trống = hoàn ${fmt(suggestedVnd)}` : 'Số tiền (VNĐ)'}
          className={cn(inputClassName, 'mt-1.5 font-mono')}
        />
        {suggestedVnd > 0 ? (
          <button
            type="button"
            onClick={() => setRefundAmount(String(suggestedVnd))}
            className="mt-1 cursor-pointer border-0 bg-transparent p-0 text-[11px] text-landing-oxblood underline underline-offset-2"
          >
            Điền số {approved ? 'đã duyệt' : 'còn lại'}: {fmt(suggestedVnd)}
          </button>
        ) : null}
      </label>

      <div>
        <span className={subLabelClassName}>
          2. Ảnh chuyển khoản{hasReceipts ? '' : ' *'}{' '}
          <span className="normal-case tracking-normal">
            (tối đa {MAX_REFUND_RECEIPT_IMAGES} — khách thấy trong đơn hàng và email hoàn tiền)
          </span>
        </span>
        <div className="mt-1.5">
          {receipts.items.length > 0 ? (
            <ImageFilePreviews
              items={receipts.items}
              onRemove={receipts.remove}
              onAdd={receipts.canAddMore ? () => document.getElementById(inputId)?.click() : undefined}
              disabled={submitting}
            />
          ) : (
            <label
              htmlFor={inputId}
              className="flex cursor-pointer items-center justify-center rounded-[2px] border border-dashed border-landing-taupe px-3 py-4 text-xs text-landing-muted transition-colors hover:border-landing-oxblood hover:text-landing-oxblood"
            >
              Chọn ảnh chuyển khoản
            </label>
          )}
          <input
            id={inputId}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              receipts.add(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <label className="block">
        <span className={subLabelClassName}>3. Mã giao dịch / ghi chú *</span>
        <input
          type="text"
          value={refundNote}
          onChange={(e) => setRefundNote(e.target.value)}
          placeholder="VD: VCB FT2611021234, chuyển tới STK của khách"
          className={cn(inputClassName, 'mt-1.5')}
        />
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={confirmRefund}
          disabled={submitting}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[2px] border-0 bg-landing-oxblood px-5 py-2.5 text-xs font-bold text-landing-paper transition-colors hover:bg-landing-obsidian disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? 'Đang ghi nhận' : `Xác nhận đã hoàn ${title.toLowerCase()}`}
        </button>
        {kind === 'SHIPPING' ? (
          <button
            type="button"
            onClick={skipShipping}
            disabled={submitting}
            className="inline-flex cursor-pointer items-center justify-center rounded-[2px] border border-landing-line bg-transparent px-4 py-2.5 text-xs font-bold text-landing-obsidian transition-colors hover:border-landing-oxblood disabled:opacity-50"
          >
            Không hoàn phí ship
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Mọi thứ admin cần để hoàn tiền một đơn, gom về một chỗ: đang ở bước nào, chuyển vào
 * tài khoản nào bao nhiêu tiền, chứng từ đã gửi khách, và đúng một việc cần làm tiếp.
 */
export function AdminRefundPanel({ order, updatingStatus, onReturnReceived, onRefundRecorded }: AdminRefundPanelProps) {
  const [copied, setCopied] = useState(false);

  const status = order.status;
  const isReturnFlow = RETURN_STATUSES.includes(status);
  const returnInTransit = ['RETURN_APPROVED', 'RETURNING'].includes(status);
  const isReturnReceived = status === 'RETURNED';
  const refundCompleted = order.refundStatus === 'COMPLETED';
  const refundRequired =
    order.refundStatus === 'REQUIRED' ||
    order.refundStatus === 'PROCESSING' ||
    (isReturnReceived && !refundCompleted);
  // Trả hàng: chỉ chốt hoàn tiền sau khi đã nhận lại hàng (RETURNED).
  const canConfirmRefund = refundRequired && (isReturnReceived || !isReturnFlow);
  const evidenceText = formatRefundEvidence(order.refundEvidence);
  const hasReceipts = getRefundEvidenceImages(order.refundEvidence).length > 0;

  if (!isReturnFlow && !refundRequired && !refundCompleted && !order.refundAccountNumber) return null;

  const paidVnd = order.amountPaidVnd ?? 0;
  const refundedVnd = order.amountRefundedVnd ?? 0;
  const remainingVnd = Math.max(0, paidVnd - refundedVnd);
  const refunds = order.refunds ?? [];
  // Khoản đã duyệt chờ chuyển, tách tiền hàng và phí ship. Để trống ô số tiền thì BE
  // hoàn đúng số đã duyệt của khoản; chưa có khoản nào (vd. hủy đơn sau khi thanh
  // toán) thì một khoản tiền hàng bằng phần còn lại của đơn.
  const openRefunds = REFUND_KINDS.flatMap((kind) => {
    const latest = refunds
      .filter((refund) => refund.provider === 'MANUAL' && refundKind(refund) === kind && OPEN_REFUND_STATUSES.includes(refund.status))
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())[0];
    return latest ? [{ kind, amountVnd: Math.min(latest.amountVnd, remainingVnd) }] : [];
  });
  const refundedOf = (kind: OrderRefundKind) =>
    refunds.filter((refund) => refundKind(refund) === kind && refund.status === 'COMPLETED').reduce((sum, refund) => sum + refund.amountVnd, 0);
  const hasShippingRefund = refunds.some((refund) => refundKind(refund) === 'SHIPPING');
  // Hoàn một món thì đơn vẫn còn tiền chưa hoàn, nhưng shop không còn nợ khách.
  const owedVnd = refundCompleted
    ? 0
    : openRefunds.length > 0
      ? Math.min(openRefunds.reduce((sum, refund) => sum + refund.amountVnd, 0), remainingVnd)
      : remainingVnd;
  const lastRefund = [...(order.refunds ?? [])]
    .filter((refund) => refund.status === 'COMPLETED')
    .sort((a, b) => new Date(b.processedAt ?? b.requestedAt).getTime() - new Date(a.processedAt ?? a.requestedAt).getTime())[0];

  // Số bước đã xong; bước kế tiếp (index = currentStep) là việc admin cần làm.
  const currentStep = refundCompleted ? 4 : isReturnReceived ? 3 : returnInTransit ? 2 : status === 'RETURN_REQUESTED' ? 1 : 0;
  const stage = refundCompleted
    ? { label: 'Đã hoàn tiền', cls: 'bg-metric-products/10 text-metric-products border-metric-products/30' }
    : canConfirmRefund
      ? { label: 'Cần chuyển khoản', cls: 'bg-destructive/10 text-destructive border-destructive/30' }
      : returnInTransit
        ? { label: 'Chờ nhận hàng hoàn', cls: 'bg-metric-users/10 text-metric-users border-metric-users/30' }
        : { label: 'Chờ duyệt yêu cầu', cls: 'bg-metric-users/10 text-metric-users border-metric-users/30' };

  const copyAccountNumber = async () => {
    if (!order.refundAccountNumber) return;
    try {
      await navigator.clipboard.writeText(order.refundAccountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Không sao chép được số tài khoản.');
    }
  };

  return (
    <section aria-labelledby="refund-panel-title" className="rounded-[2px] border border-landing-line bg-landing-ivory print:hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-landing-line px-5 py-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-landing-oxblood" />
          <h2 id="refund-panel-title" className="font-display text-[1.15rem] leading-tight text-landing-oxblood">
            {isReturnFlow ? 'Trả hàng và hoàn tiền' : 'Hoàn tiền cho khách'}
          </h2>
        </div>
        <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', stage.cls)}>{stage.label}</span>
      </header>

      {isReturnFlow ? (
        <ol className="grid grid-cols-4 gap-2 border-b border-landing-line px-5 py-4" aria-label="Tiến độ trả hàng">
          {RETURN_STEPS.map((label, index) => {
            const done = index < currentStep;
            const current = index === currentStep;
            return (
              <li key={label} aria-current={current ? 'step' : undefined}>
                <span aria-hidden="true" className={cn('block h-0.5', done ? 'bg-landing-oxblood' : 'bg-landing-taupe/60')} />
                <span
                  className={cn(
                    'mt-2 flex items-center gap-1.5 text-[11px] leading-snug',
                    current ? 'font-semibold text-landing-oxblood' : done ? 'text-landing-obsidian' : 'text-landing-muted',
                  )}
                >
                  <span className="font-mono">{index + 1}</span>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      ) : null}

      <div className="grid divide-y divide-landing-line md:grid-cols-2 md:divide-x md:divide-y-0">
        <PanelColumn title="Thông tin hoàn tiền">
          <InfoBlock label="Tài khoản nhận của khách">
            {order.refundAccountNumber ? (
              <div className="space-y-0.5">
                <p className="text-xs text-landing-muted">{order.refundBankName || 'Ngân hàng'}</p>
                <p className="flex items-center gap-1">
                  <span className="font-mono text-lg tracking-wide text-landing-obsidian">{order.refundAccountNumber}</span>
                  <button
                    type="button"
                    onClick={copyAccountNumber}
                    aria-label={copied ? 'Đã sao chép số tài khoản' : 'Sao chép số tài khoản'}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[2px] border-0 bg-transparent text-landing-muted hover:text-landing-oxblood"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-metric-products" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </p>
                <p className="text-xs font-semibold uppercase text-landing-obsidian">{order.refundAccountHolder || '—'}</p>
              </div>
            ) : (
              <p className="text-xs text-landing-muted">Khách chưa gửi tài khoản nhận hoàn.</p>
            )}
          </InfoBlock>

          <InfoBlock label="Số tiền">
            <div className="divide-y divide-landing-line/60">
              <MoneyRow label="Đã thu khách" value={paidVnd} />
              <MoneyRow label="Đã hoàn tiền hàng" value={refundedOf('GOODS')} />
              {hasShippingRefund ? <MoneyRow label="Đã hoàn phí ship" value={refundedOf('SHIPPING')} /> : null}
              <MoneyRow label="Còn phải hoàn" value={owedVnd} strong />
            </div>
          </InfoBlock>

          <InfoBlock label="Chứng từ đã gửi khách">
            {evidenceText || hasReceipts ? (
              <div className="space-y-3">
                {evidenceText ? (
                  <p className="text-xs text-landing-muted">
                    Mã giao dịch: <span className="font-mono text-landing-obsidian">{evidenceText}</span>
                  </p>
                ) : null}
                <RefundReceiptImages evidence={order.refundEvidence} label="Ảnh chuyển khoản" />
              </div>
            ) : (
              <p className="text-xs text-landing-muted">Chưa có chứng từ.</p>
            )}
          </InfoBlock>
        </PanelColumn>

        <PanelColumn title="Việc cần làm">
          {refundCompleted ? (
            <div className="space-y-2 border-l-2 border-metric-products pl-3">
              <p className="text-sm font-semibold text-metric-products">Đã chuyển khoản hoàn tiền cho khách.</p>
              {lastRefund?.processedAt ? (
                <p className="text-xs text-landing-muted">
                  Ghi nhận lúc <span className="font-mono">{fmtDateTime(lastRefund.processedAt)}</span>. Khách có 7 ngày để báo nếu chưa
                  nhận được tiền.
                </p>
              ) : null}
              {order.refundConfirmedAt ? (
                <p className="text-xs text-metric-products">
                  Khách đã xác nhận nhận tiền lúc <span className="font-mono">{fmtDateTime(order.refundConfirmedAt)}</span>.
                </p>
              ) : (
                <p className="text-xs text-landing-muted">Chưa có xác nhận nhận tiền từ khách.</p>
              )}
            </div>
          ) : canConfirmRefund ? (
            <div className="space-y-4">
              <p className="text-xs leading-relaxed text-landing-obsidian">
                {isReturnReceived
                  ? 'Hàng hoàn đã về kho. Chuyển khoản cho khách theo tài khoản bên trái rồi ghi nhận lại tại đây.'
                  : 'Đơn đã hủy sau khi khách thanh toán. Chuyển khoản hoàn lại tiền rồi ghi nhận tại đây.'}
              </p>

              {(openRefunds.length > 0 ? openRefunds : [{ kind: 'GOODS' as const, amountVnd: remainingVnd }]).map((refund) => (
                <RefundTransferForm
                  key={refund.kind}
                  orderId={order.id}
                  kind={refund.kind}
                  suggestedVnd={refund.amountVnd}
                  approved={openRefunds.length > 0}
                  hasReceipts={hasReceipts}
                  onRecorded={onRefundRecorded}
                />
              ))}
            </div>
          ) : returnInTransit ? (
            <div className="space-y-3">
              <p className="text-xs leading-relaxed text-landing-obsidian">
                Khách đang gửi hàng về. Khi hàng về kho và đã kiểm tra xong, xác nhận để mở bước chuyển khoản.
              </p>
              <button
                type="button"
                onClick={onReturnReceived}
                disabled={updatingStatus}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[2px] border-0 bg-landing-oxblood px-5 py-2.5 text-xs font-bold text-landing-paper transition-colors hover:bg-landing-obsidian disabled:opacity-50"
              >
                {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Đã nhận hàng hoàn
              </button>
            </div>
          ) : status === 'RETURN_REQUESTED' ? (
            <div className="space-y-3">
              <p className="text-xs leading-relaxed text-landing-obsidian">
                Khách vừa gửi yêu cầu trả hàng. Xem lý do, ảnh minh chứng và duyệt hoặc từ chối ở tab Báo lỗi & Đổi trả.
              </p>
              <Link
                href="/admin/dashboard?tab=order-issues"
                className="inline-flex items-center justify-center rounded-[2px] border border-landing-line px-4 py-2 text-xs font-bold text-landing-oxblood no-underline transition-colors hover:border-landing-oxblood"
              >
                Mở Báo lỗi & Đổi trả
              </Link>
            </div>
          ) : (
            <p className="text-xs text-landing-muted">Không có việc cần làm.</p>
          )}
        </PanelColumn>
      </div>
    </section>
  );
}

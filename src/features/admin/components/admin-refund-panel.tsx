'use client';

import { ImageFilePreviews } from '@/components/ui/image-file-previews';
import { fmt, fmtDateTime } from '@/features/admin/services/format';
import { updateOrderRefund } from '@/features/admin/services/mutations';
import type { AdminRefundPanelProps } from '@/features/admin/types/admin-refund-panel';
import { RefundReceiptImages } from '@/features/orders/components/refund-receipt-images';
import { describeImageFileRejection, useImageFileSelection } from '@/hooks/use-image-file-selection';
import { getErrorMessage } from '@/lib/errors';
import { cn, formatRefundEvidence, getRefundEvidenceImages } from '@/lib/utils';
import { Check, Copy, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

const MAX_REFUND_RECEIPT_IMAGES = 5;
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

/**
 * Mọi thứ admin cần để hoàn tiền một đơn, gom về một chỗ: đang ở bước nào, chuyển vào
 * tài khoản nào bao nhiêu tiền, chứng từ đã gửi khách, và đúng một việc cần làm tiếp.
 */
export function AdminRefundPanel({ order, updatingStatus, onReturnReceived, onRefundRecorded }: AdminRefundPanelProps) {
  const [refundAmount, setRefundAmount] = useState('');
  const [refundNote, setRefundNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const receipts = useImageFileSelection({
    maxFiles: MAX_REFUND_RECEIPT_IMAGES,
    onReject: (rejection) => toast.error(describeImageFileRejection(rejection, 'ảnh chứng từ')),
  });

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

  const confirmRefund = async () => {
    if (!refundNote.trim()) {
      toast.error('Vui lòng nhập mã giao dịch hoặc ghi chú chuyển khoản.');
      return;
    }
    const parsedAmount = refundAmount.trim() ? parseInt(refundAmount.trim(), 10) : undefined;
    if (parsedAmount !== undefined && (Number.isNaN(parsedAmount) || parsedAmount < 1)) {
      toast.error('Số tiền hoàn phải là số nguyên từ 1 VNĐ.');
      return;
    }
    setSubmitting(true);
    try {
      await updateOrderRefund(order.id, {
        refundStatus: 'COMPLETED',
        amountVnd: parsedAmount,
        evidenceReference: refundNote.trim(),
        internalNote: refundNote.trim(),
        receiptImages: receipts.files,
      });
      toast.success('Đã ghi nhận hoàn tiền thành công');
      setRefundNote('');
      setRefundAmount('');
      receipts.clear();
      await onRefundRecorded();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể ghi nhận hoàn tiền.'));
    } finally {
      setSubmitting(false);
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
              <MoneyRow label="Đã hoàn" value={refundedVnd} />
              <MoneyRow label="Còn phải hoàn" value={remainingVnd} strong />
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
            </div>
          ) : canConfirmRefund ? (
            <div className="space-y-4">
              <p className="text-xs leading-relaxed text-landing-obsidian">
                {isReturnReceived
                  ? 'Hàng hoàn đã về kho. Chuyển khoản cho khách theo tài khoản bên trái rồi ghi nhận lại tại đây.'
                  : 'Đơn đã hủy sau khi khách thanh toán. Chuyển khoản hoàn lại tiền rồi ghi nhận tại đây.'}
              </p>

              <label className="block">
                <span className={subLabelClassName}>1. Số tiền đã chuyển</span>
                <input
                  type="number"
                  min={1}
                  step={1000}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={remainingVnd > 0 ? `Để trống = hoàn hết ${fmt(remainingVnd)}` : 'Số tiền (VNĐ)'}
                  className={cn(inputClassName, 'mt-1.5 font-mono')}
                />
                {remainingVnd > 0 ? (
                  <button
                    type="button"
                    onClick={() => setRefundAmount(String(remainingVnd))}
                    className="mt-1 cursor-pointer border-0 bg-transparent p-0 text-[11px] text-landing-oxblood underline underline-offset-2"
                  >
                    Điền số còn lại: {fmt(remainingVnd)}
                  </button>
                ) : null}
              </label>

              <div>
                <span className={subLabelClassName}>
                  2. Ảnh chuyển khoản <span className="normal-case tracking-normal">(tối đa {MAX_REFUND_RECEIPT_IMAGES}, bấm ảnh để xem lớn)</span>
                </span>
                <div className="mt-1.5">
                  {receipts.items.length > 0 ? (
                    <ImageFilePreviews
                      items={receipts.items}
                      onRemove={receipts.remove}
                      onAdd={receipts.canAddMore ? () => document.getElementById('refund-receipt-input')?.click() : undefined}
                      disabled={submitting}
                    />
                  ) : (
                    <label
                      htmlFor="refund-receipt-input"
                      className="flex cursor-pointer items-center justify-center rounded-[2px] border border-dashed border-landing-taupe px-3 py-4 text-xs text-landing-muted transition-colors hover:border-landing-oxblood hover:text-landing-oxblood"
                    >
                      Chọn ảnh chuyển khoản
                    </label>
                  )}
                  <input
                    id="refund-receipt-input"
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

              <button
                type="button"
                onClick={confirmRefund}
                disabled={submitting}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[2px] border-0 bg-landing-oxblood px-5 py-2.5 text-xs font-bold text-landing-paper transition-colors hover:bg-landing-obsidian disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? 'Đang ghi nhận' : 'Xác nhận đã hoàn tiền'}
              </button>
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

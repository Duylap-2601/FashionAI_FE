'use client';

import { ImageFilePreviews } from '@/components/ui/image-file-previews';
import { fmt } from '@/features/admin/services/format';
import { reviewOrderIssue } from '@/features/admin/services/mutations';
import type { OrderIssue, OrderIssueReason } from '@/features/orders/types/orders';
import { describeImageFileRejection, useImageFileSelection } from '@/hooks/use-image-file-selection';
import { getErrorMessage } from '@/lib/errors';
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface AdminOrderIssueModalProps {
  issue: OrderIssue | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REASON_LABELS: Record<string, string> = {
  WRONG_SIZE: 'Sai kích thước / số đo',
  WRONG_COLOR: 'Sai màu / sai mẫu',
  QUALITY_MISMATCH: 'Lỗi may đo / Chất lượng vải',
  OTHER: 'Lý do khác',
  REFUND_NOT_RECEIVED: 'Chưa nhận được tiền hoàn',
};

const MAX_RECEIPT_IMAGES = 5;
// Lỗi từ phía shop: chính sách hoàn cả phí ship ban đầu.
const SHOP_FAULT_REASONS: OrderIssueReason[] = ['WRONG_SIZE', 'WRONG_COLOR', 'QUALITY_MISMATCH'];

export function AdminOrderIssueModal({
  issue,
  isOpen,
  onClose,
  onSuccess,
}: AdminOrderIssueModalProps) {
  const [activeAction, setActiveAction] = useState<'APPROVE_REFUND' | 'REJECT' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [refundShipping, setRefundShipping] = useState(false);
  // "Duyệt & hoàn ngay": chuyển khoản luôn, khách không cần gửi trả hàng.
  const [refundNow, setRefundNow] = useState(false);
  const [transferRef, setTransferRef] = useState('');
  const receipts = useImageFileSelection({
    maxFiles: MAX_RECEIPT_IMAGES,
    onReject: (rejection) => toast.error(describeImageFileRejection(rejection, 'ảnh chứng từ')),
  });
  const clearReceipts = receipts.clear;
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [accountCopied, setAccountCopied] = useState(false);

  // The modal stays mounted between issues, so drop the decision and the picked
  // bills when another issue opens; they must never be sent for the wrong one.
  const issueReason = issue?.reason;
  useEffect(() => {
    setActiveAction(null);
    setAdminNote('');
    // Lỗi từ phía shop mặc định hoàn cả phí ship ban đầu; admin bỏ chọn được.
    setRefundShipping(Boolean(issueReason && SHOP_FAULT_REASONS.includes(issueReason)));
    setRefundNow(false);
    setTransferRef('');
    clearReceipts();
  }, [issue?.id, issueReason, clearReceipts]);

  if (!isOpen || !issue) return null;

  const item = issue.orderItem;
  const rawImg = item?.productImageSnapshot;
  const itemImg = (typeof rawImg === 'object' && rawImg !== null ? (rawImg as { url?: string; imageUrl?: string }).url || (rawImg as { url?: string; imageUrl?: string }).imageUrl : rawImg) || '/images/726470431_1311184104081177_6052756217829444481_n.png';
  const itemName = item?.productNameSnapshot || `Món hàng #${issue.orderItemId.slice(0, 8)}`;
  const shippingFeeVnd = Math.round(Number(issue.order?.shippingFee ?? 0));
  // Phí ship ban đầu hoàn tối đa một lần mỗi đơn, thành một khoản riêng.
  const canRefundShipping =
    issue.reason !== 'REFUND_NOT_RECEIVED' && shippingFeeVnd > 0 && (issue.order?.refunds ?? []).length === 0;

  const copyAccountNumber = async () => {
    if (!issue.accountNumber) return;
    try {
      await navigator.clipboard.writeText(issue.accountNumber);
      setAccountCopied(true);
      setTimeout(() => setAccountCopied(false), 1500);
    } catch {
      toast.error('Không sao chép được số tài khoản.');
    }
  };

  const handleReview = async () => {
    if (!activeAction) return;

    if (activeAction === 'REJECT' && !adminNote.trim()) {
      toast.error('Vui lòng nhập lý do từ chối yêu cầu.');
      return;
    }
    if (activeAction === 'APPROVE_REFUND' && refundNow && (!transferRef.trim() || receipts.items.length === 0)) {
      toast.error('Hoàn tiền ngay cần mã giao dịch và ảnh chứng từ chuyển khoản.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeAction === 'REJECT') {
        await reviewOrderIssue(issue.id, {
          decision: 'REJECT',
          adminNote: adminNote.trim(),
        });
        toast.success('Đã từ chối khiếu nại báo lỗi.');
      } else {
        await reviewOrderIssue(
          issue.id,
          {
            decision: 'APPROVE',
            approvedResolution: 'REFUND',
            adminNote: adminNote.trim() || undefined,
            refundShipping: canRefundShipping ? refundShipping : undefined,
            refundNow: refundNow || undefined,
            evidenceReference: refundNow ? transferRef.trim() : undefined,
          },
          undefined,
          refundNow ? receipts.files : undefined,
        );
        toast.success(
          issue.reason === 'REFUND_NOT_RECEIVED'
            ? 'Đã duyệt. Khoản hoàn trước bị đánh dấu thất bại, cần chuyển lại cho khách.'
            : refundNow
              ? 'Đã duyệt và ghi nhận hoàn tiền cho khách.'
              : 'Đã duyệt hoàn tiền. Đơn hàng chuyển sang tiến trình hoàn trả!'
        );
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không thể xử lý yêu cầu lúc này.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-landing-obsidian/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="bg-landing-ivory rounded-[2px] max-w-2xl w-full my-8 p-6 border border-landing-line animate-in zoom-in-95 duration-200 relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-1 rounded-[2px] text-landing-muted hover:text-landing-obsidian hover:bg-landing-paper transition-colors disabled:opacity-40 cursor-pointer z-10"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-4 pb-3 border-b border-landing-line shrink-0 pr-8">
          <div className="w-12 h-12 rounded-[2px] bg-landing-oxblood/10 text-landing-oxblood flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-[1.15rem] leading-tight text-landing-oxblood">
                Chi tiết Khiếu nại #{issue.id.slice(0, 8)}
              </h2>
              <span className="text-[12px] font-mono px-2 py-0.5 rounded bg-landing-paper text-landing-obsidian">
                {issue.status}
              </span>
            </div>
            <p className="text-[12px] text-landing-muted mt-0.5">
              Tạo lúc {new Date(issue.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 text-body-sm">
          {/* Order & Customer Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-landing-paper/60 rounded-[2px] border border-landing-line/70">
            <div>
              <span className="text-[11px] font-semibold text-landing-muted uppercase tracking-wide block">Đơn hàng</span>
              <p className="font-bold text-landing-obsidian text-[14px] mt-0.5">
                {issue.order?.orderCode ? `#${issue.order.orderCode}` : issue.orderId}
              </p>
              <span className="text-[11px] text-landing-muted">
                Trạng thái: <strong>{issue.order?.status || 'COMPLETED'}</strong>
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-landing-muted uppercase tracking-wide block">Khách hàng</span>
              <p className="font-bold text-landing-obsidian text-[14px] mt-0.5">
                {issue.user?.name || 'Khách hàng'}
              </p>
              <span className="text-[11px] text-landing-muted">
                {issue.user?.email || `ID: ${issue.userId.slice(0, 8)}`}
              </span>
            </div>
          </div>

          {/* Product Snapshot */}
          <div className="flex items-center gap-3 p-3 bg-landing-ivory rounded-[2px] border border-landing-line">
            <Image
              src={itemImg}
              alt={itemName}
              width={56}
              height={70}
              className="w-14 h-18 object-cover rounded-[2px] bg-landing-paper border border-landing-line shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/726470431_1311184104081177_6052756217829444481_n.png';
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-landing-obsidian text-[14px]">{itemName}</p>
              <div className="flex flex-wrap gap-3 text-[12px] text-landing-muted mt-1">
                <span>Màu: <strong className="text-landing-obsidian">{item?.color || 'Mặc định'}</strong></span>
                <span>Số lượng: <strong className="text-landing-obsidian">{item?.quantity || 1}</strong></span>
                <span>Item ID: <code className="text-landing-obsidian">{issue.orderItemId.slice(0, 8)}</code></span>
              </div>
            </div>
          </div>

          {/* Issue Details: Reason, Desired, Description */}
          <div className="p-4 bg-landing-ivory rounded-[2px] border border-landing-line flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-landing-line">
              <div>
                <span className="text-[11px] font-semibold text-landing-muted block">Lý do khiếu nại:</span>
                <span className="text-[13px] font-bold text-landing-oxblood">
                  {REASON_LABELS[issue.reason] || issue.reason}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-landing-muted block">Khách mong muốn:</span>
                <span className="text-[13px] font-bold text-landing-oxblood">
                  Hoàn tiền
                </span>
                {issue.approvedResolution && (
                  <span className="text-metric-products text-[12px] block font-medium">
                    (Admin đã duyệt: Hoàn tiền)
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-landing-muted block mb-1">Mô tả từ khách hàng:</span>
              <p className="text-[13px] text-landing-obsidian bg-landing-paper/60 p-3 rounded-[2px] border border-landing-line whitespace-pre-wrap leading-relaxed">
                {issue.description}
              </p>
            </div>

            {/* Evidence Images */}
            {issue.evidenceImages && issue.evidenceImages.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-landing-muted block mb-2">
                  Ảnh minh chứng ({issue.evidenceImages.length}):
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {issue.evidenceImages.map((imgUrl, i) => (
                    <button
                      key={imgUrl}
                      type="button"
                      onClick={() => setSelectedImg(imgUrl)}
                      className="relative w-16 h-16 rounded-[2px] overflow-hidden border border-landing-line hover:opacity-80 transition-opacity cursor-pointer group bg-landing-paper"
                      title={`Xem ảnh ${i + 1}`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`Minh chứng ${i + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Refund bank destination: section riêng để admin đối chiếu khi chuyển khoản */}
          {issue.accountNumber && (
            <section
              aria-labelledby="issue-refund-account-title"
              className="p-3.5 rounded-[2px] border border-landing-line bg-landing-paper/60"
            >
              <h3
                id="issue-refund-account-title"
                className="text-[11px] font-semibold text-landing-brass-ink uppercase tracking-[0.18em]"
              >
                Tài khoản nhận hoàn tiền
              </h3>
              <dl className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <dt className="text-[11px] text-landing-muted">Ngân hàng</dt>
                  <dd className="mt-0.5 text-[13px] font-semibold text-landing-obsidian">{issue.bankName || 'Chưa có'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-landing-muted">Số tài khoản</dt>
                  <dd className="mt-0.5 flex items-center gap-1">
                    <span className="font-mono text-[14px] font-semibold tracking-wide text-landing-obsidian">{issue.accountNumber}</span>
                    <button
                      type="button"
                      onClick={copyAccountNumber}
                      aria-label={accountCopied ? 'Đã sao chép số tài khoản' : 'Sao chép số tài khoản'}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[2px] border-0 bg-transparent text-landing-muted hover:text-landing-oxblood"
                    >
                      {accountCopied ? <Check className="h-3.5 w-3.5 text-metric-products" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-landing-muted">Chủ tài khoản</dt>
                  <dd className="mt-0.5 text-[13px] font-semibold uppercase text-landing-obsidian">{issue.accountHolder || 'Chưa có'}</dd>
                </div>
              </dl>
            </section>
          )}

          {/* Admin Note if already processed */}
          {issue.adminNote && (
            <div className="p-3.5 rounded-[2px] border border-landing-line bg-landing-paper/60">
              <span className="text-[11px] font-semibold text-landing-muted block mb-1">
                Ghi chú của Admin trước đó:
              </span>
              <p className="text-[13px] text-landing-obsidian whitespace-pre-wrap">{issue.adminNote}</p>
            </div>
          )}

          {/* ============================================================== */}
          {/* ACTION PANEL */}
          {/* ============================================================== */}

          {/* Case 1: PENDING - Admin needs to review */}
          {issue.status === 'PENDING' && (
            <div className="p-4 rounded-[2px] border-2 border-landing-oxblood/20 bg-landing-oxblood/5 flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-landing-oxblood flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Xử lý xét duyệt khiếu nại
                </span>
                <span className="text-[11px] text-landing-muted">Chỉ dành cho Admin</span>
              </div>

              {/* Action Selector Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAction('APPROVE_REFUND')}
                  className={`py-2.5 px-3 rounded-[2px] border text-[12px] font-bold text-center transition-all cursor-pointer ${
                    activeAction === 'APPROVE_REFUND'
                      ? 'bg-metric-products text-landing-paper border-metric-products'
                      : 'bg-landing-ivory text-metric-products border-metric-products/30 hover:bg-metric-products/10'
                  }`}
                >
                  ✓ Duyệt hoàn tiền
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAction('REJECT')}
                  className={`py-2.5 px-3 rounded-[2px] border text-[12px] font-bold text-center transition-all cursor-pointer ${
                    activeAction === 'REJECT'
                      ? 'bg-destructive text-landing-paper border-destructive'
                      : 'bg-landing-ivory text-destructive border-destructive/30 hover:bg-destructive/10'
                  }`}
                >
                  ✕ Từ chối
                </button>
              </div>

              {/* Form Input for the selected action */}
              {activeAction && (
                <div className="pt-2 border-t border-landing-oxblood/10 flex flex-col gap-2">
                  <label htmlFor="admin-decision-note" className="text-[12px] font-semibold text-landing-oxblood">
                    {activeAction === 'REJECT' ? (
                      <>Lý do từ chối <span className="text-destructive">* (Bắt buộc)</span></>
                    ) : (
                      <>Ghi chú cho khách hàng (Tuỳ chọn)</>
                    )}
                  </label>
                  <textarea
                    id="admin-decision-note"
                    rows={2}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder={
                      activeAction === 'REJECT'
                        ? 'Nhập lý do cụ thể từ chối khiếu nại (ví dụ: Sản phẩm không có lỗi đường may như mô tả, quá hạn đổi trả...)'
                        : 'Nhập ghi chú thêm cho khách hàng nếu có...'
                    }
                    className="w-full px-3 py-2 bg-landing-ivory border border-landing-taupe rounded-[2px] text-body-sm focus:outline-none focus:border-landing-oxblood"
                  />

                  {activeAction === 'APPROVE_REFUND' && (
                    <fieldset className="flex flex-col gap-2">
                      <legend className="mb-1 text-[12px] font-semibold text-landing-oxblood">Cách hoàn tiền</legend>
                      {[
                        {
                          value: false,
                          label: issue.reason === 'REFUND_NOT_RECEIVED' ? 'Duyệt, chuyển lại tiền sau ở trang đơn' : 'Duyệt, chờ khách gửi trả hàng',
                          hint: 'Nhận và kiểm tra hàng hoàn rồi mới chuyển khoản ở trang đơn hàng.',
                        },
                        {
                          value: true,
                          label: issue.reason === 'REFUND_NOT_RECEIVED' ? 'Duyệt và chuyển lại tiền luôn' : 'Duyệt và hoàn tiền luôn',
                          hint: 'Chuyển khoản ngay, khách không cần gửi trả hàng. Cần mã giao dịch và ảnh chứng từ.',
                        },
                      ].map((option) => (
                        <label key={String(option.value)} className="flex cursor-pointer items-start gap-2 text-[12px] text-landing-obsidian">
                          <input
                            type="radio"
                            name="refund-mode"
                            checked={refundNow === option.value}
                            onChange={() => setRefundNow(option.value)}
                            disabled={isSubmitting}
                            className="mt-0.5 accent-landing-oxblood"
                          />
                          <span>
                            {option.label}
                            <span className="block text-[11px] text-landing-muted">{option.hint}</span>
                          </span>
                        </label>
                      ))}
                    </fieldset>
                  )}

                  {activeAction === 'APPROVE_REFUND' && refundNow && (
                    <div className="flex flex-col gap-2 border-l-2 border-landing-brass pl-3">
                      <label htmlFor="refund-now-ref" className="text-[12px] font-semibold text-landing-oxblood">
                        Mã giao dịch / ghi chú chuyển khoản <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="refund-now-ref"
                        type="text"
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        placeholder="VD: VCB FT2611021234, chuyển tới STK của khách"
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 bg-landing-ivory border border-landing-taupe rounded-[2px] text-body-sm focus:outline-none focus:border-landing-oxblood"
                      />
                      <input
                        ref={receiptInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={isSubmitting}
                        onChange={(e) => {
                          receipts.add(e.target.files);
                          e.target.value = '';
                        }}
                      />
                      {receipts.items.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => receiptInputRef.current?.click()}
                          disabled={isSubmitting}
                          className="inline-flex w-fit items-center gap-1.5 text-[12px] font-semibold text-landing-oxblood underline cursor-pointer bg-transparent border-0 p-0"
                        >
                          Đính kèm ảnh chứng từ chuyển khoản *
                        </button>
                      ) : (
                        <ImageFilePreviews
                          items={receipts.items}
                          onRemove={receipts.remove}
                          onAdd={receipts.canAddMore ? () => receiptInputRef.current?.click() : undefined}
                          disabled={isSubmitting}
                          tileClassName="size-20 rounded-[2px] border-landing-line bg-landing-paper"
                        />
                      )}
                      <span className="text-[11px] text-landing-muted">
                        Số tiền: tiền hàng của món (đã trừ phần mã giảm giá){refundShipping && canRefundShipping ? ' và phí ship ban đầu' : ''}. Khách thấy ảnh chứng từ trong mục Hoàn tiền.
                      </span>
                    </div>
                  )}

                  {activeAction === 'APPROVE_REFUND' && canRefundShipping ? (
                    <label className="flex cursor-pointer items-start gap-2 text-[12px] text-landing-obsidian">
                      <input
                        type="checkbox"
                        checked={refundShipping}
                        onChange={(e) => setRefundShipping(e.target.checked)}
                        disabled={isSubmitting}
                        className="mt-0.5 accent-landing-oxblood"
                      />
                      <span>
                        Hoàn phí ship ban đầu <span className="font-mono">{fmt(shippingFeeVnd)}</span>
                        <span className="block text-[11px] text-landing-muted">
                          Thành khoản hoàn riêng, chuyển và ghi nhận tách với tiền hàng. Mỗi đơn hoàn phí ship một lần.
                        </span>
                      </span>
                    </label>
                  ) : null}

                  {activeAction === 'APPROVE_REFUND' && (
                    <p className="text-[11px] text-metric-products bg-metric-products/10 p-2 rounded-[2px]">
                      {issue.reason === 'REFUND_NOT_RECEIVED'
                        ? 'ℹ Duyệt sẽ đánh dấu khoản hoàn trước là thất bại và mở khoản hoàn mới. Sau đó vào trang đơn hàng để chuyển lại tiền cho khách.'
                        : refundNow
                          ? 'ℹ Shop chuyển khoản trước, khách không cần gửi trả hàng. Đơn chuyển sang “Đã hoàn trả” và yêu cầu sang “Đã hoàn tiền”.'
                          : 'ℹ Duyệt chưa chuyển tiền nên không cần ảnh chứng từ. Đơn chuyển sang “Duyệt hoàn trả”; khi hàng hoàn về và kiểm tra xong, chuyển khoản rồi ghi nhận từng khoản (kèm ảnh chứng từ) ở trang đơn hàng.'}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setActiveAction(null)}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 rounded-[2px] border border-landing-taupe text-xs font-semibold text-landing-obsidian hover:bg-landing-paper"
                    >
                      Hủy lựa chọn
                    </button>
                    <button
                      type="button"
                      onClick={handleReview}
                      disabled={
                        isSubmitting ||
                        (activeAction === 'REJECT' && !adminNote.trim()) ||
                        (activeAction === 'APPROVE_REFUND' && refundNow && (!transferRef.trim() || receipts.items.length === 0))
                      }
                      className={`px-4 py-1.5 rounded-[2px] text-xs font-bold text-landing-paper flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                        activeAction === 'REJECT' ? 'bg-destructive hover:bg-destructive' : 'bg-landing-oxblood hover:bg-landing-oxblood/90'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        'Xác nhận xử lý'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Case 2: APPROVED - đã duyệt, chờ hoàn tiền */}
          {issue.status === 'APPROVED' && (
            <div className="p-4 rounded-[2px] border border-landing-brass/40 bg-landing-paper/60 text-[13px] flex items-start gap-3">
              <Clock className="w-5 h-5 text-landing-brass-ink shrink-0" />
              <div>
                <span className="font-bold text-landing-obsidian">Đã duyệt, chờ hoàn tiền</span>
                <p className="text-[12px] mt-0.5 text-landing-muted">
                  Nhận hàng hoàn rồi chuyển khoản và ghi nhận từng khoản ở trang đơn hàng. Yêu cầu tự chuyển sang “Đã hoàn tiền” khi mọi khoản đã chuyển.
                </p>
                {issue.order?.orderCode ? (
                  <Link
                    href={`/admin/orders/${issue.order.orderCode}`}
                    className="mt-2 inline-flex text-[12px] font-semibold text-landing-oxblood underline underline-offset-2"
                  >
                    Mở trang đơn #{issue.order.orderCode}
                  </Link>
                ) : null}
              </div>
            </div>
          )}

          {/* Case 3: Terminal status (RESOLVED or REJECTED) */}
          {(issue.status === 'RESOLVED' || issue.status === 'REJECTED') && (
            <div className={`p-4 rounded-[2px] border text-[13px] flex items-center gap-3 ${
              issue.status === 'RESOLVED'
                ? 'bg-metric-products/10 border-metric-products/30 text-metric-products'
                : 'bg-destructive/10 border-destructive/30 text-destructive'
            }`}>
              {issue.status === 'RESOLVED' ? (
                <CheckCircle2 className="w-5 h-5 text-metric-products shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive shrink-0" />
              )}
              <div>
                <span className="font-bold">
                  {issue.status === 'RESOLVED' ? 'Đã hoàn tiền cho khách' : 'Khiếu nại đã bị từ chối'}
                </span>
                <p className="text-[12px] mt-0.5 opacity-90">
                  {issue.status === 'RESOLVED'
                    ? 'Mọi khoản hoàn của đơn đã được chuyển khoản.'
                    : 'Không thể thay đổi trạng thái của yêu cầu đã từ chối.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-landing-line flex justify-end shrink-0 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-landing-line text-landing-obsidian font-semibold rounded-[2px] text-xs hover:bg-landing-paper/60 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {selectedImg && (
        <div
          role="dialog"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-landing-obsidian/85 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedImg(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-[85vh]">
            <Image
              src={selectedImg}
              alt="Ảnh minh chứng phóng to"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}

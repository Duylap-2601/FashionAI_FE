'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';
import { processManualReconciliation } from '@/features/admin/services/reconciliation';
import type { ReconciliationCandidate, UnmatchedTransaction } from '@/features/admin/types/admin-reconciliation';

interface AdminConfirmPaymentModalProps {
  isOpen: boolean;
  transaction: UnmatchedTransaction | null;
  candidate: ReconciliationCandidate | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminConfirmPaymentModal({
  isOpen,
  transaction,
  candidate,
  onClose,
  onSuccess,
}: AdminConfirmPaymentModalProps) {
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (transaction && candidate) {
      setReference(transaction.referenceCode || '');
      const txDate = transaction.transactionDate ? new Date(transaction.transactionDate) : new Date();
      const formattedDate = txDate.toLocaleDateString('vi-VN');
      const gw = transaction.gateway || 'Ngân hàng';
      const acc = transaction.accountNumber ? ` ${transaction.accountNumber}` : '';
      setNote(`Đối chiếu sao kê ${gw}${acc} ngày ${formattedDate}`);
      setErrorMsg(null);
    }
  }, [transaction, candidate]);

  if (!isOpen || !transaction || !candidate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedRef = reference.trim();
    const trimmedNote = note.trim();

    if (!trimmedRef) {
      setErrorMsg('Mã tham chiếu ngân hàng không được để trống.');
      return;
    }
    if (!trimmedNote) {
      setErrorMsg('Ghi chú đối soát không được để trống.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await processManualReconciliation(candidate.orderCode, transaction.id, {
        reference: trimmedRef,
        note: trimmedNote,
      });
      toast.success(`Đã xác nhận thanh toán thành công cho đơn FAI${candidate.orderCode}`);
      onSuccess();
      onClose();
    } catch (err) {
      const msg = getErrorMessage(err, 'Không thể xác nhận thanh toán thủ công.');
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedAmount = (candidate.amount || transaction.transferAmount || 0).toLocaleString('vi-VN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-landing-obsidian/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-landing-ivory rounded-[2px] border border-landing-line w-full max-w-lg overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-landing-line flex items-center justify-between bg-landing-paper/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[2px] bg-metric-products/10 text-metric-products flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-[1.05rem] leading-tight text-landing-obsidian leading-tight">
                Xác nhận đã nhận tiền
              </h2>
              <p className="text-[12px] text-landing-muted">
                Đối soát giao dịch ngân hàng vào đơn hàng chờ thanh toán
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-landing-muted hover:text-landing-obsidian rounded-[2px] hover:bg-landing-taupe/60 transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Order Recap Card */}
          <div className="p-4 rounded-[2px] bg-landing-paper/60 border border-landing-line/80 flex flex-col gap-2.5">
            <div className="text-[11px] font-bold text-landing-muted uppercase tracking-wider">
              Thông tin đối chiếu
            </div>
            <div className="grid grid-cols-2 gap-3 text-body-sm">
              <div>
                <span className="text-[12px] text-landing-muted block">Mã đơn hàng</span>
                <span className="font-mono font-bold text-landing-oxblood">
                  FAI{candidate.orderCode}
                </span>
              </div>
              <div>
                <span className="text-[12px] text-landing-muted block">Số tiền khớp</span>
                <span className="font-bold text-metric-products text-body-md">
                  {formattedAmount} ₫
                </span>
              </div>
              <div>
                <span className="text-[12px] text-landing-muted block">Khách hàng</span>
                <span className="font-medium text-landing-obsidian truncate block" title={candidate.userEmail}>
                  {candidate.userEmail || 'Chưa có email'}
                </span>
              </div>
              <div>
                <span className="text-[12px] text-landing-muted block">Loại đơn hàng</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-metric-users/20 text-metric-users">
                  {candidate.targetTier ? `Gói ${candidate.targetTier}` : 'Đơn sản phẩm'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-landing-line/60 text-[12px] text-landing-obsidian flex items-center justify-between">
              <span>GD gốc: <code className="font-mono text-landing-obsidian">{transaction.referenceCode}</code></span>
              <span>{transaction.gateway} · {transaction.accountNumber || 'STK'}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-[2px] bg-destructive/10 border border-destructive/30 text-destructive text-body-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Input Fields */}
          <div className="flex flex-col gap-3.5">
            <div>
              <label htmlFor="reference-code" className="block text-body-sm font-semibold text-landing-obsidian mb-1">
                Mã tham chiếu ngân hàng <span className="text-destructive">*</span>
              </label>
              <input
                id="reference-code"
                type="text"
                value={reference}
                onChange={e => setReference(e.target.value)}
                placeholder="VD: FT24276891234567"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-[2px] border border-landing-taupe text-body-sm text-landing-obsidian font-mono focus:outline-hidden focus:ring-2 focus:ring-landing-oxblood focus:border-transparent transition-all"
              />
              <span className="text-[11px] text-landing-muted mt-1 block">
                Mã giao dịch từ sao kê SePay / Internet Banking để lưu vết thanh toán
              </span>
            </div>

            <div>
              <label htmlFor="reconciliation-note" className="block text-body-sm font-semibold text-landing-obsidian mb-1">
                Ghi chú đối soát <span className="text-destructive">*</span>
              </label>
              <textarea
                id="reconciliation-note"
                rows={2}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="VD: Đối chiếu sao kê MBBank 0345986537 ngày 02/10/2026"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-[2px] border border-landing-taupe text-body-sm text-landing-obsidian focus:outline-hidden focus:ring-2 focus:ring-landing-oxblood focus:border-transparent transition-all resize-none"
              />
              <span className="text-[11px] text-landing-muted mt-1 block">
                Ghi chú nội bộ phục vụ kiểm toán tài chính và tra soát kế toán
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-landing-line">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-[2px] text-body-sm font-medium text-landing-obsidian hover:text-landing-obsidian hover:bg-landing-paper transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-[2px] text-body-sm font-bold text-landing-paper bg-metric-products hover:bg-landing-obsidian transition-all flex items-center gap-2 border-0 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang ghi nhận...
                </>
              ) : (
                'Xác nhận đã nhận tiền'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

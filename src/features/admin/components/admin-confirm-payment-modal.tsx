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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-body-md font-bold text-neutral-900 leading-tight">
                Xác nhận đã nhận tiền
              </h2>
              <p className="text-[12px] text-neutral-500">
                Đối soát giao dịch ngân hàng vào đơn hàng chờ thanh toán
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/60 transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Order Recap Card */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex flex-col gap-2.5">
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              Thông tin đối chiếu
            </div>
            <div className="grid grid-cols-2 gap-3 text-body-sm">
              <div>
                <span className="text-[12px] text-neutral-500 block">Mã đơn hàng</span>
                <span className="font-mono font-bold text-brand-navy">
                  FAI{candidate.orderCode}
                </span>
              </div>
              <div>
                <span className="text-[12px] text-neutral-500 block">Số tiền khớp</span>
                <span className="font-bold text-emerald-600 text-body-md">
                  {formattedAmount} ₫
                </span>
              </div>
              <div>
                <span className="text-[12px] text-neutral-500 block">Khách hàng</span>
                <span className="font-medium text-neutral-800 truncate block" title={candidate.userEmail}>
                  {candidate.userEmail || 'Chưa có email'}
                </span>
              </div>
              <div>
                <span className="text-[12px] text-neutral-500 block">Loại đơn hàng</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-gold/20 text-brand-navy">
                  {candidate.targetTier ? `Gói ${candidate.targetTier}` : 'Đơn sản phẩm'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200/60 text-[12px] text-neutral-600 flex items-center justify-between">
              <span>GD gốc: <code className="font-mono text-neutral-800">{transaction.referenceCode}</code></span>
              <span>{transaction.gateway} · {transaction.accountNumber || 'STK'}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-body-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Input Fields */}
          <div className="flex flex-col gap-3.5">
            <div>
              <label htmlFor="reference-code" className="block text-body-sm font-semibold text-neutral-700 mb-1">
                Mã tham chiếu ngân hàng <span className="text-red-500">*</span>
              </label>
              <input
                id="reference-code"
                type="text"
                value={reference}
                onChange={e => setReference(e.target.value)}
                placeholder="VD: FT24276891234567"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-body-sm text-neutral-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-brand-navy focus:border-transparent transition-all"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Mã giao dịch từ sao kê SePay / Internet Banking để lưu vết thanh toán
              </span>
            </div>

            <div>
              <label htmlFor="reconciliation-note" className="block text-body-sm font-semibold text-neutral-700 mb-1">
                Ghi chú đối soát <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reconciliation-note"
                rows={2}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="VD: Đối chiếu sao kê MBBank 0345986537 ngày 02/10/2026"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-body-sm text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-brand-navy focus:border-transparent transition-all resize-none"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Ghi chú nội bộ phục vụ kiểm toán tài chính và tra soát kế toán
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-body-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-body-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-2 border-0 cursor-pointer disabled:opacity-60"
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

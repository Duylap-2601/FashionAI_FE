'use client';

import React, { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';
import { resolveWebhookFailure } from '@/features/admin/services/reconciliation';
import type { UnmatchedTransaction } from '@/features/admin/types/admin-reconciliation';

interface AdminIgnoreFailureModalProps {
  isOpen: boolean;
  transaction: UnmatchedTransaction | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminIgnoreFailureModal({
  isOpen,
  transaction,
  onClose,
  onSuccess,
}: AdminIgnoreFailureModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await resolveWebhookFailure(transaction.id);
      toast.success('Đã bỏ qua giao dịch');
      onSuccess();
      onClose();
    } catch (err) {
      const msg = getErrorMessage(err, 'Không thể bỏ qua giao dịch.');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedAmount = (transaction.transferAmount || 0).toLocaleString('vi-VN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-body-md font-bold text-neutral-900 leading-tight">
                Bỏ qua giao dịch này?
              </h2>
              <p className="text-[12px] text-neutral-500">
                Đánh dấu đã xử lý mà không gán cho đơn hàng nào
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

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          <p className="text-body-sm text-neutral-600 leading-relaxed">
            Giao dịch mã tham chiếu <strong className="text-neutral-900 font-mono">{transaction.referenceCode}</strong> với số tiền <strong className="text-neutral-900">{formattedAmount} ₫</strong> sẽ được đánh dấu là <strong>Đã xử lý</strong>.
          </p>

          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-body-sm space-y-1 text-neutral-600">
            <div><span className="text-neutral-400">Nội dung:</span> {transaction.content}</div>
            <div><span className="text-neutral-400">Cổng:</span> {transaction.gateway} ({transaction.accountNumber || 'STK'})</div>
            <div><span className="text-neutral-400">Thời gian:</span> {new Date(transaction.transactionDate).toLocaleString('vi-VN')}</div>
          </div>

          <p className="text-[12px] text-neutral-400 italic">
            Lưu ý: Hành động này thường áp dụng cho giao dịch chuyển nhầm, test hệ thống hoặc đơn đã được hoàn/hủy trước đó.
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-body-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-4.5 py-2 rounded-xl text-body-sm font-semibold text-white bg-neutral-800 hover:bg-neutral-900 shadow-sm transition-all flex items-center gap-2 border-0 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận bỏ qua'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

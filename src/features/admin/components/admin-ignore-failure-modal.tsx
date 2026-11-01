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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-landing-obsidian/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-landing-ivory rounded-[2px] border border-landing-line w-full max-w-md overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-landing-line flex items-center justify-between bg-landing-paper/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[2px] bg-metric-users/10 text-metric-users flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-[1.05rem] leading-tight text-landing-obsidian leading-tight">
                Bỏ qua giao dịch này?
              </h2>
              <p className="text-[12px] text-landing-muted">
                Đánh dấu đã xử lý mà không gán cho đơn hàng nào
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

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          <p className="text-body-sm text-landing-obsidian leading-relaxed">
            Giao dịch mã tham chiếu <strong className="text-landing-obsidian font-mono">{transaction.referenceCode}</strong> với số tiền <strong className="text-landing-obsidian">{formattedAmount} ₫</strong> sẽ được đánh dấu là <strong>Đã xử lý</strong>.
          </p>

          <div className="p-3.5 rounded-[2px] bg-landing-paper/60 border border-landing-line text-body-sm space-y-1 text-landing-obsidian">
            <div><span className="text-landing-muted">Nội dung:</span> {transaction.content}</div>
            <div><span className="text-landing-muted">Cổng:</span> {transaction.gateway} ({transaction.accountNumber || 'STK'})</div>
            <div><span className="text-landing-muted">Thời gian:</span> {new Date(transaction.transactionDate).toLocaleString('vi-VN')}</div>
          </div>

          <p className="text-[12px] text-landing-muted italic">
            Lưu ý: Hành động này thường áp dụng cho giao dịch chuyển nhầm, test hệ thống hoặc đơn đã được hoàn/hủy trước đó.
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-landing-line">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-[2px] text-body-sm font-medium text-landing-obsidian hover:text-landing-obsidian hover:bg-landing-paper transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-4.5 py-2 rounded-[2px] text-body-sm font-semibold text-landing-paper bg-landing-obsidian hover:bg-landing-obsidian transition-all flex items-center gap-2 border-0 cursor-pointer disabled:opacity-60"
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

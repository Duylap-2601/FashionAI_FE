'use client';

import type { ConfirmDeliveryModalProps } from '@/features/orders/types/confirm-delivery-modal';
import { CheckCircle2, Loader2, PackageCheck, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export function ConfirmDeliveryModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  orderCode,
}: ConfirmDeliveryModalProps) {
  const [note, setNote] = useState('');

  // Reset note when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setNote('');
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onConfirm(note);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delivery-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 animate-in zoom-in-95 duration-200 relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-40 cursor-pointer"
          aria-label="Đóng modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div className="pr-6">
            <h3 id="confirm-delivery-title" className="text-[18px] font-bold text-brand-navy">
              Xác nhận đã nhận hàng
            </h3>
            <p className="text-[13px] text-neutral-500 mt-0.5">
              Đơn hàng #{orderCode}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <p className="text-body-sm text-neutral-600 mb-4 leading-relaxed">
          Bạn có chắc chắn đã nhận được kiện hàng này và hài lòng với các sản phẩm? Sau khi xác nhận, đơn hàng sẽ chuyển sang trạng thái <strong>Hoàn thành</strong>.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="delivery-note" className="text-[13px] font-medium text-neutral-700">
                Ghi chú nhận hàng <span className="text-neutral-400 font-normal">(tùy chọn)</span>
              </label>
              <span className="text-[11px] text-neutral-400 tabular-nums">
                {note.length}/500
              </span>
            </div>
            <textarea
              id="delivery-note"
              rows={3}
              maxLength={500}
              disabled={isLoading}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú (tùy chọn): Hàng đẹp, đúng size, đóng gói cẩn thận..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-body-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15 resize-none transition-all disabled:bg-neutral-50 disabled:text-neutral-400"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 border border-neutral-200 text-neutral-700 font-semibold text-body-sm rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-body-sm rounded-xl transition-all shadow-xs flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Xác nhận
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

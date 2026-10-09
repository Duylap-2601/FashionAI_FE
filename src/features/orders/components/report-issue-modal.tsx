'use client';

import { useCreateOrderIssue } from '@/features/orders/hooks/useOrderIssues';
import type { OrderItem, OrderIssueDesiredResolution, OrderIssueReason } from '@/features/orders/types/orders';
import { getErrorMessage } from '@/lib/errors';
import { AlertCircle, AlertTriangle, CheckCircle2, ImagePlus, Loader2, ShieldAlert, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderItem: OrderItem | null;
  onSuccess?: () => void;
}

const REASONS: { value: OrderIssueReason; label: string; desc: string }[] = [
  {
    value: 'WRONG_SIZE',
    label: 'Sai kích thước / số đo',
    desc: 'Sản phẩm may không khớp với thông số số đo đã đặt.',
  },
  {
    value: 'WRONG_COLOR',
    label: 'Sai màu sắc',
    desc: 'Màu sắc thực tế sai khác hoàn toàn so với mô tả đã chọn.',
  },
  {
    value: 'QUALITY_MISMATCH',
    label: 'Lỗi đường may / Chất lượng vải',
    desc: 'Sản phẩm bị lỗi vải, rách, đường chỉ lỗi hoặc kém chất lượng.',
  },
  {
    value: 'OTHER',
    label: 'Lý do khác',
    desc: 'Vấn đề phát sinh khác (sẽ được Admin xem xét thủ công).',
  },
];

export function ReportIssueModal({
  isOpen,
  onClose,
  orderId,
  orderItem,
  onSuccess,
}: ReportIssueModalProps) {
  const [reason, setReason] = useState<OrderIssueReason>('WRONG_SIZE');
  const [description, setDescription] = useState('');
  const [desiredResolution, setDesiredResolution] = useState<OrderIssueDesiredResolution>('REFUND');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createOrderIssueAsync, isPending } = useCreateOrderIssue();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setReason('WRONG_SIZE');
      setDescription('');
      setDesiredResolution('REFUND');
      setFiles([]);
      setPreviewUrls([]);
      setSubmitError(null);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPending, onClose]);

  // Clean up object URLs on unmount or file change
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  if (!isOpen || !orderItem) return null;

  const handleFilesSelected = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    setSubmitError(null);

    const validNewFiles: File[] = [];
    const validNewUrls: string[] = [];

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxFiles = 10;
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    const totalAllowed = maxFiles - files.length;
    if (totalAllowed <= 0) {
      toast.error('Chỉ được chọn tối đa 10 ảnh minh chứng.');
      return;
    }

    const filesToProcess = Array.from(selectedFiles).slice(0, totalAllowed);

    for (const file of filesToProcess) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Ảnh "${file.name}" không hợp lệ. Chỉ chấp nhận định dạng JPG, PNG, WEBP.`);
        continue;
      }
      if (file.size > maxSizeBytes) {
        toast.error(`Ảnh "${file.name}" vượt quá 10MB.`);
        continue;
      }
      validNewFiles.push(file);
      validNewUrls.push(URL.createObjectURL(file));
    }

    setFiles((prev) => [...prev, ...validNewFiles]);
    setPreviewUrls((prev) => [...prev, ...validNewUrls]);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const trimmedDesc = description.trim();
    if (trimmedDesc.length < 10) {
      setSubmitError('Vui lòng nhập mô tả chi tiết ít nhất 10 ký tự.');
      return;
    }
    if (trimmedDesc.length > 2000) {
      setSubmitError('Mô tả không được vượt quá 2000 ký tự.');
      return;
    }

    try {
      await createOrderIssueAsync({
        orderId,
        orderItemId: orderItem.id,
        reason,
        description: trimmedDesc,
        desiredResolution,
        evidenceImages: files,
      });

      toast.success('Gửi yêu cầu báo lỗi sản phẩm thành công. Đội ngũ FashionAI sẽ xem xét sớm nhất!');
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Không thể gửi yêu cầu báo lỗi lúc này.');
      setSubmitError(msg);
      toast.error(msg);
    }
  };

  const rawImg = orderItem.productImageSnapshot || orderItem.product?.images?.[0];
  const itemImg = (typeof rawImg === 'object' && rawImg !== null ? (rawImg as { url?: string; imageUrl?: string }).url || (rawImg as { url?: string; imageUrl?: string }).imageUrl : rawImg) || '/images/726470431_1311184104081177_6052756217829444481_n.png';
  const itemName = orderItem.productNameSnapshot || orderItem.product?.name || `Sản phẩm #${orderItem.productId}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-issue-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl max-w-xl w-full my-8 p-6 shadow-2xl border border-neutral-100 animate-in zoom-in-95 duration-200 relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="absolute top-5 right-5 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-40 cursor-pointer z-10"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="pr-6">
            <h3 id="report-issue-modal-title" className="text-[18px] font-bold text-brand-navy">
              Báo lỗi sản phẩm &amp; Yêu cầu xử lý
            </h3>
            <p className="text-[13px] text-neutral-500 mt-0.5">
              Áp dụng cho đơn hàng đã hoàn tất trong vòng 7 ngày
            </p>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5">
          {/* Product Snapshot Card */}
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
            <Image
              src={itemImg}
              alt={itemName}
              width={56}
              height={70}
              className="w-14 h-16 object-cover rounded-lg bg-white border border-neutral-200 shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/726470431_1311184104081177_6052756217829444481_n.png';
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-brand-navy line-clamp-1">{itemName}</p>
              <div className="flex flex-wrap gap-2 text-[12px] text-neutral-500 mt-0.5">
                <span>Màu: <strong className="text-neutral-700">{orderItem.color || 'Mặc định'}</strong></span>
                <span>•</span>
                <span>Số lượng: <strong className="text-neutral-700">{orderItem.quantity}</strong></span>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[13px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* 1. Reason Selection */}
          <div>
            <label className="block text-[13px] font-bold text-brand-navy mb-2">
              Lý do báo lỗi <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REASONS.map((r) => {
                const isSelected = reason === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setReason(r.value)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[13px] font-bold ${isSelected ? 'text-brand-navy' : 'text-neutral-800'}`}>
                        {r.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-navy shrink-0" />}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">{r.desc}</p>
                  </button>
                );
              })}
            </div>
            {reason === 'OTHER' && (
              <p className="text-[12px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60 mt-2 flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Lưu ý: Theo chính sách đổi trả, các yêu cầu vì &quot;Lý do khác&quot; sẽ cần được bộ phận chăm sóc khách hàng thẩm định riêng và có thể không được chấp thuận.
                </span>
              </p>
            )}
          </div>

          {/* 2. Desired Resolution */}
          <div>
            <label className="block text-[13px] font-bold text-brand-navy mb-2">
              Mong muốn xử lý <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDesiredResolution('REFUND')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  desiredResolution === 'REFUND'
                    ? 'border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-brand-navy">Hoàn tiền</span>
                  {desiredResolution === 'REFUND' && <CheckCircle2 className="w-4 h-4 text-brand-navy" />}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Hoàn lại số tiền sản phẩm theo phương thức thanh toán ban đầu.</p>
              </button>

              <button
                type="button"
                onClick={() => setDesiredResolution('EXCHANGE')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  desiredResolution === 'EXCHANGE'
                    ? 'border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-brand-navy">Đổi hàng 1-1</span>
                  {desiredResolution === 'EXCHANGE' && <CheckCircle2 className="w-4 h-4 text-brand-navy" />}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Shop gửi lại sản phẩm chuẩn may đo mới cho bạn.</p>
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1.5 italic">
              * Admin có thể duyệt đúng mong muốn hoặc trao đổi chuyển hướng khác tuỳ vào tình trạng đơn hàng.
            </p>
          </div>

          {/* 3. Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="issue-description" className="text-[13px] font-bold text-brand-navy">
                Mô tả chi tiết vấn đề <span className="text-red-500">*</span>
              </label>
              <span className={`text-[11px] ${description.length < 10 ? 'text-amber-600' : 'text-neutral-400'}`}>
                {description.length}/2000 ký tự (tối thiểu 10)
              </span>
            </div>
            <textarea
              id="issue-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vui lòng mô tả cụ thể: ví dụ Áo bị lệch vai trái khoảng 4cm so với số đo đã đặt, đường chỉ tay áo bị tuột..."
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-body-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all resize-y text-neutral-800 placeholder:text-neutral-400"
            />
          </div>

          {/* 4. Evidence Images */}
          <div>
            <label className="block text-[13px] font-bold text-brand-navy mb-1.5">
              Ảnh minh chứng <span className="text-neutral-400 font-normal">(tối đa 10 ảnh, mỗi ảnh &lt; 10MB)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
                {previewUrls.map((url, idx) => (
                  <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
                    <Image
                      src={url}
                      alt={`Minh chứng ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      disabled={isPending}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-md transition-colors cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {previewUrls.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                    className="aspect-square rounded-xl border border-dashed border-neutral-300 hover:border-brand-navy hover:bg-neutral-50 flex flex-col items-center justify-center gap-1 text-neutral-500 hover:text-brand-navy transition-all cursor-pointer text-[11px]"
                  >
                    <ImagePlus className="w-5 h-5" />
                    <span>Thêm ảnh</span>
                  </button>
                )}
              </div>
            )}

            {previewUrls.length === 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="w-full py-6 px-4 border-2 border-dashed border-neutral-200 hover:border-brand-navy hover:bg-brand-navy/5 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-500 hover:text-brand-navy transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                  <ImagePlus className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-[13px] font-semibold">Tải lên hình ảnh chụp lỗi thực tế</span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">JPG, PNG hoặc WEBP (tối đa 10MB/ảnh)</p>
                </div>
              </button>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 mt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-[13px] font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending || description.trim().length < 10}
              className="px-5 py-2.5 rounded-xl bg-brand-navy text-white text-[13px] font-bold hover:bg-brand-navy/90 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang gửi yêu cầu...
                </>
              ) : (
                'Gửi yêu cầu báo lỗi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

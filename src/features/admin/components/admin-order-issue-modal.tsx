'use client';

import { resolveOrderIssue, reviewOrderIssue } from '@/features/admin/services/mutations';
import type { OrderIssue, OrderIssueDesiredResolution } from '@/features/orders/types/orders';
import { getErrorMessage } from '@/lib/errors';
import {
  CheckCircle2,
  Clock,
  Loader2,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface AdminOrderIssueModalProps {
  issue: OrderIssue | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REASON_LABELS: Record<string, string> = {
  WRONG_SIZE: 'Sai kích thước / số đo',
  WRONG_COLOR: 'Sai màu sắc',
  QUALITY_MISMATCH: 'Lỗi may đo / Chất lượng vải',
  OTHER: 'Lý do khác',
};

export function AdminOrderIssueModal({
  issue,
  isOpen,
  onClose,
  onSuccess,
}: AdminOrderIssueModalProps) {
  const [activeAction, setActiveAction] = useState<'APPROVE_REFUND' | 'APPROVE_EXCHANGE' | 'REJECT' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [resolveNote, setResolveNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  if (!isOpen || !issue) return null;

  const item = issue.orderItem;
  const rawImg = item?.productImageSnapshot;
  const itemImg = (typeof rawImg === 'object' && rawImg !== null ? (rawImg as { url?: string; imageUrl?: string }).url || (rawImg as { url?: string; imageUrl?: string }).imageUrl : rawImg) || '/images/726470431_1311184104081177_6052756217829444481_n.png';
  const itemName = item?.productNameSnapshot || `Món hàng #${issue.orderItemId.slice(0, 8)}`;

  const handleReview = async () => {
    if (!activeAction) return;

    if (activeAction === 'REJECT' && !adminNote.trim()) {
      toast.error('Vui lòng nhập lý do từ chối yêu cầu.');
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
        const approvedRes: OrderIssueDesiredResolution =
          activeAction === 'APPROVE_REFUND' ? 'REFUND' : 'EXCHANGE';
        await reviewOrderIssue(issue.id, {
          decision: 'APPROVE',
          approvedResolution: approvedRes,
          adminNote: adminNote.trim() || undefined,
        });
        toast.success(
          approvedRes === 'REFUND'
            ? 'Đã duyệt hoàn tiền. Đơn hàng chuyển sang tiến trình hoàn tiền!'
            : 'Đã duyệt đổi hàng 1-1.'
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

  const handleResolveExchange = async () => {
    setIsSubmitting(true);
    try {
      await resolveOrderIssue(issue.id, {
        note: resolveNote.trim() || undefined,
      });
      toast.success('Đã đánh dấu hoàn tất đổi hàng 1-1 cho khách.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không thể đánh dấu hoàn tất đổi hàng.'));
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
                  {issue.desiredResolution === 'REFUND' ? 'Hoàn tiền' : 'Đổi hàng 1-1'}
                </span>
                {issue.approvedResolution && (
                  <span className="text-metric-products text-[12px] block font-medium">
                    (Admin đã duyệt: {issue.approvedResolution === 'REFUND' ? 'Hoàn tiền' : 'Đổi hàng'})
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                  onClick={() => setActiveAction('APPROVE_EXCHANGE')}
                  className={`py-2.5 px-3 rounded-[2px] border text-[12px] font-bold text-center transition-all cursor-pointer ${
                    activeAction === 'APPROVE_EXCHANGE'
                      ? 'bg-metric-orders text-landing-paper border-metric-orders'
                      : 'bg-landing-ivory text-metric-orders border-metric-orders/30 hover:bg-metric-orders/10'
                  }`}
                >
                  ✓ Duyệt đổi hàng 1-1
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
                    <p className="text-[11px] text-metric-products bg-metric-products/10 p-2 rounded-[2px]">
                      ℹ Khi duyệt hoàn tiền, trạng thái yêu cầu sẽ hoàn tất và đơn hàng được chuyển sang luồng hoàn tiền có sẵn của hệ thống.
                    </p>
                  )}

                  {activeAction === 'APPROVE_EXCHANGE' && (
                    <p className="text-[11px] text-metric-orders bg-metric-orders/10 p-2 rounded-[2px]">
                      ℹ Khi duyệt đổi hàng, yêu cầu sẽ chuyển sang trạng thái APPROVED. Shop chủ động liên hệ gửi hàng đổi ngoài hệ thống và sau đó bấm hoàn tất.
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
                      disabled={isSubmitting || (activeAction === 'REJECT' && !adminNote.trim())}
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

          {/* Case 2: APPROVED (Waiting for exchange resolution) */}
          {issue.status === 'APPROVED' && (
            <div className="p-4 rounded-[2px] border border-metric-orders/30 bg-metric-orders/10 flex flex-col gap-3">
              <div className="flex items-start gap-2.5">
                <RefreshCw className="w-5 h-5 text-metric-orders shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-metric-orders text-[14px]">
                    Đang trong tiến trình đổi hàng 1-1
                  </h4>
                  <p className="text-[12px] text-metric-orders mt-0.5 leading-relaxed">
                    Sau khi shop đã hoàn tất giao sản phẩm đổi mới cho khách hàng ngoài hệ thống, hãy xác nhận hoàn tất bên dưới để đóng khiếu nại.
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="resolve-exchange-note" className="text-[12px] font-semibold text-landing-obsidian block mb-1">
                  Ghi chú hoàn tất (Tuỳ chọn)
                </label>
                <input
                  id="resolve-exchange-note"
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder="Ví dụ: Đã giao thành công sản phẩm đổi ngày 10/10..."
                  className="w-full h-9 px-3 bg-landing-ivory border border-landing-taupe rounded-[2px] text-body-sm focus:outline-none focus:border-landing-oxblood"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleResolveExchange}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-metric-products hover:bg-landing-obsidian text-landing-paper text-xs font-bold rounded-[2px] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <PackageCheck className="w-4 h-4" />
                      Đánh dấu đổi hàng hoàn tất
                    </>
                  )}
                </button>
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
                  {issue.status === 'RESOLVED' ? 'Khiếu nại đã hoàn tất xử lý' : 'Khiếu nại đã bị từ chối'}
                </span>
                <p className="text-[12px] mt-0.5 opacity-90">
                  {issue.status === 'RESOLVED'
                    ? 'Yêu cầu này đã được giải quyết xong.'
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

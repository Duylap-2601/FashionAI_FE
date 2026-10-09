'use client';

import { useOrderIssues } from '@/features/orders/hooks/useOrderIssues';
import type { OrderIssueDesiredResolution, OrderIssueReason, OrderIssueStatus } from '@/features/orders/types/orders';
import { AlertTriangle, CheckCircle2, Clock, Image as ImageIcon, MessageSquare, RefreshCw, XCircle } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

interface OrderIssuesListProps {
  orderId: string;
}

const REASON_LABELS: Record<OrderIssueReason, string> = {
  WRONG_SIZE: 'Sai kích thước / số đo',
  WRONG_COLOR: 'Sai màu sắc',
  QUALITY_MISMATCH: 'Lỗi may đo / Chất lượng vải',
  OTHER: 'Lý do khác',
};

const RESOLUTION_LABELS: Record<OrderIssueDesiredResolution, string> = {
  REFUND: 'Hoàn tiền',
  EXCHANGE: 'Đổi hàng 1-1',
};

function StatusBadge({ status }: { status: OrderIssueStatus }) {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5" /> Chờ xem xét
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <RefreshCw className="w-3.5 h-3.5" /> Đã duyệt (Đang đổi hàng)
        </span>
      );
    case 'RESOLVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn tất xử lý
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-red-50 text-red-800 border border-red-200">
          <XCircle className="w-3.5 h-3.5" /> Từ chối yêu cầu
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-neutral-100 text-neutral-700">
          {status}
        </span>
      );
  }
}

export function OrderIssuesList({ orderId }: OrderIssuesListProps) {
  const { issues, isLoading } = useOrderIssues(orderId);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-neutral-400 text-body-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Đang tải thông tin yêu cầu báo lỗi...</span>
        </div>
      </div>
    );
  }

  if (!issues || issues.length === 0) {
    return null;
  }

  return (
    <div id="order-issues" className="bg-white border border-[#E5DFD5] rounded-2xl sm:rounded-3xl p-6 md:p-7 shadow-[0_2px_16px_rgba(93,28,52,0.03)] flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E5DFD5]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-brand-navy">
              Yêu cầu báo lỗi &amp; Đổi trả ({issues.length})
            </h3>
            <p className="text-[12px] text-neutral-500">
              Tiến trình xử lý các yêu cầu báo lỗi cho sản phẩm trong đơn
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {issues.map((issue) => {
          const item = issue.orderItem;
          const rawImg = item?.productImageSnapshot;
          const itemImg = (typeof rawImg === 'object' && rawImg !== null ? (rawImg as { url?: string; imageUrl?: string }).url || (rawImg as { url?: string; imageUrl?: string }).imageUrl : rawImg) || '/images/726470431_1311184104081177_6052756217829444481_n.png';
          const itemName = item?.productNameSnapshot || `Sản phẩm #${issue.orderItemId.slice(0, 8)}`;

          return (
            <div
              key={issue.id}
              className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 flex flex-col gap-3.5 hover:border-neutral-300 transition-colors"
            >
              {/* Top row: Status & Date */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={issue.status} />
                  <span className="text-[12px] font-medium text-neutral-500">
                    Mã: <code className="text-neutral-700 font-mono text-[11px]">{issue.id.slice(0, 8)}</code>
                  </span>
                </div>
                <span className="text-[12px] text-neutral-400">
                  {new Date(issue.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>

              {/* Product mini info */}
              <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-neutral-100">
                <Image
                  src={itemImg}
                  alt={itemName}
                  width={44}
                  height={54}
                  className="w-11 h-14 object-cover rounded-md bg-neutral-100 border border-neutral-200 shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/726470431_1311184104081177_6052756217829444481_n.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-brand-navy line-clamp-1">{itemName}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Màu: <span className="text-neutral-700">{item?.color || 'Mặc định'}</span> • Số lượng: <span className="text-neutral-700">{item?.quantity || 1}</span>
                  </p>
                </div>
              </div>

              {/* Reason & Desired Resolution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                <div className="p-2.5 bg-white rounded-lg border border-neutral-100">
                  <span className="text-neutral-400 block text-[11px]">Lý do:</span>
                  <span className="font-semibold text-brand-navy">
                    {REASON_LABELS[issue.reason] || issue.reason}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-neutral-100">
                  <span className="text-neutral-400 block text-[11px]">Mong muốn xử lý:</span>
                  <span className="font-semibold text-brand-navy">
                    {RESOLUTION_LABELS[issue.desiredResolution] || issue.desiredResolution}
                  </span>
                  {issue.approvedResolution && issue.approvedResolution !== issue.desiredResolution && (
                    <span className="ml-1.5 text-[11px] text-amber-700 font-normal">
                      (Admin duyệt: <strong>{RESOLUTION_LABELS[issue.approvedResolution]}</strong>)
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="p-3 bg-white rounded-lg border border-neutral-100 text-[13px] text-neutral-700">
                <p className="text-[11px] font-semibold text-neutral-400 mb-1">Mô tả của bạn:</p>
                <p className="whitespace-pre-wrap leading-relaxed">{issue.description}</p>
              </div>

              {/* Evidence Images */}
              {issue.evidenceImages && issue.evidenceImages.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-neutral-400 mb-1.5 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" /> Ảnh minh chứng ({issue.evidenceImages.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {issue.evidenceImages.map((imgUrl, i) => (
                      <button
                        key={imgUrl}
                        type="button"
                        onClick={() => setSelectedImg(imgUrl)}
                        className="relative w-14 h-14 rounded-lg overflow-hidden border border-neutral-200 hover:opacity-80 transition-opacity cursor-pointer group bg-neutral-100"
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

              {/* Admin Note if present */}
              {issue.adminNote && (
                <div className={`p-3 rounded-lg border text-[13px] ${
                  issue.status === 'REJECTED'
                    ? 'bg-red-50/60 border-red-200 text-red-900'
                    : 'bg-blue-50/60 border-blue-200 text-blue-900'
                }`}>
                  <div className="flex items-center gap-1.5 font-semibold text-[12px] mb-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Phản hồi từ Admin:</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{issue.adminNote}</p>
                </div>
              )}

              {/* Refund resolution note pointing to the refunds section */}
              {issue.status === 'RESOLVED' && (issue.approvedResolution === 'REFUND' || issue.desiredResolution === 'REFUND') && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[12px] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Yêu cầu hoàn tiền đã được chấp thuận và hoàn tất xử lý!</p>
                    <p className="mt-0.5 text-emerald-700">
                      Bạn có thể theo dõi tiến độ tiền về tài khoản qua mục <strong>Lịch sử hoàn tiền</strong> bên phải của đơn hàng.
                    </p>
                  </div>
                </div>
              )}

              {/* Exchange resolution guidance */}
              {issue.status === 'APPROVED' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-[12px] flex items-start gap-2">
                  <RefreshCw className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Đơn đổi hàng đang được shop chuẩn bị</p>
                    <p className="mt-0.5 text-blue-700">
                      Bộ phận vận chuyển của shop sẽ liên hệ trao đổi và gửi sản phẩm đổi 1-1 đến bạn. Vui lòng giữ sản phẩm lỗi nguyên vẹn.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Image Zoom Modal */}
      {selectedImg && (
        <div
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedImg(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full h-[80vh]">
            <Image
              src={selectedImg}
              alt="Ảnh phóng to"
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

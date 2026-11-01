'use client';

import type { AdminWebhookFailuresPanelProps } from '@/features/admin/types/admin-webhook-failures-panel';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const REASON_LABEL: Record<string, string> = {
  PARSE_FAILED: 'Không đọc được mã đơn từ nội dung chuyển khoản',
  ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng',
  AMOUNT_MISMATCH: 'Số tiền không khớp',
  INVALID_ORDER_STATUS: 'Đơn hàng không ở trạng thái chờ thanh toán',
};

export function AdminWebhookFailuresPanel({ failures, onResolve }: AdminWebhookFailuresPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="shrink-0">
        <h1 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.08] tracking-[-0.025em] text-landing-obsidian">Giao dịch chưa khớp đơn hàng</h1>
        <p className="text-body-sm text-landing-muted mt-1">
          Các webhook thanh toán từ SePay mà hệ thống không tự xử lý được (sai nội dung chuyển khoản, không tìm thấy đơn, sai số tiền...). Kiểm tra kỹ trước khi dùng &quot;Xác nhận thanh toán thủ công&quot; ở trang Đơn hàng.
        </p>
      </div>

      <div className="bg-landing-ivory rounded-[2px] border border-landing-line overflow-hidden">
        {/* Webhook Failures Table: Fixed Header + Scrollable Data Body */}
        <div className="overflow-x-auto">
          <div className="min-w-[920px]">
            {/* Fixed Header */}
            <div className="bg-landing-paper/60 border-b border-landing-line text-landing-muted text-label-sm font-semibold uppercase shrink-0 select-none">
              <div className="grid grid-cols-[170px_110px_160px_120px_minmax(200px,1fr)_160px] items-center">
                <div className="px-6 py-3">Thời gian</div>
                <div className="px-4 py-3">Nguồn</div>
                <div className="px-4 py-3">Lý do</div>
                <div className="px-4 py-3">Mã đơn (nếu có)</div>
                <div className="px-4 py-3">Chi tiết</div>
                <div className="px-6 py-3"></div>
              </div>
            </div>

            {/* Scrollable Data Body */}
            <div className="divide-y divide-landing-line text-body-sm">
              {failures.map(f => (
                <div
                  key={f.id}
                  className={`grid grid-cols-[170px_110px_160px_120px_minmax(200px,1fr)_160px] items-center ${
                    f.resolved ? 'opacity-50' : 'hover:bg-landing-paper/60'
                  } transition-colors`}
                >
                  <div className="px-6 py-3.5 text-landing-muted whitespace-nowrap truncate">{new Date(f.createdAt).toLocaleString('vi-VN')}</div>
                  <div className="px-4 py-3.5 font-medium text-landing-obsidian truncate">{f.provider}</div>
                  <div className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold bg-metric-users/10 text-metric-users">
                      <AlertTriangle className="w-3 h-3" />
                      {REASON_LABEL[f.reason] || f.reason}
                    </span>
                  </div>
                  <div className="px-4 py-3.5 font-mono text-landing-obsidian truncate">{f.orderCode ? `#${f.orderCode}` : '—'}</div>
                  <div className="px-4 py-3.5 text-landing-muted truncate" title={f.message}>{f.message}</div>
                  <div className="px-6 py-3.5">
                    {f.resolved ? (
                      <span className="inline-flex items-center gap-1 text-landing-muted">
                        <CheckCircle2 className="w-4 h-4" /> Đã xử lý
                      </span>
                    ) : (
                      <button
                        onClick={() => onResolve(f.id)}
                        className="text-landing-oxblood font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                      >
                        Đánh dấu đã xử lý
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {failures.length === 0 && (
                <div className="py-16 text-center text-landing-muted">Chưa có giao dịch nào bị lỗi</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

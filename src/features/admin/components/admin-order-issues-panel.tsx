'use client';

import { AdminPagination } from '@/features/admin/components/admin-pagination';
import type { AdminOrderIssuesPanelProps } from '@/features/admin/types/admin-order-issues-panel';
import type { OrderIssueReason, OrderIssueStatus } from '@/features/orders/types/orders';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';

const STATUS_OPTIONS: { value: OrderIssueStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ xem xét (PENDING)' },
  { value: 'APPROVED', label: 'Đã duyệt đổi hàng (APPROVED)' },
  { value: 'RESOLVED', label: 'Đã hoàn tất (RESOLVED)' },
  { value: 'REJECTED', label: 'Đã từ chối (REJECTED)' },
];

const REASON_OPTIONS: { value: OrderIssueReason | ''; label: string }[] = [
  { value: '', label: 'Tất cả lý do' },
  { value: 'WRONG_SIZE', label: 'Sai kích thước / số đo' },
  { value: 'WRONG_COLOR', label: 'Sai màu sắc' },
  { value: 'QUALITY_MISMATCH', label: 'Chất lượng / Đường may' },
  { value: 'OTHER', label: 'Lý do khác' },
];

function StatusBadge({ status }: { status: OrderIssueStatus }) {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 py-0.5 text-xs font-medium text-landing-obsidian">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-metric-users opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-metric-users" />
          </span>
          Chờ duyệt
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1.5 py-0.5 text-xs font-medium text-landing-obsidian">
          <span className="w-2 h-2 rounded-full bg-metric-orders shrink-0" />
          Đang đổi hàng
        </span>
      );
    case 'RESOLVED':
      return (
        <span className="inline-flex items-center gap-1.5 py-0.5 text-xs font-medium text-landing-obsidian">
          <span className="w-2 h-2 rounded-full bg-metric-products shrink-0" />
          Hoàn tất
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 py-0.5 text-xs font-medium text-landing-muted">
          <span className="w-2 h-2 rounded-full bg-landing-taupe shrink-0" />
          Từ chối
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 py-0.5 text-xs font-medium text-landing-muted">
          <span className="w-2 h-2 rounded-full bg-landing-taupe shrink-0" />
          {status}
        </span>
      );
  }
}

export function AdminOrderIssuesPanel({
  issues,
  filters = {},
  onFilterChange,
  onResetFilters,
  currentPage = 1,
  totalPages = 1,
  totalItems = issues.length,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  isFetching = false,
  onSelectIssue,
}: AdminOrderIssuesPanelProps) {
  const isFiltered = Boolean(filters.status || filters.reason);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.08] tracking-[-0.025em] text-landing-obsidian">Quản lý Báo lỗi &amp; Đổi trả</h1>
          <p className="text-body-sm text-landing-muted mt-1">
            Xét duyệt khiếu nại sản phẩm, xử lý hoàn tiền hoặc đổi mới 1-1 cho khách hàng
          </p>
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-landing-obsidian hover:text-destructive hover:bg-destructive/10 rounded-[2px] border border-landing-line hover:border-destructive/30 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại bộ lọc</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-landing-ivory rounded-[2px] border border-landing-line p-4 flex flex-wrap items-center gap-3 shrink-0">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-semibold text-landing-muted uppercase tracking-wider mb-1">
            Trạng thái yêu cầu
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange?.({ status: (e.target.value as OrderIssueStatus) || '' })}
            className="w-full h-10 px-3 rounded-[2px] border border-landing-taupe text-body-sm focus:outline-none focus:border-landing-oxblood cursor-pointer bg-landing-ivory"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-semibold text-landing-muted uppercase tracking-wider mb-1">
            Lý do khiếu nại
          </label>
          <select
            value={filters.reason || ''}
            onChange={(e) => onFilterChange?.({ reason: (e.target.value as OrderIssueReason) || '' })}
            className="w-full h-10 px-3 rounded-[2px] border border-landing-taupe text-body-sm focus:outline-none focus:border-landing-oxblood cursor-pointer bg-landing-ivory"
          >
            {REASON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-landing-ivory rounded-[2px] border border-landing-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-landing-line bg-landing-paper/60 text-[12px] font-bold text-landing-obsidian uppercase tracking-wider">
                <th className="py-3 px-4">Yêu cầu / Ngày gửi</th>
                <th className="py-3 px-4">Đơn hàng / Khách hàng</th>
                <th className="py-3 px-4">Sản phẩm khiếu nại</th>
                <th className="py-3 px-4">Lý do &amp; Mong muốn</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-landing-line text-body-sm">
              {isFetching ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-landing-muted">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang tải danh sách khiếu nại...</span>
                    </div>
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-landing-muted">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-landing-muted" />
                      <p>Không tìm thấy yêu cầu báo lỗi nào phù hợp.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                issues.map((issue) => {
                  const item = issue.orderItem;
                  const rawImg = item?.productImageSnapshot;
                  const itemImg = (typeof rawImg === 'object' && rawImg !== null ? (rawImg as { url?: string; imageUrl?: string }).url || (rawImg as { url?: string; imageUrl?: string }).imageUrl : rawImg) || '/images/726470431_1311184104081177_6052756217829444481_n.png';
                  const itemName = item?.productNameSnapshot || `Món #${issue.orderItemId.slice(0, 8)}`;
                  const orderCode = issue.order?.orderCode ? `#${issue.order.orderCode}` : issue.orderId.slice(0, 8);
                  const userName = issue.user?.name || issue.user?.email || 'Khách hàng';

                  return (
                    <tr key={issue.id} className="hover:bg-landing-paper/80 transition-colors">
                      {/* ID & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[12px] font-bold text-landing-oxblood block">
                          #{issue.id.slice(0, 8)}
                        </span>
                        <span className="text-[11px] text-landing-muted">
                          {new Date(issue.createdAt).toLocaleDateString('vi-VN')} {new Date(issue.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Order & Customer */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-landing-obsidian block text-[13px]">{orderCode}</span>
                        <span className="text-[12px] text-landing-muted line-clamp-1">{userName}</span>
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5 max-w-xs">
                          <Image
                            src={itemImg}
                            alt={itemName}
                            width={36}
                            height={44}
                            className="w-9 h-11 object-cover rounded bg-landing-paper border border-landing-line shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/726470431_1311184104081177_6052756217829444481_n.png';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-landing-obsidian line-clamp-1">{itemName}</p>
                            <p className="text-[11px] text-landing-muted">
                              Màu: {item?.color || 'Mặc định'} · SL: {item?.quantity || 1}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Reason & Desired */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-landing-paper text-landing-obsidian mb-1">
                          {issue.reason === 'WRONG_SIZE'
                            ? 'Sai số đo'
                            : issue.reason === 'WRONG_COLOR'
                            ? 'Sai màu'
                            : issue.reason === 'QUALITY_MISMATCH'
                            ? 'Lỗi may đo'
                            : 'Khác'}
                        </span>
                        <p className="text-[12px] text-landing-obsidian">
                          Muốn: <strong className="text-landing-oxblood">{issue.desiredResolution === 'REFUND' ? 'Hoàn tiền' : 'Đổi 1-1'}</strong>
                          {issue.approvedResolution && (
                            <span className="text-metric-products block text-[11px]">
                              → Duyệt: {issue.approvedResolution === 'REFUND' ? 'Hoàn tiền' : 'Đổi 1-1'}
                            </span>
                          )}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={issue.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectIssue?.(issue)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] border border-landing-line bg-landing-ivory hover:bg-landing-oxblood hover:text-landing-paper hover:border-landing-oxblood text-landing-obsidian text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết &amp; Xử lý</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-3 border-t border-landing-line bg-landing-paper/50 shrink-0">
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange ?? (() => {})}
            onPageSizeChange={onPageSizeChange ?? (() => {})}
          />
        </div>
      </div>
    </div>
  );
}

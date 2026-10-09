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
        <span className="inline-flex items-center gap-1.5 py-0.5 text-xs font-medium text-neutral-800">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.35)]" />
          </span>
          Chờ duyệt
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1.5 py-0.5 text-xs font-medium text-neutral-800">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.35)] shrink-0" />
          Đang đổi hàng
        </span>
      );
    case 'RESOLVED':
      return (
        <span className="inline-flex items-center gap-1.5 py-0.5 text-xs font-medium text-neutral-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.35)] shrink-0" />
          Hoàn tất
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 py-0.5 text-xs font-medium text-neutral-500">
          <span className="w-2 h-2 rounded-full bg-stone-400 shrink-0" />
          Từ chối
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 py-0.5 text-xs font-medium text-neutral-500">
          <span className="w-2 h-2 rounded-full bg-neutral-300 shrink-0" />
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
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      {/* Header */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-heading-h2 font-bold text-neutral-900">Quản lý Báo lỗi &amp; Đổi trả</h1>
          <p className="text-body-sm text-neutral-500 mt-1">
            Xét duyệt khiếu nại sản phẩm, xử lý hoàn tiền hoặc đổi mới 1-1 cho khách hàng
          </p>
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-xl border border-neutral-200 hover:border-red-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại bộ lọc</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex flex-wrap items-center gap-3 shrink-0">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Trạng thái yêu cầu
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange?.({ status: (e.target.value as OrderIssueStatus) || '' })}
            className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-body-sm focus:outline-none focus:border-brand-navy cursor-pointer bg-white"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Lý do khiếu nại
          </label>
          <select
            value={filters.reason || ''}
            onChange={(e) => onFilterChange?.({ reason: (e.target.value as OrderIssueReason) || '' })}
            className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-body-sm focus:outline-none focus:border-brand-navy cursor-pointer bg-white"
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
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-[12px] font-bold text-neutral-600 uppercase tracking-wider">
                <th className="py-3 px-4">Yêu cầu / Ngày gửi</th>
                <th className="py-3 px-4">Đơn hàng / Khách hàng</th>
                <th className="py-3 px-4">Sản phẩm khiếu nại</th>
                <th className="py-3 px-4">Lý do &amp; Mong muốn</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-body-sm">
              {isFetching ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang tải danh sách khiếu nại...</span>
                    </div>
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-neutral-300" />
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
                    <tr key={issue.id} className="hover:bg-neutral-50/80 transition-colors">
                      {/* ID & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[12px] font-bold text-brand-navy block">
                          #{issue.id.slice(0, 8)}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {new Date(issue.createdAt).toLocaleDateString('vi-VN')} {new Date(issue.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Order & Customer */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-neutral-800 block text-[13px]">{orderCode}</span>
                        <span className="text-[12px] text-neutral-500 line-clamp-1">{userName}</span>
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5 max-w-xs">
                          <Image
                            src={itemImg}
                            alt={itemName}
                            width={36}
                            height={44}
                            className="w-9 h-11 object-cover rounded bg-neutral-100 border border-neutral-200 shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/726470431_1311184104081177_6052756217829444481_n.png';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-neutral-800 line-clamp-1">{itemName}</p>
                            <p className="text-[11px] text-neutral-400">
                              Màu: {item?.color || 'Mặc định'} · SL: {item?.quantity || 1}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Reason & Desired */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 text-neutral-700 mb-1">
                          {issue.reason === 'WRONG_SIZE'
                            ? 'Sai số đo'
                            : issue.reason === 'WRONG_COLOR'
                            ? 'Sai màu'
                            : issue.reason === 'QUALITY_MISMATCH'
                            ? 'Lỗi may đo'
                            : 'Khác'}
                        </span>
                        <p className="text-[12px] text-neutral-600">
                          Muốn: <strong className="text-brand-navy">{issue.desiredResolution === 'REFUND' ? 'Hoàn tiền' : 'Đổi 1-1'}</strong>
                          {issue.approvedResolution && (
                            <span className="text-emerald-700 block text-[11px]">
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-brand-navy hover:text-white hover:border-brand-navy text-neutral-700 text-xs font-semibold transition-all cursor-pointer shadow-xs"
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
        <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 shrink-0">
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

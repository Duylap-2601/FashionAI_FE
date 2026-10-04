'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';
import { AdminPagination } from '@/features/admin/components/admin-pagination';
import { AdminReconciliationRow } from '@/features/admin/components/admin-reconciliation-row';
import { AdminConfirmPaymentModal } from '@/features/admin/components/admin-confirm-payment-modal';
import { AdminIgnoreFailureModal } from '@/features/admin/components/admin-ignore-failure-modal';
import { fetchUnmatchedTransactions, fetchWebhookFailures } from '@/features/admin/services/reconciliation';
import type {
  ReconciliationCandidate,
  ReconciliationPagination,
  UnmatchedTransaction,
  UnmatchedTransactionsResponse,
} from '@/features/admin/types/admin-reconciliation';

interface AdminReconciliationPanelProps {
  onStatsRefresh?: () => void;
}

export function AdminReconciliationPanel({ onStatsRefresh }: AdminReconciliationPanelProps) {
  // Filters & State
  const [resolvedTab, setResolvedTab] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoPolling, setAutoPolling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState<ReconciliationPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Data
  const [transactions, setTransactions] = useState<UnmatchedTransaction[]>([]);
  const [unresolvedCount, setUnresolvedCount] = useState<number>(0);

  // Modals state
  const [confirmModalData, setConfirmModalData] = useState<{
    tx: UnmatchedTransaction;
    candidate: ReconciliationCandidate;
  } | null>(null);

  const [ignoreModalTx, setIgnoreModalTx] = useState<UnmatchedTransaction | null>(null);

  // Fetch data
  const loadTransactions = useCallback(
    async (pageToLoad = pagination.page, isResolved = resolvedTab, silent = false) => {
      if (!silent) setIsLoading(true);
      try {
        if (isResolved) {
          // Tab "Đã xử lý": Lấy danh sách failures đã resolved
          const failuresRes = await fetchWebhookFailures();
          const allFailures = (Array.isArray(failuresRes)
            ? failuresRes
            : failuresRes && typeof failuresRes === 'object' && 'items' in failuresRes
            ? (failuresRes as { items?: unknown[] }).items
            : []) as Record<string, unknown>[];

          const resolvedList: UnmatchedTransaction[] = allFailures
            .filter(f => Boolean(f.resolved))
            .map(f => ({
              id: String(f.id || ''),
              reason: String(f.reason || 'RESOLVED'),
              transferAmount: Number(f.amount || f.transferAmount || 0),
              code: String(f.code || f.orderCode || ''),
              content: String(f.message || f.content || ''),
              transactionDate: String(f.createdAt || ''),
              referenceCode: String(f.referenceCode || f.id || '').substring(0, 16),
              gateway: String(f.provider || f.gateway || 'SePay'),
              accountNumber: String(f.accountNumber || ''),
              resolved: true,
              createdAt: String(f.createdAt || ''),
              resolvedAt: f.resolvedAt ? String(f.resolvedAt) : null,
              candidates: [],
            }));

          const total = resolvedList.length;
          const totalPages = Math.max(1, Math.ceil(total / pagination.limit));
          const pagedItems = resolvedList.slice(
            (pageToLoad - 1) * pagination.limit,
            pageToLoad * pagination.limit,
          );

          setTransactions(pagedItems);
          setPagination(prev => ({
            ...prev,
            page: pageToLoad,
            total,
            totalPages,
          }));
        } else {
          // Tab "Chưa xử lý": Gọi endpoint unmatched-transactions của P3-BE
          const res = await fetchUnmatchedTransactions({
            page: pageToLoad,
            limit: pagination.limit,
          });

          const raw = res as UnmatchedTransactionsResponse & { data?: UnmatchedTransaction[] };
          const items = Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.items)
            ? raw.items
            : Array.isArray(raw)
            ? (raw as unknown as UnmatchedTransaction[])
            : [];

          const meta = raw?.meta || raw?.__meta;
          const total = meta?.total ?? items.length;
          const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / pagination.limit));

          setTransactions(items);
          setPagination(prev => ({
            ...prev,
            page: pageToLoad,
            total,
            totalPages,
          }));

          setUnresolvedCount(total);
        }
      } catch (err) {
        console.error('[UNMATCHED_FETCH_ERROR]', err, (err as { response?: { data?: unknown } })?.response?.data);
        if (!silent) {
          toast.error(getErrorMessage(err, 'Không thể tải danh sách giao dịch đối soát.'));
        }
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [pagination.limit, pagination.page, resolvedTab],
  );

  // Initial and tab change load
  useEffect(() => {
    loadTransactions(1, resolvedTab);
  }, [resolvedTab, loadTransactions]);

  // Polling logic (30s)
  useEffect(() => {
    if (!autoPolling) return;
    const interval = setInterval(() => {
      loadTransactions(pagination.page, resolvedTab, true);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoPolling, loadTransactions, pagination.page, resolvedTab]);

  // Filtered transactions by client search query
  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(tx => {
      const matchRef = tx.referenceCode?.toLowerCase().includes(q);
      const matchContent = tx.content?.toLowerCase().includes(q);
      const matchCode = tx.code?.toLowerCase().includes(q);
      const matchAcc = tx.accountNumber?.toLowerCase().includes(q);
      const matchCandidate = tx.candidates?.some(
        c =>
          String(c.orderCode).includes(q) ||
          c.userEmail?.toLowerCase().includes(q) ||
          c.targetTier?.toLowerCase().includes(q),
      );
      return matchRef || matchContent || matchCode || matchAcc || matchCandidate;
    });
  }, [searchQuery, transactions]);

  const handlePageChange = (newPage: number) => {
    loadTransactions(newPage, resolvedTab);
  };

  const handleActionSuccess = () => {
    loadTransactions(pagination.page, resolvedTab);
    onStatsRefresh?.();
  };

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      {/* Page Title & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-heading-h2 font-bold text-neutral-900">
              Đối soát giao dịch lạ
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-navy/10 text-brand-navy">
              P3-SePay QR
            </span>
          </div>
          <p className="text-body-sm text-neutral-500 mt-1 max-w-3xl">
            Các giao dịch ngân hàng / SePay có nội dung chuyển khoản riêng không tự động khớp được.
            Hệ thống tự động gợi ý đơn hàng PENDING cùng số tiền trong ±24h để Admin đối chiếu và kích hoạt tức thì.
          </p>
        </div>

        {/* Quick Auto-polling & Manual Refresh toolbar */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* 30s Polling Switch */}
          <label className="flex items-center gap-2 text-[12px] font-medium text-neutral-600 cursor-pointer select-none bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shadow-2xs hover:bg-neutral-50 transition-colors">
            <input
              type="checkbox"
              checked={autoPolling}
              onChange={e => setAutoPolling(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-brand-navy focus:ring-brand-navy"
            />
            <span className="flex items-center gap-1.5">
              {autoPolling && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              Tự động làm mới (30s)
            </span>
          </label>

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={() => loadTransactions(pagination.page, resolvedTab)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-body-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-navy' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden flex flex-col flex-1 min-h-0">
        {/* Filter and Tab Bar */}
        <div className="p-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-neutral-50/60">
          <div className="flex items-center gap-2">
            {/* Segmented Control */}
            <div className="inline-flex rounded-xl bg-neutral-200/70 p-1 text-body-sm font-medium text-neutral-600">
              <button
                type="button"
                onClick={() => setResolvedTab(false)}
                className={`px-3.5 py-1.5 rounded-lg transition-all border-0 cursor-pointer text-body-sm font-semibold flex items-center gap-2 ${
                  !resolvedTab
                    ? 'bg-white text-brand-navy shadow-xs'
                    : 'bg-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>Chưa xử lý</span>
                {unresolvedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {unresolvedCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setResolvedTab(true)}
                className={`px-3.5 py-1.5 rounded-lg transition-all border-0 cursor-pointer text-body-sm font-semibold ${
                  resolvedTab
                    ? 'bg-white text-brand-navy shadow-xs'
                    : 'bg-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Đã xử lý
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px] max-w-sm flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm mã GD, FAI..., email, nội dung..."
              className="w-full pl-9 pr-4 py-1.5 border border-neutral-200 rounded-xl bg-white text-body-sm focus:outline-hidden focus:border-brand-navy"
            />
          </div>
        </div>

        {/* Transactions Table: Fixed Header + Scrollable Body */}
        <div className="overflow-x-auto flex-1 min-h-0 flex flex-col">
          <div className="min-w-[960px] flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="bg-neutral-50/90 border-b border-neutral-100 text-neutral-500 text-[11px] font-bold uppercase tracking-wider shrink-0 select-none shadow-2xs">
              <div className="grid grid-cols-[160px_130px_minmax(180px,1.2fr)_170px_130px_130px_100px] items-center">
                <div className="px-5 py-3">Giờ GD</div>
                <div className="px-4 py-3">Số tiền</div>
                <div className="px-4 py-3">Nội dung chuyển khoản</div>
                <div className="px-4 py-3">Mã tham chiếu</div>
                <div className="px-4 py-3">Cổng / STK</div>
                <div className="px-4 py-3">Ứng viên khớp</div>
                <div className="px-5 py-3 text-right">Chi tiết</div>
              </div>
            </div>

            {/* Scrollable Data Body */}
            <div className="overflow-y-auto flex-1 min-h-0 custom-scrollbar divide-y divide-neutral-100">
              {filteredTransactions.map(tx => (
                <AdminReconciliationRow
                  key={tx.id}
                  transaction={tx}
                  onOpenConfirm={(txToConfirm, candidate) =>
                    setConfirmModalData({ tx: txToConfirm, candidate })
                  }
                  onOpenIgnore={txToIgnore => setIgnoreModalTx(txToIgnore)}
                />
              ))}

              {filteredTransactions.length === 0 && !isLoading && (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-body-md font-semibold text-neutral-700">
                    {resolvedTab
                      ? 'Chưa có giao dịch nào đã xử lý'
                      : 'Tuyệt vời! Không có giao dịch lạ nào cần đối soát'}
                  </p>
                  <p className="text-[12px] text-neutral-400 max-w-md">
                    {searchQuery
                      ? 'Không tìm thấy kết quả phù hợp với bộ lọc tìm kiếm.'
                      : 'Tất cả các thanh toán chuyển khoản đã được hệ thống tự động xử lý hoặc đã được xác nhận.'}
                  </p>
                </div>
              )}

              {isLoading && filteredTransactions.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-3 border-brand-navy border-t-transparent rounded-full animate-spin" />
                  <p className="text-body-sm text-neutral-500">Đang nạp danh sách đối soát...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 shrink-0">
            <AdminPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              pageSize={pagination.limit}
              onPageChange={handlePageChange}
              itemLabel="giao dịch"
              isFetching={isLoading}
            />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModalData && (
        <AdminConfirmPaymentModal
          isOpen={Boolean(confirmModalData)}
          transaction={confirmModalData.tx}
          candidate={confirmModalData.candidate}
          onClose={() => setConfirmModalData(null)}
          onSuccess={handleActionSuccess}
        />
      )}

      {/* Ignore Failure Modal */}
      {ignoreModalTx && (
        <AdminIgnoreFailureModal
          isOpen={Boolean(ignoreModalTx)}
          transaction={ignoreModalTx}
          onClose={() => setIgnoreModalTx(null)}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
}

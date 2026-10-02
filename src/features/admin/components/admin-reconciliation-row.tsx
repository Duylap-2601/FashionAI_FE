'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  ShieldAlert,
  User,
} from 'lucide-react';
import type { ReconciliationCandidate, UnmatchedTransaction } from '@/features/admin/types/admin-reconciliation';

interface AdminReconciliationRowProps {
  transaction: UnmatchedTransaction;
  onOpenConfirm: (tx: UnmatchedTransaction, candidate: ReconciliationCandidate) => void;
  onOpenIgnore: (tx: UnmatchedTransaction) => void;
}

export function AdminReconciliationRow({
  transaction,
  onOpenConfirm,
  onOpenIgnore,
}: AdminReconciliationRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);

  const candidates = transaction.candidates || [];
  const [selectedOrderCode, setSelectedOrderCode] = useState<number | null>(
    candidates.length > 0 ? candidates[0].orderCode : null,
  );

  const handleCopyRef = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!transaction.referenceCode) return;
    navigator.clipboard.writeText(transaction.referenceCode);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleCopyContent = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!transaction.content) return;
    navigator.clipboard.writeText(transaction.content);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  const selectedCandidate = candidates.find(c => c.orderCode === selectedOrderCode) || null;

  const formattedAmount = (transaction.transferAmount || 0).toLocaleString('vi-VN');
  const formattedDate = transaction.transactionDate
    ? new Date(transaction.transactionDate).toLocaleString('vi-VN')
    : '—';

  return (
    <div className={`transition-colors border-b border-neutral-100 ${isExpanded ? 'bg-neutral-50/70' : 'hover:bg-neutral-50/40'}`}>
      {/* Summary Grid Row */}
      <div
        onClick={() => setIsExpanded(prev => !prev)}
        className="grid grid-cols-[160px_130px_minmax(180px,1.2fr)_170px_130px_130px_100px] items-center text-body-sm cursor-pointer select-none"
      >
        {/* 1. Giờ GD */}
        <div className="px-5 py-3.5 text-neutral-600 whitespace-nowrap text-[13px]">
          {formattedDate}
        </div>

        {/* 2. Số tiền */}
        <div className="px-4 py-3.5 font-bold text-brand-navy">
          {formattedAmount} ₫
        </div>

        {/* 3. Nội dung GD */}
        <div className="px-4 py-3.5 text-neutral-700">
          <div className="flex items-center gap-1.5 group max-w-full">
            <span className="truncate text-[13px]" title={transaction.content}>
              {transaction.content || '—'}
            </span>
            {transaction.content && (
              <button
                type="button"
                onClick={handleCopyContent}
                title="Sao chép nội dung"
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-200 rounded text-neutral-500 transition-opacity border-0 bg-transparent cursor-pointer shrink-0"
              >
                {copiedContent ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* 4. Mã tham chiếu */}
        <div className="px-4 py-3.5">
          <div className="inline-flex items-center gap-1.5 font-mono text-[12px] bg-neutral-100 px-2 py-1 rounded-md text-neutral-800">
            <span className="truncate max-w-[100px]">{transaction.referenceCode || '—'}</span>
            <button
              type="button"
              onClick={handleCopyRef}
              title="Sao chép mã tham chiếu"
              className="p-0.5 hover:bg-neutral-200 rounded text-neutral-500 border-0 bg-transparent cursor-pointer"
            >
              {copiedRef ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* 5. Cổng / STK */}
        <div className="px-4 py-3.5 text-[12px] text-neutral-600 truncate">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-neutral-200/70 text-neutral-800 mr-1.5">
            {transaction.gateway || 'QR'}
          </span>
          <span className="font-mono text-neutral-500">{transaction.accountNumber || ''}</span>
        </div>

        {/* 6. Ứng viên (Candidates badge) */}
        <div className="px-4 py-3.5">
          {candidates.length > 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {candidates.length} gợi ý
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-500">
              0 ứng viên
            </span>
          )}
        </div>

        {/* 7. Action Expand Toggle */}
        <div className="px-5 py-3.5 text-right">
          <button
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold text-brand-navy hover:bg-neutral-200/50 transition-colors border-0 bg-transparent cursor-pointer"
          >
            {isExpanded ? (
              <>
                Thu gọn <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Chi tiết <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details Pane */}
      {isExpanded && (
        <div className="px-6 py-4 bg-white border-t border-b border-neutral-200/80 space-y-4">
          {/* Raw transaction info */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[12px] text-neutral-600 flex flex-wrap items-center gap-y-2 gap-x-6">
            <div>
              <span className="text-neutral-400">Lý do lỗi:</span>{' '}
              <span className="font-semibold text-neutral-800">{transaction.reason || 'UNMATCHED'}</span>
            </div>
            {transaction.code && (
              <div>
                <span className="text-neutral-400">Mã GD SePay:</span>{' '}
                <span className="font-mono text-neutral-800">{transaction.code}</span>
              </div>
            )}
            <div>
              <span className="text-neutral-400">Ghi nhận:</span>{' '}
              <span>{new Date(transaction.createdAt).toLocaleString('vi-VN')}</span>
            </div>
            {transaction.resolved && (
              <div className="text-emerald-600 font-semibold">
                ✓ Đã xử lý {transaction.resolvedAt ? `lúc ${new Date(transaction.resolvedAt).toLocaleString('vi-VN')}` : ''}
              </div>
            )}
          </div>

          {/* Candidate matching section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-body-sm font-bold text-neutral-800 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-brand-navy" />
                Đơn hàng PENDING có số tiền khớp (±24h):
              </span>
              <span className="text-[12px] text-neutral-500">
                Sắp xếp theo thời gian tạo gần giao dịch nhất
              </span>
            </div>

            {candidates.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-1 md:grid-cols-2">
                {candidates.map(candidate => {
                  const isSelected = selectedOrderCode === candidate.orderCode;
                  const candidateAmount = candidate.amount.toLocaleString('vi-VN');
                  const minutes = Math.abs(candidate.minutesApart);
                  const timeLabel = minutes >= 60 ? `${Math.round(minutes / 60)} giờ` : `${minutes} phút`;

                  return (
                    <div
                      key={candidate.orderCode}
                      onClick={() => setSelectedOrderCode(candidate.orderCode)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? 'border-brand-navy bg-brand-navy/5 shadow-xs ring-1 ring-brand-navy'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        id={`candidate-${transaction.id}-${candidate.orderCode}`}
                        name={`candidate-${transaction.id}`}
                        checked={isSelected}
                        onChange={() => setSelectedOrderCode(candidate.orderCode)}
                        className="w-4 h-4 text-brand-navy focus:ring-brand-navy"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-neutral-900 text-body-sm">
                            FAI{candidate.orderCode}
                          </span>
                          <span className="font-bold text-emerald-600 text-body-sm">
                            {candidateAmount} ₫
                          </span>
                          {candidate.targetTier ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              {candidate.targetTier}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-600">
                              Đơn hàng
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[12px] text-neutral-500 mt-1">
                          <span className="truncate flex items-center gap-1" title={candidate.userEmail}>
                            <User className="w-3 h-3 shrink-0" />
                            {candidate.userEmail || 'Chưa có email'}
                          </span>
                          <span className="flex items-center gap-1 shrink-0" title="Khoảng cách thời gian">
                            <Clock className="w-3 h-3" />
                            Cách {timeLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-800 text-body-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-semibold">Không tìm thấy đơn hàng khớp</p>
                  <p className="text-[12px] text-amber-700 mt-0.5">
                    Không có đơn hàng nào ở trạng thái PENDING có số tiền khớp chính xác {formattedAmount} ₫ trong khoảng ±24 giờ.
                    Bạn có thể chọn <strong>Bỏ qua giao dịch này</strong> hoặc tra cứu thủ công tại trang Quản lý Đơn hàng.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action bar inside expand */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => onOpenIgnore(transaction)}
              disabled={transaction.resolved}
              className="px-4 py-2 rounded-xl text-body-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors border border-neutral-200 bg-white cursor-pointer disabled:opacity-40"
            >
              Bỏ qua giao dịch
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!selectedCandidate || transaction.resolved}
                onClick={() => {
                  if (selectedCandidate) {
                    onOpenConfirm(transaction, selectedCandidate);
                  }
                }}
                className="px-5 py-2 rounded-xl text-body-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all flex items-center gap-2 border-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Xác nhận đã nhận tiền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

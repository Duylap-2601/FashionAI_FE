'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tag,
  Plus,
  Search,
  RotateCcw,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2,
  Percent,
  DollarSign,
  Power,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { fmt } from '@/features/admin/services/format';
import { fetchAdminCoupons } from '@/features/admin/services/queries';
import { deleteAdminCoupon, updateAdminCoupon } from '@/features/admin/services/mutations';
import type { AdminCoupon, AdminCouponsResponse, AdminCouponFilters } from '@/features/admin/types/admin-coupons';
import { AdminCouponModal } from '@/features/admin/components/admin-coupon-modal';
import { AdminPagination } from '@/features/admin/components/admin-pagination';
import { getErrorMessage } from '@/lib/errors';

export function AdminCouponsPanel() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [filters, setFilters] = useState<AdminCouponFilters>({
    search: '',
    discountType: 'ALL',
    status: 'ALL',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<AdminCoupon | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminCoupons({
        params: { page, limit: pageSize },
      });
      const resObj = res as AdminCouponsResponse | undefined;
      const list = Array.isArray(res)
        ? res
        : resObj?.items || resObj?.data || resObj?.coupons || [];

      setCoupons(list as AdminCoupon[]);

      const meta = resObj?.meta;
      const count = typeof meta?.total === 'number'
        ? meta.total
        : typeof resObj?.total === 'number'
          ? resObj.total
          : list.length;
      setTotalItems(count);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không thể tải danh sách mã giảm giá.'));
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    toast.success(`Đã sao chép mã: ${code}`);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleToggleActive = async (c: AdminCoupon) => {
    const nextState = !c.isActive;
    try {
      await updateAdminCoupon(c.id, { isActive: nextState });
      toast.success(`Đã ${nextState ? 'kích hoạt' : 'tắt'} mã giảm giá ${c.code}`);
      setCoupons(prev => prev.map(item => item.id === c.id ? { ...item, isActive: nextState } : item));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không thể cập nhật trạng thái mã giảm giá.'));
    }
  };

  const handleDelete = async (c: AdminCoupon) => {
    if (!window.confirm(`Bạn có chắc muốn xóa mã giảm giá "${c.code}"?`)) return;

    setDeletingId(c.id);
    try {
      await deleteAdminCoupon(c.id);
      toast.success(`Đã xóa mã giảm giá ${c.code}`);
      loadCoupons();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Không thể xóa mã giảm giá.');
      if (msg.includes('đã được sử dụng trong đơn hàng') || msg.includes('CouponRedemption')) {
        toast.error(msg, {
          description: 'Mã đã có khách sử dụng. Hãy chuyển sang tắt (Inactive) để ngừng áp dụng.',
          action: {
            label: 'Tắt mã ngay',
            onClick: () => handleToggleActive(c),
          },
          duration: 6000,
        });
      } else {
        toast.error(msg);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        if (!c.code.toLowerCase().includes(q)) return false;
      }
      if (filters.discountType && filters.discountType !== 'ALL') {
        if (c.discountType !== filters.discountType) return false;
      }
      if (filters.status && filters.status !== 'ALL') {
        if (filters.status === 'ACTIVE' && !c.isActive) return false;
        if (filters.status === 'INACTIVE' && c.isActive) return false;
      }
      return true;
    });
  }, [coupons, filters]);

  const isFiltered = Boolean(
    filters.search ||
    (filters.discountType && filters.discountType !== 'ALL') ||
    (filters.status && filters.status !== 'ALL')
  );

  const resetFilters = () => {
    setFilters({
      search: '',
      discountType: 'ALL',
      status: 'ALL',
    });
  };

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-heading-h2 font-bold text-neutral-900">Quản lý Mã giảm giá (Coupons)</h1>
          <p className="text-body-sm text-neutral-500 mt-1">
            Tạo, cấu hình mức chiết khấu và theo dõi hiệu lực của các mã khuyến mãi
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedCoupon(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-navy hover:bg-brand-navy/90 text-white font-bold text-body-sm rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo mã giảm giá mới</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        {/* Filter Bar */}
        <div className="p-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-neutral-50/50">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
            {/* Search */}
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search ?? ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Tìm mã giảm giá..."
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm focus:outline-none focus:border-brand-navy"
              />
            </div>

            {/* Discount Type Filter */}
            <select
              value={filters.discountType || 'ALL'}
              onChange={(e) => setFilters(prev => ({ ...prev, discountType: e.target.value }))}
              className="px-3 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm text-neutral-700 focus:outline-none focus:border-brand-navy cursor-pointer"
            >
              <option value="ALL">Tất cả loại giảm giá</option>
              <option value="PERCENTAGE">Theo phần trăm (%)</option>
              <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status || 'ALL'}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm text-neutral-700 focus:outline-none focus:border-brand-navy cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang kích hoạt (Active)</option>
              <option value="INACTIVE">Đã tắt (Inactive)</option>
            </select>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-xl border border-neutral-200 hover:border-red-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto flex-1 min-h-0 flex flex-col">
          <div className="min-w-[960px] flex-1 flex flex-col min-h-0">
            {/* Table Header */}
            <div className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-label-sm font-semibold uppercase shrink-0 shadow-2xs select-none">
              <div className="grid grid-cols-[140px_180px_140px_130px_180px_110px_90px] items-center">
                <div className="px-6 py-3">Mã Code</div>
                <div className="px-4 py-3">Chiết khấu</div>
                <div className="px-4 py-3">Đơn tối thiểu</div>
                <div className="px-4 py-3">Lượt dùng</div>
                <div className="px-4 py-3">Thời hạn</div>
                <div className="px-4 py-3">Trạng thái</div>
                <div className="px-6 py-3 text-right">Thao tác</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-y-auto flex-1 min-h-0 custom-scrollbar divide-y divide-neutral-100 text-body-sm">
              {filteredCoupons.map((c) => {
                const numVal = Number(c.discountValue);
                const numMax = c.maxDiscountVnd ? Number(c.maxDiscountVnd) : null;
                const numMin = c.minOrderVnd ? Number(c.minOrderVnd) : null;
                const isExpired = c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();

                return (
                  <div
                    key={c.id}
                    className="grid grid-cols-[140px_180px_140px_130px_180px_110px_90px] items-center hover:bg-neutral-50/80 transition-colors"
                  >
                    {/* Code */}
                    <div className="px-6 py-3.5 flex items-center gap-1.5 min-w-0">
                      <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded text-xs truncate">
                        {c.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(c.code)}
                        title="Sao chép mã"
                        className="text-neutral-400 hover:text-brand-navy transition-colors border-0 bg-transparent cursor-pointer p-0.5"
                      >
                        {copiedId === c.code ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Discount */}
                    <div className="px-4 py-3.5 min-w-0">
                      {c.discountType === 'PERCENTAGE' ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-brand-navy flex items-center gap-1">
                            <Percent className="w-3.5 h-3.5 text-purple-600" /> Giảm {numVal}%
                          </span>
                          {numMax ? (
                            <span className="text-[11px] text-neutral-500 truncate">
                              Tối đa {fmt(numMax)}
                            </span>
                          ) : (
                            <span className="text-[11px] text-neutral-400">Không giới hạn mức giảm</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="font-bold text-brand-navy flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Giảm {fmt(numVal)}
                          </span>
                          <span className="text-[11px] text-neutral-400">Cố định</span>
                        </div>
                      )}
                    </div>

                    {/* Min Order */}
                    <div className="px-4 py-3.5 min-w-0">
                      {numMin ? (
                        <span className="text-neutral-800 font-medium">{fmt(numMin)}</span>
                      ) : (
                        <span className="text-neutral-400 text-xs">Không yêu cầu</span>
                      )}
                    </div>

                    {/* Usage */}
                    <div className="px-4 py-3.5 min-w-0">
                      <div className="flex flex-col">
                        <span className="font-semibold text-neutral-800">
                          {c.usedCount} / {c.usageLimit !== null && c.usageLimit !== undefined ? c.usageLimit : '∞'}
                        </span>
                        {c.usageLimitPerUser && (
                          <span className="text-[11px] text-neutral-400">
                            {c.usageLimitPerUser} lượt / khách
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Validity Period */}
                    <div className="px-4 py-3.5 min-w-0">
                      <div className="flex flex-col gap-0.5 text-xs">
                        {c.startsAt || c.expiresAt ? (
                          <>
                            {c.startsAt && (
                              <span className="text-neutral-600">
                                Từ: {new Date(c.startsAt).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                            {c.expiresAt && (
                              <span className={isExpired ? 'text-red-600 font-semibold' : 'text-neutral-600'}>
                                Đến: {new Date(c.expiresAt).toLocaleDateString('vi-VN')}
                                {isExpired && ' (Hết hạn)'}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-neutral-400">Vô thời hạn</span>
                        )}
                      </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors border ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'
                        }`}
                        title="Bấm để bật/tắt kích hoạt"
                      >
                        <Power className="w-3 h-3" />
                        <span>{c.isActive ? 'Bật' : 'Tắt'}</span>
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-3.5 text-right flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCoupon(c);
                          setModalOpen(true);
                        }}
                        className="p-1.5 text-neutral-500 hover:text-brand-navy hover:bg-neutral-100 rounded-lg transition-colors border-0 bg-transparent cursor-pointer"
                        title="Chỉnh sửa mã"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        disabled={deletingId === c.id}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-40"
                        title="Xóa mã"
                      >
                        {deletingId === c.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredCoupons.length === 0 && (
                <div className="py-16 text-center text-neutral-400 flex flex-col items-center gap-2">
                  <Tag className="w-8 h-8 text-neutral-300" />
                  <p>
                    {isFiltered
                      ? 'Không tìm thấy mã giảm giá nào phù hợp với bộ lọc'
                      : 'Chưa có mã giảm giá nào được tạo'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        <AdminPagination
          currentPage={page}
          totalPages={Math.ceil(totalItems / pageSize) || 1}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="mã giảm giá"
          isFetching={isLoading}
        />
      </div>

      {/* Modal create / edit */}
      <AdminCouponModal
        isOpen={modalOpen}
        coupon={selectedCoupon}
        onClose={() => {
          setModalOpen(false);
          setSelectedCoupon(null);
        }}
        onSuccess={loadCoupons}
      />
    </div>
  );
}

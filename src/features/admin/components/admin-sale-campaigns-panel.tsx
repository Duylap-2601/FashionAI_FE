'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  BadgePercent,
  CalendarDays,
  Edit2,
  Loader2,
  Plus,
  Power,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { readAdminList } from '@/features/admin/services/admin-mappers';
import { fetchAdminSaleCampaigns } from '@/features/admin/services/queries';
import { deleteAdminSaleCampaign, updateAdminSaleCampaign } from '@/features/admin/services/mutations';
import { AdminPagination } from '@/features/admin/components/admin-pagination';
import { AdminLoadingBar, AdminTableLoading } from '@/features/admin/components/admin-loading';
import { AdminSaleCampaignModal } from '@/features/admin/components/admin-sale-campaign-modal';
import type {
  AdminSaleCampaign,
  AdminSaleCampaignFilters,
} from '@/features/admin/types/admin-sale-campaigns';
import { getErrorMessage } from '@/lib/errors';

const EMPTY_FILTERS: AdminSaleCampaignFilters = { search: '', status: 'ALL' };

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('vi-VN');
}

export function AdminSaleCampaignsPanel() {
  const [campaigns, setCampaigns] = useState<AdminSaleCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<AdminSaleCampaignFilters>(EMPTY_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<AdminSaleCampaign | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminSaleCampaigns({
        page,
        limit: pageSize,
        ...(filters.status === 'ACTIVE' ? { isActive: true } : {}),
        ...(filters.status === 'INACTIVE' ? { isActive: false } : {}),
        ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
      });
      const { items, serverTotal } = readAdminList<AdminSaleCampaign>(res);
      setCampaigns(items);
      setTotalItems(serverTotal ?? items.length);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không thể tải danh sách chiến dịch sale.'));
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  const handleToggleActive = async (campaign: AdminSaleCampaign) => {
    const nextState = !campaign.isActive;
    try {
      await updateAdminSaleCampaign(campaign.id, { isActive: nextState });
      toast.success(`Đã ${nextState ? 'kích hoạt' : 'tắt'} chiến dịch ${campaign.name}`);
      setCampaigns((prev) => prev.map((item) => (
        item.id === campaign.id ? { ...item, isActive: nextState } : item
      )));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không thể cập nhật trạng thái chiến dịch sale.'));
    }
  };

  const handleDelete = async (campaign: AdminSaleCampaign) => {
    if (!window.confirm(`Bạn có chắc muốn xóa chiến dịch sale "${campaign.name}"?`)) return;
    setDeletingId(campaign.id);
    try {
      await deleteAdminSaleCampaign(campaign.id);
      toast.success(`Đã xóa chiến dịch ${campaign.name}`);
      void loadCampaigns();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không thể xóa chiến dịch sale.'));
    } finally {
      setDeletingId(null);
    }
  };

  const isFiltered = Boolean(filters.search || filters.status !== 'ALL');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.08] tracking-[-0.025em] text-landing-obsidian">Quản lý Chiến dịch sale</h1>
          <p className="text-body-sm text-landing-muted mt-1">
            Giảm giá theo phần trăm cho nhóm sản phẩm trong khoảng thời gian đã chọn
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedCampaign(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-landing-oxblood hover:bg-landing-oxblood/90 text-landing-paper font-bold text-body-sm rounded-[2px] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo chiến dịch mới</span>
        </button>
      </div>

      <div className="bg-landing-ivory rounded-[2px] border border-landing-line overflow-hidden">
        <div className="p-4 border-b border-landing-line flex flex-wrap items-center justify-between gap-3 shrink-0 bg-landing-paper/50">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <Search className="w-4 h-4 text-landing-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search}
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({ ...prev, search: e.target.value }));
                }}
                placeholder="Tìm chiến dịch sale..."
                className="w-full pl-9 pr-4 py-2 border border-landing-line rounded-[2px] bg-landing-ivory text-body-sm focus:outline-none focus:border-landing-oxblood"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => {
                setPage(1);
                setFilters((prev) => ({ ...prev, status: e.target.value as AdminSaleCampaignFilters['status'] }));
              }}
              className="px-3 py-2 border border-landing-line rounded-[2px] bg-landing-ivory text-body-sm text-landing-obsidian focus:outline-none focus:border-landing-oxblood cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang kích hoạt</option>
              <option value="INACTIVE">Đã tắt</option>
            </select>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                setPage(1);
                setFilters(EMPTY_FILTERS);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-landing-obsidian hover:text-destructive hover:bg-destructive/10 rounded-[2px] border border-landing-line hover:border-destructive/30 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="bg-landing-paper/60 border-b border-landing-line text-landing-muted text-label-sm font-semibold uppercase shrink-0 select-none">
              <div className="grid grid-cols-[240px_130px_190px_130px_120px_100px] items-center">
                <div className="px-6 py-3">Chiến dịch</div>
                <div className="px-4 py-3">Giảm giá</div>
                <div className="px-4 py-3">Thời gian</div>
                <div className="px-4 py-3">Sản phẩm</div>
                <div className="px-4 py-3">Trạng thái</div>
                <div className="px-6 py-3 text-right">Thao tác</div>
              </div>
            </div>

            <div className="divide-y divide-landing-line text-body-sm">
              {isLoading && campaigns.length > 0 && (
                <AdminLoadingBar label="Đang cập nhật chiến dịch sale..." />
              )}
              {isLoading && campaigns.length === 0 && (
                <AdminTableLoading label="Đang tải chiến dịch sale" />
              )}
              {campaigns.map((campaign) => {
                const startsAt = formatDate(campaign.startsAt);
                const endsAt = formatDate(campaign.endsAt);
                return (
                  <div
                    key={campaign.id}
                    className="grid grid-cols-[240px_130px_190px_130px_120px_100px] items-center hover:bg-landing-paper/80 transition-colors"
                  >
                    <div className="px-6 py-3.5 min-w-0">
                      <p className="font-semibold text-landing-obsidian truncate">{campaign.name}</p>
                      <p className="text-[11px] text-landing-muted">Cập nhật {formatDate(campaign.updatedAt)}</p>
                    </div>

                    <div className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 font-bold text-landing-oxblood">
                        <BadgePercent className="w-3.5 h-3.5 text-metric-ai" />
                        -{campaign.discountPercent}%
                      </span>
                    </div>

                    <div className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5 text-xs text-landing-obsidian">
                        <span>Từ: {startsAt ?? 'Ngay'}</span>
                        <span>Đến: {endsAt ?? 'Không hết hạn'}</span>
                      </div>
                    </div>

                    <div className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-landing-obsidian font-medium">
                        <CalendarDays className="w-3.5 h-3.5 text-landing-muted" />
                        {campaign.productCount} sản phẩm
                      </span>
                    </div>

                    <div className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => void handleToggleActive(campaign)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors border ${
                          campaign.isActive
                            ? 'bg-metric-products/10 text-metric-products border-metric-products/30 hover:bg-metric-products/10'
                            : 'bg-landing-paper text-landing-muted border-landing-line hover:bg-landing-taupe'
                        }`}
                        title="Bấm để bật/tắt kích hoạt"
                      >
                        <Power className="w-3 h-3" />
                        <span>{campaign.isActive ? 'Bật' : 'Tắt'}</span>
                      </button>
                    </div>

                    <div className="px-6 py-3.5 text-right flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setModalOpen(true);
                        }}
                        className="p-1.5 text-landing-muted hover:text-landing-oxblood hover:bg-landing-paper rounded-[2px] transition-colors border-0 bg-transparent cursor-pointer"
                        title="Chỉnh sửa chiến dịch"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(campaign)}
                        disabled={deletingId === campaign.id}
                        className="p-1.5 text-landing-muted hover:text-destructive hover:bg-destructive/10 rounded-[2px] transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-40"
                        title="Xóa chiến dịch"
                      >
                        {deletingId === campaign.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {campaigns.length === 0 && !isLoading && (
                <div className="py-16 text-center text-landing-muted flex flex-col items-center gap-2">
                  <BadgePercent className="w-8 h-8 text-landing-muted" />
                  <p>
                    {isFiltered
                      ? 'Không tìm thấy chiến dịch sale nào phù hợp với bộ lọc'
                      : 'Chưa có chiến dịch sale nào được tạo'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <AdminPagination
          currentPage={page}
          totalPages={Math.ceil(totalItems / pageSize) || 1}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="chiến dịch"
          isFetching={isLoading}
        />
      </div>

      <AdminSaleCampaignModal
        isOpen={modalOpen}
        campaign={selectedCampaign}
        onClose={() => {
          setModalOpen(false);
          setSelectedCampaign(null);
        }}
        onSuccess={loadCampaigns}
      />
    </div>
  );
}

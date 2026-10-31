'use client';

import type { AdminUsersPanelProps } from '@/features/admin/types/admin-users-panel';
import type { UserRole, UserTier } from '@/features/admin/types/admin-dashboard-page';
import { AdminPagination } from '@/features/admin/components/admin-pagination';
import { AdminLoadingBar, AdminTableLoading } from '@/features/admin/components/admin-loading';
import { RotateCcw, Search } from 'lucide-react';

export function AdminUsersPanel({
  users,
  setSelectedUser,
  filters = {},
  onFilterChange,
  onResetFilters,
  currentPage = 1,
  totalPages = 1,
  totalItems = users.length,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  isFetching = false,
}: AdminUsersPanelProps) {
  const isFiltered = Boolean(
    filters.search ||
    (filters.tier && filters.tier !== 'ALL') ||
    (filters.role && filters.role !== 'ALL') ||
    (filters.isVerified && filters.isVerified !== 'ALL')
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="shrink-0">
        <h1 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.08] tracking-[-0.025em] text-landing-obsidian">Quản lý người dùng</h1>
        <p className="text-body-sm text-landing-muted mt-1">Xem thông tin và thay đổi tier / vai trò</p>
      </div>

      <div className="bg-landing-ivory rounded-[2px] border border-landing-line overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-landing-line flex flex-wrap items-center justify-between gap-3 shrink-0 bg-landing-paper/50">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
            {/* Search */}
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <Search className="w-4 h-4 text-landing-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search ?? ''}
                onChange={(e) => onFilterChange?.({ search: e.target.value })}
                placeholder="Tìm tên, email người dùng..."
                className="w-full pl-9 pr-4 py-2 border border-landing-line rounded-[2px] bg-landing-ivory text-body-sm focus:outline-none focus:border-landing-oxblood"
              />
            </div>

            {/* Tier Filter */}
            <select
              value={filters.tier || 'ALL'}
              onChange={(e) => onFilterChange?.({ tier: (e.target.value === 'ALL' ? '' : e.target.value) as UserTier | '' })}
              className="px-3 py-2 border border-landing-line rounded-[2px] bg-landing-ivory text-body-sm text-landing-obsidian focus:outline-none focus:border-landing-oxblood cursor-pointer"
            >
              <option value="ALL">Tất cả Tier</option>
              <option value="FREE">FREE</option>
              <option value="MEMBER">MEMBER</option>
              <option value="VIP">VIP</option>
            </select>

            {/* Role Filter */}
            <select
              value={filters.role || 'ALL'}
              onChange={(e) => onFilterChange?.({ role: (e.target.value === 'ALL' ? '' : e.target.value) as UserRole | '' })}
              className="px-3 py-2 border border-landing-line rounded-[2px] bg-landing-ivory text-body-sm text-landing-obsidian focus:outline-none focus:border-landing-oxblood cursor-pointer"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            {/* Verification Status Filter */}
            <select
              value={filters.isVerified || 'ALL'}
              onChange={(e) => onFilterChange?.({ isVerified: (e.target.value === 'ALL' ? '' : e.target.value) as 'VERIFIED' | 'UNVERIFIED' | '' })}
              className="px-3 py-2 border border-landing-line rounded-[2px] bg-landing-ivory text-body-sm text-landing-obsidian focus:outline-none focus:border-landing-oxblood cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái xác thực</option>
              <option value="VERIFIED">Đã xác thực</option>
              <option value="UNVERIFIED">Chưa xác thực</option>
            </select>
          </div>

          {/* Reset button */}
          {isFiltered && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-landing-obsidian hover:text-destructive hover:bg-destructive/10 rounded-[2px] border border-landing-line hover:border-destructive/30 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>

        {/* Users Table: Fixed Header + Scrollable Data Body */}
        <div className="overflow-x-auto">
          <div className="min-w-[880px]">
            {/* Fixed Header */}
            <div className="bg-landing-paper/60 border-b border-landing-line text-landing-muted text-label-sm font-semibold uppercase shrink-0 select-none">
              <div className="grid grid-cols-[minmax(180px,1fr)_minmax(180px,1.2fr)_110px_110px_110px_140px_100px] items-center">
                <div className="px-6 py-3">Thành viên</div>
                <div className="px-4 py-3">Email</div>
                <div className="px-4 py-3">Vai trò</div>
                <div className="px-4 py-3">Tier</div>
                <div className="px-4 py-3 text-right">Try-On</div>
                <div className="px-4 py-3">Trạng thái</div>
                <div className="px-6 py-3"></div>
              </div>
            </div>

            {/* Scrollable Data Body */}
            <div className="divide-y divide-landing-line text-body-sm">
              {isFetching && users.length > 0 && (
                <AdminLoadingBar label="Đang cập nhật người dùng..." />
              )}
              {isFetching && users.length === 0 && (
                <AdminTableLoading label="Đang tải người dùng" />
              )}
              {users.map(u => (
                <div
                  key={u.id}
                  className="grid grid-cols-[minmax(180px,1fr)_minmax(180px,1.2fr)_110px_110px_110px_140px_100px] items-center hover:bg-landing-paper/60 transition-colors"
                >
                  <div className="px-6 py-3.5 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-landing-oxblood/10 text-landing-oxblood flex items-center justify-center font-bold font-sans shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-landing-obsidian truncate">{u.name}</span>
                    </div>
                  </div>
                  <div className="px-4 py-3.5 text-landing-obsidian truncate">{u.email}</div>
                  <div className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-[2px] text-xs font-medium font-mono ${
                      u.role === 'ADMIN' ? 'bg-landing-oxblood/10 text-landing-oxblood border border-landing-oxblood/20' : 'bg-landing-paper text-landing-obsidian'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  <div className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-[2px] text-xs font-semibold capitalize ${
                      u.tier === 'VIP' ? 'bg-metric-users/20 text-metric-users border border-metric-users/30' : u.tier === 'MEMBER' ? 'bg-landing-paper text-landing-obsidian border border-landing-line' : 'bg-landing-paper/60 text-landing-muted'
                    }`}>
                      {u.tier}
                    </span>
                  </div>
                  <div className="px-4 py-3.5 text-right font-medium text-landing-obsidian">{u.tryOns} lượt</div>
                  <div className="px-4 py-3.5">
                    <div className="inline-flex items-center gap-1.5 py-0.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${u.isVerified ? 'bg-metric-products' : 'bg-landing-taupe'}`} />
                      <span className="text-xs font-medium text-landing-obsidian">
                        {u.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                      </span>
                    </div>
                  </div>
                  <div className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="text-landing-oxblood font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      Quản lý
                    </button>
                  </div>
                </div>
              ))}

              {users.length === 0 && !isFetching && (
                <div className="py-16 text-center text-landing-muted">
                  {isFiltered ? 'Không tìm thấy người dùng phù hợp với bộ lọc' : 'Chưa có người dùng nào'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages !== undefined && onPageChange && (
          <div className="shrink-0">
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              disabled={isFetching}
            />
          </div>
        )}
      </div>
    </div>
  );
}

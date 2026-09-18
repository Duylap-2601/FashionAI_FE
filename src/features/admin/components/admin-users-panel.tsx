'use client';

import type { AdminUsersPanelProps } from '@/features/admin/types/admin-users-panel';
import type { UserRole, UserTier } from '@/features/admin/types/admin-dashboard-page';
import { AdminPagination } from '@/features/admin/components/admin-pagination';
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
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      <div className="shrink-0">
        <h1 className="text-heading-h2 font-bold text-neutral-900">Quản lý người dùng</h1>
        <p className="text-body-sm text-neutral-500 mt-1">Xem thông tin và thay đổi tier / vai trò</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        {/* Filter Bar */}
        <div className="p-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-neutral-50/50">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
            {/* Search */}
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search ?? ''}
                onChange={(e) => onFilterChange?.({ search: e.target.value })}
                placeholder="Tìm tên, email người dùng..."
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm focus:outline-none focus:border-brand-navy"
              />
            </div>

            {/* Tier Filter */}
            <select
              value={filters.tier || 'ALL'}
              onChange={(e) => onFilterChange?.({ tier: (e.target.value === 'ALL' ? '' : e.target.value) as UserTier | '' })}
              className="px-3 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm text-neutral-700 focus:outline-none focus:border-brand-navy cursor-pointer"
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
              className="px-3 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm text-neutral-700 focus:outline-none focus:border-brand-navy cursor-pointer"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            {/* Verification Status Filter */}
            <select
              value={filters.isVerified || 'ALL'}
              onChange={(e) => onFilterChange?.({ isVerified: (e.target.value === 'ALL' ? '' : e.target.value) as 'VERIFIED' | 'UNVERIFIED' | '' })}
              className="px-3 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm text-neutral-700 focus:outline-none focus:border-brand-navy cursor-pointer"
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
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-xl border border-neutral-200 hover:border-red-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>

        <div className="overflow-auto flex-1 min-h-0">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-neutral-50 z-10 shadow-2xs">
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-label-sm font-semibold uppercase">
                <th className="px-6 py-3 bg-neutral-50">Thành viên</th>
                <th className="px-4 py-3 bg-neutral-50">Email</th>
                <th className="px-4 py-3 bg-neutral-50">Vai trò</th>
                <th className="px-4 py-3 bg-neutral-50">Tier</th>
                <th className="px-4 py-3 text-right bg-neutral-50">Try-On</th>
                <th className="px-4 py-3 bg-neutral-50">Trạng thái</th>
                <th className="px-6 py-3 bg-neutral-50"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-body-sm">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center font-bold font-sans">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-neutral-950">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-neutral-600">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-label-sm font-semibold ${
                      u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-label-sm font-bold capitalize ${
                      u.tier === 'VIP' ? 'bg-amber-100 text-amber-700' : u.tier === 'MEMBER' ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {u.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-neutral-700">{u.tryOns} lượt</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-label-sm font-semibold ${
                      u.isVerified ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                    }`}>
                      {u.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="text-brand-navy font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      Quản lý
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                    {isFiltered ? 'Không tìm thấy người dùng phù hợp với bộ lọc' : 'Chưa có người dùng nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

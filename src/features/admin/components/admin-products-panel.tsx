'use client';

import { CATEGORY_LABEL, PRODUCT_STATUS_CFG } from '@/features/admin/constants/admin-dashboard-page';
import { fmt } from '@/features/admin/services/format';
import type { AdminProductsPanelProps } from '@/features/admin/types/admin-products-panel';
import { AdminPagination } from '@/features/admin/components/admin-pagination';
import {
  Pencil,
  RotateCcw,
  Search,
  Trash2
} from 'lucide-react';
import Image from 'next/image';

export function AdminProductsPanel({
  openProductEditor,
  searchQuery,
  setSearchQuery,
  products,
  handleDeleteProduct,
  filters = {},
  onFilterChange,
  onResetFilters,
  currentPage = 1,
  totalPages = 1,
  totalItems = products.length,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  isFetching = false,
}: AdminProductsPanelProps) {
  const isFiltered = Boolean(
    (filters.search || searchQuery) ||
    (filters.category && filters.category !== 'ALL') ||
    (filters.status && filters.status !== 'ALL') ||
    (filters.stockStatus && filters.stockStatus !== 'all')
  );

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-heading-h2 font-bold text-neutral-900">Danh mục sản phẩm</h1>
          <p className="text-body-sm text-neutral-500 mt-1">Cấu hình phôi ảnh cho tính năng Try-On và bán hàng</p>
        </div>
        <button
          onClick={() => openProductEditor(null)}
          className="px-4 py-2.5 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl text-label-sm font-bold border-0 cursor-pointer flex items-center gap-2 shrink-0 shadow-xs transition-colors"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        {/* Filter Bar */}
        <div className="p-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-neutral-50/50">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
            {/* Search */}
            <div className="relative min-w-[200px] max-w-xs flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search ?? searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  onFilterChange?.({ search: val });
                }}
                placeholder="Tìm tên sản phẩm..."
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm focus:outline-none focus:border-brand-navy"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category || 'ALL'}
              onChange={(e) => onFilterChange?.({ category: e.target.value === 'ALL' ? '' : e.target.value })}
              className="px-3 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm text-neutral-700 focus:outline-none focus:border-brand-navy cursor-pointer"
            >
              <option value="ALL">Tất cả danh mục</option>
              <option value="UPPER">Áo (UPPER)</option>
              <option value="LOWER">Quần & Váy (LOWER)</option>
              <option value="FULL_BODY">Suit đầy đủ (FULL_BODY)</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status || 'ALL'}
              onChange={(e) => onFilterChange?.({ status: e.target.value === 'ALL' ? '' : e.target.value })}
              className="px-3 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm text-neutral-700 focus:outline-none focus:border-brand-navy cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang bán (ACTIVE)</option>
              <option value="DRAFT">Bản nháp (DRAFT)</option>
              <option value="ARCHIVED">Đã lưu trữ (ARCHIVED)</option>
            </select>

            {/* Stock status filter */}
            <select
              value={filters.stock || filters.stockStatus || 'all'}
              onChange={(e) => {
                const val = (e.target.value === 'all' ? '' : e.target.value) as 'all' | 'out_of_stock' | 'low_stock' | '';
                onFilterChange?.({ stock: val, stockStatus: val });
              }}
              className="px-3 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm text-neutral-700 focus:outline-none focus:border-brand-navy cursor-pointer"
            >
              <option value="all">Tất cả tồn kho</option>
              <option value="out_of_stock">Hết hàng (0)</option>
              <option value="low_stock">Sắp hết (&lt; 10)</option>
            </select>
          </div>

          {/* Reset button */}
          {isFiltered && onResetFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onResetFilters();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-xl border border-neutral-200 hover:border-red-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại bộ lọc</span>
            </button>
          )}
        </div>

        {/* Product Table */}
        <div className="overflow-auto flex-1 min-h-0">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-neutral-50 z-10 shadow-2xs">
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-label-sm font-semibold uppercase">
                <th className="px-6 py-3 bg-neutral-50">Sản phẩm</th>
                <th className="px-4 py-3 bg-neutral-50">Danh mục</th>
                <th className="px-4 py-3 text-right bg-neutral-50">Giá bán</th>
                <th className="px-4 py-3 text-right bg-neutral-50">Tồn kho</th>
                <th className="px-4 py-3 bg-neutral-50">Trạng thái</th>
                <th className="px-6 py-3 bg-neutral-50">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-body-sm">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                          <Image
                            src={p.image}
                            alt={p.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/731163514_999523332788054_1114320478812927640_n.png';
                            }}
                          />
                        </div>
                        {p.images && p.images.length > 1 && (
                          <span
                            title={`${p.images.length} hình ảnh`}
                            className="absolute -bottom-1 -right-1.5 bg-brand-navy text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[20px] text-center rounded-full border-2 border-white shadow-xs z-10 leading-none select-none"
                          >
                            +{p.images.length}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-neutral-900 line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-neutral-500">{CATEGORY_LABEL[p.category] || p.category}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-brand-navy">{fmt(p.price)}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-neutral-700">
                    {p.stock ?? 0}
                    {p.stock === 0 && <span className="ml-1 text-red-500 font-semibold">(Hết hàng)</span>}
                    {p.stock !== undefined && p.stock > 0 && p.stock < 10 && <span className="ml-1 text-amber-600 font-semibold">(Sắp hết)</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-label-sm font-semibold ${PRODUCT_STATUS_CFG[p.status]?.cls || ''}`}>
                      {PRODUCT_STATUS_CFG[p.status]?.label || p.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openProductEditor(p)}
                        className="w-8 h-8 rounded-lg hover:bg-neutral-100 border-0 bg-transparent flex items-center justify-center text-neutral-500 hover:text-brand-navy cursor-pointer transition-colors"
                        title="Chỉnh sửa sản phẩm"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 border-0 bg-transparent flex items-center justify-center text-neutral-500 hover:text-red-600 cursor-pointer transition-colors"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                    {isFiltered ? 'Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại' : 'Chưa có sản phẩm nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {onPageChange && (
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            itemLabel="sản phẩm"
            isFetching={isFetching}
          />
        )}
      </div>
    </div>
  );
}

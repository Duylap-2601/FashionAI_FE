'use client';

import { CATEGORY_LABEL, PRODUCT_STATUS_CFG } from '@/features/admin/constants/admin-dashboard-page';
import { fmt } from '@/features/admin/services/format';
import type { AdminProductsPanelProps } from '@/features/admin/types/admin-products-panel';
import { AdminPagination } from '@/features/admin/components/admin-pagination';
import { AdminLoadingBar, AdminTableLoading } from '@/features/admin/components/admin-loading';
import {
  ChevronDown,
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
    (filters.status && filters.status !== 'ALL')
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.08] tracking-[-0.025em] text-landing-obsidian">Danh mục sản phẩm</h1>
          <p className="text-body-sm text-landing-muted mt-1">Cấu hình phôi ảnh cho tính năng Try-On và bán hàng</p>
        </div>
        <button
          onClick={() => openProductEditor(null)}
          className="px-4 py-2.5 bg-landing-oxblood hover:bg-landing-oxblood/90 text-landing-paper rounded-[2px] text-label-sm font-bold border-0 cursor-pointer flex items-center gap-2 shrink-0 transition-colors"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-landing-ivory rounded-[2px] border border-landing-line overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-landing-line flex flex-wrap items-center justify-between gap-3 shrink-0 bg-landing-paper/50">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
            {/* Search */}
            <div className="relative min-w-[200px] max-w-xs flex-1">
              <Search className="w-4 h-4 text-landing-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search ?? searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  onFilterChange?.({ search: val });
                }}
                placeholder="Tìm tên sản phẩm..."
                className="w-full pl-9 pr-4 py-2 border border-landing-line rounded-[2px] bg-landing-ivory text-body-sm focus:outline-none focus:border-landing-oxblood"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={filters.category || 'ALL'}
                onChange={(e) => onFilterChange?.({ category: e.target.value === 'ALL' ? '' : e.target.value })}
                className="appearance-none pl-3.5 pr-8 py-2 border border-landing-line/90 rounded-[2px] bg-landing-ivory text-xs font-medium text-landing-obsidian hover:border-landing-taupe focus:outline-none focus:border-landing-oxblood focus:ring-1 focus:ring-landing-oxblood/10 transition-colors cursor-pointer"
              >
                <option value="ALL">Tất cả danh mục</option>
                <option value="UPPER">Áo (UPPER)</option>
                <option value="LOWER">Quần & Váy (LOWER)</option>
                <option value="FULL_BODY">Suit đầy đủ (FULL_BODY)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-landing-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filters.status || 'ALL'}
                onChange={(e) => onFilterChange?.({ status: e.target.value === 'ALL' ? '' : e.target.value })}
                className="appearance-none pl-3.5 pr-8 py-2 border border-landing-line/90 rounded-[2px] bg-landing-ivory text-xs font-medium text-landing-obsidian hover:border-landing-taupe focus:outline-none focus:border-landing-oxblood focus:ring-1 focus:ring-landing-oxblood/10 transition-colors cursor-pointer"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang bán (ACTIVE)</option>
                <option value="DRAFT">Bản nháp (DRAFT)</option>
                <option value="ARCHIVED">Đã lưu trữ (ARCHIVED)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-landing-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Reset button */}
          {isFiltered && onResetFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onResetFilters();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-landing-obsidian hover:text-destructive hover:bg-destructive/10 rounded-[2px] border border-landing-line hover:border-destructive/30 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại bộ lọc</span>
            </button>
          )}
        </div>

        {/* Product Table: Header is fixed, scrollbar is strictly contained within the data body */}
        <div className="overflow-x-auto">
          <div className="min-w-[880px]">
            {/* Fixed Header */}
            <div className="bg-landing-paper/60 border-b border-landing-line text-landing-muted text-label-sm font-semibold uppercase shrink-0 select-none">
              <div className="grid grid-cols-[minmax(240px,1fr)_140px_140px_130px_110px] items-center">
                <div className="px-6 py-3">Sản phẩm</div>
                <div className="px-4 py-3">Danh mục</div>
                <div className="px-4 py-3 text-right">Giá bán</div>
                <div className="px-4 py-3">Trạng thái</div>
                <div className="px-6 py-3">Thao tác</div>
              </div>
            </div>

            {/* Scrollable Data Body - Scrollbar starts below header and stays strictly in data area */}
            <div className="divide-y divide-landing-line text-body-sm">
              {isFetching && products.length > 0 && (
                <AdminLoadingBar label="Đang cập nhật sản phẩm..." />
              )}
              {isFetching && products.length === 0 && (
                <AdminTableLoading label="Đang tải sản phẩm" />
              )}
              {products.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[minmax(240px,1fr)_140px_140px_130px_110px] items-center hover:bg-landing-paper/80 transition-colors"
                >
                  {/* Sản phẩm */}
                  <div className="px-6 py-3.5 flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-[2px] overflow-hidden bg-landing-paper border border-landing-line">
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
                          className="absolute -bottom-1 -right-1.5 bg-landing-oxblood text-landing-paper text-[10px] font-bold px-1.5 py-0.5 min-w-[20px] text-center rounded-full border-2 border-landing-paper z-1 leading-none select-none"
                        >
                          +{p.images.length}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-landing-obsidian line-clamp-1 truncate">{p.name}</span>
                  </div>

                  {/* Danh mục */}
                  <div className="px-4 py-3.5 text-landing-muted">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="truncate">{CATEGORY_LABEL[p.category] || p.category}</span>
                      {p.layerRole && (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-landing-paper text-landing-obsidian border border-landing-line">
                          {p.layerRole}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Giá bán */}
                  <div className="px-4 py-3.5 text-right font-mono font-bold text-metric-revenue tracking-tight">
                    {fmt(p.price)}
                  </div>

                  {/* Trạng thái - Minimalist Atelier (Micro-dot + Refined Typography) */}
                  <div className="px-4 py-3.5">
                    {p.status === 'ACTIVE' ? (
                      <div className="inline-flex items-center gap-2 py-0.5" title="Sản phẩm đang được mở bán">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-metric-products opacity-40" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-metric-products" />
                        </span>
                        <span className="text-xs font-medium text-landing-obsidian tracking-tight">
                          {PRODUCT_STATUS_CFG[p.status]?.label || p.status}
                        </span>
                      </div>
                    ) : p.status === 'DRAFT' ? (
                      <div className="inline-flex items-center gap-2 py-0.5" title="Sản phẩm ở trạng thái nháp">
                        <span className="inline-flex rounded-full h-2 w-2 bg-landing-taupe shrink-0" />
                        <span className="text-xs font-medium text-landing-muted tracking-tight">
                          {PRODUCT_STATUS_CFG[p.status]?.label || p.status}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 py-0.5" title="Sản phẩm đã ngừng kinh doanh">
                        <span className="inline-flex rounded-full h-2 w-2 bg-landing-taupe shrink-0" />
                        <span className="text-xs font-medium text-landing-muted tracking-tight">
                          {PRODUCT_STATUS_CFG[p.status]?.label || p.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Thao tác */}
                  <div className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openProductEditor(p)}
                        className="w-8 h-8 rounded-[2px] hover:bg-landing-paper border-0 bg-transparent flex items-center justify-center text-landing-muted hover:text-landing-oxblood cursor-pointer transition-colors"
                        title="Chỉnh sửa sản phẩm"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="w-8 h-8 rounded-[2px] hover:bg-destructive/10 border-0 bg-transparent flex items-center justify-center text-landing-muted hover:text-destructive cursor-pointer transition-colors"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {products.length === 0 && !isFetching && (
                <div className="py-16 text-center text-landing-muted">
                  {isFiltered ? 'Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại' : 'Chưa có sản phẩm nào'}
                </div>
              )}
            </div>
          </div>
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

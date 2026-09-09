'use client';

import { CATEGORY_LABEL, PRODUCT_STATUS_CFG } from '@/features/admin/constants/admin-dashboard-page';
import { fmt } from '@/features/admin/services/format';
import type { AdminProductsPanelProps } from '@/features/admin/types/admin-products-panel';
import {
  Pencil,
  Search,
  Trash2
} from 'lucide-react';

export function AdminProductsPanel({ openProductEditor, searchQuery, setSearchQuery, products, handleDeleteProduct }: AdminProductsPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-heading-h2 font-bold text-neutral-900">Danh mục sản phẩm</h1>
          <p className="text-body-sm text-neutral-500 mt-1">Cấu hình phôi ảnh cho tính năng Try-On</p>
        </div>
        <button
          onClick={() => openProductEditor(null)}
          className="px-4 py-2.5 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl text-label-sm font-bold border-0 cursor-pointer flex items-center gap-2"
        >
          + Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="pl-9 pr-4 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm w-64 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-label-sm font-semibold uppercase">
                <th className="px-6 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3 text-right">Giá bán</th>
                <th className="px-4 py-3 text-right">Tồn kho</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-6 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-body-sm">
              {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border border-neutral-100" />
                        {p.images && p.images.length > 1 && (
                          <span className="absolute -bottom-1 -right-1 bg-brand-navy text-white text-[9px] font-bold px-1 rounded-full border border-white shadow-2xs">
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
                    {p.stock === 0 && <span className="ml-1 text-red-500">(Hết hàng)</span>}
                    {p.stock !== undefined && p.stock > 0 && p.stock < 10 && <span className="ml-1 text-amber-500">(Sắp hết)</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-label-sm font-semibold ${PRODUCT_STATUS_CFG[p.status]?.cls || ''}`}>
                      {PRODUCT_STATUS_CFG[p.status]?.label || p.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 flex gap-2">
                    <button
                      onClick={() => openProductEditor(p)}
                      className="w-8 h-8 rounded-lg hover:bg-neutral-100 border-0 bg-transparent flex items-center justify-center text-neutral-500 hover:text-brand-navy cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 border-0 bg-transparent flex items-center justify-center text-neutral-500 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-neutral-400">Chưa có sản phẩm nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import type { GarmentCategory, ProductStatus } from '@/features/admin/types/admin-dashboard-page';
import type { AdminProductModalProps } from '@/features/admin/types/admin-product-modal';
import {
  Package,
  Trash2,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

export function AdminProductModal({ closeProductEditor, editingProduct, setEditingProduct, addColor, updateColor, removeColor, productImages, handleSelectImages, handleSetPrimaryImage, handleRemoveImage, handleSaveProduct }: AdminProductModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={closeProductEditor}
      />
      <motion.div
        className="bg-white rounded-2xl shadow-xl max-w-[500px] w-full max-h-[90vh] overflow-y-auto p-6 relative z-10 animate-in zoom-in-95 duration-200"
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
      >
        <h2 className="text-body-lg font-bold text-neutral-900 mb-4">
          {editingProduct.id ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Tên sản phẩm *</label>
            <input
              type="text"
              value={editingProduct.name || ''}
              onChange={e => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Blazer Nam Cổ Điển..."
              className="w-full h-10 px-3 rounded-lg border border-neutral-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Giá bán *</label>
              <input
                type="number"
                value={editingProduct.price || ''}
                onChange={e => setEditingProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                placeholder="850000"
                className="w-full h-10 px-3 rounded-lg border border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Tồn kho *</label>
              <input
                type="number"
                min="0"
                value={editingProduct.stock ?? 0}
                onChange={e => setEditingProduct(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                placeholder="100"
                className="w-full h-10 px-3 rounded-lg border border-neutral-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Danh mục *</label>
              <select
                value={editingProduct.category || 'UPPER'}
                onChange={e => setEditingProduct(prev => ({ ...prev, category: e.target.value as GarmentCategory }))}
                className="w-full h-10 px-3 rounded-lg border border-neutral-300"
              >
                <option value="UPPER">Áo (UPPER)</option>
                <option value="LOWER">Quần / Váy (LOWER)</option>
                <option value="FULL_BODY">Toàn thân (FULL_BODY)</option>
              </select>
            </div>
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Trạng thái</label>
              <select
                value={editingProduct.status || 'ACTIVE'}
                onChange={e => setEditingProduct(prev => ({ ...prev, status: e.target.value as ProductStatus }))}
                className="w-full h-10 px-3 rounded-lg border border-neutral-300"
              >
                <option value="ACTIVE">Đang bán</option>
                <option value="DRAFT">Bản nháp</option>
                <option value="ARCHIVED">Ngừng bán</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-body-sm font-medium text-neutral-700">Màu sắc</label>
              <button
                type="button"
                onClick={addColor}
                className="text-label-sm font-semibold text-brand-navy hover:underline bg-transparent border-0 cursor-pointer"
              >
                + Thêm màu
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {(editingProduct.colors || []).map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={c.hex || '#000000'}
                    onChange={e => updateColor(i, { hex: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-neutral-300 p-0.5 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={c.name}
                    onChange={e => updateColor(i, { name: e.target.value })}
                    placeholder="Tên màu (vd: Burgundy)"
                    className="flex-1 h-10 px-3 rounded-lg border border-neutral-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeColor(i)}
                    className="w-9 h-9 rounded-lg hover:bg-red-50 border-0 bg-transparent flex items-center justify-center text-neutral-400 hover:text-red-600 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(editingProduct.colors || []).length === 0 && (
                <p className="text-label-sm text-neutral-400">Chưa có màu nào. Nhấn &quot;Thêm màu&quot; để bổ sung.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Hình thức sản xuất</label>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[13px] text-neutral-700 font-medium flex items-center gap-2">
              <span className="text-semantic-success font-bold">✓ May đo theo số đo (Made-to-Measure)</span>
              <span className="text-neutral-400 text-[12px]">(Khách hàng cung cấp số đo tại Profile)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-body-sm font-medium text-neutral-700">
                Ảnh sản phẩm {editingProduct.id ? '' : '*'} ({productImages.length} ảnh)
              </label>
              <label className="text-label-sm font-semibold text-brand-navy hover:underline cursor-pointer flex items-center gap-1">
                <span>+ Thêm ảnh</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleSelectImages(e.target.files);
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-4 gap-2.5 mb-2">
              {productImages.map((img, idx) => {
                const isPrimary = Boolean(img.isMain) || (productImages.every(p => !p.isMain) && idx === 0);
                const isOnlyImage = productImages.length === 1;

                return (
                  <div
                    key={img.id}
                    className={`relative group rounded-xl border bg-neutral-50 overflow-hidden aspect-square flex items-center justify-center shadow-2xs transition-all ${isPrimary ? 'border-brand-navy ring-2 ring-brand-navy/30' : 'border-neutral-200'
                      }`}
                  >
                    <img
                      src={img.url}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Primary Badge or Set Primary Button */}
                    {isPrimary ? (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-brand-navy/95 text-white text-[9px] font-bold rounded shadow-xs">
                        Ảnh chính
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className="absolute top-1 left-1 px-1.5 py-0.5 bg-white/90 hover:bg-white text-neutral-800 text-[9px] font-semibold rounded shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-0"
                        title="Đặt làm ảnh chính"
                      >
                        Đặt chính
                      </button>
                    )}

                    {/* Remove Image Button */}
                    <button
                      type="button"
                      disabled={isOnlyImage}
                      onClick={() => handleRemoveImage(img)}
                      className={`absolute top-1 right-1 w-6 h-6 rounded flex items-center justify-center transition-opacity border-0 cursor-pointer ${isOnlyImage
                          ? 'bg-neutral-400/80 text-white cursor-not-allowed opacity-0 group-hover:opacity-60'
                          : 'bg-red-600/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100'
                        }`}
                      title={isOnlyImage ? 'Sản phẩm phải có ít nhất 1 ảnh' : 'Xóa ảnh này'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {/* Add More Dropzone / Card */}
              <label className="border-2 border-dashed border-neutral-300 hover:border-brand-navy/60 hover:bg-neutral-100/50 rounded-xl aspect-square flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-neutral-400 hover:text-brand-navy">
                <Package className="w-5 h-5" />
                <span className="text-[11px] font-semibold">+ Thêm</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleSelectImages(e.target.files);
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-label-sm text-neutral-400">
              JPG, PNG hoặc WEBP · Tải lên nhiều ảnh cùng lúc · Ảnh đầu tiên là ảnh đại diện (nhấn &quot;Đặt chính&quot; để đổi).
            </p>
          </div>

          <div>
            <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Chất liệu vải (Material)</label>
            <input
              type="text"
              value={editingProduct.material || ''}
              onChange={e => setEditingProduct(prev => ({ ...prev, material: e.target.value }))}
              placeholder="VD: 100% Cotton Oxford, Premium Wool pha cashmere..."
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#5D1C34]/20 focus:border-[#5D1C34]"
            />
          </div>

          <div>
            <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Mô tả</label>
            <textarea
              value={editingProduct.description || ''}
              onChange={e => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả ngắn về sản phẩm..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <button
              onClick={closeProductEditor}
              className="px-4 py-2 border border-neutral-200 text-neutral-600 rounded-xl font-medium hover:bg-neutral-50 transition-colors cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveProduct}
              className="px-5 py-2 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl font-bold border-0 cursor-pointer shadow-sm"
            >
              Lưu
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

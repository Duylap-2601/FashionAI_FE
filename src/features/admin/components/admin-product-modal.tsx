'use client';

import type { GarmentCategory, GarmentType, LayerRole, ProductStatus } from '@/features/admin/types/admin-dashboard-page';
import type { AdminProductModalProps } from '@/features/admin/types/admin-product-modal';
import {
  Package,
  Trash2,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

const GARMENT_TYPES_BY_CATEGORY: Record<GarmentCategory, { value: GarmentType; label: string }[]> = {
  UPPER: [
    { value: 'SHIRT', label: 'Áo sơ mi (SHIRT)' },
    { value: 'VEST', label: 'Áo vest (VEST)' },
    { value: 'JACKET', label: 'Áo khoác / Blazer (JACKET)' },
  ],
  LOWER: [
    { value: 'PANTS', label: 'Quần dài / Quần tây (PANTS)' },
    { value: 'SKIRT', label: 'Chân váy (SKIRT)' },
  ],
  FULL_BODY: [
    { value: 'DRESS', label: 'Đầm (DRESS)' },
    { value: 'JUMPSUIT', label: 'Jumpsuit (JUMPSUIT)' },
  ],
};

const LAYER_ROLES: { value: LayerRole; label: string }[] = [
  { value: 'OUTER', label: 'OUTER — Áo khoác ngoài / Blazer' },
  { value: 'INNER', label: 'INNER — Áo trong / Sơ mi / Áo thun' },
  { value: 'BASE', label: 'BASE — Áo lót / Áo giữ nhiệt (Base layer)' },
  { value: 'BOTTOM', label: 'BOTTOM — Quần / Chân váy' },
];

export function AdminProductModal({ closeProductEditor, editingProduct, setEditingProduct, addColor, updateColor, removeColor, productImages, handleSelectImages, handleSetPrimaryImage, handleSetImageColor, handleRemoveImage, handleSaveProduct }: AdminProductModalProps) {
  const currentCategory = (editingProduct.category || 'UPPER') as GarmentCategory;
  const availableGarmentTypes = GARMENT_TYPES_BY_CATEGORY[currentCategory] || [];

  const handleCategoryChange = (newCategory: GarmentCategory) => {
    const validTypes = GARMENT_TYPES_BY_CATEGORY[newCategory] || [];
    const isCurrentValid = validTypes.some(t => t.value === editingProduct.garmentType);
    let newLayerRole = editingProduct.layerRole;
    if (newCategory === 'LOWER' && editingProduct.layerRole !== 'BOTTOM') {
      newLayerRole = 'BOTTOM';
    } else if (newCategory === 'UPPER' && editingProduct.layerRole === 'BOTTOM') {
      newLayerRole = null;
    }
    setEditingProduct(prev => {
      if (!prev) return null;
      return {
        ...prev,
        category: newCategory,
        garmentType: isCurrentValid ? prev.garmentType : undefined,
        layerRole: newLayerRole,
      };
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-landing-obsidian/50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={closeProductEditor}
      />
      <motion.div
        className="bg-landing-ivory rounded-[2px] max-w-[500px] w-full max-h-[90vh] overflow-y-auto p-6 relative z-10 animate-in zoom-in-95 duration-200"
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
      >
        <h2 className="font-display text-[1.15rem] leading-tight text-landing-obsidian mb-4">
          {editingProduct.id ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-body-sm font-medium text-landing-obsidian mb-1.5">Tên sản phẩm *</label>
            <input
              type="text"
              value={editingProduct.name || ''}
              onChange={e => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Blazer Nam Cổ Điển..."
              className="w-full h-10 px-3 rounded-[2px] border border-landing-taupe"
            />
          </div>

          <div>
            <label className="block text-body-sm font-medium text-landing-obsidian mb-1.5">Giá bán *</label>
            <input
              type="number"
              value={editingProduct.price || ''}
              onChange={e => setEditingProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              placeholder="850000"
              className="w-full h-10 px-3 rounded-[2px] border border-landing-taupe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-landing-obsidian mb-1.5">Danh mục *</label>
              <select
                value={editingProduct.category || 'UPPER'}
                onChange={e => handleCategoryChange(e.target.value as GarmentCategory)}
                className="w-full h-10 px-3 rounded-[2px] border border-landing-taupe"
              >
                <option value="UPPER">Áo (UPPER)</option>
                <option value="LOWER">Quần / Váy (LOWER)</option>
                <option value="FULL_BODY">Toàn thân (FULL_BODY)</option>
              </select>
            </div>
            <div>
              <label className="block text-body-sm font-medium text-landing-obsidian mb-1.5">Trạng thái</label>
              <select
                value={editingProduct.status || 'ACTIVE'}
                onChange={e => setEditingProduct(prev => ({ ...prev, status: e.target.value as ProductStatus }))}
                className="w-full h-10 px-3 rounded-[2px] border border-landing-taupe"
              >
                <option value="ACTIVE">Đang bán</option>
                <option value="DRAFT">Bản nháp</option>
                <option value="ARCHIVED">Ngừng bán</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-body-sm font-medium text-landing-obsidian mb-1.5">
              Loại trang phục (chi tiết)
              <span className="text-landing-muted text-[12px] ml-1">(theo danh mục {currentCategory === 'UPPER' ? 'Áo' : currentCategory === 'LOWER' ? 'Quần / Váy' : 'Toàn thân'})</span>
            </label>
            <select
              value={editingProduct.garmentType || ''}
              onChange={e => setEditingProduct(prev => ({ ...prev, garmentType: (e.target.value || undefined) as GarmentType | undefined }))}
              className="w-full h-10 px-3 rounded-[2px] border border-landing-taupe"
            >
              <option value="">-- Chọn loại cụ thể --</option>
              {availableGarmentTypes.map(item => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="text-label-sm text-landing-muted mt-1.5">
              {currentCategory === 'LOWER' && '• Quần (PANTS) → cần số đo đùi, ống quần | Chân váy (SKIRT) → không cần số đo đùi, ống'}
              {currentCategory === 'UPPER' && '• Áo sơ mi / Vest / Blazer → yêu cầu số đo vai, ngực, dài tay khi đặt may'}
              {currentCategory === 'FULL_BODY' && '• Đầm / Jumpsuit → yêu cầu số đo toàn thân (ngực, eo, mông, dài đầm)'}
            </p>
          </div>

          <div>
            <label className="block text-body-sm font-medium text-landing-obsidian mb-1.5">
              Lớp trang phục (Layer Role)
              <span className="text-landing-muted text-[12px] ml-1">(Dùng cho phòng thử AI & phối đồ đa lớp)</span>
            </label>
            <select
              value={editingProduct.layerRole || ''}
              onChange={e => setEditingProduct(prev => ({ ...prev, layerRole: (e.target.value as LayerRole) || null }))}
              className="w-full h-10 px-3 rounded-[2px] border border-landing-taupe"
            >
              <option value="">-- Mặc định (Tự động suy luận từ loại trang phục) --</option>
              {LAYER_ROLES.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <p className="text-label-sm text-landing-muted mt-1.5">
              • Cho phép chọn đồng thời áo khoác + áo trong + quần/váy (tối đa 3 món). Nếu để trống, backend sẽ tự động suy luận.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-body-sm font-medium text-landing-obsidian">Màu sắc</label>
              <button
                type="button"
                onClick={addColor}
                className="text-label-sm font-semibold text-landing-oxblood hover:underline bg-transparent border-0 cursor-pointer"
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
                    className="w-10 h-10 rounded-[2px] border border-landing-taupe p-0.5 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={c.name}
                    onChange={e => updateColor(i, { name: e.target.value })}
                    placeholder="Tên màu (vd: Burgundy)"
                    className="flex-1 h-10 px-3 rounded-[2px] border border-landing-taupe"
                  />
                  <button
                    type="button"
                    onClick={() => removeColor(i)}
                    className="w-9 h-9 rounded-[2px] hover:bg-destructive/10 border-0 bg-transparent flex items-center justify-center text-landing-muted hover:text-destructive cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(editingProduct.colors || []).length === 0 && (
                <p className="text-label-sm text-landing-muted">Chưa có màu nào. Nhấn &quot;Thêm màu&quot; để bổ sung.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-body-sm font-medium text-landing-obsidian mb-1.5">Hình thức sản xuất</label>
            <div className="p-3 bg-landing-paper/60 rounded-[2px] border border-landing-line text-[13px] text-landing-obsidian font-medium flex items-center gap-2">
              <span className="text-semantic-success font-bold">✓ May đo theo số đo (Made-to-Measure)</span>
              <span className="text-landing-muted text-[12px]">(Khách hàng cung cấp số đo tại Profile)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-body-sm font-medium text-landing-obsidian">
                Ảnh sản phẩm {editingProduct.id ? '' : '*'} ({productImages.length} ảnh)
              </label>
              <label className="text-label-sm font-semibold text-landing-oxblood hover:underline cursor-pointer flex items-center gap-1">
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
                  <div key={img.id} className="flex flex-col gap-1">
                    <div
                      className={`relative group rounded-[2px] border bg-landing-paper/60 overflow-hidden aspect-square flex items-center justify-center transition-all ${isPrimary ? 'border-landing-oxblood ring-2 ring-landing-oxblood/30' : 'border-landing-line'
                        }`}
                    >
                      <Image
                        src={img.url}
                        alt={`Ảnh ${idx + 1}`}
                        fill
                        unoptimized
                        sizes="(min-width: 768px) 25vw, 50vw"
                        className="object-cover"
                      />

                      {/* Primary Badge or Set Primary Button */}
                      {isPrimary ? (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-landing-oxblood/95 text-landing-paper text-[9px] font-bold rounded z-10">
                          Ảnh chính
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="absolute top-1 left-1 px-1.5 py-0.5 bg-landing-paper/90 hover:bg-landing-ivory text-landing-obsidian text-[9px] font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-0 z-10"
                          title="Đặt làm ảnh chính"
                        >
                          Đặt chính
                        </button>
                      )}

                      {/* Color Tag if assigned */}
                      {img.colorName && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-landing-obsidian/75 backdrop-blur-xs text-landing-paper text-[9px] font-medium rounded max-w-[85%] truncate z-10">
                          {img.colorName}
                        </span>
                      )}

                      {/* Remove Image Button */}
                      <button
                        type="button"
                        disabled={isOnlyImage}
                        onClick={() => handleRemoveImage(img)}
                        className={`absolute top-1 right-1 w-6 h-6 rounded flex items-center justify-center transition-opacity border-0 cursor-pointer z-10 ${isOnlyImage
                          ? 'bg-landing-taupe/80 text-landing-paper cursor-not-allowed opacity-0 group-hover:opacity-60'
                          : 'bg-destructive/90 hover:bg-destructive text-landing-paper opacity-0 group-hover:opacity-100'
                          }`}
                        title={isOnlyImage ? 'Sản phẩm phải có ít nhất 1 ảnh' : 'Xóa ảnh này'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Color selector dropdown */}
                    <select
                      value={img.colorName || ''}
                      onChange={e => handleSetImageColor(idx, e.target.value || null)}
                      className="w-full text-[10px] h-6 px-1 rounded border border-landing-line bg-landing-ivory text-landing-obsidian focus:outline-none focus:ring-1 focus:ring-landing-oxblood truncate"
                      title="Gắn màu cho ảnh này"
                    >
                      <option value="">Ảnh chung</option>
                      {(editingProduct.colors || [])
                        .filter(c => c.name && c.name.trim())
                        .map(c => (
                          <option key={c.name} value={c.name.trim()}>
                            {c.name.trim()}
                          </option>
                        ))}
                      {img.colorName &&
                        !(editingProduct.colors || []).some(
                          c => c.name?.trim().toLowerCase() === img.colorName?.trim().toLowerCase()
                        ) && (
                          <option value={img.colorName.trim()}>{img.colorName.trim()}</option>
                        )}
                    </select>
                  </div>
                );
              })}

              {/* Add More Dropzone / Card */}
              <div className="flex flex-col gap-1">
                <label className="border-2 border-dashed border-landing-taupe hover:border-landing-oxblood/60 hover:bg-landing-paper/50 rounded-[2px] aspect-square flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-landing-muted hover:text-landing-oxblood">
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
                <div className="h-6" />
              </div>
            </div>

            <p className="text-label-sm text-landing-muted">
              JPG, PNG hoặc WEBP · Chọn màu tương ứng dưới mỗi ảnh để kích hoạt đổi ảnh theo màu.
            </p>
          </div>

          <div>
            <label className="block text-body-sm font-medium text-landing-obsidian mb-1.5">Chất liệu vải (Material)</label>
            <input
              type="text"
              value={editingProduct.material || ''}
              onChange={e => setEditingProduct(prev => ({ ...prev, material: e.target.value }))}
              placeholder="VD: 100% Cotton Oxford, Premium Wool pha cashmere..."
              className="w-full px-3 py-2 rounded-[2px] border border-landing-taupe focus:outline-none focus:ring-2 focus:ring-landing-oxblood/20 focus:border-landing-oxblood"
            />
          </div>

          <div>
            <label className="block text-body-sm font-medium text-landing-obsidian mb-1.5">Mô tả</label>
            <textarea
              value={editingProduct.description || ''}
              onChange={e => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả ngắn về sản phẩm..."
              rows={3}
              className="w-full px-3 py-2 rounded-[2px] border border-landing-taupe resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <button
              onClick={closeProductEditor}
              className="px-4 py-2 border border-landing-line text-landing-obsidian rounded-[2px] font-medium hover:bg-landing-paper/60 transition-colors cursor-pointer bg-landing-ivory"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveProduct}
              className="px-5 py-2 bg-landing-oxblood hover:bg-landing-oxblood/90 text-landing-paper rounded-[2px] font-bold border-0 cursor-pointer"
            >
              Lưu
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

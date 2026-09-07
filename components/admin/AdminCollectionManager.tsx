'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers, Plus, Search, Eye, EyeOff, Pencil, Trash2,
  ExternalLink, Sparkles, Check, X, Image as ImageIcon, Upload, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getAllCollections,
  saveCollection,
  togglePublishCollection,
  deleteCollection,
} from '@/lib/collections';
import { Collection, CreateCollectionDto } from '@/types/collection';
import { useProducts } from '@/hooks/useProducts';
import {
  useAdminAllCollections,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
} from '@/hooks/useCollections';

export function AdminCollectionManager() {
  const { collections: apiCollections, isLoading, refetch } = useAdminAllCollections();
  const createMutation = useCreateCollection();
  const updateMutation = useUpdateCollection();
  const deleteMutation = useDeleteCollection();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCollection, setEditingCollection] = useState<Partial<Collection> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get real products from API so admin can select real product images for collections
  const { products: availableProducts } = useProducts();

  // Keep state in sync with React Query / localStorage
  useEffect(() => {
    if (apiCollections && apiCollections.length > 0) {
      setCollections(apiCollections);
    } else {
      setCollections(getAllCollections());
    }
  }, [apiCollections]);

  // Clean up object URLs when previews change
  useEffect(() => {
    return () => {
      filePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [filePreviews]);

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { isPublished: !currentStatus } as any,
      });
      toast.success(
        !currentStatus
          ? 'Đã xuất bản bộ sưu tập lên Landing Page!'
          : 'Đã chuyển bộ sưu tập về trạng thái Bản nháp.'
      );
      refetch();
    } catch (err: any) {
      console.warn('Backend update failed, falling back to local storage:', err);
      const updated = togglePublishCollection(id);
      if (updated) {
        toast.info(
          updated.isPublished
            ? 'Đã xuất bản (lưu cục bộ)!'
            : 'Đã ẩn về bản nháp (lưu cục bộ).'
        );
        setCollections(getAllCollections());
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bộ sưu tập "${name}" không?`)) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`Đã xóa bộ sưu tập "${name}"`);
      refetch();
    } catch (err) {
      console.warn('Backend delete failed, falling back to local storage:', err);
      deleteCollection(id);
      toast.success(`Đã xóa bộ sưu tập "${name}" (cục bộ)`);
      setCollections(getAllCollections());
    }
  };

  const handleOpenNew = () => {
    setSelectedFiles([]);
    setFilePreviews([]);
    setEditingCollection({
      name: '',
      slug: '',
      season: 'SPRING / SUMMER 2026',
      tagline: '',
      description: '',
      displayOrder: (collections.length + 1) * 10,
      coverImages: [
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
      ],
      thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=85',
      isPublished: true,
      productIds: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: Collection) => {
    setSelectedFiles([]);
    setFilePreviews([]);
    setEditingCollection({ ...col });
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    if (files.length === 0) return;

    // revoke old preview urls
    filePreviews.forEach((url) => URL.revokeObjectURL(url));

    setSelectedFiles(files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews(newPreviews);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection?.name?.trim()) {
      toast.error('Vui lòng nhập tên bộ sưu tập');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCollection.id) {
        // Update existing
        await updateMutation.mutateAsync({
          id: editingCollection.id,
          data: {
            name: editingCollection.name,
            slug: editingCollection.slug || undefined,
            description: editingCollection.description || undefined,
            isPublished: editingCollection.isPublished ?? true,
            displayOrder: Number(editingCollection.displayOrder) || 0,
            coverImages: selectedFiles.length > 0 ? selectedFiles : undefined,
          },
        });
        toast.success('Cập nhật bộ sưu tập trên máy chủ thành công!');
      } else {
        // Create new
        await createMutation.mutateAsync({
          name: editingCollection.name,
          slug: editingCollection.slug || undefined,
          description: editingCollection.description || undefined,
          isPublished: editingCollection.isPublished ?? true,
          displayOrder: Number(editingCollection.displayOrder) || 0,
          coverImages: selectedFiles,
        });
        toast.success('Tạo mới bộ sưu tập trên máy chủ thành công!');
      }

      // Also persist to local mock store for instant offline feedback
      saveCollection(editingCollection);

      setIsModalOpen(false);
      setEditingCollection(null);
      setSelectedFiles([]);
      setFilePreviews([]);
      refetch();
    } catch (err: any) {
      console.warn('Backend create/update failed, saving locally:', err);
      saveCollection(editingCollection);
      toast.info(
        editingCollection.id
          ? 'Đã cập nhật (lưu cục bộ do máy chủ chưa sẵn sàng)'
          : 'Đã tạo mới (lưu cục bộ do máy chủ chưa sẵn sàng)'
      );
      setIsModalOpen(false);
      setEditingCollection(null);
      setCollections(getAllCollections());
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCollections = collections.filter((col) =>
    col.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    col.season?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    col.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#5D1C34]" />
            Quản lý Bộ Sưu Tập (Collections)
          </h2>
          <p className="text-body-sm text-neutral-500 mt-0.5">
            Tạo, xuất bản hoặc ẩn các bộ sưu tập trên Landing Page khách hàng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenNew}
            className="h-10 px-5 rounded-xl bg-[#5D1C34] hover:bg-[#732240] text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm bộ sưu tập</span>
          </button>
        </div>
      </div>

      {/* Search Filter & Status Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bộ sưu tập theo tên, mùa, slug..."
            className="w-full h-10 pl-10 pr-4 text-body-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-[#5D1C34]"
          />
        </div>
        <div className="text-body-sm text-neutral-500 font-medium">
          Tổng: <span className="font-bold text-neutral-900">{collections.length}</span> bộ sưu tập
          {' '}(<span className="text-emerald-600 font-semibold">{collections.filter((c) => c.isPublished).length}</span> đang hiển thị)
        </div>
      </div>

      {/* Table list */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="py-3.5 px-4">Ảnh bìa</th>
                <th className="py-3.5 px-4">Tên bộ sưu tập</th>
                <th className="py-3.5 px-4">Thứ tự</th>
                <th className="py-3.5 px-4">Mùa / Season</th>
                <th className="py-3.5 px-4">Số thiết kế</th>
                <th className="py-3.5 px-4">Trạng thái Landing Page</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-body-sm">
              {isLoading && collections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-neutral-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#5D1C34]" />
                    Đang tải dữ liệu bộ sưu tập từ máy chủ...
                  </td>
                </tr>
              ) : filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-neutral-400">
                    Chưa có bộ sưu tập nào hoặc không tìm thấy kết quả phù hợp.
                  </td>
                </tr>
              ) : (
                filteredCollections.map((col) => (
                  <tr key={col.id} className="hover:bg-neutral-50/70 transition-colors">
                    {/* Cover Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-14 h-18 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shadow-2xs shrink-0">
                        <img
                          src={col.thumbnail || col.coverImages?.[0] || '/images/placeholder.png'}
                          alt={col.name}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </td>

                    {/* Name & Tagline */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-neutral-900">{col.name}</div>
                      {col.tagline && (
                        <div className="text-xs text-neutral-500 truncate max-w-xs mt-0.5">
                          {col.tagline}
                        </div>
                      )}
                      <div className="text-[10px] text-neutral-400 mt-1 font-mono">
                        slug: /{col.slug}
                      </div>
                    </td>

                    {/* Display Order */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-xs font-mono font-semibold rounded">
                        #{col.displayOrder ?? 0}
                      </span>
                    </td>

                    {/* Season */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-md">
                        {col.season || '2026'}
                      </span>
                    </td>

                    {/* Count */}
                    <td className="py-3 px-4 font-semibold text-neutral-700">
                      {col.itemCount || col._count?.products || col.productIds?.length || 0} sản phẩm
                    </td>

                    {/* Publish Status Toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePublish(col.id, col.isPublished)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          col.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-neutral-100 text-neutral-500 border border-neutral-200 hover:bg-neutral-200'
                        }`}
                        title={col.isPublished ? 'Bấm để ẩn khỏi Landing Page' : 'Bấm để xuất bản lên Landing Page'}
                      >
                        {col.isPublished ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>ĐÃ XUẤT BẢN (LIVE)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>BẢN NHÁP (ẨN)</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(col)}
                          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <a
                          href="/"
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Xem trên trang chủ"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(col.id, col.name)}
                          className="p-1.5 text-semantic-error hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa bộ sưu tập"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create / Edit Collection */}
      {isModalOpen && editingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#5D1C34]" />
                {editingCollection.id ? 'Chỉnh sửa Bộ Sưu Tập' : 'Tạo Bộ Sưu Tập Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  Tên bộ sưu tập <span className="text-semantic-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingCollection.name || ''}
                  onChange={(e) => setEditingCollection({ ...editingCollection, name: e.target.value })}
                  placeholder="Ví dụ: Elegance Office 2026, Urban Power Suit..."
                  className="w-full h-10 px-3 text-body-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#5D1C34] focus:bg-white"
                />
              </div>

              {/* Season, Slug, DisplayOrder */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                    Mùa / Season
                  </label>
                  <input
                    type="text"
                    value={editingCollection.season || ''}
                    onChange={(e) => setEditingCollection({ ...editingCollection, season: e.target.value })}
                    placeholder="SPRING / SUMMER 2026"
                    className="w-full h-10 px-3 text-body-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#5D1C34] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                    Slug đường dẫn
                  </label>
                  <input
                    type="text"
                    value={editingCollection.slug || ''}
                    onChange={(e) => setEditingCollection({ ...editingCollection, slug: e.target.value })}
                    placeholder="tự tạo nếu để trống"
                    className="w-full h-10 px-3 text-body-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#5D1C34] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    value={editingCollection.displayOrder ?? 0}
                    onChange={(e) =>
                      setEditingCollection({
                        ...editingCollection,
                        displayOrder: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="1, 2, 3..."
                    className="w-full h-10 px-3 text-body-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#5D1C34] focus:bg-white"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  Khẩu hiệu / Tagline
                </label>
                <input
                  type="text"
                  value={editingCollection.tagline || ''}
                  onChange={(e) => setEditingCollection({ ...editingCollection, tagline: e.target.value })}
                  placeholder="Chuẩn dáng từ đầu, đẹp từng đường may"
                  className="w-full h-10 px-3 text-body-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#5D1C34] focus:bg-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  Mô tả chi tiết
                </label>
                <textarea
                  rows={3}
                  value={editingCollection.description || ''}
                  onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                  placeholder="Mô tả phong cách, chất liệu, ý tưởng của bộ sưu tập..."
                  className="w-full p-3 text-body-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#5D1C34] focus:bg-white"
                />
              </div>

              {/* File Upload for Cover Images */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#5D1C34]" />
                    Tải lên file ảnh bìa (Tối đa 3 ảnh - Banner 3 khung)
                  </span>
                  <span className="text-[10px] text-neutral-400 font-normal">PNG, JPG, WEBP</span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#5D1C34] file:text-white hover:file:bg-[#732240] cursor-pointer"
                />
                {filePreviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-2.5">
                    {filePreviews.map((preview, idx) => (
                      <div key={idx} className="w-14 h-18 rounded-lg overflow-hidden border border-neutral-300 bg-white relative">
                        <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0.5 right-0.5 text-[9px] bg-black/60 text-white px-1 rounded">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Or URL inputs for Cover Images */}
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1.5 flex items-center justify-between">
                  <span>Hoặc Nhập URL ảnh bìa (Hero Banner)</span>
                  <span className="text-[11px] text-neutral-400 font-normal lowercase">Preview trực tiếp</span>
                </label>
                <div className="flex flex-col gap-2">
                  {[0, 1, 2].map((idx) => {
                    const currentImg = editingCollection.coverImages?.[idx] || '';
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-400 w-14">Ảnh {idx + 1}:</span>
                        <input
                          type="text"
                          value={currentImg}
                          onChange={(e) => {
                            const newCovers = [...(editingCollection.coverImages || [])];
                            newCovers[idx] = e.target.value;
                            setEditingCollection({ ...editingCollection, coverImages: newCovers });
                          }}
                          placeholder={`URL ảnh ${idx === 1 ? '(Ảnh trung tâm)' : ''}`}
                          className="flex-1 h-9 px-3 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-[#5D1C34]"
                        />
                        {currentImg && (
                          <div className="w-9 h-9 rounded overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                            <img src={currentImg} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Pick From Real Products' Images */}
              {availableProducts && availableProducts.length > 0 && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="text-[11px] font-bold uppercase text-neutral-600 mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#5D1C34]" />
                    <span>Chọn nhanh ảnh từ sản phẩm có sẵn trên website:</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {availableProducts.slice(0, 8).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          const newCovers = [...(editingCollection.coverImages || [])];
                          newCovers[0] = p.image;
                          setEditingCollection({
                            ...editingCollection,
                            coverImages: newCovers,
                            thumbnail: p.image,
                          });
                          toast.success(`Đã lấy ảnh từ "${p.name}"`);
                        }}
                        className="shrink-0 w-12 h-16 rounded-lg overflow-hidden border border-neutral-300 hover:border-[#5D1C34] hover:scale-105 transition-all relative group"
                        title={`Chọn ảnh từ ${p.name}`}
                      >
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Publish Toggle Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={editingCollection.isPublished ?? true}
                  onChange={(e) => setEditingCollection({ ...editingCollection, isPublished: e.target.checked })}
                  className="w-4 h-4 text-[#5D1C34] rounded border-neutral-300 focus:ring-[#5D1C34]"
                />
                <label htmlFor="isPublished" className="text-body-sm font-semibold text-neutral-900 cursor-pointer">
                  Xuất bản ngay lên Landing Page (Người dùng thấy được ngay)
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 mt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-semibold text-xs hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#5D1C34] hover:bg-[#732240] text-white font-semibold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Đang lưu...' : 'Lưu bộ sưu tập'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

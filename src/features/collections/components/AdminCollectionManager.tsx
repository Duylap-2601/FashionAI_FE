'use client';
import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { getErrorMessage } from '@/lib/errors';


import type { CollectionProductsModalProps } from '@/features/collections/types/admin-collection-manager';
import {
  useAddProductToCollection,
  useAdminAllCollections,
  useCollectionProducts,
  useCreateCollection,
  useDeleteCollection,
  useRemoveProductFromCollection,
  useUpdateCollection,
} from '@/features/collections/hooks/useCollections';
import {
  getAllCollections
} from '@/features/collections/services/local-collections';
import { Collection } from '@/features/collections/types/collection';
import { useProductCatalog } from '@/features/products/hooks/useProducts';
import {
  ChevronDown,
  ExternalLink,
  Eye, EyeOff,
  Image as ImageIcon,
  Layers,
  Loader2, Package,
  Pencil,
  Plus, RotateCcw, Search,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminPagination } from '@/features/admin/components/admin-pagination';

export function AdminCollectionManager() {
  const { collections: apiCollections, isLoading, isError, refetch } = useAdminAllCollections();
  const createMutation = useCreateCollection();
  const updateMutation = useUpdateCollection();
  const deleteMutation = useDeleteCollection();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingCollection, setEditingCollection] = useState<Partial<Collection> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managingProductsCollection, setManagingProductsCollection] = useState<Collection | null>(null);

  // Get real products from API so admin can select real product images and manage products
  const { products: availableProducts } = useProductCatalog();

  // Keep state in sync with React Query / fallback
  useEffect(() => {
    if (apiCollections !== undefined) {
      setCollections(apiCollections);
    } else if (isError) {
      setCollections(getAllCollections());
    }
  }, [apiCollections, isError]);

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
        data: { isPublished: !currentStatus },
      });
      toast.success(
        !currentStatus
          ? 'Đã xuất bản bộ sưu tập lên Landing Page!'
          : 'Đã chuyển bộ sưu tập về trạng thái Bản nháp.'
      );
      refetch();
    } catch (err: unknown) {
      console.warn('Backend update failed:', err);
      const msg = getErrorMessage(err, 'Cập nhật trạng thái thất bại');
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bộ sưu tập "${name}" không?`)) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`Đã xóa bộ sưu tập "${name}"`);
      refetch();
    } catch (err: unknown) {
      console.warn('Backend delete failed:', err);
      const msg = getErrorMessage(err, 'Xóa bộ sưu tập thất bại');
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
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
      const coverImages = selectedFiles.length > 0
        ? selectedFiles
        : (editingCollection.coverImages?.filter(Boolean) || []);

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
            coverImages,
          },
        });
        toast.success('Cập nhật bộ sưu tập thành công!');
      } else {
        // Create new
        await createMutation.mutateAsync({
          name: editingCollection.name,
          slug: editingCollection.slug || undefined,
          description: editingCollection.description || undefined,
          isPublished: editingCollection.isPublished ?? true,
          displayOrder: Number(editingCollection.displayOrder) || 0,
          coverImages,
        });
        toast.success('Tạo mới bộ sưu tập thành công!');
      }

      setIsModalOpen(false);
      setEditingCollection(null);
      setSelectedFiles([]);
      setFilePreviews([]);
      refetch();
    } catch (err: unknown) {
      console.error('Backend create/update failed:', err);
      const msg = getErrorMessage(err, 'Có lỗi xảy ra khi lưu bộ sưu tập');
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCollections = collections.filter((col) => {
    if (statusFilter === 'published' && !col.isPublished) return false;
    if (statusFilter === 'draft' && col.isPublished) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = col.name?.toLowerCase().includes(q);
      const matchSeason = col.season?.toLowerCase().includes(q);
      const matchSlug = col.slug?.toLowerCase().includes(q);
      if (!matchName && !matchSeason && !matchSlug) return false;
    }
    return true;
  });

  const isFiltered = Boolean(searchQuery.trim() || statusFilter !== 'all');
  const totalItems = filteredCollections.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedCollections = filteredCollections.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-landing-ivory p-5 rounded-[2px] border border-landing-line shrink-0">
        <div>
          <h2 className="font-display text-[1.25rem] leading-tight text-landing-obsidian flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-landing-oxblood" />
            Quản lý Bộ Sưu Tập (Collections)
          </h2>
          <p className="text-body-sm text-landing-muted mt-0.5">
            Tạo, xuất bản, chỉnh sửa và gắn sản phẩm vào các bộ sưu tập trên Landing Page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenNew}
            className="h-10 px-5 rounded-[2px] bg-landing-oxblood hover:bg-landing-obsidian text-landing-paper font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm bộ sưu tập</span>
          </button>
        </div>
      </div>

      {/* Search Filter & Status Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-landing-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm bộ sưu tập theo tên, mùa, slug..."
              className="w-full h-10 pl-10 pr-4 text-body-sm bg-landing-ivory border border-landing-line rounded-[2px] focus:outline-none focus:border-landing-oxblood"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'published' | 'draft');
                setCurrentPage(1);
              }}
              className="appearance-none h-10 pl-3.5 pr-8 border border-landing-line/90 rounded-[2px] bg-landing-ivory text-xs font-medium text-landing-obsidian hover:border-landing-taupe focus:outline-none focus:border-landing-oxblood focus:ring-1 focus:ring-landing-oxblood/10 transition-colors cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đang hiển thị (Live)</option>
              <option value="draft">Bản nháp (Ẩn)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-landing-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 h-10 text-xs font-semibold text-landing-obsidian hover:text-destructive hover:bg-destructive/10 rounded-[2px] border border-landing-line hover:border-destructive/30 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>

        <div className="text-body-sm text-landing-muted font-medium shrink-0">
          Tổng: <span className="font-bold text-landing-obsidian">{collections.length}</span> bộ sưu tập
          {' '}(<span className="text-metric-products font-semibold">{collections.filter((c) => c.isPublished).length}</span> đang hiển thị)
        </div>
      </div>

      {/* Table list: Fixed Header + Scrollable Data Body */}
      <div className="bg-landing-ivory rounded-[2px] border border-landing-line overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1050px]">
            {/* Fixed Header */}
            <div className="bg-landing-paper/60 border-b border-landing-line text-[11px] font-bold uppercase tracking-wider text-landing-muted shrink-0 select-none">
              <div className="grid grid-cols-[100px_minmax(220px,1fr)_90px_130px_170px_200px_140px] items-center">
                <div className="py-3.5 px-4">Ảnh bìa</div>
                <div className="py-3.5 px-4">Tên bộ sưu tập</div>
                <div className="py-3.5 px-4">Thứ tự</div>
                <div className="py-3.5 px-4">Mùa / Season</div>
                <div className="py-3.5 px-4">Sản phẩm thuộc BST</div>
                <div className="py-3.5 px-4">Trạng thái Landing Page</div>
                <div className="py-3.5 px-4 text-right">Thao tác</div>
              </div>
            </div>

            {/* Scrollable Data Body */}
            <div className="divide-y divide-landing-line text-body-sm">
              {isLoading ? (
                <div className="py-16 text-center text-landing-muted">
                  <AtelierLoader size="sm" label="Đang may bộ sưu tập" />
                </div>
              ) : paginatedCollections.length === 0 ? (
                <div className="py-16 text-center text-landing-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Layers className="w-8 h-8 text-landing-muted" />
                    <p className="text-body-sm font-medium">
                      {isFiltered ? 'Không tìm thấy bộ sưu tập nào phù hợp với bộ lọc' : 'Chưa có bộ sưu tập nào'}
                    </p>
                    <button
                      onClick={handleOpenNew}
                      className="mt-2 text-xs text-landing-oxblood hover:underline font-semibold cursor-pointer"
                    >
                      + Tạo bộ sưu tập đầu tiên
                    </button>
                  </div>
                </div>
              ) : (
                paginatedCollections.map((col) => (
                  <div
                    key={col.id}
                    className="grid grid-cols-[100px_minmax(220px,1fr)_90px_130px_170px_200px_140px] items-center hover:bg-landing-paper/60 transition-colors"
                  >
                    {/* Cover Thumbnail */}
                    <div className="py-3 px-4">
                      <div className="w-16 h-16 rounded-[2px] overflow-hidden bg-landing-paper border border-landing-line relative shrink-0">
                        {col.coverImages?.[0] ? (
                          <Image
                            src={col.coverImages[0]}
                            alt={col.name}
                            fill
                            unoptimized
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : col.thumbnail ? (
                          <Image
                            src={col.thumbnail}
                            alt={col.name}
                            fill
                            unoptimized
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-landing-muted">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        {col.coverImages && col.coverImages.length > 1 && (
                          <div className="absolute bottom-1 right-1 bg-landing-obsidian/70 text-landing-paper text-[9px] font-bold px-1 rounded-sm">
                            +{col.coverImages.length - 1}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name & Tagline */}
                    <div className="py-3 px-4 min-w-0">
                      <div className="font-semibold text-landing-obsidian text-sm line-clamp-1 truncate">
                        {col.name}
                      </div>
                      {col.tagline && (
                        <div className="text-xs text-landing-muted line-clamp-1 mt-0.5 truncate">
                          {col.tagline}
                        </div>
                      )}
                      <div className="text-[10px] text-landing-muted mt-1 font-mono truncate">
                        slug: /{col.slug}
                      </div>
                    </div>

                    {/* Display Order */}
                    <div className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-landing-paper text-landing-obsidian text-xs font-mono font-semibold rounded">
                        #{col.displayOrder ?? 0}
                      </span>
                    </div>

                    {/* Season */}
                    <div className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-landing-paper text-landing-obsidian text-xs font-semibold rounded-[2px]">
                        {col.season || '2026'}
                      </span>
                    </div>

                    {/* Products count & manage button */}
                    <div className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setManagingProductsCollection(col)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] hover:bg-landing-paper text-xs font-medium text-landing-obsidian hover:text-landing-oxblood transition-colors cursor-pointer group"
                        title="Bấm để xem và quản lý sản phẩm trong BST"
                      >
                        <Package className="w-3.5 h-3.5 text-landing-muted group-hover:text-landing-oxblood transition-colors" />
                        <span className="group-hover:underline">{col.itemCount ?? col._count?.products ?? 0} sản phẩm</span>
                      </button>
                    </div>

                    {/* Publish Status Toggle - Minimalist Atelier (Micro-dot + Refined Typography) */}
                    <div className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(col.id, col.isPublished)}
                        className="inline-flex items-center gap-2 py-1 px-2.5 -ml-2 rounded-[2px] hover:bg-landing-paper/80 transition-colors cursor-pointer group text-left"
                        title={col.isPublished ? 'Đang hiển thị trên Landing Page. Bấm để chuyển về Bản nháp' : 'Bản nháp ẩn. Bấm để xuất bản lên Landing Page'}
                      >
                        {col.isPublished ? (
                          <>
                            <span className="relative flex h-2 w-2 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-metric-products opacity-40" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-metric-products" />
                            </span>
                            <span className="text-xs font-medium text-landing-obsidian tracking-tight group-hover:text-landing-oxblood">
                              Đang hiển thị
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="inline-flex rounded-full h-2 w-2 bg-landing-taupe shrink-0" />
                            <span className="text-xs font-medium text-landing-muted tracking-tight group-hover:text-landing-obsidian">
                              Bản nháp
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setManagingProductsCollection(col)}
                          className="p-1.5 text-landing-obsidian hover:text-landing-obsidian hover:bg-landing-paper rounded-[2px] transition-colors cursor-pointer"
                          title="Gắn sản phẩm vào BST"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(col)}
                          className="p-1.5 text-landing-obsidian hover:text-landing-obsidian hover:bg-landing-paper rounded-[2px] transition-colors cursor-pointer"
                          title="Chỉnh sửa bộ sưu tập"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <a
                          href="/"
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-landing-obsidian hover:text-landing-obsidian hover:bg-landing-paper rounded-[2px] transition-colors"
                          title="Xem trên trang chủ"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(col.id, col.name)}
                          className="p-1.5 text-semantic-error hover:bg-destructive/10 rounded-[2px] transition-colors cursor-pointer"
                          title="Xóa bộ sưu tập"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="shrink-0 border-t border-landing-line">
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      {/* Modal Create / Edit Collection */}
      {isModalOpen && editingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-landing-obsidian/70 backdrop-blur-xs">
          <div className="bg-landing-ivory rounded-[2px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border border-landing-line animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-landing-line mb-5">
              <h3 className="flex items-center gap-2 font-display text-[1.15rem] leading-tight text-landing-obsidian">
                <Layers className="w-5 h-5 text-landing-oxblood" />
                {editingCollection.id ? 'Chỉnh sửa Bộ Sưu Tập' : 'Tạo Bộ Sưu Tập Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-landing-muted hover:text-landing-obsidian rounded-[2px] hover:bg-landing-paper"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase text-landing-obsidian mb-1">
                  Tên bộ sưu tập <span className="text-semantic-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingCollection.name || ''}
                  onChange={(e) => setEditingCollection({ ...editingCollection, name: e.target.value })}
                  placeholder="Ví dụ: Elegance Office 2026, Urban Power Suit..."
                  className="w-full h-10 px-3 text-body-sm bg-landing-paper/60 border border-landing-taupe rounded-[2px] focus:outline-none focus:border-landing-oxblood focus:bg-landing-ivory"
                />
              </div>

              {/* Season, Slug, DisplayOrder */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-landing-obsidian mb-1">
                    Mùa / Season
                  </label>
                  <input
                    type="text"
                    value={editingCollection.season || ''}
                    onChange={(e) => setEditingCollection({ ...editingCollection, season: e.target.value })}
                    placeholder="SPRING / SUMMER 2026"
                    className="w-full h-10 px-3 text-body-sm bg-landing-paper/60 border border-landing-taupe rounded-[2px] focus:outline-none focus:border-landing-oxblood focus:bg-landing-ivory"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-landing-obsidian mb-1">
                    Slug đường dẫn
                  </label>
                  <input
                    type="text"
                    value={editingCollection.slug || ''}
                    onChange={(e) => setEditingCollection({ ...editingCollection, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder="tự tạo nếu để trống"
                    className="w-full h-10 px-3 text-body-sm bg-landing-paper/60 border border-landing-taupe rounded-[2px] focus:outline-none focus:border-landing-oxblood focus:bg-landing-ivory"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-landing-obsidian mb-1">
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
                    className="w-full h-10 px-3 text-body-sm bg-landing-paper/60 border border-landing-taupe rounded-[2px] focus:outline-none focus:border-landing-oxblood focus:bg-landing-ivory"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-bold uppercase text-landing-obsidian mb-1">
                  Khẩu hiệu / Tagline
                </label>
                <input
                  type="text"
                  value={editingCollection.tagline || ''}
                  onChange={(e) => setEditingCollection({ ...editingCollection, tagline: e.target.value })}
                  placeholder="Chuẩn dáng từ đầu, đẹp từng đường may"
                  className="w-full h-10 px-3 text-body-sm bg-landing-paper/60 border border-landing-taupe rounded-[2px] focus:outline-none focus:border-landing-oxblood focus:bg-landing-ivory"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-landing-obsidian mb-1">
                  Mô tả chi tiết
                </label>
                <textarea
                  rows={3}
                  value={editingCollection.description || ''}
                  onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                  placeholder="Mô tả phong cách, chất liệu, ý tưởng của bộ sưu tập..."
                  className="w-full p-3 text-body-sm bg-landing-paper/60 border border-landing-taupe rounded-[2px] focus:outline-none focus:border-landing-oxblood focus:bg-landing-ivory"
                />
              </div>

              {/* File Upload for Cover Images */}
              <div className="p-3.5 bg-landing-paper/60 rounded-[2px] border border-landing-line">
                <label className="block text-xs font-bold uppercase text-landing-obsidian mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-landing-oxblood" />
                    Tải lên file ảnh bìa (Tối đa 3 ảnh - Banner 3 khung)
                  </span>
                  <span className="text-[10px] text-landing-muted font-normal">PNG, JPG, WEBP</span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-landing-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-[2px] file:border-0 file:text-xs file:font-semibold file:bg-landing-oxblood file:text-landing-paper hover:file:bg-[#732240] cursor-pointer"
                />
                {filePreviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-2.5">
                    {filePreviews.map((preview, idx) => (
                      <div key={idx} className="w-14 h-18 rounded-[2px] overflow-hidden border border-landing-taupe bg-landing-ivory relative">
                        <Image
                          src={preview}
                          alt="Upload preview"
                          fill
                          unoptimized
                          sizes="56px"
                          className="object-cover"
                        />
                        <span className="absolute bottom-0.5 right-0.5 text-[9px] bg-landing-obsidian/70 text-landing-paper px-1 rounded">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Or URL inputs for Cover Images */}
              <div>
                <label className="block text-xs font-bold uppercase text-landing-obsidian mb-1.5 flex items-center justify-between">
                  <span>Hoặc Nhập URL ảnh bìa (Hero Banner)</span>
                  <span className="text-[11px] text-landing-muted font-normal lowercase">Preview trực tiếp</span>
                </label>
                <div className="flex flex-col gap-2">
                  {[0, 1, 2].map((idx) => {
                    const currentImg = editingCollection.coverImages?.[idx] || '';
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-landing-muted w-14">Ảnh {idx + 1}:</span>
                        <input
                          type="text"
                          value={currentImg}
                          onChange={(e) => {
                            const newCovers = [...(editingCollection.coverImages || [])];
                            newCovers[idx] = e.target.value;
                            setEditingCollection({ ...editingCollection, coverImages: newCovers });
                          }}
                          placeholder={`URL ảnh ${idx === 1 ? '(Ảnh trung tâm)' : ''}`}
                          className="flex-1 h-9 px-3 text-xs bg-landing-paper/60 border border-landing-taupe rounded-[2px] focus:outline-none focus:border-landing-oxblood"
                        />
                        {currentImg && (
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded border border-landing-line bg-landing-paper">
                            <Image
                              src={currentImg}
                              alt=""
                              fill
                              unoptimized
                              sizes="36px"
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Pick From Real Products' Images */}
              {availableProducts && availableProducts.length > 0 && (
                <div className="p-3 bg-landing-paper/60 rounded-[2px] border border-landing-line">
                  <div className="text-[11px] font-bold uppercase text-landing-obsidian mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-landing-oxblood" />
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
                        className="shrink-0 w-12 h-16 rounded-[2px] overflow-hidden border border-landing-taupe hover:border-landing-oxblood hover:scale-105 transition-all relative group"
                        title={`Chọn ảnh từ ${p.name}`}
                      >
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          unoptimized
                          sizes="48px"
                          className="object-cover"
                        />
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
                  className="w-4 h-4 text-landing-oxblood rounded border-landing-taupe focus:ring-landing-oxblood"
                />
                <label htmlFor="isPublished" className="text-body-sm font-semibold text-landing-obsidian cursor-pointer">
                  Xuất bản ngay lên Landing Page (Người dùng thấy được ngay)
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-landing-line mt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-[2px] border border-landing-line text-landing-obsidian font-semibold text-xs hover:bg-landing-paper/60 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-[2px] bg-landing-oxblood hover:bg-landing-obsidian text-landing-paper font-semibold text-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Đang lưu...' : 'Lưu bộ sưu tập'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Manage Products inside Collection */}
      <CollectionProductsModal
        collection={managingProductsCollection}
        isOpen={!!managingProductsCollection}
        onClose={() => setManagingProductsCollection(null)}
        availableProducts={availableProducts}
        onCollectionUpdated={() => refetch()}
      />
    </div>
  );
}

function CollectionProductsModal({
  collection,
  isOpen,
  onClose,
  availableProducts,
  onCollectionUpdated,
}: CollectionProductsModalProps) {
  const { products: collectionProducts, isLoading, refetch } = useCollectionProducts(collection?.id);
  const addProductMutation = useAddProductToCollection();
  const removeProductMutation = useRemoveProductFromCollection();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !collection) return null;

  // Filter products that are not yet in the collection
  const existingIds = new Set(collectionProducts.map((p) => p.id));
  const candidateProducts = availableProducts.filter((p) => !existingIds.has(p.id));

  const handleAddProduct = async () => {
    if (!selectedProductId) {
      toast.error('Vui lòng chọn sản phẩm để thêm');
      return;
    }

    setIsProcessing(true);
    try {
      await addProductMutation.mutateAsync({
        collectionId: collection.id,
        productId: selectedProductId,
      });
      toast.success('Đã thêm sản phẩm vào bộ sưu tập!');
      setSelectedProductId('');
      refetch();
      onCollectionUpdated?.();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Không thể thêm sản phẩm vào BST');
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveProduct = async (productId: string, productName: string) => {
    if (!confirm(`Xóa sản phẩm "${productName}" khỏi bộ sưu tập này?`)) return;

    setIsProcessing(true);
    try {
      await removeProductMutation.mutateAsync({
        collectionId: collection.id,
        productId,
      });
      toast.success(`Đã xóa sản phẩm khỏi bộ sưu tập!`);
      refetch();
      onCollectionUpdated?.();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Không thể xóa sản phẩm khỏi BST');
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-landing-obsidian/70 backdrop-blur-xs">
      <div className="bg-landing-ivory rounded-[2px] w-full max-w-2xl max-h-[90vh] flex flex-col border border-landing-line animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-landing-line">
          <div>
            <h3 className="flex items-center gap-2 font-display text-[1.15rem] leading-tight text-landing-obsidian">
              <Package className="w-5 h-5 text-landing-oxblood" />
              Sản phẩm trong: <span className="text-landing-oxblood">{collection.name}</span>
            </h3>
            <p className="text-xs text-landing-muted mt-0.5">
              Quản lý danh sách sản phẩm hiển thị khi khách hàng chọn BST này trên Landing Page.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-landing-muted hover:text-landing-obsidian rounded-[2px] hover:bg-landing-paper"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-5">
          {/* Add product section */}
          <div className="p-4 bg-landing-paper/60 rounded-[2px] border border-landing-line flex flex-col gap-2.5">
            <label className="text-xs font-bold uppercase text-landing-obsidian">
              Thêm sản phẩm mới vào BST:
            </label>
            <div className="flex gap-2">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={isProcessing || candidateProducts.length === 0}
                className="flex-1 h-10 px-3 text-body-sm bg-landing-ivory border border-landing-taupe rounded-[2px] focus:outline-none focus:border-landing-oxblood disabled:opacity-60"
              >
                <option value="">
                  {candidateProducts.length === 0
                    ? 'Tất cả sản phẩm đã có trong BST'
                    : '-- Chọn sản phẩm để thêm --'}
                </option>
                {candidateProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.price})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={!selectedProductId || isProcessing}
                className="h-10 px-4 rounded-[2px] bg-landing-oxblood hover:bg-landing-obsidian text-landing-paper font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Thêm</span>
              </button>
            </div>
          </div>

          {/* Current products list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-landing-obsidian">
                Danh sách hiện có ({collectionProducts.length} sản phẩm):
              </span>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-landing-oxblood" />}
            </div>

            {collectionProducts.length === 0 ? (
              <div className="text-center py-8 text-landing-muted text-body-sm bg-landing-paper/50 rounded-[2px] border border-dashed border-landing-line">
                Bộ sưu tập này chưa có sản phẩm nào. Hãy chọn sản phẩm ở trên để thêm vào.
              </div>
            ) : (
              <div className="divide-y divide-landing-line border border-landing-line rounded-[2px] overflow-hidden bg-landing-ivory">
                {collectionProducts.map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between gap-3 hover:bg-landing-paper/70 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-[2px] border border-landing-line bg-landing-paper">
                        <Image
                          src={p.image || '/images/placeholder.png'}
                          alt={p.name}
                          fill
                          unoptimized
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-landing-obsidian text-body-sm truncate">{p.name}</div>
                        <div className="text-xs text-landing-muted flex items-center gap-2 mt-0.5">
                          <span className="font-medium text-landing-oxblood">
                            {p.price}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{p.category}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(p.id, p.name)}
                      disabled={isProcessing}
                      className="p-2 text-semantic-error hover:bg-destructive/10 rounded-[2px] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                      title="Xóa khỏi bộ sưu tập"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-landing-line flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-[2px] bg-landing-paper hover:bg-landing-taupe text-landing-obsidian font-semibold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

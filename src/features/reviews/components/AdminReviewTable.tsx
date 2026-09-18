'use client';

import { queryKeys as reviewsQueryKeys } from '@/features/reviews/services/query-keys';
import { fetchAdminReviewsResponse, fetchProductReviewsResponse } from '@/features/reviews/services/queries';
import { useProductCatalog } from '@/features/products/hooks/useProducts';
import { StarRating } from '@/features/reviews/components/StarRating';
import { useAdminDeleteReview } from '@/features/reviews/hooks/useReviews';
import { AdminPagination } from '@/features/admin/components/admin-pagination';
import type { Review } from '@/features/reviews/types/reviews';
import { useQuery } from '@tanstack/react-query';
import {
  CornerDownRight,
  Loader2,
  MessageSquare,
  RotateCcw,
  Search,
  ShieldAlert,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

function toReviewList(payload: unknown): Review[] {
  if (Array.isArray(payload)) return payload as Review[];
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as { data?: unknown }).data;
    return Array.isArray(data) ? data as Review[] : [];
  }
  return [];
}

export function AdminReviewTable() {
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);

  const { products, isLoading: isProductsLoading } = useProductCatalog();
  const adminDeleteMutation = useAdminDeleteReview();

  // Thử gọi GET /products/admin/reviews nếu BE có, hoặc tổng hợp từ các products
  const { data: allReviews = [], isLoading: isReviewsLoading, refetch } = useQuery<Review[]>({
    queryKey: reviewsQueryKeys.adminReviews(selectedProductId),
    queryFn: async () => {
      try {
        // Thử endpoint tập trung của admin trước nếu BE có
        const res = await fetchAdminReviewsResponse();
        return toReviewList(res);
      } catch {
        // Fallback: Lấy reviews theo từng sản phẩm
        if (selectedProductId && selectedProductId !== 'all') {
          const res = await fetchProductReviewsResponse(selectedProductId, {
            params: { limit: 50 },
          });
          const list = toReviewList(res);
          const prod = products.find((p) => p.id === selectedProductId);
          return list.map((r) => ({
            ...r,
            product: prod
              ? { id: prod.id, name: prod.name, image: prod.image }
              : r.product,
          }));
        } else {
          // Lấy reviews từ top 10 sản phẩm đầu tiên
          const topProducts = products.slice(0, 10);
          const results = await Promise.allSettled(
            topProducts.map(async (p) => {
              const res = await fetchProductReviewsResponse(p.id, { params: { limit: 10 } });
              const list = toReviewList(res);
              return list.map((r) => ({
                ...r,
                product: { id: p.id, name: p.name, image: p.image },
              }));
            })
          );

          const aggregated: Review[] = [];
          for (const item of results) {
            if (item.status === 'fulfilled') {
              aggregated.push(...item.value);
            }
          }
          return aggregated;
        }
      }
    },
    enabled: !isProductsLoading,
  });

  // Lọc theo từ khóa tìm kiếm và số sao
  const filteredReviews = allReviews.filter((r) => {
    if (selectedRating !== 'all' && r.rating !== selectedRating) return false;
    if (selectedProductId !== 'all' && r.productId !== selectedProductId) return false;
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const userName = (r.user?.name || '').toLowerCase();
      const productName = (r.product?.name || '').toLowerCase();
      const comment = (r.comment || '').toLowerCase();
      if (!userName.includes(q) && !productName.includes(q) && !comment.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const isFiltered = Boolean(
    searchKeyword.trim() ||
    selectedProductId !== 'all' ||
    selectedRating !== 'all'
  );

  const totalItems = filteredReviews.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const resetFilters = () => {
    setSearchKeyword('');
    setSelectedProductId('all');
    setSelectedRating('all');
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReview) return;
    try {
      await adminDeleteMutation.mutateAsync({
        id: deletingReview.id,
        productId: deletingReview.productId,
      });
      toast.success('Admin: Đã xóa đánh giá thành công');
      setDeletingReview(null);
      refetch();
    } catch {
      toast.error('Không thể xóa đánh giá. Vui lòng thử lại.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden flex flex-col flex-1 min-h-0">
      {/* Header & Controls */}
      <div className="p-6 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h3 className="text-[20px] font-bold text-brand-navy flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-navy" />
            Quản lý Đánh giá sản phẩm
          </h3>
          <p className="text-body-sm text-neutral-500 mt-1">
            Kiểm duyệt phản hồi của khách hàng, theo dõi mức độ hài lòng và xóa đánh giá vi phạm.
          </p>
        </div>

        {/* Thanh tìm kiếm & bộ lọc */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Ô tìm kiếm */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm khách hàng, nội dung..."
              className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-xl text-body-sm focus:outline-none focus:border-brand-navy"
            />
          </div>

          {/* Lọc theo sản phẩm */}
          <select
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-neutral-300 rounded-xl text-body-sm bg-white focus:outline-none focus:border-brand-navy cursor-pointer max-w-[200px] truncate"
          >
            <option value="all">Tất cả sản phẩm</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Lọc theo mức sao */}
          <select
            value={selectedRating}
            onChange={(e) => {
              setSelectedRating(e.target.value === 'all' ? 'all' : Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-neutral-300 rounded-xl text-body-sm bg-white focus:outline-none focus:border-brand-navy cursor-pointer"
          >
            <option value="all">Tất cả sao</option>
            <option value="5">5 sao ⭐⭐⭐⭐⭐</option>
            <option value="4">4 sao ⭐⭐⭐⭐</option>
            <option value="3">3 sao ⭐⭐⭐</option>
            <option value="2">2 sao ⭐⭐ (Cảnh báo)</option>
            <option value="1">1 sao ⭐ (Tiêu cực)</option>
          </select>

          {/* Reset button */}
          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-xl border border-neutral-200 hover:border-red-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Bảng danh sách Reviews */}
      <div className="overflow-auto flex-1 min-h-0">
        <table className="w-full text-left text-body-sm border-collapse">
          <thead className="sticky top-0 bg-neutral-50 z-10 shadow-2xs text-[12px] font-bold text-neutral-500 uppercase tracking-wider">
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="py-3.5 px-6 bg-neutral-50">Khách hàng</th>
              <th className="py-3.5 px-6 bg-neutral-50">Sản phẩm</th>
              <th className="py-3.5 px-6 bg-neutral-50">Điểm sao</th>
              <th className="py-3.5 px-6 bg-neutral-50">Nhận xét & Feedback</th>
              <th className="py-3.5 px-6 bg-neutral-50">Ngày đánh giá</th>
              <th className="py-3.5 px-6 text-right bg-neutral-50">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isReviewsLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-navy" />
                    <span>Đang tải danh sách đánh giá...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedReviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-400">
                  {isFiltered ? 'Không tìm thấy đánh giá nào phù hợp với bộ lọc' : 'Chưa có đánh giá nào'}
                </td>
              </tr>
            ) : (
              paginatedReviews.map((r) => {
                const userName = r.user?.name || 'Khách hàng';
                const initial = (userName.trim()[0] || 'K').toUpperCase();
                const formattedDate = r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                  : 'Gần đây';

                return (
                  <tr key={r.id} className="hover:bg-neutral-50/70 transition-colors">
                    {/* Cột Khách hàng */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {r.user?.avatarUrl ? (
                          <img
                            src={r.user.avatarUrl}
                            alt={userName}
                            className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center font-bold text-[13px] shrink-0">
                            {initial}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-neutral-900 text-[13px]">
                            {userName}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            ID: {r.userId.substring(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Cột Sản phẩm */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {r.product?.image && (
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                            <img
                              src={r.product.image}
                              alt={r.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-col max-w-[200px]">
                          <span className="font-medium text-neutral-900 text-[13px] truncate">
                            {r.product?.name || 'Sản phẩm #' + r.productId}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono truncate">
                            ID: {r.productId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Cột Điểm sao */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <StarRating value={r.rating} size="xs" readOnly showValue />
                    </td>

                    {/* Cột Nhận xét & Ảnh */}
                    <td className="py-4 px-6 max-w-[320px]">
                      <div className="flex flex-col gap-1.5">
                        {r.comment ? (
                          <p className="text-neutral-700 line-clamp-2 leading-relaxed">
                            {r.comment}
                          </p>
                        ) : (
                          <span className="text-neutral-400 italic text-[12px]">
                            Không có nhận xét bằng chữ
                          </span>
                        )}

                        {Array.isArray(r.images) && r.images.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-0.5">
                            {r.images.map((imgUrl, idx) => (
                              <a
                                key={idx}
                                href={imgUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="w-7 h-7 rounded-md overflow-hidden border border-neutral-200 bg-neutral-100 hover:opacity-80"
                              >
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              </a>
                            ))}
                            <span className="text-[11px] text-neutral-400 font-medium ml-1">
                              ({r.images.length} ảnh)
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Cột Ngày */}
                    <td className="py-4 px-6 whitespace-nowrap text-neutral-500 text-[13px]">
                      {formattedDate}
                    </td>

                    {/* Cột Thao tác */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${r.productId}#product-reviews`}
                          target="_blank"
                          className="p-2 text-neutral-500 hover:text-brand-navy hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer inline-flex items-center"
                          title="Xem chi tiết & Phản hồi đánh giá này"
                        >
                          <CornerDownRight className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeletingReview(r)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Xóa đánh giá này (Quyền Admin)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="shrink-0 border-t border-neutral-100">
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
            disabled={isReviewsLoading}
          />
        </div>
      )}

      {/* Modal xác nhận xóa của Admin */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-neutral-200">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="font-bold text-[18px]">Xác nhận xóa đánh giá</h4>
            </div>
            <p className="text-body-sm text-neutral-600 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa đánh giá của{' '}
              <strong className="text-neutral-800">{deletingReview.user?.name || 'khách hàng'}</strong>{' '}
              cho sản phẩm{' '}
              <strong className="text-neutral-800">
                {deletingReview.product?.name || deletingReview.productId}
              </strong>
              ? Hành động này sẽ gỡ bỏ đánh giá vĩnh viễn và cập nhật lại điểm trung bình của sản phẩm.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingReview(null)}
                className="px-4 py-2 rounded-xl text-body-sm font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={adminDeleteMutation.isPending}
                className="px-4 py-2 rounded-xl text-body-sm font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 cursor-pointer"
              >
                {adminDeleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

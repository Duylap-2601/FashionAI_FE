'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Trash2, ShieldAlert,
  Loader2, CheckCircle2, MessageSquare,
  ExternalLink, CornerDownRight
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useProducts } from '@/hooks/useProducts';
import { useAdminDeleteReview, Review } from '@/hooks/useReviews';
import { StarRating } from './StarRating';
import Link from 'next/link';

export function AdminReviewTable() {
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);

  const { products, isLoading: isProductsLoading } = useProducts();
  const adminDeleteMutation = useAdminDeleteReview();

  // Thử gọi GET /products/admin/reviews nếu BE có, hoặc tổng hợp từ các products
  const { data: allReviews = [], isLoading: isReviewsLoading, refetch } = useQuery<Review[]>({
    queryKey: ['admin-reviews', selectedProductId],
    queryFn: async () => {
      try {
        // Thử endpoint tập trung của admin trước nếu BE có
        const res = await api.get('/products/admin/reviews');
        return (res.data?.data || res.data || []) as Review[];
      } catch {
        // Fallback: Lấy reviews theo từng sản phẩm
        if (selectedProductId && selectedProductId !== 'all') {
          const res = await api.get(`/products/${selectedProductId}/reviews`, {
            params: { limit: 50 },
          });
          const list = (res.data?.data || res.data || []) as Review[];
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
              const res = await api.get(`/products/${p.id}/reviews`, { params: { limit: 10 } });
              const list = (res.data?.data || res.data || []) as Review[];
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
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-6 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm khách hàng, nội dung..."
              className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-xl text-body-sm focus:outline-none focus:border-brand-navy"
            />
          </div>

          {/* Lọc theo sản phẩm */}
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
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
            onChange={(e) =>
              setSelectedRating(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="px-3 py-2 border border-neutral-300 rounded-xl text-body-sm bg-white focus:outline-none focus:border-brand-navy cursor-pointer"
          >
            <option value="all">Tất cả sao</option>
            <option value="5">5 sao ⭐⭐⭐⭐⭐</option>
            <option value="4">4 sao ⭐⭐⭐⭐</option>
            <option value="3">3 sao ⭐⭐⭐</option>
            <option value="2">2 sao ⭐⭐ (Cảnh báo)</option>
            <option value="1">1 sao ⭐ (Tiêu cực)</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách Reviews */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-[12px] font-bold text-neutral-500 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-6">Khách hàng</th>
              <th className="py-3.5 px-6">Sản phẩm</th>
              <th className="py-3.5 px-6">Điểm sao</th>
              <th className="py-3.5 px-6">Nhận xét & Feedback</th>
              <th className="py-3.5 px-6">Ngày đánh giá</th>
              <th className="py-3.5 px-6 text-right">Thao tác</th>
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
            ) : filteredReviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-400">
                  Không tìm thấy đánh giá nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredReviews.map((r) => {
                const userName = r.user?.name || 'Khách hàng';
                const initial = (userName.trim()[0] || 'K').toUpperCase();
                const formattedDate = r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : '';

                return (
                  <tr key={r.id} className="hover:bg-neutral-50/70 transition-colors">
                    {/* Cột Khách hàng */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {r.user?.avatarUrl ? (
                          <img
                            src={r.user.avatarUrl}
                            alt={userName}
                            className="w-9 h-9 rounded-full object-cover border border-neutral-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center font-bold text-body-sm">
                            {initial}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-brand-navy">{userName}</div>
                          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Đã mua hàng
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cột Sản phẩm */}
                    <td className="py-4 px-6 max-w-[200px]">
                      <div className="flex items-center gap-2.5">
                        {r.product?.image && (
                          <img
                            src={r.product.image}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-neutral-200 shrink-0"
                          />
                        )}
                        <Link
                          href={`/products/${r.productId}`}
                          target="_blank"
                          className="font-medium text-neutral-800 hover:text-brand-navy hover:underline truncate flex items-center gap-1"
                          title={r.product?.name || r.productId}
                        >
                          <span className="truncate">{r.product?.name || r.productId}</span>
                          <ExternalLink className="w-3 h-3 opacity-50 shrink-0" />
                        </Link>
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

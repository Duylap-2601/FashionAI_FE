'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, BadgePercent, Check, Loader2, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { fmt } from '@/features/admin/services/format';
import { readAdminList, toAdminProduct } from '@/features/admin/services/admin-mappers';
import { fetchAdminProducts, fetchAdminSaleCampaignDetail } from '@/features/admin/services/queries';
import { createAdminSaleCampaign, updateAdminSaleCampaign } from '@/features/admin/services/mutations';
import type { AdminProduct } from '@/features/admin/types/admin-dashboard-page';
import type { AdminSaleCampaign, CreateSaleCampaignPayload } from '@/features/admin/types/admin-sale-campaigns';
import type { AdminProductDto } from '@/features/admin/types/api';
import { getErrorMessage } from '@/lib/errors';

interface AdminSaleCampaignModalProps {
  isOpen: boolean;
  campaign: AdminSaleCampaign | null;
  onClose: () => void;
  onSuccess: () => void;
}

function toLocalDatetimeString(isoString?: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function AdminSaleCampaignModal({ isOpen, campaign, onClose, onSuccess }: AdminSaleCampaignModalProps) {
  const isEditing = Boolean(campaign);
  const [name, setName] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [productIds, setProductIds] = useState<string[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg(null);
    setProductSearch('');
    setProducts([]);
    setProductIds([]);

    if (!campaign) {
      setName('');
      setDiscountPercent('');
      setIsActive(true);
      setStartsAt('');
      setEndsAt('');
      return;
    }

    setName(campaign.name);
    setDiscountPercent(String(campaign.discountPercent));
    setIsActive(campaign.isActive);
    setStartsAt(toLocalDatetimeString(campaign.startsAt));
    setEndsAt(toLocalDatetimeString(campaign.endsAt));
    setLoadingDetail(true);
    fetchAdminSaleCampaignDetail(campaign.id)
      .then((detail) => {
        setName(detail.name);
        setDiscountPercent(String(detail.discountPercent));
        setIsActive(detail.isActive);
        setStartsAt(toLocalDatetimeString(detail.startsAt));
        setEndsAt(toLocalDatetimeString(detail.endsAt));
        setProductIds(detail.productIds);
      })
      .catch((err) => {
        const msg = getErrorMessage(err, 'Không thể tải chi tiết chiến dịch sale.');
        setErrorMsg(msg);
        toast.error(msg);
      })
      .finally(() => setLoadingDetail(false));
  }, [campaign, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingProducts(true);

    fetchAdminProducts({ params: { page: 1, limit: 200 } })
      .then((res) => {
        if (cancelled) return;
        const { items } = readAdminList<AdminProductDto>(res);
        setProducts(items.map(toAdminProduct));
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(getErrorMessage(err, 'Không thể tải danh sách sản phẩm.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProducts(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => product.name.toLowerCase().includes(query));
  }, [products, productSearch]);

  if (!isOpen) return null;

  const toggleProduct = (productId: string) => {
    setProductIds((prev) => (
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    const percent = Number(discountPercent);

    if (!trimmedName) {
      setErrorMsg('Vui lòng nhập tên chiến dịch sale.');
      return;
    }
    if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) {
      setErrorMsg('Phần trăm giảm giá phải lớn hơn 0 và nhỏ hơn 100.');
      return;
    }
    if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
      setErrorMsg('Thời gian kết thúc phải sau thời gian bắt đầu.');
      return;
    }
    if (productIds.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất một sản phẩm.');
      return;
    }

    const payload: CreateSaleCampaignPayload = {
      name: trimmedName,
      discountPercent: percent,
      isActive,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      productIds,
    };

    setSubmitting(true);
    try {
      if (isEditing && campaign) {
        await updateAdminSaleCampaign(campaign.id, payload);
        toast.success(`Đã cập nhật chiến dịch ${trimmedName}`);
      } else {
        await createAdminSaleCampaign(payload);
        toast.success(`Đã tạo chiến dịch ${trimmedName}`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      const msg = getErrorMessage(err, 'Không thể lưu chiến dịch sale.');
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = loadingDetail || loadingProducts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="fixed inset-0 bg-landing-obsidian/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative bg-landing-ivory rounded-[2px] max-w-2xl w-full max-h-[90vh] flex flex-col z-10 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-landing-line shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[2px] bg-landing-oxblood/10 flex items-center justify-center text-landing-oxblood">
              <BadgePercent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-[1.15rem] leading-tight text-landing-obsidian">
                {isEditing ? `Chỉnh sửa chiến dịch: ${campaign?.name}` : 'Tạo chiến dịch sale mới'}
              </h2>
              <p className="text-label-sm text-landing-muted">
                Giảm giá theo phần trăm cho nhóm sản phẩm trong thời gian đã chọn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-landing-paper text-landing-muted hover:text-landing-obsidian transition-colors border-0 bg-transparent cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-[2px] flex items-start gap-2.5 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-body-sm font-semibold text-landing-obsidian">
                Tên chiến dịch <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Sale Thu 2026"
                className="w-full px-3.5 py-2.5 rounded-[2px] border border-landing-taupe text-landing-obsidian focus:outline-none focus:border-landing-oxblood focus:ring-1 focus:ring-landing-oxblood"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-body-sm font-semibold text-landing-obsidian block">Trạng thái</label>
              <button
                type="button"
                onClick={() => setIsActive((value) => !value)}
                className={`w-full py-2.5 px-3 rounded-[2px] font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border ${
                  isActive
                    ? 'bg-metric-products/10 text-metric-products border-metric-products'
                    : 'bg-landing-paper text-landing-obsidian border-landing-taupe'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-metric-products' : 'bg-landing-taupe'}`} />
                {isActive ? 'Kích hoạt' : 'Đã tắt'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-body-sm font-semibold text-landing-obsidian">
                Giảm giá (%) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                required
                min="0.01"
                max="99.99"
                step="0.01"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="VD: 30"
                className="w-full px-3.5 py-2.5 rounded-[2px] border border-landing-taupe text-landing-obsidian focus:outline-none focus:border-landing-oxblood focus:ring-1 focus:ring-landing-oxblood"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-body-sm font-semibold text-landing-obsidian">
                Bắt đầu <span className="text-landing-muted font-normal">(tùy chọn)</span>
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[2px] border border-landing-taupe text-landing-obsidian focus:outline-none focus:border-landing-oxblood focus:ring-1 focus:ring-landing-oxblood text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-body-sm font-semibold text-landing-obsidian">
                Kết thúc <span className="text-landing-muted font-normal">(tùy chọn)</span>
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[2px] border border-landing-taupe text-landing-obsidian focus:outline-none focus:border-landing-oxblood focus:ring-1 focus:ring-landing-oxblood text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-body-sm font-semibold text-landing-obsidian">
                Sản phẩm áp dụng <span className="text-destructive">*</span>
              </label>
              <span className="text-xs text-landing-muted">Đã chọn {productIds.length}</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-landing-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Tìm sản phẩm theo tên..."
                className="w-full pl-9 pr-4 py-2 border border-landing-line rounded-[2px] bg-landing-ivory text-body-sm focus:outline-none focus:border-landing-oxblood"
              />
            </div>

            <div className="border border-landing-line rounded-[2px] max-h-64 overflow-y-auto custom-scrollbar divide-y divide-landing-line">
              {isBusy && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-landing-muted">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tải sản phẩm...</span>
                </div>
              )}

              {!isBusy && filteredProducts.map((product) => {
                const selected = productIds.includes(product.id);
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggleProduct(product.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                      selected ? 'bg-landing-oxblood/5' : 'hover:bg-landing-paper/60'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      selected ? 'bg-landing-oxblood border-landing-oxblood text-landing-paper' : 'border-landing-taupe bg-landing-ivory'
                    }`}>
                      {selected && <Check className="w-3 h-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-landing-obsidian truncate">{product.name}</span>
                      <span className="block text-[11px] text-landing-muted">
                        {fmt(product.price)} · {product.status}
                      </span>
                    </span>
                  </button>
                );
              })}

              {!isBusy && filteredProducts.length === 0 && (
                <div className="py-8 text-center text-sm text-landing-muted">
                  Không tìm thấy sản phẩm phù hợp
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-landing-line flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-[2px] border border-landing-line text-landing-obsidian hover:bg-landing-paper/60 text-body-sm font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || isBusy}
              className="px-6 py-2.5 rounded-[2px] bg-landing-oxblood text-landing-paper text-body-sm font-bold hover:bg-landing-oxblood/90 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Lưu thay đổi' : 'Tạo chiến dịch'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

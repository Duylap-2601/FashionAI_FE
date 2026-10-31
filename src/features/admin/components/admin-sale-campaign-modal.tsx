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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col z-10 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center text-brand-navy">
              <BadgePercent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-body-lg font-bold text-neutral-900">
                {isEditing ? `Chỉnh sửa chiến dịch: ${campaign?.name}` : 'Tạo chiến dịch sale mới'}
              </h2>
              <p className="text-label-sm text-neutral-500">
                Giảm giá theo phần trăm cho nhóm sản phẩm trong thời gian đã chọn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors border-0 bg-transparent cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-body-sm font-semibold text-neutral-700">
                Tên chiến dịch <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Sale Thu 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-body-sm font-semibold text-neutral-700 block">Trạng thái</label>
              <button
                type="button"
                onClick={() => setIsActive((value) => !value)}
                className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                {isActive ? 'Kích hoạt' : 'Đã tắt'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-body-sm font-semibold text-neutral-700">
                Giảm giá (%) <span className="text-red-500">*</span>
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-body-sm font-semibold text-neutral-700">
                Bắt đầu <span className="text-neutral-400 font-normal">(tùy chọn)</span>
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-body-sm font-semibold text-neutral-700">
                Kết thúc <span className="text-neutral-400 font-normal">(tùy chọn)</span>
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-body-sm font-semibold text-neutral-700">
                Sản phẩm áp dụng <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-neutral-500">Đã chọn {productIds.length}</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Tìm sản phẩm theo tên..."
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm focus:outline-none focus:border-brand-navy"
              />
            </div>

            <div className="border border-neutral-200 rounded-xl max-h-64 overflow-y-auto custom-scrollbar divide-y divide-neutral-100">
              {isBusy && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-neutral-500">
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
                      selected ? 'bg-brand-navy/5' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      selected ? 'bg-brand-navy border-brand-navy text-white' : 'border-neutral-300 bg-white'
                    }`}>
                      {selected && <Check className="w-3 h-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-neutral-900 truncate">{product.name}</span>
                      <span className="block text-[11px] text-neutral-500">
                        {fmt(product.price)} · {product.status}
                      </span>
                    </span>
                  </button>
                );
              })}

              {!isBusy && filteredProducts.length === 0 && (
                <div className="py-8 text-center text-sm text-neutral-400">
                  Không tìm thấy sản phẩm phù hợp
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-body-sm font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || isBusy}
              className="px-6 py-2.5 rounded-xl bg-brand-navy text-white text-body-sm font-bold hover:bg-brand-navy/90 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
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

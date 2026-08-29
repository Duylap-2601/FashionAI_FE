'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Layers, Sparkles, Trash2, X, Check, ArrowRight,
  ShoppingBag, Plus, Info, AlertTriangle, ChevronRight,
  Shirt, RefreshCw
} from 'lucide-react';
import { PageHeader, PageContent } from '@/components/navigation/Layout';
import { useRackItems, useUnpinFromRack, useClearRack, RackItem, BackendRackProduct } from '@/hooks/useRack';
import { toBackendCategory } from '@/hooks/useProducts';
import { StaggerContainer, StaggerItem } from '@/components/ui/AnimateIn';
import { toast } from 'sonner';

function getProductImage(product: BackendRackProduct): string {
  if (Array.isArray(product?.images) && product.images.length > 0) {
    const main = product.images.find(img => typeof img === 'object' && img?.isMain);
    if (main && typeof main === 'object') {
      const url = main.imageUrl || main.url;
      if (url) return url;
    }
    const first = product.images[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object') {
      const url = first.imageUrl || first.url;
      if (url) return url;
    }
  }
  if (product?.garmentUrl) return product.garmentUrl;
  return '/images/731163514_999523332788054_1114320478812927640_n.png';
}

function formatPrice(price: string | number): string {
  const num = Number(price);
  if (Number.isFinite(num)) {
    return `${num.toLocaleString('vi-VN')} ₫`;
  }
  return String(price || '0');
}

function getCategoryBadge(catStr?: string) {
  const backendCat = toBackendCategory(catStr);
  switch (backendCat) {
    case 'UPPER':
      return { label: 'Áo / Blazer', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'LOWER':
      return { label: 'Quần / Váy', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'FULL_BODY':
      return { label: 'Bộ liền / Suit', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
  }
}

export default function RackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, isLoading, isError, refetch } = useRackItems();
  const { unpinProduct, isUnpinning } = useUnpinFromRack();
  const { clearRack, isClearing } = useClearRack();

  // Selected rack items for Try-on combination
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.includes(item.productId));
  }, [items, selectedIds]);

  const handleToggleSelect = (item: RackItem) => {
    const isSelected = selectedIds.includes(item.productId);

    if (isSelected) {
      setSelectedIds(prev => prev.filter(id => id !== item.productId));
      return;
    }

    const newCat = toBackendCategory(item.product.category);

    if (selectedItems.length >= 2) {
      toast.error('Chỉ được chọn tối đa 2 món trang phục (1 trên + 1 dưới)');
      return;
    }

    if (newCat === 'FULL_BODY') {
      if (selectedItems.length > 0) {
        toast.warning('Bộ liền / Suit đầy đủ không thể kết hợp thêm với món khác');
        return;
      }
      setSelectedIds([item.productId]);
      toast.success(`Đã chọn "${item.product.name}"`);
      return;
    }

    const hasFullBody = selectedItems.some(i => toBackendCategory(i.product.category) === 'FULL_BODY');
    if (hasFullBody) {
      toast.warning('Không thể kết hợp thêm món đồ khi đã chọn Bộ liền');
      return;
    }

    const hasSameCategory = selectedItems.some(i => toBackendCategory(i.product.category) === newCat);
    if (hasSameCategory) {
      const catLabel = newCat === 'UPPER' ? 'áo/blazer' : 'quần/váy';
      toast.warning(`Bạn đã chọn 1 ${catLabel} rồi. Vui lòng chọn món khác loại để phối đồ.`);
      return;
    }

    setSelectedIds(prev => [...prev, item.productId]);
    toast.success(`Đã chọn "${item.product.name}"`);
  };

  const handleUnpin = (e: React.MouseEvent, item: RackItem) => {
    e.stopPropagation();
    unpinProduct(item.id, {
      onSuccess: () => {
        setSelectedIds(prev => prev.filter(id => id !== item.productId));
        toast.info(`Đã xóa "${item.product.name}" khỏi Giá treo đồ`);
      },
      onError: () => {
        toast.error('Không thể xóa món đồ này');
      },
    });
  };

  const handleClearAll = () => {
    clearRack(undefined, {
      onSuccess: () => {
        setSelectedIds([]);
        setShowClearConfirm(false);
        toast.info('Đã dọn sạch Giá treo đồ');
      },
      onError: () => {
        toast.error('Không thể dọn sạch Giá treo');
      },
    });
  };

  const handleGoToTryOn = () => {
    if (selectedItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 món đồ để thử');
      return;
    }
    const ids = selectedItems.map(i => i.productId).join(',');
    router.push(`/try-on?rackIds=${ids}`);
  };

  // Not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-neutral-100">
          <div className="w-16 h-16 bg-[#5D1C34]/10 text-[#5D1C34] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-heading-h3 font-bold text-brand-navy mb-2">Giá treo đồ ảo</h2>
          <p className="text-body-sm text-neutral-600 mb-6">
            Đăng nhập để lưu trữ các món đồ yêu thích, tự do phối đồ (Mix & Match) và thử đồ ảo không giới hạn.
          </p>
          <Link
            href="/login?callbackUrl=/rack"
            className="w-full py-3 bg-brand-navy text-white rounded-xl font-bold hover:bg-brand-navy/90 transition-colors inline-block"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Giá treo đồ của tôi"
        subtitle="Lưu trữ các trang phục bạn thích để tự do phối đồ và gửi thẳng vào phòng Thử đồ ảo"
        breadcrumbs={
          <div className="flex items-center gap-2 text-label-sm text-neutral-500">
            <Link href="/" className="hover:text-brand-navy">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-navy font-semibold">Giá treo đồ</span>
          </div>
        }
        cta={
          items.length > 0 ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2 border border-neutral-200 text-neutral-600 hover:text-semantic-error hover:border-semantic-error/40 rounded-xl text-label-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Dọn sạch giá treo
              </button>
            </div>
          ) : null
        }
      />

      <PageContent>
        {/* Instruction Banner */}
        <div className="bg-[#FDFBF7] border border-[#E5DFD5] rounded-2xl p-4 md:p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-[#5D1C34]/10 text-[#5D1C34] rounded-xl shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-body-md font-bold text-brand-navy">Quy tắc phối đồ Try-On</h3>
              <p className="text-body-sm text-neutral-600 mt-0.5">
                Chọn <span className="font-semibold text-[#5D1C34]">1 Áo + 1 Quần/Váy</span> để thử combo, hoặc chọn <span className="font-semibold text-[#5D1C34]">1 Bộ liền / Suit</span> riêng lẻ.
              </p>
            </div>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-label-sm font-bold text-[#5D1C34] hover:underline shrink-0"
          >
            <Plus className="w-4 h-4" /> Ghim thêm sản phẩm
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin text-[#5D1C34]" />
            <p className="text-body-sm font-medium">Đang tải Giá treo đồ...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && items.length === 0 && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center max-w-lg mx-auto my-8 shadow-xs">
            <div className="w-18 h-18 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shirt className="w-9 h-9" />
            </div>
            <h3 className="text-heading-h3 font-bold text-brand-navy mb-2">Giá treo đồ đang trống</h3>
            <p className="text-body-sm text-neutral-500 mb-6 max-w-sm mx-auto">
              Bạn chưa ghim sản phẩm nào. Hãy khám phá catalog và bấm biểu tượng Giá treo trên mỗi món đồ để bắt đầu phối đồ!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white text-label-md font-bold rounded-xl hover:bg-brand-navy/90 transition-colors shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" /> Khám phá sản phẩm
            </Link>
          </div>
        )}

        {/* Grid of Pinned Items */}
        {!isLoading && items.length > 0 && (
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.productId);
              const badge = getCategoryBadge(item.product.category);
              const imageUrl = getProductImage(item.product);

              return (
                <StaggerItem key={item.id}>
                  <div
                    onClick={() => handleToggleSelect(item)}
                    className={`group relative flex flex-col bg-white rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 shadow-xs hover:shadow-md ${
                      isSelected
                        ? 'border-[#5D1C34] ring-2 ring-[#5D1C34]/20 shadow-md bg-[#5D1C34]/2'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {/* Image Box */}
                    <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={item.product.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/731163514_999523332788054_1114320478812927640_n.png';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Selection Checkbox Overlay */}
                      <div
                        className={`absolute top-2 left-2 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#5D1C34] text-white shadow-md'
                            : 'bg-white/80 backdrop-blur-sm border border-neutral-300 text-transparent hover:border-brand-navy'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>

                      {/* Unpin Button */}
                      <button
                        type="button"
                        onClick={(e) => handleUnpin(e, item)}
                        disabled={isUnpinning}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm hover:bg-semantic-error hover:text-white rounded-full flex items-center justify-center text-neutral-500 transition-all opacity-80 hover:opacity-100 shadow-sm"
                        title="Bỏ ghim khỏi giá treo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* Category Badge */}
                      <div className="absolute bottom-2 left-2 pointer-events-none">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border shadow-2xs ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                        {item.product.brand || 'StAle. SIGNATURE'}
                      </span>
                      <h4 className="text-body-sm font-semibold text-brand-navy line-clamp-1 leading-snug">
                        {item.product.name}
                      </h4>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-body-sm font-bold text-[#5D1C34]">
                          {formatPrice(item.product.price)}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {isSelected ? '✓ Đã chọn' : 'Bấm để phối'}
                        </span>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}

        {/* Sticky Bottom Action Bar when items are selected */}
        {selectedItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-4 shadow-xl animate-in slide-in-from-bottom duration-300">
            <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex -space-x-3 overflow-hidden shrink-0">
                  {selectedItems.map((item) => (
                    <img
                      key={item.id}
                      src={getProductImage(item.product)}
                      alt={item.product.name}
                      className="inline-block h-12 w-12 rounded-xl object-cover ring-2 ring-white bg-neutral-100 shadow-sm"
                    />
                  ))}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm font-bold text-brand-navy">
                      Đã chọn {selectedItems.length}/2 món
                    </span>
                    <span className="text-xs text-neutral-500 font-medium hidden sm:inline">
                      ({selectedItems.map(i => i.product.name).join(' + ')})
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    {selectedItems.length === 1 && toBackendCategory(selectedItems[0].product.category) !== 'FULL_BODY'
                      ? 'Gợi ý: Bạn có thể chọn thêm 1 món nữa để hoàn thiện combo'
                      : 'Sẵn sàng đưa vào phòng thử đồ ảo!'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-4 py-2.5 text-body-sm font-semibold text-neutral-600 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-colors"
                >
                  Bỏ chọn tất cả
                </button>
                <button
                  type="button"
                  onClick={handleGoToTryOn}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-[#5D1C34] to-[#A67D44] text-white text-body-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Thử đồ với lựa chọn này <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear All Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-semantic-error/10 text-semantic-error flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-heading-h3 font-bold text-center text-brand-navy mb-2">
                Dọn sạch giá treo đồ?
              </h3>
              <p className="text-body-sm text-neutral-600 text-center mb-6">
                Hành động này sẽ gỡ toàn bộ {items.length} món đồ khỏi Giá treo đồ của bạn. Bạn có chắc chắn không?
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  disabled={isClearing}
                  className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-body-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={isClearing}
                  className="flex-1 py-2.5 bg-semantic-error text-white rounded-xl text-body-sm font-semibold hover:bg-semantic-error/90 transition-colors flex items-center justify-center gap-1.5"
                >
                  {isClearing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Xóa tất cả'}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageContent>
    </div>
  );
}

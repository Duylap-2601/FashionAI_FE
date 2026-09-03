'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Trash2, X, Check,
  ShoppingBag, Plus, ChevronRight,
  RefreshCw, Search
} from 'lucide-react';
import { HangerIcon } from '@/components/ui/HangerIcon';
import { PageHeader, PageContent } from '@/components/navigation/Layout';
import { useRackItems, useUnpinFromRack, useClearRack, RackItem, BackendRackProduct } from '@/hooks/useRack';
import { toBackendCategory } from '@/hooks/useProducts';
import { StaggerContainer, StaggerItem } from '@/components/ui/AnimateIn';
import { MannequinDressForm } from '@/components/rack/MannequinDressForm';
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

type TabType = 'ALL' | 'UPPER' | 'LOWER' | 'FULL_BODY';

export default function RackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, isLoading, isError, refetch } = useRackItems();
  const { unpinProduct, isUnpinning } = useUnpinFromRack();
  const { clearRack, isClearing } = useClearRack();

  // Mannequin Outfit Slot States
  const [upperItem, setUpperItem] = useState<RackItem | null>(null);
  const [lowerItem, setLowerItem] = useState<RackItem | null>(null);
  const [fullBodyItem, setFullBodyItem] = useState<RackItem | null>(null);

  // Tab & Search filter for wardrobe
  const [currentTab, setCurrentTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filtered wardrobe items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const cat = toBackendCategory(item.product.category);
      if (currentTab !== 'ALL' && cat !== currentTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = item.product.name?.toLowerCase().includes(q);
        const brandMatch = item.product.brand?.toLowerCase().includes(q);
        return nameMatch || brandMatch;
      }
      return true;
    });
  }, [items, currentTab, searchQuery]);

  // Check if an item is currently placed on mannequin
  const isItemWorn = (productId: string) => {
    return (
      upperItem?.productId === productId ||
      lowerItem?.productId === productId ||
      fullBodyItem?.productId === productId
    );
  };

  // Handle clicking an item from wardrobe to wear/remove on mannequin
  const handleItemClick = (item: RackItem) => {
    const cat = toBackendCategory(item.product.category);
    const worn = isItemWorn(item.productId);

    if (worn) {
      // Remove item
      if (upperItem?.productId === item.productId) setUpperItem(null);
      if (lowerItem?.productId === item.productId) setLowerItem(null);
      if (fullBodyItem?.productId === item.productId) setFullBodyItem(null);
      toast.info(`Đã gỡ "${item.product.name}" khỏi ma-nơ-canh`);
      return;
    }

    // Wear item based on category
    if (cat === 'FULL_BODY') {
      setFullBodyItem(item);
      setUpperItem(null);
      setLowerItem(null);
      toast.success(`Đã mặc "${item.product.name}" lên ma-nơ-canh`);
      return;
    }

    if (cat === 'UPPER') {
      setFullBodyItem(null);
      setUpperItem(item);
      toast.success(`Đã gắn áo "${item.product.name}" vào ma-nơ-canh`);
      return;
    }

    if (cat === 'LOWER') {
      setFullBodyItem(null);
      setLowerItem(item);
      toast.success(`Đã gắn quần/váy "${item.product.name}" vào ma-nơ-canh`);
      return;
    }
  };

  // Reset entire mannequin outfit
  const handleResetMannequin = () => {
    setUpperItem(null);
    setLowerItem(null);
    setFullBodyItem(null);
    toast.info('Đã làm mới ma-nơ-canh');
  };

  // Remove a product from rack storage
  const handleUnpin = (e: React.MouseEvent, item: RackItem) => {
    e.stopPropagation();
    unpinProduct(item.id, {
      onSuccess: () => {
        if (upperItem?.productId === item.productId) setUpperItem(null);
        if (lowerItem?.productId === item.productId) setLowerItem(null);
        if (fullBodyItem?.productId === item.productId) setFullBodyItem(null);
        toast.info(`Đã xóa "${item.product.name}" khỏi Tủ đồ`);
      },
      onError: () => {
        toast.error('Không thể xóa món đồ này');
      },
    });
  };

  // Clear all items from rack
  const handleClearAll = () => {
    clearRack(undefined, {
      onSuccess: () => {
        handleResetMannequin();
        setShowClearConfirm(false);
        toast.info('Đã dọn sạch Tủ đồ cá nhân');
      },
      onError: () => {
        toast.error('Không thể dọn sạch tủ đồ');
      },
    });
  };

  // Navigate to try-on studio with selected combination
  const handleGoToTryOn = () => {
    const selectedList: RackItem[] = [];
    if (fullBodyItem) {
      selectedList.push(fullBodyItem);
    } else {
      if (upperItem) selectedList.push(upperItem);
      if (lowerItem) selectedList.push(lowerItem);
    }

    if (selectedList.length === 0) {
      toast.error('Vui lòng gắn ít nhất 1 món đồ lên ma-nơ-canh để thử');
      return;
    }

    const ids = selectedList.map(i => i.productId).join(',');
    router.push(`/try-on?rackIds=${ids}`);
  };

  // Count items by category for tab badges
  const categoryCounts = useMemo(() => {
    const counts = { ALL: items.length, UPPER: 0, LOWER: 0, FULL_BODY: 0 };
    items.forEach(item => {
      const cat = toBackendCategory(item.product.category);
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });
    return counts;
  }, [items]);

  // Not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-neutral-100">
          <div className="w-16 h-16 bg-[#5D1C34]/10 text-[#5D1C34] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HangerIcon className="w-8 h-8" />
          </div>
          <h2 className="text-heading-h3 font-bold text-brand-navy mb-2">Giá treo đồ ảo</h2>
          <p className="text-body-sm text-neutral-600 mb-6">
            Đăng nhập để lưu trữ các món đồ yêu thích, tự do phối đồ trên Ma-nơ-canh và thử đồ ảo AI.
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
        title="Studio Phối Đồ & Giá Treo"
        subtitle="Gắn trang phục lên ma-nơ-canh để mix & match combo ưng ý, sau đó đưa vào phòng Thử đồ AI"
        breadcrumbs={
          <div className="flex items-center gap-2 text-label-sm text-neutral-500">
            <Link href="/" className="hover:text-brand-navy">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-navy font-semibold">Giá treo & Phối đồ</span>
          </div>
        }
        cta={
          items.length > 0 ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="px-3.5 py-2 border border-neutral-200 text-neutral-600 hover:text-semantic-error hover:border-semantic-error/40 rounded-xl text-label-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Dọn sạch giá treo
              </button>
            </div>
          ) : null
        }
      />

      <PageContent>
        {/* Loading State */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin text-[#5D1C34]" />
            <p className="text-body-sm font-medium">Đang tải tủ đồ của bạn...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && items.length === 0 && (
          <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center max-w-lg mx-auto my-8 shadow-xs">
            <div className="w-20 h-20 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <HangerIcon className="w-10 h-10" />
            </div>
            <h3 className="text-heading-h3 font-bold text-brand-navy mb-2">Giá treo đồ đang trống</h3>
            <p className="text-body-sm text-neutral-500 mb-6 max-w-sm mx-auto">
              Bạn chưa lưu trang phục nào. Hãy khám phá catalog và bấm nút ghim trên mỗi món đồ để mang vào studio phối đồ!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white text-label-md font-bold rounded-xl hover:bg-brand-navy/90 transition-colors shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" /> Khám phá bộ sưu tập
            </Link>
          </div>
        )}

        {/* 2-Column Mix & Match Layout */}
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Wardrobe Inventory (7 cols on lg) */}
            <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4">
              {/* Filter Tabs & Search */}
              <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-body-md font-bold text-brand-navy flex items-center gap-2">
                      Tủ Đồ Đã Lưu
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-neutral-100 text-neutral-600">
                        {items.length} món
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-500">Chạm vào sản phẩm để tự động ướm lên ma-nơ-canh</p>
                  </div>

                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#5D1C34] hover:underline shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm đồ mới
                  </Link>
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { key: 'ALL' as TabType, label: 'Tất cả', count: categoryCounts.ALL },
                    { key: 'UPPER' as TabType, label: 'Áo / Top', count: categoryCounts.UPPER },
                    { key: 'LOWER' as TabType, label: 'Quần & Váy', count: categoryCounts.LOWER },
                    { key: 'FULL_BODY' as TabType, label: 'Bộ liền / Suit', count: categoryCounts.FULL_BODY },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setCurrentTab(tab.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        currentTab === tab.key
                          ? 'bg-[#5D1C34] text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                          currentTab === tab.key ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search query if items are many */}
                {items.length > 6 && (
                  <div className="relative">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên sản phẩm, thương hiệu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden focus:border-[#5D1C34] transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Wardrobe Items Grid */}
              {filteredItems.length === 0 ? (
                <div className="bg-white border border-dashed border-neutral-300 rounded-2xl p-8 text-center">
                  <p className="text-body-sm text-neutral-500">Không tìm thấy món đồ phù hợp trong mục này.</p>
                </div>
              ) : (
                <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  {filteredItems.map((item) => {
                    const worn = isItemWorn(item.productId);
                    const badge = getCategoryBadge(item.product.category);
                    const imageUrl = getProductImage(item.product);

                    return (
                      <StaggerItem key={item.id}>
                        <div
                          onClick={() => handleItemClick(item)}
                          className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-md ${
                            worn
                              ? 'border-[#5D1C34] ring-3 ring-[#5D1C34]/20 shadow-md bg-[#5D1C34]/[0.02]'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          {/* Image Box */}
                          <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={item.product.name}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  '/images/731163514_999523332788054_1114320478812927640_n.png';
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />

                            {/* Worn Indicator Overlay */}
                            <div
                              className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                worn
                                  ? 'bg-[#5D1C34] text-white shadow-md'
                                  : 'bg-white/80 backdrop-blur-sm text-neutral-600 border border-neutral-300'
                              }`}
                            >
                              {worn ? (
                                <>
                                  <Check className="w-3 h-3 stroke-[3]" /> Đang mặc
                                </>
                              ) : (
                                'Chạm để thử'
                              )}
                            </div>

                            {/* Unpin Button */}
                            <button
                              type="button"
                              onClick={(e) => handleUnpin(e, item)}
                              disabled={isUnpinning}
                              className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm hover:bg-semantic-error hover:text-white rounded-full flex items-center justify-center text-neutral-500 transition-all opacity-80 hover:opacity-100 shadow-sm"
                              title="Bỏ khỏi giá treo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            {/* Category Badge */}
                            <div className="absolute bottom-2 left-2 pointer-events-none">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border shadow-2xs ${badge?.bg}`}>
                                {badge?.label}
                              </span>
                            </div>
                          </div>

                          {/* Info Card */}
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
                              <span className="text-[10px] font-semibold text-neutral-400 group-hover:text-[#5D1C34] transition-colors">
                                {worn ? 'Gỡ ra ✕' : 'Mặc vào +'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              )}
            </div>

            {/* Right Column: Virtual Mannequin Studio (5 cols on lg, sticky) */}
            <div className="lg:col-span-5 xl:col-span-5 sticky top-24">
              <MannequinDressForm
                upperItem={upperItem}
                lowerItem={lowerItem}
                fullBodyItem={fullBodyItem}
                onRemoveUpper={() => setUpperItem(null)}
                onRemoveLower={() => setLowerItem(null)}
                onRemoveFullBody={() => setFullBodyItem(null)}
                onReset={handleResetMannequin}
                onGoToTryOn={handleGoToTryOn}
              />
            </div>
          </div>
        )}

        {/* Clear All Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200">
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

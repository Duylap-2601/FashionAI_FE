'use client';

import { HangerIcon } from '@/components/ui/HangerIcon';
import { useMobileBreakpoint } from '@/components/ui/use-mobile';
import { useCartPanel } from '@/features/cart/hooks/use-cart-panel';
import { useCart } from '@/features/cart/store/cartStore';
import { DesktopFilterSidebar, MobileFilterSheet, MobileSortSheet } from '@/features/products/components/listing/ProductFilterPanels';
import { ProductList } from '@/features/products/components/listing/ProductList';
import { ProductResultsHeader } from '@/features/products/components/listing/ProductResultsHeader';
import { ProductToolbar } from '@/features/products/components/listing/ProductToolbar';
import { GARMENT_TYPE_TABS, SUB_CATEGORIES } from '@/features/products/constants/product-filters';
import { PRODUCTS } from '@/features/products/constants/products';
import { ITEMS_PER_PAGE } from '@/features/products/constants/products-page';
import { useInfiniteProducts, useProducts } from '@/features/products/hooks/useProducts';
import type { ActiveChip, SortBy } from '@/features/products/types/product-filters';
import type { Product } from '@/features/products/types/products';
import type { ProductListParams } from '@/features/products/types/products-hook';
import { useAuthStore } from '@/features/auth/store/authStore';
import { usePinToRack, useRackItems, useUnpinFromRack } from '@/features/rack/hooks/useRack';
import { ShoppingBag, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const DEFAULT_SORT_BY: SortBy = 'Mới nhất';

function toSortParam(sortBy: SortBy): ProductListParams['sort'] {
  if (sortBy === 'Giá thấp đến cao') return 'price_asc';
  if (sortBy === 'Giá cao đến thấp') return 'price_desc';
  return 'latest';
}

export default function ProductListing() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { setIsCartOpen } = useCartPanel();
  const { addToCart } = useCart();
  const isMobile = useMobileBreakpoint();
  const hasResolvedBreakpoint = typeof isMobile === 'boolean';
  const { isPinned, getItemByProductId } = useRackItems();
  const { pinProduct } = usePinToRack();
  const { unpinProduct } = useUnpinFromRack();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>(DEFAULT_SORT_BY);
  const [currentPage, setCurrentPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const maxPriceLimit = 10000000;
  const currentPriceRange = selectedMaxPrice ?? maxPriceLimit;

  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const applySearch = (value: string) => {
      setSearchQuery(prev => (prev === value ? prev : value));
      setCurrentPage(1);
    };

    const searchParams = new URLSearchParams(window.location.search);
    applySearch(searchParams.get('search') ?? '');

    const paramGarmentType = searchParams.get('garmentType');
    if (paramGarmentType) {
      const matchTab = GARMENT_TYPE_TABS.find(
        (t) => t.garmentType === paramGarmentType || t.key === paramGarmentType
      );
      if (matchTab) setActiveTab(matchTab.label);
    }

    const handleProductSearch = (event: Event) => {
      const nextSearch = (event as CustomEvent<string>).detail;
      if (typeof nextSearch === 'string') applySearch(nextSearch);
    };

    window.addEventListener('fashionai:product-search', handleProductSearch);
    return () => window.removeEventListener('fashionai:product-search', handleProductSearch);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  const activeGarmentType = useMemo(() => {
    const matchTab = GARMENT_TYPE_TABS.find(
      (t) => t.label === activeTab || t.key === activeTab
    );
    return matchTab?.garmentType;
  }, [activeTab]);

  const productQueryParams = useMemo<Omit<ProductListParams, 'page' | 'enabled'>>(() => ({
    limit: ITEMS_PER_PAGE,
    search: debouncedSearchQuery || undefined,
    garmentType: activeGarmentType,
    color: selectedColors.length > 0 ? selectedColors.join(',') : undefined,
    subCategory: selectedSubCategories.length > 0 ? selectedSubCategories.join(',') : undefined,
    maxPrice: selectedMaxPrice ?? undefined,
    sort: toSortParam(sortBy),
  }), [activeGarmentType, debouncedSearchQuery, selectedColors, selectedMaxPrice, selectedSubCategories, sortBy]);

  const desktopQuery = useProducts({
    ...productQueryParams,
    page: currentPage,
    enabled: hasResolvedBreakpoint && isMobile === false,
  });

  const mobileQuery = useInfiniteProducts({
    ...productQueryParams,
    enabled: hasResolvedBreakpoint && isMobile === true,
  });

  const queryProducts = isMobile ? mobileQuery.products : desktopQuery.products;
  const queryMeta = isMobile ? mobileQuery.meta : desktopQuery.meta;
  const isLoading = hasResolvedBreakpoint ? (isMobile ? mobileQuery.isLoading : desktopQuery.isLoading) : true;
  const isFetching = isMobile ? mobileQuery.isFetching : desktopQuery.isFetching;
  const isError = isMobile ? mobileQuery.isError : desktopQuery.isError;
  const refetch = isMobile ? mobileQuery.refetch : desktopQuery.refetch;
  const hasNextPage = mobileQuery.hasNextPage;
  const fetchNextPage = mobileQuery.fetchNextPage;
  const isFetchingNextPage = mobileQuery.isFetchingNextPage;
  const displayedProducts = isError && queryProducts.length === 0 ? PRODUCTS : queryProducts;
  const totalProducts = isError && queryProducts.length === 0 ? PRODUCTS.length : queryMeta.total;
  const totalPages = Math.max(1, queryMeta.totalPages);
  const hasMoreProducts = Boolean(isMobile && hasNextPage);

  const categoryCounts = useMemo(() => (
    GARMENT_TYPE_TABS.map((tab) => ({
      label: tab.label,
      count: tab.key === 'ALL' ? totalProducts : undefined,
    }))
  ), [totalProducts]);

  const subCategoryCounts = useMemo(() => SUB_CATEGORIES.map(sub => ({ name: sub.name })), []);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !isMobile || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '480px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isMobile]);

  const toggleColor = useCallback((colorName: string) => {
    setSelectedColors(prev =>
      prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]
    );
    resetToFirstPage();
  }, [resetToFirstPage]);

  const toggleSubCategory = useCallback((subName: string) => {
    setSelectedSubCategories(prev =>
      prev.includes(subName) ? prev.filter(s => s !== subName) : [...prev, subName]
    );
    resetToFirstPage();
  }, [resetToFirstPage]);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setActiveTab('Tất cả');
    setSelectedColors([]);
    setSelectedSubCategories([]);
    setSelectedMaxPrice(null);
    setSortBy(DEFAULT_SORT_BY);
    setCurrentPage(1);
    if (isError) refetch();
  };

  const activeChips = useMemo<ActiveChip[]>(() => {
    const chips: ActiveChip[] = [];

    if (activeTab !== 'Tất cả') {
      chips.push({
        id: 'tab',
        label: activeTab,
        onRemove: () => {
          setActiveTab('Tất cả');
          resetToFirstPage();
        },
      });
    }
    if (searchQuery.trim()) {
      chips.push({
        id: 'search',
        label: `"${searchQuery.trim()}"`,
        onRemove: () => {
          setSearchQuery('');
          resetToFirstPage();
        },
      });
    }
    if (selectedMaxPrice !== null && selectedMaxPrice < maxPriceLimit) {
      chips.push({
        id: 'price',
        label: `≤ ${(selectedMaxPrice / 1000).toLocaleString('vi-VN')}kđ`,
        onRemove: () => {
          setSelectedMaxPrice(null);
          resetToFirstPage();
        },
      });
    }
    selectedColors.forEach(color => chips.push({ id: `color-${color}`, label: `Màu ${color}`, onRemove: () => toggleColor(color) }));
    selectedSubCategories.forEach(sub => chips.push({ id: `sub-${sub}`, label: sub, onRemove: () => toggleSubCategory(sub) }));

    return chips;
  }, [activeTab, resetToFirstPage, searchQuery, selectedColors, selectedMaxPrice, selectedSubCategories, toggleColor, toggleSubCategory]);

  const handleToggleRack = (product: Product) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu sản phẩm vào Giá treo đồ');
      router.push('/login?callbackUrl=/products');
      return;
    }

    const rackItem = getItemByProductId(product.id);
    if (rackItem) {
      unpinProduct(rackItem.id, {
        onSuccess: () => toast.info(`Đã bỏ ${product.name} khỏi Giá treo đồ`),
        onError: () => toast.error('Không thể xóa khỏi Giá treo đồ'),
      });
      return;
    }

    pinProduct(product.id, {
      onSuccess: () => {
        toast.custom((t) => (
          <div className="bg-[#FDFBF7] border-l-4 border-[#5D1C34] border-y border-r border-[#E5DFD5] p-4 rounded-xl shadow-lg flex items-start gap-3.5 max-w-[380px] w-full relative">
            <div className="p-2 bg-[#5D1C34]/10 text-[#5D1C34] rounded-lg shrink-0 mt-0.5">
              <HangerIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <h4 className="text-[14px] font-bold text-brand-navy leading-snug">Đã ghim vào Giá treo đồ!</h4>
              <p className="text-[12px] text-neutral-700 font-semibold mt-1 truncate">{product.name}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Sẵn sàng để phối đồ và thử đồ ảo</p>
            </div>
            <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-h-[56px]">
              <button type="button" onClick={() => toast.dismiss(t)} className="p-1 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => { router.push('/rack'); toast.dismiss(t); }} className="text-[12px] font-bold text-[#5D1C34] hover:underline underline-offset-2 transition-all mt-auto">
                Xem giá treo
              </button>
            </div>
          </div>
        ), { duration: 4000 });
      },
      onError: () => toast.error('Không thể ghim vào Giá treo đồ'),
    });
  };

  const handleAddToCart = (product: Product) => {
    const color = product.colors?.[0]?.name || 'Mặc định';
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.numericPrice,
      quantity: 1,
      image: product.image,
      color,
      variant: `Màu: ${color} · May đo`,
    });

    toast.custom((t) => (
      <div className="bg-[#FDFBF7] border-l-4 border-[#5D1C34] border-y border-r border-[#E5DFD5] p-4 rounded-xl shadow-lg flex items-start gap-3.5 max-w-[380px] w-full relative">
        <div className="p-2 bg-[#5D1C34]/10 text-[#5D1C34] rounded-lg shrink-0 mt-0.5">
          <ShoppingBag className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-[14px] font-bold text-brand-navy leading-snug">Đã thêm vào giỏ hàng!</h4>
          <p className="text-[12px] text-neutral-700 font-semibold mt-1 truncate">{product.name}</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">Màu: {color} · May đo theo số đo | SL: 1</p>
        </div>
        <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-h-[56px]">
          <button type="button" onClick={() => toast.dismiss(t)} className="p-1 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => { setIsCartOpen(true); toast.dismiss(t); }} className="text-[12px] font-bold text-[#5D1C34] hover:underline underline-offset-2 transition-all mt-auto">
            Xem giỏ hàng
          </button>
        </div>
      </div>
    ), { duration: 4000 });
  };

  const filterPanelProps = {
    activeChips,
    currentPriceRange,
    maxPriceLimit,
    selectedColors,
    subCategoryCounts,
    selectedSubCategories,
    filteredCount: totalProducts,
    onClose: () => setIsSidebarOpen(false),
    onClearAll: handleClearAllFilters,
    onPriceChange: (value: number) => {
      setSelectedMaxPrice(value);
      resetToFirstPage();
    },
    onToggleColor: toggleColor,
    onToggleSubCategory: toggleSubCategory,
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <ProductToolbar
        categories={categoryCounts}
        activeTab={activeTab}
        searchQuery={searchQuery}
        isSidebarOpen={isSidebarOpen}
        sortBy={sortBy}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          resetToFirstPage();
        }}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onSortChange={(value) => {
          setSortBy(value);
          resetToFirstPage();
        }}
      />

      {isSidebarOpen && <MobileFilterSheet {...filterPanelProps} />}
      {isSortOpen && <MobileSortSheet sortBy={sortBy} onClose={() => setIsSortOpen(false)} onSortChange={(value) => {
        setSortBy(value);
        resetToFirstPage();
      }} />}

      <div className="flex-1 flex max-w-[1280px] w-full mx-auto px-4 md:px-8 py-8 items-start relative">
        {isSidebarOpen && <DesktopFilterSidebar {...filterPanelProps} />}

        <div className="flex-1 flex flex-col min-w-0">
          <ProductResultsHeader
            filteredCount={totalProducts}
            activeChips={activeChips}
            onOpenFilters={() => setIsSidebarOpen(true)}
            onOpenSort={() => setIsSortOpen(true)}
            onClearAll={handleClearAllFilters}
          />

          <ProductList
            apiProductsLength={queryProducts.length}
            isError={isError}
            isLoading={isLoading}
            isFetching={isFetching}
            isFetchingNextPage={isFetchingNextPage}
            isMobile={Boolean(isMobile)}
            isSidebarOpen={isSidebarOpen}
            products={displayedProducts}
            totalCount={totalProducts}
            hasMoreProducts={hasMoreProducts}
            currentPage={currentPage}
            totalPages={totalPages}
            loadMoreRef={loadMoreRef}
            isPinned={isPinned}
            onRetry={() => refetch()}
            onClearAll={handleClearAllFilters}
            onLoadMore={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onToggleRack={handleToggleRack}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </div>
  );
}

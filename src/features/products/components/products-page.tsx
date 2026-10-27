'use client';

import { useMobileBreakpoint } from '@/components/ui/use-mobile';
import { useCartPanel } from '@/features/cart/hooks/use-cart-panel';
import { useCart } from '@/features/cart/hooks/use-cart';
import { DesktopFilterSidebar, MobileFilterSheet, MobileSortSheet } from '@/features/products/components/listing/ProductFilterPanels';
import { ProductList } from '@/features/products/components/listing/ProductList';
import { ProductResultsHeader } from '@/features/products/components/listing/ProductResultsHeader';
import { ProductToolbar } from '@/features/products/components/listing/ProductToolbar';
import {
  ALL_GARMENTS_TAB,
  DEFAULT_SORT_BY,
  GARMENT_TYPE_TABS,
  PRICE_FILTER,
  SUB_CATEGORIES,
} from '@/features/products/constants/product-filters';
import { PRODUCTS } from '@/features/products/constants/products';
import { ITEMS_PER_PAGE } from '@/features/products/constants/products-page';
import { useInfiniteProducts, useProducts } from '@/features/products/hooks/useProducts';
import type { ActiveChip, SortBy } from '@/features/products/types/product-filters';
import type { Product } from '@/features/products/types/products';
import type { ProductListParams } from '@/features/products/types/products-hook';
import { trackEvent } from '@/lib/analytics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

function toSortParam(sortBy: SortBy): ProductListParams['sort'] {
  if (sortBy === 'Giá thấp đến cao') return 'price_asc';
  if (sortBy === 'Giá cao đến thấp') return 'price_desc';
  return 'latest';
}

export default function ProductListing() {
  const { setIsCartOpen } = useCartPanel();
  const { addToCart } = useCart();
  const isMobile = useMobileBreakpoint();
  const hasResolvedBreakpoint = typeof isMobile === 'boolean';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(ALL_GARMENTS_TAB);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>(DEFAULT_SORT_BY);
  const [currentPage, setCurrentPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const maxPriceLimit = PRICE_FILTER.max;
  const currentPriceRange = selectedMaxPrice ?? maxPriceLimit;

  // Chỉ cuộn khi đầu lưới đã trôi lên dưới toolbar dính; mốc lấy từ scroll-margin-top của lưới.
  const scrollToResults = useCallback(() => {
    const target = resultsRef.current;
    if (!target) return;
    const stickyOffset = Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
    if (target.getBoundingClientRect().top >= stickyOffset) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  }, []);

  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
    scrollToResults();
  }, [scrollToResults]);

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

  // Mọi ô tìm kiếm (header, trang /search, landing) đều dẫn về trang này nên chỉ đo ở đây.
  useEffect(() => {
    if (debouncedSearchQuery) trackEvent('search', { search_term: debouncedSearchQuery });
  }, [debouncedSearchQuery]);

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

  const categoryTabs = useMemo(() => GARMENT_TYPE_TABS.map((tab) => ({ label: tab.label })), []);

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
    setActiveTab(ALL_GARMENTS_TAB);
    setSelectedColors([]);
    setSelectedSubCategories([]);
    setSelectedMaxPrice(null);
    setSortBy(DEFAULT_SORT_BY);
    setCurrentPage(1);
    if (isError) refetch();
  };

  const activeChips = useMemo<ActiveChip[]>(() => {
    const chips: ActiveChip[] = [];

    if (activeTab !== ALL_GARMENTS_TAB) {
      chips.push({
        id: 'tab',
        label: activeTab,
        onRemove: () => {
          setActiveTab(ALL_GARMENTS_TAB);
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
    if (selectedMaxPrice !== null && selectedMaxPrice < PRICE_FILTER.max) {
      chips.push({
        id: 'price',
        label: `Dưới ${selectedMaxPrice.toLocaleString('vi-VN')} ₫`,
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

  const handleAddToCart = (product: Product) => {
    const color = product.colors?.[0]?.name;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.numericPrice,
      quantity: 1,
      image: product.image,
      color,
      variant: `Màu: ${color || 'Mặc định'} · May đo`,
    });

    toast.custom((t) => (
      <div className="flex w-[min(360px,calc(100vw-56px))] items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[13px] font-semibold text-landing-obsidian">Đã thêm {product.name} vào giỏ</p>
        <button type="button" onClick={() => { setIsCartOpen(true); toast.dismiss(t); }} className="shrink-0 text-[12px] font-bold text-landing-oxblood hover:underline">
          Xem giỏ
        </button>
      </div>
    ), { duration: 2500 });
  };

  const activeFilterCount = selectedColors.length
    + selectedSubCategories.length
    + (selectedMaxPrice !== null && selectedMaxPrice < maxPriceLimit ? 1 : 0);

  const filterSectionProps = {
    currentPriceRange,
    maxPriceLimit,
    selectedColors,
    subCategoryCounts,
    selectedSubCategories,
    onPriceChange: (value: number) => {
      setSelectedMaxPrice(value);
      resetToFirstPage();
    },
    onToggleColor: toggleColor,
    onToggleSubCategory: toggleSubCategory,
  };

  const isDesktopSidebarOpen = isSidebarOpen && isMobile === false;

  return (
    <main className="flex flex-1 flex-col">
      <ProductToolbar
        categories={categoryTabs}
        activeTab={activeTab}
        searchQuery={searchQuery}
        isFilterOpen={isSidebarOpen}
        activeFilterCount={activeFilterCount}
        sortBy={sortBy}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          resetToFirstPage();
        }}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        onToggleFilters={() => setIsSidebarOpen(prev => !prev)}
        onOpenSort={() => setIsSortOpen(true)}
        onSortChange={(value) => {
          setSortBy(value);
          resetToFirstPage();
        }}
      />

      <MobileFilterSheet
        {...filterSectionProps}
        open={isSidebarOpen && isMobile === true}
        activeChips={activeChips}
        filteredCount={totalProducts}
        onOpenChange={setIsSidebarOpen}
        onClearAll={handleClearAllFilters}
      />
      <MobileSortSheet
        open={isSortOpen && isMobile === true}
        sortBy={sortBy}
        onOpenChange={setIsSortOpen}
        onSortChange={(value) => {
          setSortBy(value);
          resetToFirstPage();
        }}
      />

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 items-start px-4 pb-16 pt-8 md:px-8 md:pb-24 md:pt-10">
        {isDesktopSidebarOpen ? (
          <DesktopFilterSidebar
            {...filterSectionProps}
            hasActiveFilters={activeChips.length > 0}
            onClearAll={handleClearAllFilters}
          />
        ) : null}

        {/* scroll-mt = header 72px + toolbar dính (105px dưới xl, 57px từ xl) + khoảng thở. */}
        <div ref={resultsRef} className="flex min-w-0 flex-1 scroll-mt-[193px] flex-col md:scroll-mt-[201px] xl:scroll-mt-[153px]">
          <ProductResultsHeader
            filteredCount={totalProducts}
            isLoading={isLoading && queryProducts.length === 0}
            currentPage={currentPage}
            totalPages={totalPages}
            showPageIndex={isMobile === false}
            activeChips={activeChips}
            onClearAll={handleClearAllFilters}
          />

          <ProductList
            apiProductsLength={queryProducts.length}
            isError={isError}
            isLoading={isLoading}
            isFetching={isFetching}
            isFetchingNextPage={isFetchingNextPage}
            isMobile={Boolean(isMobile)}
            isSidebarOpen={isDesktopSidebarOpen}
            products={displayedProducts}
            totalCount={totalProducts}
            hasMoreProducts={hasMoreProducts}
            currentPage={currentPage}
            totalPages={totalPages}
            loadMoreRef={loadMoreRef}
            onRetry={() => refetch()}
            onClearAll={handleClearAllFilters}
            onLoadMore={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onPageChange={(page) => {
              setCurrentPage(page);
              scrollToResults();
            }}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </main>
  );
}

'use client';

import { ITEMS_PER_PAGE } from '@/features/products/constants/products-page';
import { useCartPanel } from '@/features/cart/hooks/use-cart-panel';
import { HangerIcon } from '@/components/ui/HangerIcon';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCart } from '@/features/cart/store/cartStore';
import { DesktopFilterSidebar, MobileFilterSheet, MobileSortSheet } from '@/features/products/components/listing/ProductFilterPanels';
import { ProductList } from '@/features/products/components/listing/ProductList';
import { ProductResultsHeader } from '@/features/products/components/listing/ProductResultsHeader';
import { ProductToolbar } from '@/features/products/components/listing/ProductToolbar';
import { SUB_CATEGORIES } from '@/features/products/constants/product-filters';
import { PRODUCTS } from '@/features/products/constants/products';
import { useProducts } from '@/features/products/hooks/useProducts';
import { getCategoryGroup } from '@/features/products/services/product-filters';
import type { ActiveChip, SortBy } from '@/features/products/types/product-filters';
import type { Product } from '@/features/products/types/products';
import { usePinToRack, useRackItems, useUnpinFromRack } from '@/features/rack/hooks/useRack';
import { ShoppingBag, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function ProductListing() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { setIsCartOpen } = useCartPanel();
  const { addToCart } = useCart();
  const { products: apiProducts, isLoading, isError, refetch } = useProducts();
  const { isPinned, getItemByProductId } = useRackItems();
  const { pinProduct } = usePinToRack();
  const { unpinProduct } = useUnpinFromRack();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('Mới nhất');
  const [currentPage, setCurrentPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const allProducts = useMemo(() => {
    if (apiProducts.length > 0) return apiProducts;
    if (isLoading) return [];
    if (isError) return PRODUCTS;
    return [];
  }, [apiProducts, isLoading, isError]);

  const maxPriceLimit = useMemo(() => {
    if (allProducts.length === 0) return 10000000;
    const max = Math.max(...allProducts.map(p => p.numericPrice || 0));
    return Math.max(max, 5000000);
  }, [allProducts]);

  const currentPriceRange = selectedMaxPrice ?? maxPriceLimit;

  useEffect(() => {
    const applySearch = (value: string) => {
      setSearchQuery(prev => (prev === value ? prev : value));
      setCurrentPage(1);
    };

    applySearch(new URLSearchParams(window.location.search).get('search') ?? '');

    const handleProductSearch = (event: Event) => {
      const nextSearch = (event as CustomEvent<string>).detail;
      if (typeof nextSearch === 'string') applySearch(nextSearch);
    };

    window.addEventListener('fashionai:product-search', handleProductSearch);
    return () => window.removeEventListener('fashionai:product-search', handleProductSearch);
  }, []);

  const categoryCounts = useMemo(() => {
    let ao = 0;
    let quanVay = 0;
    let suit = 0;

    allProducts.forEach(p => {
      const group = getCategoryGroup(p);
      if (group === 'Áo') ao++;
      else if (group === 'Quần & Váy') quanVay++;
      else if (group === 'Suit đầy đủ') suit++;
    });

    return [
      { label: 'Tất cả', count: allProducts.length },
      { label: 'Áo', count: ao },
      { label: 'Quần & Váy', count: quanVay },
      { label: 'Suit đầy đủ', count: suit },
    ];
  }, [allProducts]);

  const subCategoryCounts = useMemo(() => {
    return SUB_CATEGORIES.map(sub => {
      const count = allProducts.filter(p => {
        const pCat = (p.category || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        return sub.match.some(m => pCat.includes(m) || pName.includes(m));
      }).length;
      return { name: sub.name, count };
    });
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (activeTab !== 'Tất cả') {
      result = result.filter(p => getCategoryGroup(p) === activeTab);
    }

    if (selectedSubCategories.length > 0) {
      result = result.filter(p => {
        const pCat = (p.category || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        return selectedSubCategories.some(subName => {
          const subObj = SUB_CATEGORIES.find(s => s.name === subName);
          if (!subObj) return pCat.includes(subName.toLowerCase()) || pName.includes(subName.toLowerCase());
          return subObj.match.some(m => pCat.includes(m) || pName.includes(m));
        });
      });
    }

    if (selectedColors.length > 0) {
      result = result.filter(p =>
        p.colors && p.colors.some(c =>
          selectedColors.some(sc => c.name.toLowerCase().includes(sc.toLowerCase()))
        )
      );
    }

    if (selectedMaxPrice !== null) {
      result = result.filter(p => p.numericPrice <= selectedMaxPrice);
    }

    if (sortBy === 'Giá thấp đến cao') {
      result.sort((a, b) => a.numericPrice - b.numericPrice);
    } else if (sortBy === 'Giá cao đến thấp') {
      result.sort((a, b) => b.numericPrice - a.numericPrice);
    }

    return result;
  }, [allProducts, searchQuery, activeTab, selectedSubCategories, selectedColors, selectedMaxPrice, sortBy]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, currentPage * ITEMS_PER_PAGE),
    [filteredProducts, currentPage]
  );
  const hasMoreProducts = visibleProducts.length < filteredProducts.length;

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMoreProducts) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setCurrentPage(prev => prev + 1);
      },
      { rootMargin: '480px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreProducts]);

  const toggleColor = (colorName: string) => {
    setSelectedColors(prev =>
      prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]
    );
    setCurrentPage(1);
  };

  const toggleSubCategory = (subName: string) => {
    setSelectedSubCategories(prev =>
      prev.includes(subName) ? prev.filter(s => s !== subName) : [...prev, subName]
    );
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setActiveTab('Tất cả');
    setSelectedColors([]);
    setSelectedSubCategories([]);
    setSelectedMaxPrice(null);
    setSortBy('Mới nhất');
    setCurrentPage(1);
    if (isError) refetch();
  };

  const activeChips = useMemo<ActiveChip[]>(() => {
    const chips: ActiveChip[] = [];

    if (activeTab !== 'Tất cả') chips.push({ id: 'tab', label: activeTab, onRemove: () => setActiveTab('Tất cả') });
    if (searchQuery.trim()) chips.push({ id: 'search', label: `"${searchQuery.trim()}"`, onRemove: () => setSearchQuery('') });
    if (selectedMaxPrice !== null && selectedMaxPrice < maxPriceLimit) {
      chips.push({
        id: 'price',
        label: `≤ ${(selectedMaxPrice / 1000).toLocaleString('vi-VN')}kđ`,
        onRemove: () => setSelectedMaxPrice(null),
      });
    }
    selectedColors.forEach(color => chips.push({ id: `color-${color}`, label: `Màu ${color}`, onRemove: () => toggleColor(color) }));
    selectedSubCategories.forEach(sub => chips.push({ id: `sub-${sub}`, label: sub, onRemove: () => toggleSubCategory(sub) }));

    return chips;
  }, [activeTab, searchQuery, selectedMaxPrice, maxPriceLimit, selectedColors, selectedSubCategories]);

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
    filteredCount: filteredProducts.length,
    onClose: () => setIsSidebarOpen(false),
    onClearAll: handleClearAllFilters,
    onPriceChange: (value: number) => {
      setSelectedMaxPrice(value);
      setCurrentPage(1);
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
          setCurrentPage(1);
        }}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onSortChange={setSortBy}
      />

      {isSidebarOpen && <MobileFilterSheet {...filterPanelProps} />}
      {isSortOpen && <MobileSortSheet sortBy={sortBy} onClose={() => setIsSortOpen(false)} onSortChange={setSortBy} />}

      <div className="flex-1 flex max-w-[1280px] w-full mx-auto px-4 md:px-8 py-8 items-start relative">
        {isSidebarOpen && <DesktopFilterSidebar {...filterPanelProps} />}

        <div className="flex-1 flex flex-col min-w-0">
          <ProductResultsHeader
            filteredCount={filteredProducts.length}
            activeChips={activeChips}
            onOpenFilters={() => setIsSidebarOpen(true)}
            onOpenSort={() => setIsSortOpen(true)}
            onClearAll={handleClearAllFilters}
          />

          <ProductList
            apiProductsLength={apiProducts.length}
            isError={isError}
            isLoading={isLoading}
            isSidebarOpen={isSidebarOpen}
            filteredProducts={filteredProducts}
            visibleProducts={visibleProducts}
            hasMoreProducts={hasMoreProducts}
            loadMoreRef={loadMoreRef}
            isPinned={isPinned}
            onRetry={() => refetch()}
            onClearAll={handleClearAllFilters}
            onLoadMore={() => setCurrentPage(prev => prev + 1)}
            onToggleRack={handleToggleRack}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </div>
  );
}

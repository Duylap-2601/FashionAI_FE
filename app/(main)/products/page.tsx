'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, LayoutGrid, List, X, ShoppingBag, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/components/ui/AnimateIn';
import { useApp } from '@/components/navigation/Layout';
import { useCart } from '@/store/cartStore';
import { toast } from 'sonner';
import { PRODUCTS, Product } from '@/lib/data';
import { useProducts } from '@/hooks/useProducts';

function getCategoryGroup(product: Product): 'Áo' | 'Quần & Váy' | 'Suit đầy đủ' {
  const cat = (product.category || '').toLowerCase();
  const name = (product.name || '').toLowerCase();

  if (
    cat.includes('suit') ||
    cat.includes('toan than') ||
    cat.includes('full_body') ||
    cat.includes('one-piece') ||
    name.includes('suit') ||
    name.includes('nguyên bộ') ||
    name.includes('combo')
  ) {
    return 'Suit đầy đủ';
  }
  if (
    cat.includes('quan') ||
    cat.includes('vay') ||
    cat.includes('lower') ||
    cat.includes('bottom') ||
    name.includes('quần') ||
    name.includes('váy') ||
    name.includes('chân váy')
  ) {
    return 'Quần & Váy';
  }
  return 'Áo';
}

const SUB_CATEGORIES = [
  { name: 'Áo sơ mi', match: ['sơ mi', 'shirt'] },
  { name: 'Blazer', match: ['blazer', 'vest'] },
  { name: 'Quần tây', match: ['quần tây', 'quần âu', 'trouser', 'pant'] },
  { name: 'Váy công sở', match: ['váy', 'chân váy', 'skirt'] },
  { name: 'Suit 2 mảnh', match: ['suit 2', 'suit k', 'suit n', ' nguyên bộ'] },
  { name: 'Suit 3 mảnh', match: ['suit 3', 'suit 3 mảnh'] },
];

const AVAILABLE_COLORS = [
  { name: 'Đen', color: '#111111' },
  { name: 'Trắng', color: '#FFFFFF', border: true },
  { name: 'Xám', color: '#888888' },
  { name: 'Navy', color: '#2B3450' },
  { name: 'Kem', color: '#EFE9E1' },
  { name: 'Be', color: '#E8E2D2' },
];

export default function ProductListing() {
  const { setIsCartOpen } = useApp();
  const { addToCart } = useCart();
  const { products: apiProducts, isLoading, isError, refetch } = useProducts();

  const allProducts = useMemo(() => {
    return apiProducts.length > 0 ? apiProducts : PRODUCTS;
  }, [apiProducts]);

  // Filter States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);

  const maxPriceLimit = useMemo(() => {
    if (allProducts.length === 0) return 10000000;
    const max = Math.max(...allProducts.map(p => p.numericPrice || 0));
    return Math.max(max, 5000000);
  }, [allProducts]);

  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number | null>(null);
  const currentPriceRange = selectedMaxPrice ?? maxPriceLimit;
  const [sortBy, setSortBy] = useState<'Mới nhất' | 'Giá thấp đến cao' | 'Giá cao đến thấp'>('Mới nhất');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Dynamic Category Counts
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

  // Dynamic Subcategory Counts
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

  // Filtered Products Calculation
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Top Category tab filter
    if (activeTab !== 'Tất cả') {
      result = result.filter(p => getCategoryGroup(p) === activeTab);
    }

    // Sidebar Subcategories filter
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

    // Color filter
    if (selectedColors.length > 0) {
      result = result.filter(p =>
        p.colors && p.colors.some(c =>
          selectedColors.some(sc => c.name.toLowerCase().includes(sc.toLowerCase()))
        )
      );
    }

    // Price range filter
    if (selectedMaxPrice !== null) {
      result = result.filter(p => p.numericPrice <= selectedMaxPrice);
    }

    // Sorting
    if (sortBy === 'Giá thấp đến cao') {
      result.sort((a, b) => a.numericPrice - b.numericPrice);
    } else if (sortBy === 'Giá cao đến thấp') {
      result.sort((a, b) => b.numericPrice - a.numericPrice);
    }

    return result;
  }, [allProducts, searchQuery, activeTab, selectedSubCategories, selectedColors, selectedMaxPrice, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (validCurrentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, validCurrentPage, itemsPerPage]);

  // Handlers for Toggling Filters
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
  };

  // Active Chips List
  const activeChips = useMemo(() => {
    const chips: { id: string; label: string; onRemove: () => void }[] = [];

    if (activeTab !== 'Tất cả') {
      chips.push({ id: 'tab', label: activeTab, onRemove: () => setActiveTab('Tất cả') });
    }
    if (searchQuery.trim()) {
      chips.push({ id: 'search', label: `"${searchQuery.trim()}"`, onRemove: () => setSearchQuery('') });
    }
    if (selectedMaxPrice !== null && selectedMaxPrice < maxPriceLimit) {
      chips.push({
        id: 'price',
        label: `≤ ${(selectedMaxPrice / 1000).toLocaleString('vi-VN')}kđ`,
        onRemove: () => setSelectedMaxPrice(null)
      });
    }
    selectedColors.forEach(color => {
      chips.push({ id: `color-${color}`, label: `Màu ${color}`, onRemove: () => toggleColor(color) });
    });
    selectedSubCategories.forEach(sub => {
      chips.push({ id: `sub-${sub}`, label: sub, onRemove: () => toggleSubCategory(sub) });
    });

    return chips;
  }, [activeTab, searchQuery, selectedMaxPrice, maxPriceLimit, selectedColors, selectedSubCategories]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* STICKY FILTER BAR */}
      <div className="sticky top-[56px] md:top-[64px] z-40 bg-white border-b border-neutral-200 px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Category tabs */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categoryCounts.map(tab => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(tab.label);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-label-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.label
                  ? 'bg-brand-navy text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="relative hidden md:block w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm..."
              className="w-full h-10 pl-9 pr-4 bg-neutral-50 border border-transparent rounded-full text-body-sm focus:bg-white focus:border-neutral-300 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`h-10 px-4 rounded-full border text-label-sm font-medium flex items-center gap-2 transition-colors ${
              isSidebarOpen ? 'border-brand-navy bg-brand-navy text-white' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Lọc
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 px-4 pr-8 rounded-full border border-neutral-200 text-label-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors appearance-none cursor-pointer focus:outline-none focus:border-brand-navy hidden sm:block bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat"
          >
            <option value="Mới nhất">Mới nhất</option>
            <option value="Giá thấp đến cao">Giá thấp đến cao</option>
            <option value="Giá cao đến thấp">Giá cao đến thấp</option>
          </select>

          <div className="hidden lg:flex items-center gap-1 bg-neutral-100 p-1 rounded-full border border-neutral-200">
            <button className="p-1.5 bg-white shadow-sm rounded-full text-brand-navy"><LayoutGrid className="w-4 h-4" /></button>
            <button className="p-1.5 text-neutral-500 hover:text-brand-navy"><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex max-w-[1280px] w-full mx-auto px-4 md:px-8 py-8 items-start relative">

        {/* LEFT SIDEBAR (Filter) */}
        {isSidebarOpen && (
          <div className="w-[260px] shrink-0 pr-8 hidden md:block animate-in slide-in-from-left-8 duration-300 border-r border-neutral-100 min-h-[calc(100vh-200px)] sticky top-[136px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-brand-navy">Bộ lọc</h2>
              <button
                onClick={handleClearAllFilters}
                className="text-[12px] text-neutral-500 hover:text-brand-navy hover:underline"
              >
                Xoá tất cả
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {/* Khoảng giá */}
              <div>
                <h3 className="text-label-sm font-semibold mb-3">Khoảng giá tối đa</h3>
                <input
                  type="range"
                  min={200000}
                  max={maxPriceLimit}
                  step={100000}
                  value={currentPriceRange}
                  onChange={(e) => {
                    setSelectedMaxPrice(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full accent-brand-navy cursor-pointer"
                />
                <div className="text-[13px] font-medium text-neutral-600 text-center mt-2">
                  Dưới {currentPriceRange.toLocaleString('vi-VN')}đ
                </div>
              </div>

              {/* Màu sắc */}
              <div>
                <h3 className="text-label-sm font-semibold mb-4">Màu sắc</h3>
                <div className="grid grid-cols-5 gap-3">
                  {AVAILABLE_COLORS.map(c => {
                    const isSelected = selectedColors.includes(c.name);
                    return (
                      <div
                        key={c.name}
                        onClick={() => toggleColor(c.name)}
                        className="relative group cursor-pointer flex flex-col items-center"
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            c.border ? 'border border-neutral-300' : ''
                          } ${isSelected ? 'ring-2 ring-brand-navy ring-offset-2' : ''}`}
                          style={{ backgroundColor: c.color }}
                        >
                          {isSelected && (
                            <Check className={`w-3.5 h-3.5 ${c.color === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                          )}
                        </div>
                        <div className="absolute -top-8 bg-brand-navy text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {c.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Danh mục con */}
              <div>
                <h3 className="text-label-sm font-semibold mb-4">Danh mục</h3>
                <div className="flex flex-col gap-3">
                  {subCategoryCounts.map(item => {
                    const isChecked = selectedSubCategories.includes(item.name);
                    return (
                      <label
                        key={item.name}
                        onClick={() => toggleSubCategory(item.name)}
                        className="flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-brand-navy border-brand-navy' : 'border-neutral-300 bg-white'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-body-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{item.name}</span>
                        </div>
                        <span className="text-[12px] text-neutral-400">({item.count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="w-full py-3 mt-4 bg-brand-navy text-white text-body-sm font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors shadow-sm"
              >
                Áp dụng ({filteredProducts.length} sản phẩm)
              </button>
            </div>
          </div>
        )}

        {/* RIGHT GRID */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-3 mb-6 flex-wrap min-h-[32px]">
            <span className="text-body-sm font-medium text-neutral-900">
              {filteredProducts.length} sản phẩm
            </span>

            {activeChips.length > 0 && (
              <>
                <div className="w-px h-4 bg-neutral-300 mx-1"></div>
                {activeChips.map(chip => (
                  <div
                    key={chip.id}
                    onClick={chip.onRemove}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-full text-[12px] font-medium text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    {chip.label} <X className="w-3 h-3 text-neutral-500 hover:text-neutral-900" />
                  </div>
                ))}
                <button
                  onClick={handleClearAllFilters}
                  className="text-[12px] font-semibold text-brand-navy hover:underline ml-2"
                >
                  Xoá tất cả
                </button>
              </>
            )}
          </div>

          {isLoading && apiProducts.length === 0 ? (
            <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-${isSidebarOpen ? '5' : '6'} gap-2 md:gap-3 mb-12`}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white border border-neutral-100 rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-neutral-200" />
                  <div className="p-2.5 flex flex-col gap-1.5">
                    <div className="h-2.5 w-16 bg-neutral-200 rounded" />
                    <div className="h-3 w-3/4 bg-neutral-200 rounded" />
                    <div className="h-3 w-1/2 bg-neutral-200 rounded mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-[20px] font-bold text-brand-navy mb-2 tracking-tight">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="text-body-md text-neutral-500 mb-8 max-w-[320px]">Thử bỏ một vài bộ lọc để xem thêm sản phẩm.</p>
              <button
                onClick={handleClearAllFilters}
                className="px-6 py-3 border border-neutral-200 text-neutral-700 text-body-sm font-medium rounded-xl hover:bg-neutral-50 transition-colors"
              >
                Xoá tất cả bộ lọc
              </button>
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <StaggerContainer className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-${isSidebarOpen ? '5' : '6'} gap-2 md:gap-3 mb-12 transition-all duration-300`}>
                {paginatedProducts.map(product => {
                  const hasDiscount = product.originalPrice && product.originalPrice > product.numericPrice;
                  const discountPercent = hasDiscount && product.originalPrice
                    ? Math.round(((product.originalPrice - product.numericPrice) / product.originalPrice) * 100)
                    : null;
                  const isCombo = product.name.toLowerCase().includes('combo') || product.category.toLowerCase().includes('suit');

                  return (
                    <StaggerItem key={product.id} className="group">
                      <Link href={`/products/${product.id}`} className="group flex flex-col bg-white border border-neutral-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full relative">
                        <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/731163514_999523332788054_1114320478812927640_n.png';
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Product Badges */}
                          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10 pointer-events-none">
                            {discountPercent && discountPercent > 0 && (
                              <span className="px-1.5 py-0.5 bg-semantic-error text-white text-[9px] font-bold rounded shadow-sm">
                                -{discountPercent}%
                              </span>
                            )}
                            {isCombo && (
                              <span className="px-1.5 py-0.5 bg-brand-navy/90 backdrop-blur-sm text-white text-[9px] font-bold rounded shadow-sm">
                                Combo
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              const color = product.colors?.[0]?.name || 'Mặc định';
                              addToCart({
                                productId: product.id,
                                name: product.name,
                                price: product.numericPrice,
                                quantity: 1,
                                image: product.image,
                                color,
                                variant: `Màu: ${color} · May đo`
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
                                    <button 
                                      type="button"
                                      onClick={() => toast.dismiss(t)} 
                                      className="p-1 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => { setIsCartOpen(true); toast.dismiss(t); }} 
                                      className="text-[12px] font-bold text-[#5D1C34] hover:underline underline-offset-2 transition-all mt-auto"
                                    >
                                      Xem giỏ hàng
                                    </button>
                                  </div>
                                </div>
                              ), {
                                duration: 4000
                              });
                            }}
                            className="absolute bottom-1.5 right-1.5 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-brand-navy shadow-sm opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-brand-navy hover:text-white"
                            title="Thêm nhanh vào giỏ"
                          >
                            <ShoppingBag className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="px-2.5 py-2 flex flex-col gap-0.5">
                          <div className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">{product.brand}</div>
                          <h4 className="text-[11px] font-medium text-brand-navy line-clamp-1 font-sans">{product.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-bold text-brand-navy">{product.price}</span>
                            {hasDiscount && product.originalPriceFormatted && (
                              <span className="text-[10px] text-neutral-400 line-through">
                                {product.originalPriceFormatted}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-auto">
                  <button
                    disabled={validCurrentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl border font-medium transition-colors ${
                        page === validCurrentPage
                          ? 'border-brand-navy bg-brand-navy text-white'
                          : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    disabled={validCurrentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

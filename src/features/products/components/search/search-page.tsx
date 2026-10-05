'use client';

import {
  POPULAR_CATEGORIES,
  POPULAR_SEARCH_KEYWORDS,
} from '@/features/products/constants/header-search';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useSearchHistory } from '@/features/products/hooks/useSearchHistory';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Flame,
  Loader2,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery.trim());
  const inputRef = useRef<HTMLInputElement>(null);

  const { history, addHistory, removeHistory, clearHistory } = useSearchHistory();

  useEffect(() => {
    // Focus input on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Query live product suggestions when user types at least 2 characters
  const shouldFetchLive = debouncedQuery.length >= 2;
  const { products: liveProducts, isLoading: isLiveLoading, meta: liveMeta } = useProducts({
    search: shouldFetchLive ? debouncedQuery : undefined,
    limit: 4,
    enabled: shouldFetchLive,
  });

  const executeSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    addHistory(trimmed);
    window.dispatchEvent(new CustomEvent('fashionai:product-search', { detail: trimmed }));
    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/products');
    }
  };

  const matchingHistory = useMemo(() => {
    if (!debouncedQuery) return [];
    return history
      .filter((item) => item.toLowerCase().includes(debouncedQuery.toLowerCase()) && item.toLowerCase() !== debouncedQuery.toLowerCase())
      .slice(0, 3);
  }, [debouncedQuery, history]);

  return (
    <div className="min-h-screen bg-brand-cream/30">
      {/* Search Bar Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs">
        <div className="max-w-2xl mx-auto px-3.5 py-3 flex items-center gap-2.5 sm:gap-3">
          {/* Back Button */}
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-1 text-neutral-600 hover:text-brand-navy hover:bg-neutral-100 rounded-full transition-colors shrink-0"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Search Input Box */}
          <form onSubmit={handleSubmit} className="flex-1 relative flex items-center">
            <div className="relative w-full flex items-center bg-neutral-100/90 hover:bg-neutral-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-navy/20 border border-neutral-200/90 rounded-full transition-all">
              <Search className="w-4 h-4 text-neutral-400 ml-3.5 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Bạn đang tìm sản phẩm gì?"
                className="w-full bg-transparent py-2.5 pl-2.5 pr-9 text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2.5 p-1 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-200/60 transition-colors"
                  aria-label="Xóa nội dung tìm kiếm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Search Action Button */}
          <button
            type="button"
            onClick={() => executeSearch(query)}
            className="px-4 py-2 bg-brand-navy text-white text-body-sm font-semibold rounded-full hover:bg-brand-navy/90 active:scale-95 transition-all shrink-0 shadow-xs"
          >
            Tìm
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">
        {/* State A: User is typing (Live suggestions & instant matches) */}
        {query.trim().length > 0 ? (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Direct query submit row */}
            <button
              type="button"
              onClick={() => executeSearch(query)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-neutral-50 border border-neutral-200/90 shadow-xs text-left transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center text-brand-navy shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div className="truncate text-body-sm text-neutral-700">
                  Tìm kiếm tất cả: <span className="font-semibold text-brand-navy">&ldquo;{query}&rdquo;</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-navy group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>

            {/* Matching past history keywords */}
            {matchingHistory.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs space-y-2">
                <div className="text-label-sm font-semibold text-neutral-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Từ khóa đã tìm trước đây</span>
                </div>
                <div className="divide-y divide-neutral-100">
                  {matchingHistory.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => executeSearch(item)}
                      className="w-full flex items-center justify-between py-2.5 text-left text-body-sm text-neutral-700 hover:text-brand-navy transition-colors group"
                    >
                      <span className="truncate">{item}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-brand-navy transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Product Suggestions */}
            {shouldFetchLive && (
              <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-label-sm font-semibold text-neutral-900">
                    Sản phẩm gợi ý
                  </h3>
                  {isLiveLoading && (
                    <Loader2 className="w-4 h-4 animate-spin text-brand-navy" />
                  )}
                </div>

                {isLiveLoading && liveProducts.length === 0 ? (
                  <div className="py-6 flex items-center justify-center gap-2 text-body-xs text-neutral-400">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-navy" />
                    <span>Đang tìm kiếm sản phẩm...</span>
                  </div>
                ) : liveProducts.length > 0 ? (
                  <div className="divide-y divide-neutral-100">
                    {liveProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        onClick={() => addHistory(query)}
                        className="flex items-center gap-3 py-2.5 hover:bg-neutral-50 -mx-2 px-2 rounded-xl transition-colors group"
                      >
                        <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-body-sm font-medium text-neutral-900 truncate group-hover:text-brand-navy transition-colors">
                            {product.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-body-xs font-semibold text-[#5D1C34]">
                              {product.price}
                            </span>
                            {product.category && (
                              <span className="text-[11px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                                {product.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-brand-navy group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    ))}

                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => executeSearch(query)}
                        className="w-full py-2.5 px-3 rounded-xl bg-brand-navy/5 hover:bg-brand-navy/10 text-brand-navy text-body-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Xem tất cả {liveMeta.total || liveProducts.length} sản phẩm phù hợp</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-body-xs text-neutral-500">
                    Không tìm thấy sản phẩm gợi ý nào cho &ldquo;{query}&rdquo;.
                    <br />
                    <button
                      type="button"
                      onClick={() => executeSearch(query)}
                      className="mt-2 text-[#5D1C34] font-semibold underline underline-offset-4"
                    >
                      Bấm vào đây để tìm toàn bộ kho
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* State B: User has not typed anything (History, Trending, Categories) */
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Section 1: Lịch sử tìm kiếm (Shopee/Uniqlo style) */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2 text-label-md font-semibold text-neutral-900">
                    <Clock className="w-4 h-4 text-neutral-500" />
                    <span>Lịch sử tìm kiếm</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="text-body-xs font-medium text-[#5D1C34] hover:text-[#5D1C34]/80 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa tất cả</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-3">
                  {history.map((term) => (
                    <div
                      key={term}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-body-sm text-neutral-700 transition-colors group cursor-pointer"
                      onClick={() => executeSearch(term)}
                    >
                      <span className="truncate max-w-[180px]">{term}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistory(term);
                        }}
                        className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded-full hover:bg-neutral-300/60 transition-colors"
                        aria-label={`Xóa "${term}" khỏi lịch sử`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Tìm kiếm phổ biến / Xu hướng (Shopee/Uniqlo style) */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 text-label-md font-semibold text-neutral-900">
                <TrendingUp className="w-4 h-4 text-[#5D1C34]" />
                <span>Tìm kiếm phổ biến</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-3">
                {POPULAR_SEARCH_KEYWORDS.map((keyword, index) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => executeSearch(keyword)}
                    className="px-3.5 py-1.5 rounded-full bg-neutral-50 hover:bg-brand-navy/5 border border-neutral-200 hover:border-brand-navy/30 text-body-sm text-neutral-700 hover:text-brand-navy transition-all shadow-2xs flex items-center gap-1.5"
                  >
                    {index < 3 && <Flame className="w-3.5 h-3.5 text-semantic-error" />}
                    <span>{keyword}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Danh mục nổi bật */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 text-label-md font-semibold text-neutral-900">
                <Sparkles className="w-4 h-4 text-brand-navy" />
                <span>Khám phá theo danh mục</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3">
                {POPULAR_CATEGORIES.map((category) => (
                  <Link
                    key={category.label}
                    href={category.href || `/products?garmentType=${category.garmentType}`}
                    className="p-3 rounded-xl bg-neutral-50 hover:bg-brand-navy/5 border border-neutral-200/80 hover:border-brand-navy/30 transition-all group block"
                  >
                    <div className="font-semibold text-body-sm text-neutral-900 group-hover:text-brand-navy transition-colors truncate">
                      {category.label}
                    </div>
                    {category.subTitle && (
                      <div className="text-[11px] text-neutral-500 mt-0.5 truncate">
                        {category.subTitle}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

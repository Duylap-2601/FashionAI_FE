'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ShoppingBag, Eye, Star, ChevronRight } from 'lucide-react';
import { Product } from '@/lib/data';
import { useCart } from '@/store/cartStore';
import { toast } from 'sonner';

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  badge?: string;
  viewAllLink?: string;
  showCategories?: boolean;
}

export function ProductGrid({
  products,
  title = 'SẢN PHẨM NỔI BẬT',
  subtitle = 'Các thiết kế được yêu thích nhất trong tuần',
  badge = 'BÁN CHẠY',
  viewAllLink = '/products',
  showCategories = true,
}: ProductGridProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const categories = ['Tất cả', 'Blazer', 'Suit', 'Áo sơ mi', 'Quần tây', 'Chân váy'];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'Tất cả') return true;
    return p.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      variant: product.colors?.[0]?.name || 'Tiêu chuẩn',
      price: product.numericPrice,
      quantity: 1,
      image: product.image,
      color: product.colors?.[0]?.name,
    });
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const handleTryOn = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/try-on?productId=${product.id}`);
  };

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            {badge && (
              <span className="text-[11px] font-bold text-brand-gold uppercase tracking-[0.18em] block mb-2">
                {badge}
              </span>
            )}
            <h2 className="text-[26px] md:text-[34px] font-bold text-neutral-900 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-body-sm text-neutral-500 mt-1">{subtitle}</p>
            )}
          </div>

          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="flex items-center gap-1.5 text-body-sm font-semibold text-[#5D1C34] hover:text-[#7A2445] transition-colors self-start md:self-auto"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Category filter pills */}
        {showCategories && (
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 h-9 px-5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#5D1C34] text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* 5-Column Responsive Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
            <p className="text-neutral-500 text-body-md">Không tìm thấy sản phẩm phù hợp trong danh mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-4 md:gap-5">
            {filteredProducts.map((product) => {
              const hasSecondImage = product.gallery && product.gallery.length > 1;
              const isHovered = hoveredId === product.id;
              const displayImage = isHovered && hasSecondImage ? product.gallery[1] : product.image;
              const isOutOfStock = product.stock === 0;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-white rounded-xl overflow-hidden border border-neutral-200/80 hover:border-neutral-300 hover:shadow-xl transition-all duration-300 relative"
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                    <Link href={`/products/${product.id}`} className="block w-full h-full">
                      <img
                        src={displayImage}
                        alt={product.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>

                    {/* Stock / Sale Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 bg-neutral-800/90 text-white text-[10px] font-bold uppercase rounded tracking-wide">
                          Hết hàng
                        </span>
                      ) : product.originalPrice && product.numericPrice < product.originalPrice ? (
                        <span className="px-2 py-0.5 bg-semantic-error text-white text-[10px] font-bold uppercase rounded tracking-wide">
                          -{Math.round(((product.originalPrice - product.numericPrice) / product.originalPrice) * 100)}%
                        </span>
                      ) : product.isNew ? (
                        <span className="px-2 py-0.5 bg-brand-navy text-white text-[10px] font-bold uppercase rounded tracking-wide">
                          NEW
                        </span>
                      ) : null}
                    </div>

                    {/* Hover Floating Actions */}
                    <div className="absolute inset-x-2 bottom-2.5 flex flex-col gap-1.5 opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-200 z-20">
                      <button
                        onClick={(e) => handleTryOn(product, e)}
                        className="w-full h-9 bg-white/95 backdrop-blur-sm text-[#5D1C34] hover:bg-[#5D1C34] hover:text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                        title="Thử đồ trên ảnh của bạn"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                          <span className="max-[360px]:hidden">Thử đồ AI</span>
                      </button>

                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => handleQuickAdd(product, e)}
                          disabled={isOutOfStock}
                          className="flex-1 h-8 bg-neutral-900/90 hover:bg-neutral-900 text-white rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span className="max-[360px]:hidden">Thêm giỏ</span>
                        </button>
                        <Link
                          href={`/products/${product.id}`}
                          className="w-8 h-8 bg-white/90 hover:bg-white text-neutral-800 rounded-lg flex items-center justify-center transition-colors shadow-xs"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Product Metadata */}
                  <div className="flex flex-col flex-1 p-3 sm:p-3.5">
                    {/* Brand */}
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 truncate">
                      {product.brand || 'StAle. SIGNATURE'}
                    </span>

                    {/* Name */}
                    <Link
                      href={`/products/${product.id}`}
                      className="text-body-sm font-semibold text-neutral-900 hover:text-[#5D1C34] line-clamp-2 leading-snug mb-2 transition-colors flex-1"
                    >
                      {product.name}
                    </Link>

                    {/* Price & Rating */}
                    <div className="flex items-baseline justify-between gap-1 mt-auto">
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-body-sm font-bold text-[#5D1C34]">
                          {product.price}
                        </span>
                        {product.originalPriceFormatted && (
                          <span className="text-[11px] text-neutral-400 line-through">
                            {product.originalPriceFormatted}
                          </span>
                        )}
                      </div>

                      {product.rating && (
                        <div className="flex items-center gap-0.5 text-[11px] text-amber-600 shrink-0 font-medium">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{product.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

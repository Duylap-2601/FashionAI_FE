'use client';

import { useCollectionProducts, usePublishedCollections } from '@/features/collections/hooks/useCollections';
import { AiTryOnFeatureBanner } from '@/features/home/components/AiTryOnFeatureBanner';
import { CollectionCarousel } from '@/features/home/components/CollectionCarousel';
import { EditorialLookbook } from '@/features/home/components/EditorialLookbook';
import { HeroBanner } from '@/features/home/components/HeroBanner';
import { NewsletterBar } from '@/features/home/components/NewsletterBar';
import { ProductGrid } from '@/features/home/components/ProductGrid';
import { SaleBannerText } from '@/features/home/components/SaleBannerText';
import { PRODUCTS } from '@/features/products/constants/products';
import type { Product } from '@/features/products/types/products';
import { useProductCatalog } from '@/features/products/hooks/useProducts';
import { useMemo, useState } from 'react';

function getTrendingScore(product: Product): number {
  let score = 0;
  // 1. Tiêu chí cao nhất: Số lượt đánh giá từ khách hàng
  if (product.reviewCount && product.reviewCount > 0) {
    score += product.reviewCount * 50;
  }
  // 2. Điểm đánh giá trung bình
  if (product.rating && product.rating > 0) {
    score += product.rating * 10;
  }
  // 3. Số lượt bán (nếu có)
  if (product.soldCount && product.soldCount > 0) {
    score += product.soldCount * 20;
  }
  // 4. Fallback khi các chỉ số đều bằng nhau (như khi chưa có review):
  // Ưu tiên các dòng trang phục chủ đạo, thiết kế cao cấp của thương hiệu StAle
  const nameLower = product.name.toLowerCase();
  const garmentType = product.garmentType || '';
  if (nameLower.includes('blazer') || garmentType === 'JACKET') score += 15;
  if (nameLower.includes('vest') || garmentType === 'VEST') score += 12;
  if (nameLower.includes('đầm') || garmentType === 'DRESS') score += 10;
  if (nameLower.includes('combo')) score += 8;

  return score;
}

export function LandingPageClient() {
  const { products: apiProducts } = useProductCatalog();
  const { collections } = usePublishedCollections();

  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const selectedCollection =
    collections.find((c) => c.id === selectedCollectionId) ||
    collections[0] ||
    null;

  const {
    products: backendCollectionProducts,
  } = useCollectionProducts(selectedCollection?.id);

  const displayProducts = apiProducts && apiProducts.length > 0 ? apiProducts : PRODUCTS;

  const collectionProducts =
    backendCollectionProducts.length > 0
      ? backendCollectionProducts
      : selectedCollection?.productIds && selectedCollection.productIds.length > 0
        ? displayProducts.filter((p: Product) => selectedCollection.productIds?.includes(p.id))
        : displayProducts;

  // Lọc và sắp xếp Top Trending dựa trên lượt đánh giá và chỉ lấy Top 8 sản phẩm
  const bestSellers = useMemo(() => {
    return [...displayProducts]
      .sort((a, b) => getTrendingScore(b) - getTrendingScore(a))
      .slice(0, 8);
  }, [displayProducts]);

  return (
    <main className="flex-1 overflow-x-hidden bg-white text-neutral-900 selection:bg-[#5D1C34] selection:text-white">
      <HeroBanner collections={collections} />

        <CollectionCarousel
          collections={collections}
          selectedCollectionId={selectedCollection?.id}
          onSelectCollection={(col) => {
            setSelectedCollectionId(col.id);
            const el = document.getElementById('featured-products');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <SaleBannerText />

        <div id="featured-products">
          <ProductGrid
            products={collectionProducts.length > 0 ? collectionProducts : displayProducts}
            title={selectedCollection ? `THIẾT KẾ: ${selectedCollection.name.toUpperCase()}` : 'SẢN PHẨM MỚI NHẤT'}
            subtitle={selectedCollection?.tagline || 'Chuẩn dáng từ đầu, đẹp từng đường may'}
            badge="BỘ SƯU TẬP"
            viewAllLink="/products"
            showCategories={true}
          />
        </div>

        <EditorialLookbook
          images={selectedCollection?.lookbookImages || selectedCollection?.coverImages}
          collection={selectedCollection}
        />

        <ProductGrid
          products={bestSellers}
          title="SẢN PHẨM BÁN CHẠY NHẤT"
          subtitle="Được khách hàng và stylist tin chọn nhiều nhất trong tháng"
          badge="TOP TRENDING"
          viewAllLink="/products"
          showCategories={false}
        />

        <AiTryOnFeatureBanner />

      <NewsletterBar />
    </main>
  );
}

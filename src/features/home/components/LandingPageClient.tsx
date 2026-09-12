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
import { useProducts } from '@/features/products/hooks/useProducts';
import { useState } from 'react';

export function LandingPageClient() {
  const { products: apiProducts } = useProducts();
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
        ? displayProducts.filter((p) => selectedCollection.productIds?.includes(p.id))
        : displayProducts;

  const bestSellers = [...displayProducts].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));

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

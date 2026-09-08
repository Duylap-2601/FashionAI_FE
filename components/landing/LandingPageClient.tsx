'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnnouncementBar } from '@/components/landing/AnnouncementBar';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroBanner } from '@/components/landing/HeroBanner';
import { CollectionCarousel } from '@/components/landing/CollectionCarousel';
import { SaleBannerText } from '@/components/landing/SaleBannerText';
import { ProductGrid } from '@/components/landing/ProductGrid';
import { EditorialLookbook } from '@/components/landing/EditorialLookbook';
import { AiTryOnFeatureBanner } from '@/components/landing/AiTryOnFeatureBanner';
import { NewsletterBar } from '@/components/landing/NewsletterBar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FloatingChat } from '@/components/chat/FloatingChat';
import { CartSlideOver } from '@/components/cart/CartSlideOver';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { useCart } from '@/store/cartStore';
import { useProducts } from '@/hooks/useProducts';
import { usePublishedCollections, useCollectionProducts } from '@/hooks/useCollections';
import { PRODUCTS } from '@/lib/data';

export function LandingPageClient() {
  const pathname = usePathname();
  const { isCartOpen, setIsCartOpen } = useCart();
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
    <div className="min-h-screen overflow-x-hidden flex flex-col bg-white text-neutral-900 selection:bg-[#5D1C34] selection:text-white">
      <AnnouncementBar />

      <LandingHeader collections={collections} />

      <main className="flex-1">
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

      <LandingFooter />

      <FloatingChat />

      <CartSlideOver isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <BottomTabBar pathname={pathname} />
    </div>
  );
}

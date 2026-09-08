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

export default function LandingPage() {
  const pathname = usePathname();
  const { isCartOpen, setIsCartOpen } = useCart();
  const { products: apiProducts } = useProducts();
  const { collections } = usePublishedCollections();

  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  // Active collection (default to first published collection)
  const selectedCollection =
    collections.find((c) => c.id === selectedCollectionId) ||
    collections[0] ||
    null;

  // Real backend products for the selected collection
  const {
    products: backendCollectionProducts,
  } = useCollectionProducts(selectedCollection?.id);

  // Use real products from backend if available, fallback to local PRODUCTS
  const displayProducts = apiProducts && apiProducts.length > 0 ? apiProducts : PRODUCTS;

  // Prioritize real backend collection products; fallback to productIds filter, then all products
  const collectionProducts =
    backendCollectionProducts.length > 0
      ? backendCollectionProducts
      : selectedCollection?.productIds && selectedCollection.productIds.length > 0
      ? displayProducts.filter((p) => selectedCollection.productIds?.includes(p.id))
      : displayProducts;

  // Best sellers: sort by soldCount or reverse
  const bestSellers = [...displayProducts].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col bg-white text-neutral-900 selection:bg-[#5D1C34] selection:text-white">
      {/* 1. Announcement Bar (Top) */}
      <AnnouncementBar />

      {/* 2. Navigation Header */}
      <LandingHeader collections={collections} />

      <main className="flex-1">
        {/* 3. Hero 3-Panel Editorial Carousel */}
        <HeroBanner collections={collections} />

        {/* 4. Horizontal Collections Carousel with "XEM NGAY" */}
        <CollectionCarousel
          collections={collections}
          selectedCollectionId={selectedCollection?.id}
          onSelectCollection={(col) => {
            setSelectedCollectionId(col.id);
            const el = document.getElementById('featured-products');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 5. Typography Sale & Promo Banner */}
        <SaleBannerText />

        {/* 6. First 5-Column Product Grid (Featured / Active Collection) */}
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

        {/* 7. Editorial Lookbook (3 Full-Bleed Photos) */}
        <EditorialLookbook
          images={selectedCollection?.lookbookImages || selectedCollection?.coverImages}
        />

        {/* 8. Second 5-Column Product Grid (Best Sellers) */}
        <ProductGrid
          products={bestSellers}
          title="SẢN PHẨM BÁN CHẠY NHẤT"
          subtitle="Được khách hàng và stylist tin chọn nhiều nhất trong tháng"
          badge="TOP TRENDING"
          viewAllLink="/products"
          showCategories={false}
        />

        {/* 9. AI Virtual Try-On Highlight Banner */}
        <AiTryOnFeatureBanner />

        {/* 10. Newsletter Signup & Hotline Support */}
        <NewsletterBar />
      </main>

      {/* 11. Footer (4 Columns) */}
      <LandingFooter />

      {/* Global AI Chatbot Floating Trigger */}
      <FloatingChat />

      {/* Global Slide-Over Cart */}
      <CartSlideOver isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <BottomTabBar pathname={pathname} />
    </div>
  );
}

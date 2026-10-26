'use client';

import { useCollectionProducts, usePublishedCollections } from '@/features/collections/hooks/useCollections';
import { AiStylistCapsule } from '@/features/home/components/AiStylistCapsule';
import { AiTryOnFeatureBanner } from '@/features/home/components/AiTryOnFeatureBanner';
import { CollectionCarousel } from '@/features/home/components/CollectionCarousel';
import { EditorialLookbook } from '@/features/home/components/EditorialLookbook';
import { HeroBanner } from '@/features/home/components/HeroBanner';
import { ProductGrid } from '@/features/home/components/ProductGrid';
import type { Product } from '@/features/products/types/products';
import { useProductCatalog } from '@/features/products/hooks/useProducts';
import { useState } from 'react';

export function LandingPageClient() {
  const { products: apiProducts } = useProductCatalog();
  const { collections } = usePublishedCollections();

  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const selectedCollection =
    collections.find((collection) => collection.id === selectedCollectionId)
    || collections[0]
    || null;

  const { products: backendCollectionProducts, isLoading: collectionProductsLoading } = useCollectionProducts(selectedCollection?.id);

  const displayProducts = apiProducts;

  const collectionProducts =
    backendCollectionProducts.length > 0
      ? backendCollectionProducts
      : selectedCollection?.productIds && selectedCollection.productIds.length > 0
        ? displayProducts.filter((product: Product) => selectedCollection.productIds?.includes(product.id))
        : collectionProductsLoading
          ? displayProducts
          : selectedCollection
            ? []
            : displayProducts;

  const capsuleSource = collectionProducts.length >= 3 ? collectionProducts : displayProducts;
  const capsuleProducts = capsuleSource.slice(0, 3);

  return (
    <main className="flex-1 overflow-x-hidden bg-landing-paper text-landing-obsidian selection:bg-landing-oxblood selection:text-landing-paper">
      <HeroBanner />

      <CollectionCarousel
        collections={collections}
        selectedCollectionId={selectedCollection?.id}
        onSelectCollection={(collection) => {
          setSelectedCollectionId(collection.id);
          const element = document.getElementById('featured-products');
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <div id="featured-products" className="scroll-mt-24">
        <ProductGrid
          products={collectionProducts.length > 0 ? collectionProducts : displayProducts}
          title={selectedCollection?.name || 'Sản phẩm tiêu biểu'}
          subtitle={selectedCollection?.tagline || 'Chuẩn dáng từ đầu, đẹp từng đường may.'}
          badge="Sản phẩm"
          viewAllLink="/products"
          showCategories
        />
      </div>

      <EditorialLookbook
        images={selectedCollection?.lookbookImages || selectedCollection?.coverImages}
        collection={selectedCollection}
      />

      <AiTryOnFeatureBanner products={capsuleSource} />

      <AiStylistCapsule products={capsuleProducts} />

    </main>
  );
}

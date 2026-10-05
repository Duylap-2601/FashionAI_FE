import SearchPage from '@/features/products/components/search/search-page';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Tìm kiếm sản phẩm | FashionAI',
  description: 'Tìm kiếm nhanh các sản phẩm thời trang cao cấp tại FashionAI',
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-cream/30 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchPage />
    </Suspense>
  );
}

import { StaggerContainer, StaggerItem } from '@/components/ui/AnimateIn';
import { ProductCard } from '@/features/products/components/listing/ProductCard';
import type { ProductListProps } from '@/features/products/types/product-list';
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2, MoreHorizontal } from 'lucide-react';

function ProductSkeletonGrid({ isSidebarOpen }: { isSidebarOpen: boolean }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${isSidebarOpen ? 'xl:grid-cols-5' : 'xl:grid-cols-6'} gap-2.5 md:gap-3 mb-12`}>
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
  );
}

function EmptyProducts({ onClearAll }: { onClearAll: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <h3 className="text-[20px] font-bold text-brand-navy mb-2 tracking-tight">Không tìm thấy sản phẩm phù hợp</h3>
      <p className="text-body-md text-neutral-500 mb-8 max-w-[320px]">Thử bỏ một vài bộ lọc để xem thêm sản phẩm.</p>
      <button onClick={onClearAll} className="px-6 py-3 border border-neutral-200 text-neutral-700 text-body-sm font-medium rounded-xl hover:bg-neutral-50 transition-colors">
        Xóa tất cả bộ lọc
      </button>
    </div>
  );
}

function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
  const items: Array<number | 'ellipsis'> = [];

  sortedPages.forEach((page, index) => {
    const previous = sortedPages[index - 1];
    if (previous && page - previous > 1) items.push('ellipsis');
    items.push(page);
  });

  return items;
}

function ProductPagination({
  currentPage,
  totalPages,
  isFetching,
  onPageChange,
}: Pick<ProductListProps, 'currentPage' | 'totalPages' | 'isFetching' | 'onPageChange'>) {
  if (totalPages <= 1) return null;

  return (
    <div className="hidden md:flex items-center justify-center gap-2 pb-4">
      <button
        disabled={currentPage <= 1 || isFetching}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Trang trước"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPaginationItems(currentPage, totalPages).map((item, index) => (
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="w-10 h-10 inline-flex items-center justify-center text-neutral-400">
            <MoreHorizontal className="w-4 h-4" />
          </span>
        ) : (
          <button
            key={item}
            disabled={isFetching}
            onClick={() => onPageChange(item)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border font-medium transition-colors ${
              item === currentPage
                ? 'border-brand-navy bg-brand-navy text-white'
                : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            } disabled:cursor-wait disabled:opacity-70`}
          >
            {item}
          </button>
        )
      ))}

      <button
        disabled={currentPage >= totalPages || isFetching}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Trang sau"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ProductList({
  apiProductsLength,
  isError,
  isLoading,
  isFetching,
  isFetchingNextPage,
  isMobile,
  isSidebarOpen,
  products,
  totalCount,
  hasMoreProducts,
  currentPage,
  totalPages,
  loadMoreRef,
  isPinned,
  onRetry,
  onClearAll,
  onLoadMore,
  onPageChange,
  onToggleRack,
  onAddToCart,
}: ProductListProps) {
  return (
    <>
      {isError && apiProductsLength === 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-body-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>Không thể tải sản phẩm mới nhất, đang hiển thị dữ liệu dự phòng.</span>
          <button onClick={onRetry} className="ml-auto shrink-0 text-amber-700 font-semibold underline hover:no-underline">
            Thử lại
          </button>
        </div>
      )}

      {isLoading && apiProductsLength === 0 ? (
        <ProductSkeletonGrid isSidebarOpen={isSidebarOpen} />
      ) : products.length === 0 ? (
        <EmptyProducts onClearAll={onClearAll} />
      ) : (
        <>
          <StaggerContainer
            animateOnMount
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${isSidebarOpen ? 'xl:grid-cols-5' : 'xl:grid-cols-6'} gap-2.5 md:gap-3 mb-12 transition-all duration-300`}
          >
            {products.map(product => (
              <StaggerItem key={product.id} className="group">
                <ProductCard
                  product={product}
                  pinned={isPinned(product.id)}
                  onToggleRack={onToggleRack}
                  onAddToCart={onAddToCart}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>

          {isMobile && hasMoreProducts ? (
            <div ref={loadMoreRef} className="flex flex-col items-center justify-center gap-3 pb-4">
              <div className="flex items-center gap-2 text-body-sm font-medium text-neutral-500">
                {isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin text-[#5D1C34]" />}
                {isFetchingNextPage ? 'Đang tải thêm sản phẩm...' : `Đã hiển thị ${products.length}/${totalCount} sản phẩm`}
              </div>
              <button onClick={onLoadMore} disabled={isFetchingNextPage} className="px-5 py-2.5 rounded-full border border-neutral-200 text-body-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors disabled:cursor-wait disabled:opacity-60">
                Xem thêm
              </button>
            </div>
          ) : null}

          {!isMobile && (
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              isFetching={isFetching}
              onPageChange={onPageChange}
            />
          )}

          {isMobile && !hasMoreProducts && (
            <div className="pb-4 text-center text-[12px] font-medium text-neutral-400">
              Đã hiển thị tất cả {totalCount} sản phẩm
            </div>
          )}
        </>
      )}
    </>
  );
}

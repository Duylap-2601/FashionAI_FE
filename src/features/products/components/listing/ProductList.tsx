import { cn } from '@/components/ui/utils';
import { ProductCard } from '@/features/products/components/listing/ProductCard';
import type { ProductListProps } from '@/features/products/types/product-list';
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';
const labelText = 'text-[11px] font-semibold uppercase tracking-[0.16em]';

// Bốn cột khi đóng bộ lọc; sidebar chiếm chỗ nên lưới lùi một cột ở md và lg.
function productGridClassName(isSidebarOpen: boolean) {
  return cn(
    'grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-4 md:gap-y-12 lg:gap-x-6',
    isSidebarOpen ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4',
  );
}

function ProductSkeletonGrid({ isSidebarOpen }: { isSidebarOpen: boolean }) {
  return (
    <div className={cn(productGridClassName(isSidebarOpen), 'mb-12')} aria-hidden="true">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex flex-col motion-safe:animate-pulse">
          <div className="aspect-[3/4] bg-landing-taupe/45" />
          <div className="flex flex-col gap-2.5 pt-4">
            <div className="h-2.5 w-16 bg-landing-taupe/45" />
            <div className="h-4 w-3/4 bg-landing-taupe/45" />
            <div className="mt-3 h-3 w-1/2 bg-landing-taupe/45" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyProducts({ onClearAll }: { onClearAll: () => void }) {
  return (
    <div className="mb-12 flex flex-col items-center border border-landing-line/70 bg-landing-ivory px-6 py-16 text-center md:py-24">
      <p className="max-w-md font-display text-xl leading-snug text-landing-obsidian md:text-2xl">
        Chưa có thiết kế nào khớp với bộ lọc này.
      </p>
      <button
        type="button"
        onClick={onClearAll}
        className={cn('mt-8 h-11 rounded-[2px] bg-landing-obsidian px-6 text-landing-paper transition-colors hover:bg-landing-oxblood', labelText, focusRing)}
      >
        Xoá bộ lọc
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

  const stepButton = cn(
    'inline-flex h-11 items-center gap-2 px-2 text-landing-obsidian transition-colors hover:text-landing-oxblood disabled:cursor-not-allowed disabled:text-landing-muted disabled:opacity-50',
    labelText,
    focusRing,
  );

  return (
    <nav aria-label="Phân trang" className="mb-4 flex items-center justify-between gap-4 border-t border-landing-line/70 pt-6">
      <button
        type="button"
        disabled={currentPage <= 1 || isFetching}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className={stepButton}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Trang trước
      </button>

      <ol className="flex items-center gap-1">
        {getPaginationItems(currentPage, totalPages).map((item, index) => (
          <li key={item === 'ellipsis' ? `ellipsis-${index}` : item}>
            {item === 'ellipsis' ? (
              <span aria-hidden="true" className="inline-flex h-11 w-8 items-center justify-center font-mono text-[13px] text-landing-muted">
                …
              </span>
            ) : (
              <button
                type="button"
                disabled={isFetching}
                onClick={() => onPageChange(item)}
                aria-current={item === currentPage ? 'page' : undefined}
                aria-label={`Trang ${item}`}
                className={cn(
                  'inline-flex h-11 w-11 items-center justify-center rounded-[2px] font-mono text-[13px] transition-colors disabled:cursor-wait',
                  item === currentPage
                    ? 'bg-landing-oxblood text-landing-paper'
                    : 'text-landing-muted hover:bg-landing-ivory hover:text-landing-obsidian',
                  focusRing,
                )}
              >
                {String(item).padStart(2, '0')}
              </button>
            )}
          </li>
        ))}
      </ol>

      <button
        type="button"
        disabled={currentPage >= totalPages || isFetching}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className={stepButton}
      >
        Trang sau
        <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </nav>
  );
}

function LoadMore({
  shownCount,
  totalCount,
  isFetchingNextPage,
  loadMoreRef,
  onLoadMore,
}: {
  shownCount: number;
  totalCount: number;
  isFetchingNextPage?: boolean;
  loadMoreRef: ProductListProps['loadMoreRef'];
  onLoadMore: () => void;
}) {
  const progress = totalCount > 0 ? Math.min(100, Math.round((shownCount / totalCount) * 100)) : 0;

  return (
    <div ref={loadMoreRef} className="mb-4 flex flex-col items-center gap-4 border-t border-landing-line/70 pt-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-landing-muted" aria-live="polite">
        {isFetchingNextPage ? 'Đang tải thêm' : (
          <>
            <span className="text-landing-obsidian">{shownCount}</span> / {totalCount} sản phẩm
          </>
        )}
      </p>
      <div aria-hidden="true" className="h-px w-40 bg-landing-line">
        <div className="h-px bg-landing-oxblood transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>
      <button
        type="button"
        onClick={onLoadMore}
        disabled={isFetchingNextPage}
        className={cn('inline-flex h-11 items-center gap-2 rounded-[2px] border border-landing-obsidian/70 px-8 text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood disabled:cursor-wait disabled:opacity-60', labelText, focusRing)}
      >
        {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : null}
        Xem thêm
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
  onRetry,
  onClearAll,
  onLoadMore,
  onPageChange,
  onAddToCart,
}: ProductListProps) {
  return (
    <>
      {isError && apiProductsLength === 0 ? (
        <div role="status" className="mb-8 flex items-center gap-3 border border-landing-line bg-landing-ivory px-4 py-3 text-sm text-landing-obsidian">
          <AlertTriangle className="h-4 w-4 shrink-0 text-landing-oxblood" strokeWidth={1.75} />
          <span className="min-w-0">Chưa tải được danh mục mới nhất, đang hiển thị dữ liệu dự phòng.</span>
          <button
            type="button"
            onClick={onRetry}
            className={cn('ml-auto shrink-0 text-landing-oxblood underline underline-offset-4 hover:no-underline', labelText, focusRing)}
          >
            Thử lại
          </button>
        </div>
      ) : null}

      {isLoading && apiProductsLength === 0 ? (
        <ProductSkeletonGrid isSidebarOpen={isSidebarOpen} />
      ) : products.length === 0 ? (
        <EmptyProducts onClearAll={onClearAll} />
      ) : (
        <>
          <div className={cn(productGridClassName(isSidebarOpen), 'mb-14')}>
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                imagePriority={index < 4}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>

          {isMobile && hasMoreProducts ? (
            <LoadMore
              shownCount={products.length}
              totalCount={totalCount}
              isFetchingNextPage={isFetchingNextPage}
              loadMoreRef={loadMoreRef}
              onLoadMore={onLoadMore}
            />
          ) : null}

          {isMobile && !hasMoreProducts ? (
            <p className="mb-4 border-t border-landing-line/70 pt-8 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-landing-muted">
              Đã xem hết {totalCount} sản phẩm
            </p>
          ) : null}

          {!isMobile ? (
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              isFetching={isFetching}
              onPageChange={onPageChange}
            />
          ) : null}
        </>
      )}
    </>
  );
}

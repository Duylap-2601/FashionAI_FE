import Link from 'next/link';

export function ProductDetailSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-landing-paper">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8">
        <div className="h-3 w-56 bg-landing-taupe/45 motion-safe:animate-pulse" />
      </div>
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-4 pb-24 md:grid-cols-[55%_1fr] md:px-8 lg:gap-16">
        <div className="flex flex-col gap-3">
          <div className="aspect-[3/4] w-full max-w-[560px] bg-landing-taupe/45 motion-safe:animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[110px] w-[82px] bg-landing-taupe/45 motion-safe:animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-5 border border-landing-line bg-landing-ivory p-5 motion-safe:animate-pulse md:p-7">
          <div className="h-3 w-32 bg-landing-taupe/45" />
          <div className="h-10 w-3/4 bg-landing-taupe/45" />
          <div className="h-7 w-36 bg-landing-taupe/45" />
          <div className="my-2 h-px w-full bg-landing-line" />
          <div className="h-12 w-full bg-landing-taupe/45" />
          <div className="h-12 w-full bg-landing-taupe/45" />
        </div>
      </div>
    </div>
  );
}

export function ProductNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-landing-paper px-4 text-center">
      <div className="flex w-full max-w-[560px] flex-col items-center border border-landing-line bg-landing-ivory px-6 py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink">Không tìm thấy</p>
        <h1 className="mt-2 font-display text-landing-h2 text-landing-obsidian">Sản phẩm này không còn trong bộ sưu tập</h1>
        <p className="mt-3 max-w-[420px] text-sm leading-relaxed text-landing-muted">
          Sản phẩm bạn đang tìm kiếm có thể đã ngừng kinh doanh hoặc đường dẫn không tồn tại.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-[2px] bg-landing-oxblood px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-paper transition-colors hover:bg-landing-obsidian focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
        >
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    </div>
  );
}

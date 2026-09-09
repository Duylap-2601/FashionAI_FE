import Link from 'next/link';

export function ProductDetailSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 py-6">
        <div className="h-4 w-48 bg-neutral-100 rounded animate-pulse" />
      </div>
      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 pb-16 grid grid-cols-1 md:grid-cols-[55%_1fr] gap-12">
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="w-full aspect-[3/4] md:max-w-[560px] bg-neutral-100 rounded-2xl" />
          <div className="flex gap-2.5">
            {[1, 2, 3].map(i => <div key={i} className="w-[82px] h-[110px] bg-neutral-100 rounded-xl" />)}
          </div>
        </div>
        <div className="flex flex-col space-y-5 animate-pulse">
          <div className="h-3 w-32 bg-neutral-100 rounded" />
          <div className="h-9 w-3/4 bg-neutral-100 rounded-lg" />
          <div className="h-7 w-36 bg-neutral-100 rounded-md" />
          <div className="w-full h-px bg-neutral-100 my-4" />
          <div className="h-14 w-full bg-neutral-100 rounded-xl" />
          <div className="h-14 w-full bg-neutral-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-[22px] font-bold text-brand-navy mb-2">Không tìm thấy sản phẩm</h2>
      <p className="text-neutral-500 mb-6 text-body-md max-w-[420px]">
        Sản phẩm bạn đang tìm kiếm có thể đã ngừng kinh doanh hoặc đường dẫn không tồn tại.
      </p>
      <Link href="/products" className="px-6 py-3 bg-[#5D1C34] text-white font-semibold rounded-xl hover:bg-[#4A1629] transition-all shadow-md cursor-pointer">
        Quay lại danh sách sản phẩm
      </Link>
    </div>
  );
}

'use client';

/** Khung chờ cùng bố cục với kết quả để trang không nhảy khi kết quả về. */
export function StylistResultSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Đang tạo bộ phối">
      <div className="h-6 w-52 bg-landing-taupe/45 motion-safe:animate-pulse" />
      <div className="-mx-4 flex gap-4 overflow-hidden px-4 md:mx-0 md:grid md:grid-cols-2 md:px-0 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-[84%] shrink-0 overflow-hidden rounded-[2px] border border-landing-line bg-landing-ivory sm:w-[58%] md:w-auto">
            <div className="h-60 bg-landing-taupe/35 motion-safe:animate-pulse" />
            <div className="flex flex-col gap-2.5 p-4">
              <div className="h-4 w-2/3 bg-landing-taupe/45 motion-safe:animate-pulse" />
              <div className="h-3 w-full bg-landing-taupe/35 motion-safe:animate-pulse" />
              <div className="h-3 w-4/5 bg-landing-taupe/35 motion-safe:animate-pulse" />
              <div className="mt-3 h-10 bg-landing-taupe/35 motion-safe:animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

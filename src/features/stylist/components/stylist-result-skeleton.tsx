'use client';

/** Khung chờ cùng bố cục với kết quả để trang không nhảy khi kết quả về. */
export function StylistResultSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Đang tạo bộ phối">
      <div className="h-5 w-44 rounded-full bg-neutral-200/70 animate-pulse" />
      <div className="flex gap-4 overflow-hidden -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="shrink-0 w-[84%] sm:w-[58%] md:w-auto rounded-2xl border border-neutral-200/80 bg-white overflow-hidden">
            <div className="h-52 bg-neutral-100 animate-pulse" />
            <div className="p-4 flex flex-col gap-2.5">
              <div className="h-4 w-2/3 rounded-full bg-neutral-100 animate-pulse" />
              <div className="h-3 w-full rounded-full bg-neutral-100 animate-pulse" />
              <div className="h-3 w-4/5 rounded-full bg-neutral-100 animate-pulse" />
              <div className="mt-3 h-10 rounded-xl bg-neutral-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

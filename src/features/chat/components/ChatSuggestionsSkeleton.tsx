'use client';

import { Sparkles } from 'lucide-react';

/** Khung chờ thẻ sản phẩm: hiện ngay khi AI viết xong chữ, trong lúc BE chọn sản phẩm. */
export function ChatSuggestionsSkeleton() {
  return (
    <div className="w-full min-w-0" aria-busy="true" aria-label="Đang chọn sản phẩm">
      <p className="mb-2 flex items-center gap-1.5 px-1 text-xs text-landing-muted" role="status">
        <Sparkles className="h-3.5 w-3.5 text-landing-oxblood motion-safe:animate-pulse" strokeWidth={1.75} /> Đang chọn sản phẩm phù hợp…
      </p>
      <div className="flex gap-3 overflow-hidden">
        {[0, 1].map((i) => (
          <div key={i} className="w-[256px] shrink-0 overflow-hidden rounded-[2px] border border-landing-line bg-landing-ivory sm:w-[272px]">
            <div className="h-48 bg-landing-taupe/35 motion-safe:animate-pulse" />
            <div className="flex flex-col gap-2 p-3.5">
              <div className="h-4 w-2/3 bg-landing-taupe/45 motion-safe:animate-pulse" />
              <div className="h-3 w-full bg-landing-taupe/35 motion-safe:animate-pulse" />
              <div className="h-3 w-4/5 bg-landing-taupe/35 motion-safe:animate-pulse" />
              <div className="mt-2 h-9 bg-landing-taupe/35 motion-safe:animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

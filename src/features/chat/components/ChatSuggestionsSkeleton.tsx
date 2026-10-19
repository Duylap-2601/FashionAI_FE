'use client';

import { Sparkles } from 'lucide-react';

/** Khung chờ thẻ sản phẩm: hiện ngay khi AI viết xong chữ, trong lúc BE chọn sản phẩm. */
export function ChatSuggestionsSkeleton() {
  return (
    <div className="w-full min-w-0" aria-busy="true" aria-label="Đang chọn sản phẩm">
      <p className="mb-2 flex items-center gap-1.5 px-1 text-label-sm text-neutral-500">
        <Sparkles className="w-3.5 h-3.5 text-brand-navy animate-pulse" /> Đang chọn sản phẩm phù hợp…
      </p>
      <div className="flex gap-3 overflow-hidden">
        {[0, 1].map((i) => (
          <div key={i} className="shrink-0 w-[256px] sm:w-[272px] rounded-2xl border border-neutral-200/80 bg-white overflow-hidden">
            <div className="h-48 bg-brand-cream animate-pulse" />
            <div className="p-3.5 flex flex-col gap-2">
              <div className="h-4 w-2/3 rounded-full bg-neutral-100 animate-pulse" />
              <div className="h-3 w-full rounded-full bg-neutral-100 animate-pulse" />
              <div className="h-3 w-4/5 rounded-full bg-neutral-100 animate-pulse" />
              <div className="mt-2 h-9 rounded-xl bg-neutral-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

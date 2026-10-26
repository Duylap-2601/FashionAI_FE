'use client';

import Image from 'next/image';
import React, { useRef, useState } from 'react';

export function ComparisonSlider({ before, after }: { before: string; after: string }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  };

  const handlePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    updatePosition(event.clientX);
  };

  return (
    <div ref={containerRef} className="relative aspect-[3/4] w-full cursor-col-resize touch-none select-none overflow-hidden border border-landing-line bg-landing-ivory" onPointerDown={handlePointer} onPointerMove={(event) => { if (event.buttons === 1) updatePosition(event.clientX); }}>
      <Image src={after} alt="Kết quả thử trang phục" fill sizes="(max-width: 1024px) 100vw, 560px" unoptimized className="object-contain" draggable={false} />
      <div className="absolute inset-0 overflow-hidden bg-landing-ivory" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image src={before} alt="Ảnh gốc trước khi thử" fill sizes="(max-width: 1024px) 100vw, 560px" unoptimized className="object-contain" draggable={false} />
      </div>
      <div className="pointer-events-none absolute bottom-0 top-0 w-px bg-landing-paper" style={{ left: `${position}%` }}>
        <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-landing-line bg-landing-paper">
          <div className="flex gap-1" aria-hidden="true"><div className="h-3.5 w-px bg-landing-obsidian/50" /><div className="h-3.5 w-px bg-landing-obsidian/50" /></div>
        </div>
      </div>
      <label className="sr-only" htmlFor="try-on-comparison">So sánh ảnh gốc và kết quả thử đồ</label>
      <input id="try-on-comparison" type="range" min="0" max="100" value={Math.round(position)} onChange={(event) => setPosition(Number(event.target.value))} className="absolute inset-x-4 bottom-4 h-2 accent-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood" />
      <span className="pointer-events-none absolute left-3 top-3 bg-landing-obsidian/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-landing-paper">Trước</span>
      <span className="pointer-events-none absolute right-3 top-3 bg-landing-oxblood px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-landing-paper">Sau</span>
    </div>
  );
}

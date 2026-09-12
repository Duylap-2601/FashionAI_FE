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
    <div ref={containerRef} className="relative aspect-[3/4] w-full select-none overflow-hidden rounded-2xl border border-[#E5DFD5] bg-white cursor-col-resize touch-none" onPointerDown={handlePointer} onPointerMove={(event) => { if (event.buttons === 1) updatePosition(event.clientX); }}>
      <Image src={after} alt="Kết quả thử trang phục" fill sizes="(max-width: 1024px) 100vw, 58vw" unoptimized className="object-contain p-2" draggable={false} />
      <div className="absolute inset-0 overflow-hidden bg-white" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image src={before} alt="Ảnh gốc trước khi thử" fill sizes="(max-width: 1024px) 100vw, 58vw" unoptimized className="object-contain p-2" draggable={false} />
      </div>
      <div className="absolute top-0 bottom-0 w-[2px] bg-white shadow-lg pointer-events-none" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg border border-[#E5DFD5] flex items-center justify-center">
          <div className="flex gap-0.5"><div className="w-[3px] h-4 rounded-full bg-neutral-400" /><div className="w-[3px] h-4 rounded-full bg-neutral-400" /></div>
        </div>
      </div>
      <label className="sr-only" htmlFor="try-on-comparison">So sánh ảnh gốc và kết quả thử đồ</label>
      <input id="try-on-comparison" type="range" min="0" max="100" value={Math.round(position)} onChange={(event) => setPosition(Number(event.target.value))} className="absolute inset-x-4 bottom-4 h-2 accent-[#5D1C34] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5D1C34] focus-visible:ring-offset-2" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(position)} />
      <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/55 backdrop-blur-sm rounded-full text-white text-[11px] font-medium pointer-events-none">Ảnh gốc</div>
      <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#5D1C34]/85 backdrop-blur-sm rounded-full text-white text-[11px] font-medium pointer-events-none">Kết quả</div>
    </div>
  );
}

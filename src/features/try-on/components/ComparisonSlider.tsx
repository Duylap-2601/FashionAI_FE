'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export function ComparisonSlider({ before, after }: { before: string; after: string }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) updatePosition(e.clientX); };
    const onUp = () => { dragging.current = false; };
    const onTouch = (e: TouchEvent) => { if (dragging.current) updatePosition(e.touches[0].clientX); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouch);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onUp);
    };
  }, [updatePosition]);

  return (
    <div ref={containerRef} className="relative w-full rounded-xl overflow-hidden select-none cursor-col-resize shadow-md" style={{ height: 420 }} onMouseDown={onMouseDown} onTouchStart={() => { dragging.current = true; }}>
      <Image src={after} alt="Try-On result" fill sizes="(max-width: 768px) 100vw, 640px" unoptimized className="object-cover" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <Image src={before} alt="Original photo" fill sizes="(max-width: 768px) 100vw, 640px" unoptimized className="object-cover" style={{ width: `${100 / (position / 100)}%`, minWidth: '100%' }} draggable={false} />
      </div>
      <div className="absolute top-0 bottom-0 w-[2px] bg-white shadow-lg pointer-events-none" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-auto cursor-col-resize" onMouseDown={onMouseDown} onTouchStart={() => { dragging.current = true; }}>
          <div className="flex gap-0.5"><div className="w-[3px] h-4 rounded-full bg-neutral-400" /><div className="w-[3px] h-4 rounded-full bg-neutral-400" /></div>
        </div>
      </div>
      <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-[11px] font-medium pointer-events-none">Ảnh gốc</div>
      <div className="absolute top-3 right-3 px-2.5 py-1 bg-brand-navy/80 backdrop-blur-sm rounded-full text-white text-[11px] font-medium pointer-events-none">Kết quả Try-On</div>
    </div>
  );
}

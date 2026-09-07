'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const MESSAGES = [
  { text: '✨ TRẢI NGHIỆM THỬ ĐỒ ẢO AI MIỄN PHÍ — THẤY KẾT QUẢ TRƯỚC KHI MUA', link: '/try-on' },
  { text: '🚚 FREESHIP TOÀN QUỐC CHO MỌI ĐƠN HÀNG TỪ 500.000₫', link: '/products' },
  { text: '✦ BỘ SƯU TẬP MỚI 2026 ĐÃ CHÍNH THỨC RA MẮT — XEM NGAY', link: '#collections' },
];

export function AnnouncementBar() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + MESSAGES.length) % MESSAGES.length);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % MESSAGES.length);
  };

  const current = MESSAGES[currentIdx];

  return (
    <div className="w-full bg-[#15434e] text-white text-[11px] md:text-[12px] font-medium tracking-wider h-[38px] flex items-center justify-between px-3 md:px-8 border-b border-[#1b505c] select-none z-50 relative">
      <button
        onClick={handlePrev}
        className="text-white/60 hover:text-white transition-colors p-1"
        aria-label="Previous announcement"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      <a
        href={current.link}
        className="flex items-center gap-2 hover:underline underline-offset-4 text-center truncate max-w-[85%] md:max-w-none transition-all duration-300"
      >
        <Sparkles className="w-3 h-3 text-brand-gold shrink-0 animate-pulse" />
        <span>{current.text}</span>
      </a>

      <button
        onClick={handleNext}
        className="text-white/60 hover:text-white transition-colors p-1"
        aria-label="Next announcement"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

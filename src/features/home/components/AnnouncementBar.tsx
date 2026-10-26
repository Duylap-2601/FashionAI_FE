'use client';

import { MESSAGES } from '@/features/home/constants/announcement-bar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function AnnouncementBar() {
  const shouldReduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion || isPaused) return;
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isPaused, shouldReduceMotion]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + MESSAGES.length) % MESSAGES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
  };

  const current = MESSAGES[currentIndex] ?? MESSAGES[0];

  return (
    <div
      role="region"
      aria-label="Thông báo cửa hàng"
      className="relative z-50 flex h-10 w-full items-center justify-between border-b border-landing-paper/10 bg-landing-obsidian px-2 text-landing-paper/80 select-none md:px-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <button
        type="button"
        onClick={handlePrev}
        className="flex h-10 w-10 items-center justify-center text-landing-paper/45 transition-colors hover:text-landing-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-landing-brass"
        aria-label="Thông báo trước"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <Link
        href={current.link}
        className="flex min-w-0 items-center gap-2.5 text-center text-[9px] font-semibold uppercase tracking-[0.18em] transition-colors hover:text-landing-paper md:text-[10px]"
      >
        <span className="hidden h-1 w-1 shrink-0 rounded-full bg-landing-brass sm:block" aria-hidden="true" />
        <span className="truncate" aria-live="polite">{current.text}</span>
      </Link>

      <button
        type="button"
        onClick={handleNext}
        className="flex h-10 w-10 items-center justify-center text-landing-paper/45 transition-colors hover:text-landing-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-landing-brass"
        aria-label="Thông báo tiếp theo"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

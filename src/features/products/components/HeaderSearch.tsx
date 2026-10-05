'use client';

import type { HeaderSearchProps } from '@/features/products/types/header-search';
import { Search } from 'lucide-react';
import Link from 'next/link';

export function HeaderSearch({ className = '' }: HeaderSearchProps) {
  return (
    <Link
      href="/search"
      aria-label="Tìm kiếm sản phẩm"
      className={`rounded-full p-2 transition-colors text-neutral-600 hover:bg-neutral-100 hover:text-brand-navy flex items-center justify-center ${className}`}
    >
      <Search className="h-[18px] w-[18px] md:h-5 md:w-5" />
    </Link>
  );
}

import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-[14px] text-[#8B8880] whitespace-nowrap overflow-x-auto no-scrollbar py-2 font-medium">
      <ol className="flex items-center gap-2">
        <li className="flex items-center">
          <Link href="/" className="hover:text-brand-navy transition-colors flex items-center">
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-2">
              <span className="text-[#8B8880] select-none text-[16px] leading-none mb-0.5">›</span>
              {isLast || !item.href ? (
                <span className="text-[#1A1917] font-medium truncate max-w-[200px]" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-[#1A1917] transition-colors truncate max-w-[150px]">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}


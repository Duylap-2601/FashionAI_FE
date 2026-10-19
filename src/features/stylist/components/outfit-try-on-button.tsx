'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OUTFIT_ROLE_LABELS } from '@/features/stylist/constants/outfit-suggestion';
import { outfitTryOnOptions } from '@/features/stylist/services/outfit-suggestions';
import type { OutfitTryOnButtonProps } from '@/features/stylist/types/outfit-try-on-button';
import { ChevronDown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

const BUTTON_CLASS =
  'h-10 px-3 rounded-xl border border-brand-navy/30 bg-white text-brand-navy text-label-md font-semibold flex items-center justify-center gap-1.5 hover:bg-brand-navy/5 transition-colors cursor-pointer';

/**
 * "Thử đồ" cho một bộ phối. Phòng thử chỉ mặc được 1 áo + 1 quần/váy (hoặc 1 đầm), nên bộ có
 * nhiều lớp áo cho khách chọn áo muốn thử thay vì tự bỏ bớt một món.
 */
export function OutfitTryOnButton({ outfit }: OutfitTryOnButtonProps) {
  const options = useMemo(() => outfitTryOnOptions(outfit), [outfit]);
  const roleOf = (productId: string) => outfit.items.find((item) => item.product.id === productId)?.role;

  if (options.length === 0) {
    return (
      <span className="h-10 px-3 rounded-xl border border-neutral-200 text-neutral-400 text-label-md font-semibold flex items-center justify-center gap-1.5">
        <Sparkles className="w-4 h-4" /> Thử đồ
      </span>
    );
  }

  if (options.length === 1) {
    return (
      <Link href={options[0].href} className={BUTTON_CLASS}>
        <Sparkles className="w-4 h-4" /> Thử đồ
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={BUTTON_CLASS}>
          <Sparkles className="w-4 h-4" /> Thử đồ <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 p-1.5">
        <DropdownMenuLabel className="px-2 pt-1 pb-2 text-label-sm font-normal text-neutral-500">
          Phòng thử mặc được 1 áo + 1 quần/váy. Chọn áo muốn thử:
        </DropdownMenuLabel>
        {options.map((option) => {
          const [upper, ...rest] = option.products;
          const role = roleOf(upper.id);
          return (
            <DropdownMenuItem key={option.href} asChild className="cursor-pointer rounded-lg px-2 py-2">
              <Link href={option.href} className="flex flex-col items-start gap-0.5">
                <span className="text-body-sm font-semibold text-neutral-900 line-clamp-1">
                  {role ? `${OUTFIT_ROLE_LABELS[role]}: ` : ''}{upper.name}
                </span>
                {rest.length > 0 && (
                  <span className="text-label-sm text-neutral-500 line-clamp-1">+ {rest.map((product) => product.name).join(' + ')}</span>
                )}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

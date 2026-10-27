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
  'flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-[2px] border border-landing-obsidian/70 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';

/**
 * "Thử đồ" cho một bộ phối. Phòng thử chỉ mặc được 1 áo + 1 quần/váy (hoặc 1 đầm), nên bộ có
 * nhiều lớp áo cho khách chọn áo muốn thử thay vì tự bỏ bớt một món.
 */
export function OutfitTryOnButton({ outfit }: OutfitTryOnButtonProps) {
  const options = useMemo(() => outfitTryOnOptions(outfit), [outfit]);
  const roleOf = (productId: string) => outfit.items.find((item) => item.product.id === productId)?.role;

  if (options.length === 0) {
    return (
      <span className="flex h-10 items-center justify-center gap-1.5 rounded-[2px] border border-landing-line px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-landing-muted/70">
        <Sparkles className="h-4 w-4" strokeWidth={1.75} /> Thử đồ
      </span>
    );
  }

  if (options.length === 1) {
    return (
      <Link href={options[0].href} className={BUTTON_CLASS}>
        <Sparkles className="h-4 w-4" strokeWidth={1.75} /> Thử đồ
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={BUTTON_CLASS}>
          <Sparkles className="h-4 w-4" strokeWidth={1.75} /> Thử đồ <ChevronDown className="h-3.5 w-3.5 opacity-70" strokeWidth={1.75} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 rounded-[2px] border-landing-line bg-landing-ivory p-1.5">
        <DropdownMenuLabel className="px-2 pt-1 pb-2 text-xs font-normal leading-relaxed text-landing-muted">
          Phòng thử mặc được 1 áo + 1 quần/váy. Chọn áo muốn thử:
        </DropdownMenuLabel>
        {options.map((option) => {
          const [upper, ...rest] = option.products;
          const role = roleOf(upper.id);
          return (
            <DropdownMenuItem key={option.href} asChild className="cursor-pointer rounded-[2px] px-2 py-2 focus:bg-landing-paper">
              <Link href={option.href} className="flex flex-col items-start gap-0.5">
                <span className="line-clamp-1 text-sm font-semibold text-landing-obsidian">
                  {role ? `${OUTFIT_ROLE_LABELS[role]}: ` : ''}{upper.name}
                </span>
                {rest.length > 0 && (
                  <span className="line-clamp-1 text-xs text-landing-muted">+ {rest.map((product) => product.name).join(' + ')}</span>
                )}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

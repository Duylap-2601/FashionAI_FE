'use client';

import type { CartItem } from '@/features/cart/types/cart-store';
import { cn } from '@/lib/utils';
import { Minus, Plus, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export const CART_IMAGE_FALLBACK = '/images/731163514_999523332788054_1114320478812927640_n.png';

export const cartFocusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';

export function formatCartPrice(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function QuantityStepper({ item, disabled, onChange }: { item: CartItem; disabled: boolean; onChange: (delta: number) => void }) {
  const buttonClass = cn(
    'flex h-full w-9 items-center justify-center text-landing-obsidian/70 transition-colors hover:text-landing-oxblood disabled:cursor-not-allowed disabled:opacity-40',
    cartFocusRing,
  );
  return (
    <div className="flex h-9 items-center border border-landing-line" role="group" aria-label={`Số lượng ${item.name}`}>
      <button type="button" onClick={() => onChange(-1)} disabled={disabled} aria-label="Giảm số lượng" className={buttonClass}>
        <Minus className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
      <span className="flex h-full min-w-9 items-center justify-center border-x border-landing-line px-2 font-mono text-sm text-landing-obsidian" aria-live="polite">
        {item.quantity}
      </span>
      <button type="button" onClick={() => onChange(1)} disabled={disabled} aria-label="Tăng số lượng" className={buttonClass}>
        <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}

/** Một dòng giỏ hàng, dùng chung cho panel trượt và trang /cart. */
export function CartLine({
  item,
  size = 'md',
  onNavigate,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  size?: 'sm' | 'md';
  onNavigate?: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}) {
  const [imageSrc, setImageSrc] = useState(item.image || CART_IMAGE_FALLBACK);
  const isAvailable = item.available !== false;
  const href = `/products/${item.productId || item.id}`;

  return (
    <div className={cn('flex gap-4', size === 'md' ? 'py-6' : 'py-4', !isAvailable && 'opacity-70')}>
      <Link
        href={href}
        onClick={onNavigate}
        tabIndex={-1}
        aria-hidden="true"
        className={cn('relative shrink-0 overflow-hidden rounded-[2px] bg-landing-ivory', size === 'md' ? 'h-[128px] w-24' : 'h-24 w-[72px]')}
      >
        <Image src={imageSrc} alt="" fill sizes="96px" className="object-cover" onError={() => setImageSrc(CART_IMAGE_FALLBACK)} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={href}
              onClick={onNavigate}
              className={cn('product-name-line line-clamp-2 text-landing-obsidian transition-colors hover:text-landing-oxblood', cartFocusRing)}
            >
              {item.name}
            </Link>
            {item.variant ? <p className="mt-1 text-xs text-landing-muted">{item.variant}</p> : null}
            {!isAvailable ? (
              <p className="mt-1 text-xs text-destructive">Đã ngừng bán, không tính vào đơn hàng.</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Bỏ ${item.name} khỏi giỏ`}
            className={cn('-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center text-landing-muted transition-colors hover:text-destructive', cartFocusRing)}
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <QuantityStepper item={item} disabled={!isAvailable} onChange={(delta) => onUpdateQuantity(item.id, delta)} />
          <div className="text-right">
            {item.listPrice && item.listPrice > item.price ? (
              <p className="font-mono text-[11px] text-landing-muted line-through">
                {formatCartPrice(item.listPrice * item.quantity)}
              </p>
            ) : null}
            <p className="font-mono text-sm text-landing-oxblood">{formatCartPrice(item.price * item.quantity)}</p>
            {item.quantity > 1 ? <p className="font-mono text-[11px] text-landing-muted">{formatCartPrice(item.price)} / mA3n</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

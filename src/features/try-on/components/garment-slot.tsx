'use client';

import {
  getValidProductColors,
  normalizeProductColorName,
  resolveProductImageForColor,
} from '@/features/products/services/products-utils';
import type { Product } from '@/features/products/types/products';
import { cn } from '@/lib/utils';
import { Check, Plus } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';

// Thành phần dùng chung cho thử bằng ảnh và thử trực tiếp.

export const tryOnFocusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';

type TryOnButtonVariant = 'primary' | 'outline' | 'quiet' | 'inverse';

const BUTTON_VARIANTS: Record<TryOnButtonVariant, string> = {
  primary: 'bg-landing-oxblood text-landing-paper hover:bg-landing-obsidian',
  outline: 'border border-landing-line text-landing-obsidian hover:border-landing-oxblood hover:text-landing-oxblood',
  quiet: 'px-0 text-landing-muted hover:text-landing-oxblood',
  inverse: 'border border-landing-paper/25 text-landing-paper hover:bg-landing-paper hover:text-landing-obsidian',
};

export function tryOnButtonClassName(variant: TryOnButtonVariant = 'primary', size: 'lg' | 'md' | 'sm' = 'md') {
  return cn(
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[2px] font-semibold uppercase transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-45',
    size === 'lg' && 'h-12 px-6 text-[11.5px] tracking-[0.16em]',
    size === 'md' && 'h-11 px-5 text-[11px] tracking-[0.16em]',
    size === 'sm' && 'h-9 px-3.5 text-[10.5px] tracking-[0.14em]',
    BUTTON_VARIANTS[variant],
    tryOnFocusRing,
  );
}

export const tryOnLabelClassName = 'text-[11px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink';

/** Nút gạt vuông (Trực tiếp / Bằng ảnh, Một món / Phối bộ). */
export function TryOnSegmented<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  ariaLabel,
  className,
}: {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className={cn('grid border border-landing-line', className)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-10 items-center justify-center gap-1.5 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              selected ? 'bg-landing-oxblood text-landing-paper' : 'text-landing-obsidian/70 hover:text-landing-oxblood',
              tryOnFocusRing,
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Một ô trang phục: ảnh theo màu đang chọn, tên, giá, đổi hoặc bỏ chọn. */
export function GarmentSlot({
  label,
  hint,
  product,
  color,
  emptyLabel,
  onSelect,
  onClear,
  disabled = false,
}: {
  label: string;
  hint?: string;
  product: Product | null;
  color?: string | null;
  emptyLabel: string;
  onSelect: () => void;
  onClear?: () => void;
  disabled?: boolean;
}) {
  const image = product ? resolveProductImageForColor(product, color).url || product.image : null;

  return (
    <div className="flex gap-4">
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        aria-label={product ? `Đổi ${label.toLowerCase()}: ${product.name}` : `Chọn ${label.toLowerCase()}`}
        className={cn(
          'relative flex h-[104px] w-[78px] shrink-0 items-center justify-center overflow-hidden rounded-[2px] border bg-landing-ivory transition-colors disabled:cursor-not-allowed',
          product ? 'border-landing-line hover:border-landing-oxblood' : 'border-dashed border-landing-taupe text-landing-muted hover:border-landing-oxblood hover:text-landing-oxblood',
          tryOnFocusRing,
        )}
      >
        {product && image ? (
          <Image src={image} alt="" fill sizes="78px" unoptimized className="object-contain p-1.5 mix-blend-multiply" />
        ) : (
          <Plus className="h-5 w-5" strokeWidth={1.5} />
        )}
      </button>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className={tryOnLabelClassName}>
          {label}
          {hint ? <span className="ml-1.5 font-normal normal-case tracking-normal text-landing-muted">{hint}</span> : null}
        </p>
        {product ? (
          <>
            <p className="product-name-line mt-1.5 line-clamp-2 text-landing-obsidian">{product.name}</p>
            <p className="mt-1 font-mono text-xs text-landing-oxblood">{product.price}</p>
          </>
        ) : (
          <p className="mt-1.5 text-sm text-landing-muted">{emptyLabel}</p>
        )}
        <div className="mt-auto flex items-center gap-4 pt-2">
          <button type="button" onClick={onSelect} disabled={disabled} className={tryOnButtonClassName('quiet', 'sm')}>
            {product ? 'Đổi món' : 'Chọn món'}
          </button>
          {product && onClear ? (
            <button type="button" onClick={onClear} disabled={disabled} className={cn(tryOnButtonClassName('quiet', 'sm'), 'hover:text-destructive')}>
              Bỏ chọn
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Chọn màu khi sản phẩm có từ hai màu hợp lệ trở lên. */
export function GarmentColorPicker({
  product,
  selectedColor,
  onSelectColor,
  disabled = false,
  label,
  lockedHint,
}: {
  product: Product | null;
  selectedColor?: string | null;
  onSelectColor?: (color: string) => void;
  disabled?: boolean;
  label: string;
  lockedHint?: string;
}) {
  const colors = getValidProductColors(product);
  if (!product || !onSelectColor || colors.length < 2) return null;
  const current = normalizeProductColorName(selectedColor) || normalizeProductColorName(colors[0]?.name);
  const currentName = colors.find((color) => normalizeProductColorName(color.name) === current)?.name ?? colors[0]?.name;

  return (
    <div className="mt-3">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-xs text-landing-muted">{label}</p>
        <p className="truncate text-xs font-medium text-landing-obsidian">{currentName}</p>
      </div>
      <div role="radiogroup" aria-label={label} className="flex max-h-[92px] flex-wrap gap-1.5 overflow-y-auto">
        {colors.map((color) => {
          const selected = normalizeProductColorName(color.name) === current;
          return (
            <button
              key={color.name}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onSelectColor(color.name)}
              title={color.name}
              className={cn(
                'flex h-9 max-w-full items-center gap-2 rounded-[2px] border bg-landing-paper px-2.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                selected ? 'border-landing-oxblood text-landing-oxblood' : 'border-landing-line text-landing-obsidian/80 hover:border-landing-brass',
                tryOnFocusRing,
              )}
            >
              <span aria-hidden="true" className="h-3.5 w-3.5 shrink-0 rounded-full border border-landing-obsidian/15" style={{ backgroundColor: color.hex }} />
              <span className="truncate">{color.name}</span>
              {selected ? <Check className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      {disabled && lockedHint ? <p className="mt-2 text-xs text-landing-muted">{lockedHint}</p> : null}
    </div>
  );
}

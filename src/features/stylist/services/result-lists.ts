import { isRecord } from '@/lib/errors';
import type { ColorSuggestion, ColorSwatch, OutfitCombination } from '@/features/stylist/types/stylist';

export function toColorList(value: unknown): ColorSuggestion[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ColorSuggestion => typeof item === 'string' || (
    isRecord(item) && ['name', 'color', 'hex'].every((key) => item[key] === undefined || typeof item[key] === 'string')
  ));
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Màu nên mặc để hiển thị ô màu; bỏ mục không có tên, mã hex sai định dạng coi như không có. */
export function toColorSwatches(value: unknown, limit = 6): ColorSwatch[] {
  return toColorList(value)
    .map((color) => {
      if (typeof color === 'string') return { name: color.trim(), hex: null };
      const hex = color.hex?.trim();
      return { name: (color.name || color.color || '').trim(), hex: hex && HEX_COLOR.test(hex) ? hex.toUpperCase() : null };
    })
    .filter((color) => color.name !== '')
    .slice(0, limit);
}

export function toOutfitList(value: unknown): (string | OutfitCombination)[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string | Record<string, unknown> =>
    typeof item === 'string' || isRecord(item)
  ).map((item) => {
    if (typeof item === 'string') return item;
    return {
      name: typeof item.name === 'string' ? item.name : '',
      items: Array.isArray(item.items) ? item.items.filter(isRecord).map((garment) => ({
        name: typeof garment.name === 'string' ? garment.name : '',
        type: typeof garment.type === 'string' ? garment.type : 'shirt',
      })) : [],
    };
  });
}

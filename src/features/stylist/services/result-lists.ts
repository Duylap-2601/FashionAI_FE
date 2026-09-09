import { isRecord } from '@/lib/errors';
import type { ColorSuggestion, OutfitCombination } from '@/features/stylist/types/stylist';

export function toColorList(value: unknown): ColorSuggestion[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ColorSuggestion => typeof item === 'string' || (
    isRecord(item) && ['name', 'color', 'hex'].every((key) => item[key] === undefined || typeof item[key] === 'string')
  ));
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

import type { GarmentType } from '@/features/products/types/products';

export interface GarmentTypeTab {
  key: string;
  label: string;
  garmentType?: GarmentType;
}

export const GARMENT_TYPE_TABS: readonly GarmentTypeTab[] = [
  { key: 'ALL', label: 'Tất cả', garmentType: undefined },
  { key: 'SHIRT', label: 'Áo sơ mi', garmentType: 'SHIRT' },
  { key: 'VEST', label: 'Áo vest', garmentType: 'VEST' },
  { key: 'JACKET', label: 'Áo khoác / Blazer', garmentType: 'JACKET' },
  { key: 'PANTS', label: 'Quần tây', garmentType: 'PANTS' },
  { key: 'SKIRT', label: 'Chân váy', garmentType: 'SKIRT' },
  { key: 'DRESS', label: 'Đầm', garmentType: 'DRESS' },
  { key: 'JUMPSUIT', label: 'Jumpsuit', garmentType: 'JUMPSUIT' },
] as const;

export const SUB_CATEGORIES = [
  { name: 'Áo sơ mi', match: ['sơ mi', 'shirt'] },
  { name: 'Blazer', match: ['blazer', 'vest'] },
  { name: 'Quần tây', match: ['quần tây', 'quần âu', 'trouser', 'pant'] },
  { name: 'Váy công sở', match: ['váy', 'chân váy', 'skirt'] },
  { name: 'Suit 2 mảnh', match: ['suit 2', 'suit k', 'suit n', ' nguyên bộ'] },
  { name: 'Suit 3 mảnh', match: ['suit 3', 'suit 3 mảnh'] },
];

export const AVAILABLE_COLORS = [
  { name: 'Đen', color: '#111111' },
  { name: 'Trắng', color: '#FFFFFF', border: true },
  { name: 'Xám', color: '#888888' },
  { name: 'Navy', color: '#2B3450' },
  { name: 'Kem', color: '#F9F7F5' },
  { name: 'Be', color: '#E8E2D2' },
];

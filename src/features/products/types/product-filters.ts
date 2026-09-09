export type CategoryGroup = 'Áo' | 'Quần & Váy' | 'Suit đầy đủ';

export type SortBy = 'Mới nhất' | 'Giá thấp đến cao' | 'Giá cao đến thấp';

export type CategoryCount = { label: string; count: number };

export type SubCategoryCount = { name: string; count: number };

export type ActiveChip = { id: string; label: string; onRemove: () => void };

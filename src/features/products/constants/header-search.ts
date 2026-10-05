export const SEARCH_HISTORY_KEY = 'fashionai.searchHistory';

export const MAX_HISTORY_ITEMS = 12;

export const POPULAR_SEARCH_KEYWORDS = [
  'Áo sơ mi lụa',
  'Blazer dạ tweed',
  'Đầm dạ hội dáng dài',
  'Quần tây ống suông',
  'Set vest nữ thanh lịch',
  'Chân váy chữ A',
  'Áo len cardigan',
  'Đầm hoa nhí vintage',
  'Áo polo cao cấp',
  'Váy công sở',
] as const;

export interface PopularCategoryItem {
  label: string;
  garmentType?: string;
  href?: string;
  subTitle?: string;
}

export const POPULAR_CATEGORIES: PopularCategoryItem[] = [
  { label: 'Áo sơ mi & Áo kiểu', garmentType: 'top', subTitle: 'Thanh lịch & hiện đại' },
  { label: 'Đầm & Váy liền', garmentType: 'dress', subTitle: 'Duyên dáng & tôn dáng' },
  { label: 'Quần & Chân váy', garmentType: 'bottom', subTitle: 'Dễ phối & thoải mái' },
  { label: 'Áo khoác & Blazer', garmentType: 'outerwear', subTitle: 'Sang trọng & thời thượng' },
  { label: 'Bộ sưu tập 2026', href: '/collections', subTitle: 'Xu hướng mới nhất' },
  { label: 'Phòng thử đồ AI', href: '/try-on', subTitle: 'Ướm thử thông minh' },
];

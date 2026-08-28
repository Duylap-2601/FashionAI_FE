const imgSuit = '/images/726470431_1311184104081177_6052756217829444481_n.png';
const imgBlazer = '/images/731163514_999523332788054_1114320478812927640_n.png';
const imgShirt = '/images/731199294_3955961871204172_1445370375731306017_n.png';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  numericPrice: number;
  originalPrice?: number;
  originalPriceFormatted?: string;
  category: string;
  garmentCategory?: 'UPPER' | 'LOWER' | 'FULL_BODY';
  image: string;
  gallery: string[];
  colors: { name: string; hex: string }[];
  isGuest: boolean;
  description?: string;
  stock?: number;
  soldCount?: number;
  isNew?: boolean;
  rating?: number;
  reviewCount?: number;
}

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Blazer Nữ Công Sở Dáng Ôm',
    brand: 'StAle. SIGNATURE',
    price: '750.000 ₫',
    numericPrice: 750000,
    category: 'Blazer',
    image: imgBlazer,
    gallery: [imgBlazer, imgSuit, imgShirt],
    colors: [
      { name: 'Đen', hex: '#111827' },
      { name: 'Kem', hex: '#EFE9E1' },
      { name: 'Burgundy', hex: '#38140C' },
    ],
    isGuest: true,
  },
  {
    id: 'p2',
    name: 'Combo Suit Nguyên Bộ',
    brand: 'StAle. SIGNATURE',
    price: '1.290.000 ₫',
    numericPrice: 1290000,
    category: 'Suit',
    image: imgSuit,
    gallery: [imgSuit, imgBlazer, imgShirt],
    colors: [
      { name: 'Kem', hex: '#EFE9E1' },
      { name: 'Xám Tro', hex: '#5E6469' },
    ],
    isGuest: false,
  },
  {
    id: 'p3',
    name: 'Áo Sơ Mi Oxford Trắng Premium',
    brand: 'StAle. ESSENTIALS',
    price: '550.000 ₫',
    numericPrice: 550000,
    category: 'Áo sơ mi',
    image: imgShirt,
    gallery: [imgShirt, imgBlazer, imgSuit],
    colors: [
      { name: 'Trắng', hex: '#FFFFFF' },
      { name: 'Xanh nhạt', hex: '#DBEAFE' },
    ],
    isGuest: true,
  },
  {
    id: 'p4',
    name: 'Combo Suit Kẻ Sọc Năng Động',
    brand: 'StAle. SIGNATURE',
    price: '1.290.000 ₫',
    numericPrice: 1290000,
    category: 'Suit',
    image: imgSuit,
    gallery: [imgSuit, imgBlazer, imgShirt],
    colors: [
      { name: 'Xám', hex: '#808080' },
      { name: 'Navy', hex: '#38140C' },
    ],
    isGuest: true,
  },
  {
    id: 'p5',
    name: 'Quần Tây Ống Suông Classic',
    brand: 'StAle. ESSENTIALS',
    price: '550.000 ₫',
    numericPrice: 550000,
    category: 'Quần tây',
    image: imgSuit,
    gallery: [imgSuit, imgBlazer, imgShirt],
    colors: [
      { name: 'Kem', hex: '#EFE9E1' },
      { name: 'Đen', hex: '#111111' },
    ],
    isGuest: true,
  },
  {
    id: 'p6',
    name: 'Chân Váy Xếp Ly Basic',
    brand: 'StAle. ESSENTIALS',
    price: '550.000 ₫',
    numericPrice: 550000,
    category: 'Chân váy',
    image: imgBlazer,
    gallery: [imgBlazer, imgSuit, imgShirt],
    colors: [
      { name: 'Trắng', hex: '#FFFFFF' },
      { name: 'Đen', hex: '#111111' },
    ],
    isGuest: true,
  },
];

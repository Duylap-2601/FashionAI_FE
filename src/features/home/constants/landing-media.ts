export const LANDING_MEDIA = {
  hero: '/images/hero1.png',
  hero2: '/images/hero2.png',
  look01: '/images/731163514_999523332788054_1114320478812927640_n.png',
  look02: '/images/726470431_1311184104081177_6052756217829444481_n.png',
  look03: '/images/731199294_3955961871204172_1445370375731306017_n.png',
  tryOn: '/images/731163514_999523332788054_1114320478812927640_n.png',
  productFallback: '/images/731163514_999523332788054_1114320478812927640_n.png',
} as const;

export const HERO_FALLBACK = {
  id: 'landing-hero-fallback',
  name: 'Elegance Office 2026',
  season: 'SPRING / SUMMER 2026',
  tagline: 'Tinh tế từng đường may, bản lĩnh nơi công sở.',
  image: LANDING_MEDIA.hero,
} as const;

/** 2 slide hero cố định (hero1, hero2) */
export const HERO_LOCAL_SLIDES = [
  {
    id: 'local-hero-1',
    name: 'StAle. Signature',
    season: 'SPRING / SUMMER 2026',
    image: LANDING_MEDIA.hero,
    fallbackImage: LANDING_MEDIA.hero,
  },
  {
    id: 'local-hero-2',
    name: 'Urban Power Suit',
    season: 'AUTUMN / WINTER 2026',
    image: LANDING_MEDIA.hero2,
    fallbackImage: LANDING_MEDIA.hero2,
  },
] as const;

export const LOOKBOOK_FALLBACK = [
  {
    url: LANDING_MEDIA.look01,
    title: 'The Monochrome Edit',
    subtitle: 'Blazer đen, chân váy trắng, một đường cắt sắc.',
  },
  {
    url: LANDING_MEDIA.look02,
    title: 'Soft Structure',
    subtitle: 'Suit be hai hàng khuy cho nhịp làm việc chậm lại.',
  },
  {
    url: LANDING_MEDIA.look03,
    title: 'Quiet Tailoring',
    subtitle: 'Sơ mi trắng và quần tây xám, chuẩn mực mỗi ngày.',
  },
] as const;

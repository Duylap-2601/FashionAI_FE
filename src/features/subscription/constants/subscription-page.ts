import type { Plan } from '@/features/subscription/types/subscription-page';

export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'FREE',
    name: 'Miễn Phí',
    priceText: '0đ',
    numericPrice: 0,
    periodText: 'mãi mãi',
    description: 'Trải nghiệm cơ bản tư vấn phong cách cùng FashionAI',
    features: [
      { text: '0 lượt Thử đồ AI (Try-on cấm)' },
      { text: '3 lượt AI Stylist / ngày' },
      { text: '50 tin nhắn Chatbot AI / ngày' },
      { text: 'Lưu trữ số đo cơ thể cá nhân' },
      { text: 'Đặt may đo Made-to-measure' },
    ],
    ctaText: 'Gói hiện tại',
  },
  {
    id: 'MEMBER',
    name: 'Hội Viên (Member)',
    priceText: '49.000đ',
    numericPrice: 49000,
    periodText: '/ 30 ngày',
    badge: 'Phổ biến nhất',
    isPopular: true,
    description: 'Dành cho khách hàng muốn trải nghiệm thử đồ AI và tư vấn phối đồ mỗi ngày',
    features: [
      { text: '5 lượt Thử đồ AI (Try-on) / ngày', highlight: true },
      { text: '20 lượt AI Stylist / ngày', highlight: true },
      { text: '200 tin nhắn Chatbot AI / ngày', highlight: true },
      { text: 'Hỗ trợ thử combo 2 món (Áo + Quần)' },
    ],
    ctaText: 'Nâng cấp Member',
  },
  {
    id: 'VIP',
    name: 'Khách Hàng VIP',
    priceText: '99.000đ',
    numericPrice: 99000,
    periodText: '/ 30 ngày',
    badge: 'Cao cấp nhất',
    description: 'Dành cho tín đồ thời trang cao cấp cần thử đồ nhiều lần và hỗ trợ stylist không giới hạn',
    features: [
      { text: '10 lượt Thử đồ AI (Try-on) / ngày', highlight: true },
      { text: 'Không giới hạn AI Stylist (Unlimited)', highlight: true },
      { text: 'Không giới hạn Chatbot AI (Unlimited)', highlight: true },
      { text: 'Hỗ trợ thử combo 2 món (Áo + Quần)' },
    ],
    ctaText: 'Nâng cấp VIP',
  },
];

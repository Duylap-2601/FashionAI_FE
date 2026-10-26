import type { Plan } from '@/features/subscription/types/subscription-page';

export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'FREE',
    name: 'Miễn Phí',
    priceText: '0đ',
    numericPrice: 0,
    periodText: 'mãi mãi',
    description: 'Dùng AI Stylist và chat AI mỗi ngày, lưu số đo và đặt may.',
    features: [
      { text: 'Chưa có lượt Thử đồ AI bằng ảnh' },
      { text: '3 lượt AI Stylist mỗi ngày' },
      { text: '50 tin nhắn chat AI mỗi ngày' },
      { text: 'Lưu trữ số đo cơ thể cá nhân' },
      { text: 'Đặt may theo số đo' },
    ],
    ctaText: 'Gói hiện tại',
  },
  {
    id: 'MEMBER',
    name: 'Hội Viên (Member)',
    priceText: '34.000đ',
    numericPrice: 34000,
    periodText: '/ 30 ngày',
    description: 'Dành cho khách hàng muốn trải nghiệm thử đồ AI và tư vấn phối đồ mỗi ngày',
    features: [
      { text: '5 lượt Thử đồ AI mỗi ngày', highlight: true },
      { text: '20 lượt AI Stylist mỗi ngày', highlight: true },
      { text: '200 tin nhắn chat AI mỗi ngày', highlight: true },
      { text: 'Phối bộ khi thử đồ, mỗi món 1 lượt' },
    ],
    ctaText: 'Nâng cấp Member',
  },
  {
    id: 'VIP',
    name: 'Khách Hàng VIP',
    priceText: '99.000đ',
    numericPrice: 99000,
    periodText: '/ 30 ngày',
    description: 'Dành cho tín đồ thời trang cao cấp cần thử đồ nhiều lần và hỗ trợ stylist không giới hạn',
    features: [
      { text: '10 lượt Thử đồ AI mỗi ngày', highlight: true },
      { text: 'AI Stylist không giới hạn', highlight: true },
      { text: 'Chat AI không giới hạn', highlight: true },
      { text: 'Phối bộ khi thử đồ, mỗi món 1 lượt' },
    ],
    ctaText: 'Nâng cấp VIP',
  },
];

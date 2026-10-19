import type { GenderPref } from '@/features/stylist/types/ai-stylist-page';

export const OCCASIONS = ['Đi làm', 'Phỏng vấn', 'Họp quan trọng', 'Sự kiện', 'Dạ tiệc'];

export const STYLE_PREFERENCES = ['Lịch lãm', 'Tối giản', 'Năng động', 'Thanh lịch', 'Smart casual'];

export const BUDGETS = ['Dưới 500k', '500k - 1 triệu', '1 - 2 triệu', 'Trên 2 triệu'];

export const GENDER_OPTIONS: { value: Exclude<GenderPref, ''>; label: string }[] = [
  { value: 'female', label: 'Nữ' },
  { value: 'male', label: 'Nam' },
  { value: 'other', label: 'Khác' },
];

export const IMAGE_CONSENT_TEXT =
  'Đây là ảnh của tôi (hoặc tôi có quyền dùng ảnh) và tôi đồng ý cho FashionAI dùng ảnh chỉ để phân tích. Ảnh không được lưu lại.';

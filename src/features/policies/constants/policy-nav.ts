import type { PolicyNavItem } from '@/features/policies/types/policy';
import { FileText, Lock, RotateCcw, Ruler, ShieldCheck } from 'lucide-react';

export const POLICY_NAV_ITEMS: readonly PolicyNavItem[] = [
  { slug: 'return-policy', href: '/return-policy', label: 'Chính sách đổi trả', icon: RotateCcw },
  { slug: 'warranty', href: '/warranty', label: 'Chính sách bảo hành', icon: ShieldCheck },
  { slug: 'size-guide', href: '/size-guide', label: 'Hướng dẫn chọn size', icon: Ruler },
  { slug: 'privacy', href: '/privacy', label: 'Chính sách bảo mật', icon: Lock },
  { slug: 'terms', href: '/terms', label: 'Điều khoản dịch vụ', icon: FileText },
];

export const POLICY_CONTACT = {
  hotline: '1900 6868',
  hotlineHours: '8:30 - 22:00, tất cả các ngày trong tuần',
  email: 'contact@fashionai.vn',
  address: 'Số 126 Nguyễn Thị Minh Khai, Phường 6, Quận 3, TP. Hồ Chí Minh',
} as const;

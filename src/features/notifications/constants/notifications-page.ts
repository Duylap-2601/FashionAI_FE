import { NotificationType } from '@/features/notifications/types/notification';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  CreditCard,
  Info,
  Package,
  Tag
} from 'lucide-react';

export const TABS: { id: string; label: string; type?: NotificationType; icon: LucideIcon }[] = [
  { id: 'all', label: 'Tất cả', icon: Bell },
  { id: 'order', label: 'Đơn hàng', type: 'ORDER_STATUS', icon: Package },
  { id: 'payment', label: 'Thanh toán', type: 'PAYMENT', icon: CreditCard },
  { id: 'promotion', label: 'Khuyến mãi', type: 'PROMOTION', icon: Tag },
  { id: 'system', label: 'Hệ thống', type: 'SYSTEM', icon: Info },
];

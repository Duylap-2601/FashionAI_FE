export interface AccountNavItem {
  href: string;
  label: string;
  /** Hiện số thông báo chưa đọc cạnh mục này. */
  showUnread?: boolean;
}

/** Các trang trong menu tài khoản ở header, cùng thứ tự. */
export const ACCOUNT_PRIMARY_NAV: AccountNavItem[] = [
  { href: '/profile', label: 'Hồ sơ của tôi' },
  { href: '/profile/measurements', label: 'Số đo & chi tiết' },
  { href: '/profile/orders', label: 'Đơn hàng' },
  { href: '/profile/reviews', label: 'Đánh giá của tôi' },
  { href: '/notifications', label: 'Thông báo', showUnread: true },
];

export const ACCOUNT_SECONDARY_NAV: AccountNavItem[] = [
  { href: '/profile/addresses', label: 'Sổ địa chỉ' },
  { href: '/profile/history', label: 'Lịch sử thử đồ' },
  { href: '/profile/stylist-history', label: 'Lịch sử AI Stylist' },
  { href: '/subscription', label: 'Gói thành viên' },
];

export const ACCOUNT_TIER_LABELS: Record<string, string> = {
  FREE: 'Miễn phí',
  MEMBER: 'Member',
  VIP: 'VIP',
};

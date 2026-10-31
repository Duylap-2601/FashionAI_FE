import type { AdminNavItem, AdminPage, AdminPagination, AdminSidebarItem, GarmentCategory, ProductStatus } from '@/features/admin/types/admin-dashboard-page';
import type { AdminOrderIssueFilters } from '@/features/admin/types/admin-order-issues-panel';
import type { AdminOrderFilters } from '@/features/admin/types/admin-orders-panel';
import type { AdminProductFilters } from '@/features/admin/types/admin-products-panel';
import type { AdminShipmentFilters } from '@/features/admin/types/admin-shipments-panel';
import type { AdminUserFilters } from '@/features/admin/types/admin-users-panel';
import type { BackendOrderStatus, OrderDisplayStatus } from '@/features/orders/types/orders';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  BadgePercent,
  BarChart3,
  CheckCircle2,
  Clock,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Package,
  Radio,
  RotateCcw,
  Scissors,
  Share2,
  ShieldAlert,
  ShoppingBag,
  Tag,
  Truck,
  Users,
  XCircle
} from 'lucide-react';

export const ADMIN_PAGES: AdminPage[] = ['dashboard', 'analytics', 'platforms', 'products', 'collections', 'users', 'orders', 'shipments', 'order-issues', 'coupons', 'sale-campaigns', 'reviews', 'shipping-settings', 'live-try-on-settings', 'webhook-failures', 'reconciliation'];

export function isAdminPage(value: string | null | undefined): value is AdminPage {
  return Boolean(value && ADMIN_PAGES.includes(value as AdminPage));
}

// 'webhook-failures' vẫn mở được qua URL/notification nhưng không có mục riêng trên sidebar.
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Phân tích', icon: BarChart3 },
  { id: 'platforms', label: 'Nền tảng', icon: Share2 },
  { id: 'products', label: 'Sản phẩm', icon: Package },
  { id: 'collections', label: 'Bộ sưu tập', icon: Layers },
  { id: 'users', label: 'Người dùng', icon: Users },
  { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
  { id: 'shipments', label: 'Vận đơn', icon: Truck },
  { id: 'order-issues', label: 'Báo lỗi & Đổi trả', icon: ShieldAlert },
  { id: 'coupons', label: 'Mã giảm giá', icon: Tag },
  { id: 'sale-campaigns', label: 'Chiến dịch sale', icon: BadgePercent },
  { id: 'reconciliation', label: 'Đối soát giao dịch lạ', icon: AlertTriangle },
  { id: 'reviews', label: 'Đánh giá', icon: MessageSquare },
  { id: 'shipping-settings', label: 'Cài đặt GHN', icon: Truck },
  { id: 'live-try-on-settings', label: 'Live Try-On', icon: Radio },
];

/** Menu sidebar admin hỗ trợ các nhóm tab sổ xuống (collapsible accordion).
 * Các tab có tab con được ưu tiên xếp lên trên, các tab độc lập ở phía dưới.
 */
export const ADMIN_NAV_ENTRIES: AdminSidebarItem[] = [
  // 1. Dashboard tổng quan
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },

  // 2. Các nhóm có tab con (đẩy lên trên)
  {
    id: 'group-products-collections',
    label: 'Sản phẩm & Bộ sưu tập',
    icon: Package,
    children: [
      { id: 'products', label: 'Sản phẩm', icon: Package },
      { id: 'collections', label: 'Bộ sưu tập', icon: Layers },
    ],
  },
  {
    id: 'group-orders-shipments',
    label: 'Đơn hàng & Vận đơn',
    icon: ShoppingBag,
    children: [
      { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
      { id: 'shipments', label: 'Vận đơn', icon: Truck },
    ],
  },
  {
    id: 'group-users-reviews',
    label: 'Người dùng & Đánh giá',
    icon: Users,
    children: [
      { id: 'users', label: 'Người dùng', icon: Users },
      { id: 'reviews', label: 'Đánh giá', icon: MessageSquare },
    ],
  },
  {
    id: 'group-analytics-platforms',
    label: 'Phân tích & Nền tảng',
    icon: BarChart3,
    children: [
      { id: 'analytics', label: 'Phân tích', icon: BarChart3 },
      { id: 'platforms', label: 'Nền tảng', icon: Share2 },
    ],
  },

  // 3. Các tab đơn lẻ không có tab con (ở dưới)
  { id: 'order-issues', label: 'Báo lỗi & Đổi trả', icon: ShieldAlert },
  { id: 'coupons', label: 'Mã giảm giá', icon: Tag },
  { id: 'sale-campaigns', label: 'Chiến dịch sale', icon: BadgePercent },
  { id: 'reconciliation', label: 'Đối soát giao dịch lạ', icon: AlertTriangle },
  { id: 'shipping-settings', label: 'Cài đặt GHN', icon: Truck },
  { id: 'live-try-on-settings', label: 'Live Try-On', icon: Radio },
];

export const ADMIN_PAGE_TITLES: Record<AdminPage, string> = {
  dashboard: 'Tổng quan kinh doanh',
  analytics: 'Phân tích truy cập',
  platforms: 'Nền tảng người dùng',
  products: 'Quản lý sản phẩm',
  collections: 'Quản lý bộ sưu tập',
  users: 'Quản lý người dùng',
  orders: 'Quản lý đơn hàng',
  shipments: 'Quản lý vận đơn',
  'order-issues': 'Quản lý Báo lỗi & Đổi trả',
  coupons: 'Quản lý mã giảm giá',
  'sale-campaigns': 'Quản lý chiến dịch sale',
  'webhook-failures': 'Đối soát giao dịch lạ',
  reconciliation: 'Đối soát giao dịch lạ',
  reviews: 'Quản lý đánh giá sản phẩm',
  'shipping-settings': 'Cài đặt GHN',
  'live-try-on-settings': 'Cài đặt Live Try-On',
};

export const DEFAULT_ADMIN_PAGINATION: AdminPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
};

export const EMPTY_PRODUCT_FILTERS: AdminProductFilters = { category: '', status: '', search: '' };
export const EMPTY_ORDER_FILTERS: AdminOrderFilters = { search: '', status: '', paymentStatus: '', fromDate: '', toDate: '' };
export const EMPTY_USER_FILTERS: AdminUserFilters = { search: '', tier: '', role: '', isVerified: '' };
export const EMPTY_SHIPMENT_FILTERS: AdminShipmentFilters = {};
export const EMPTY_ORDER_ISSUE_FILTERS: AdminOrderIssueFilters = { status: '', reason: '' };

/** Users được tải một lần rồi lọc/phân trang phía client. */
export const ADMIN_USERS_FETCH_LIMIT = 1000;
export const ADMIN_REVIEW_SCAN_LIMIT = 50;

/** Chu kỳ đồng bộ đơn hàng/vận đơn/thống kê khi tab trình duyệt đang hiển thị. */
export const ADMIN_REFRESH_INTERVAL_MS = 30_000;
/** Chu kỳ kiểm tra socket realtime đã được tạo/tạo lại để gắn listener (không gọi mạng). */
export const ADMIN_SOCKET_CHECK_MS = 2_000;
/** Gộp socket event và notification bắn liên tiếp cho cùng một thay đổi thành một lần tải lại. */
export const ADMIN_REALTIME_DEBOUNCE_MS = 500;
// 'notification' không nằm ở đây: RealtimeProvider đã đưa nó vào notification store và dashboard
// tải lại theo store.
export const ADMIN_REALTIME_EVENTS = [
  'order:created',
  'order:updated',
  'order_status',
  'shipment:created',
  'shipment:updated',
  'shipment_status',
] as const;

/** Trạng thái đơn không tính vào doanh thu khi backend không trả số liệu. */
export const NON_REVENUE_STATUSES: BackendOrderStatus[] = ['CANCELLED', 'FAILED', 'EXPIRED', 'PENDING', 'RETURNED'];

export const ADMIN_PRODUCT_FALLBACK_IMAGE = '/images/731163514_999523332788054_1114320478812927640_n.png';
export const DEFAULT_PRODUCT_COLOR_HEX = '#5D1C34';

export const CATEGORY_LABEL: Record<GarmentCategory, string> = {
  UPPER: 'Áo',
  LOWER: 'Quần / Váy',
  FULL_BODY: 'Toàn thân',
};

export const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL', 'Free'];

export const PRODUCT_STATUS_CFG: Record<ProductStatus, { label: string; cls: string; dotCls: string }> = {
  ACTIVE: {
    label: 'Đang bán',
    cls: 'text-neutral-900',
    dotCls: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.45)]',
  },
  DRAFT: {
    label: 'Bản nháp',
    cls: 'text-neutral-500',
    dotCls: 'bg-neutral-300',
  },
  ARCHIVED: {
    label: 'Ngừng bán',
    cls: 'text-neutral-400',
    dotCls: 'bg-stone-400',
  },
};

export const ORDER_STATUS_CFG: Record<string, { label: string; cls: string; icon: LucideIcon }> = {
  CREATED: { label: 'Đã tạo', cls: 'bg-slate-500/10 text-slate-800 border border-slate-500/20', icon: Clock },
  PENDING: { label: 'Chờ xác nhận', cls: 'bg-amber-500/10 text-amber-900 border border-amber-500/20', icon: Clock },
  PAID: { label: 'Đã thanh toán', cls: 'bg-emerald-500/10 text-emerald-900 border border-emerald-500/20', icon: CheckCircle2 },
  CONFIRMED: { label: 'Đã xác nhận', cls: 'bg-emerald-500/10 text-emerald-900 border border-emerald-500/20', icon: CheckCircle2 },
  MEASUREMENT_REVIEW: { label: 'Kiểm tra số đo', cls: 'bg-brand-navy/8 text-brand-navy border border-brand-navy/15', icon: Scissors },
  MEASUREMENT_CONFIRMED: { label: 'Chốt số đo', cls: 'bg-brand-navy/10 text-brand-navy border border-brand-navy/20', icon: CheckCircle2 },
  TAILORING: { label: 'Đang may', cls: 'bg-[#5D1C34]/10 text-[#5D1C34] border border-[#5D1C34]/20', icon: Scissors },
  QUALITY_CHECK: { label: 'Kiểm tra chất lượng', cls: 'bg-brand-gold/15 text-brand-navy border border-brand-gold/30', icon: CheckCircle2 },
  READY_TO_SHIP: { label: 'Sẵn sàng giao', cls: 'bg-sky-500/10 text-sky-900 border border-sky-500/20', icon: Truck },
  SHIPPING: { label: 'Đang giao', cls: 'bg-brand-navy/10 text-brand-navy border border-brand-navy/20', icon: Truck },
  DELIVERED: { label: 'Đã giao hàng', cls: 'bg-emerald-500/10 text-emerald-900 border border-emerald-500/20', icon: CheckCircle2 },
  COMPLETED: { label: 'Hoàn thành', cls: 'bg-emerald-500/12 text-emerald-950 border border-emerald-600/25', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã hủy', cls: 'bg-rose-500/10 text-rose-900 border border-rose-500/20', icon: XCircle },
  RETURNED: { label: 'Hoàn trả', cls: 'bg-neutral-100 text-neutral-700 border border-neutral-200', icon: RotateCcw },
  EXPIRED: { label: 'Hết hạn', cls: 'bg-neutral-100 text-neutral-500 border border-neutral-200', icon: XCircle },
  FAILED: { label: 'Thất bại', cls: 'bg-rose-500/10 text-rose-900 border border-rose-500/20', icon: XCircle },
};

export function resolveOrderStatusCfg(
  status: string,
  displayStatus?: OrderDisplayStatus | null
): { label: string; cls: string; icon: LucideIcon } {
  const base = ORDER_STATUS_CFG[status] || ORDER_STATUS_CFG.PENDING;
  if (!displayStatus || displayStatus.source === 'ORDER') return base;

  const code = (displayStatus.code || '').toLowerCase();
  let visual = ORDER_STATUS_CFG.SHIPPING;
  if (code === 'delivered') visual = ORDER_STATUS_CFG.DELIVERED;
  else if (code === 'cancel') visual = ORDER_STATUS_CFG.CANCELLED;
  else if (displayStatus.issue) visual = ORDER_STATUS_CFG.FAILED;
  else if (code.startsWith('return')) visual = ORDER_STATUS_CFG.RETURNED;

  return { ...visual, label: displayStatus.label };
}

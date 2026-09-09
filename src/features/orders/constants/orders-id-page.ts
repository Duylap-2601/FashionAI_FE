export const STATUS_MAP: Record<string, { label: string; color: string; step: number; desc: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-amber-50 text-amber-700 border-amber-200', step: 0, desc: 'Đơn hàng đang chờ FashionAI xác nhận' },
  PAID: { label: 'Đã thanh toán', color: 'bg-blue-50 text-blue-700 border-blue-200', step: 1, desc: 'Thanh toán thành công. Đang đóng gói sản phẩm' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-700 border-blue-200', step: 1, desc: 'Đơn hàng đã được xác nhận và đang đóng gói' },
  SHIPPING: { label: 'Đang giao hàng', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', step: 2, desc: 'Đơn hàng đang trên đường giao tới bạn' },
  DELIVERED: { label: 'Đã giao hàng', color: 'bg-green-50 text-green-700 border-green-200', step: 3, desc: 'Đơn hàng đã giao thành công' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-50 text-red-600 border-red-200', step: -1, desc: 'Đơn hàng đã được hủy' },
  RETURNED: { label: 'Hoàn trả', color: 'bg-neutral-100 text-neutral-600 border-neutral-300', step: -1, desc: 'Đơn hàng đã được hoàn trả' },
};

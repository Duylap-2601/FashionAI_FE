export const STATUS_MAP: Record<string, { label: string; color: string; step: number; desc: string }> = {
  PENDING: { label: 'Chờ thanh toán', color: 'bg-amber-50 text-amber-700 border-amber-200', step: 0, desc: 'Đơn hàng đang chờ thanh toán online' },
  PAID: { label: 'Đã thanh toán', color: 'bg-blue-50 text-blue-700 border-blue-200', step: 1, desc: 'Thanh toán thành công, chờ shop kiểm tra số đo' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-700 border-blue-200', step: 1, desc: 'Đơn hàng đã được xác nhận và đang đóng gói' },
  MEASUREMENT_REVIEW: { label: 'Kiểm tra số đo', color: 'bg-purple-50 text-purple-700 border-purple-200', step: 2, desc: 'Shop đang kiểm tra hoặc chờ bạn bổ sung số đo' },
  MEASUREMENT_CONFIRMED: { label: 'Chốt số đo', color: 'bg-purple-50 text-purple-700 border-purple-200', step: 3, desc: 'Số đo đã được xác nhận' },
  TAILORING: { label: 'Đang may', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', step: 4, desc: 'Trang phục đang được may theo số đo' },
  QUALITY_CHECK: { label: 'QC', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', step: 5, desc: 'Đơn hàng đang kiểm tra chất lượng' },
  READY_TO_SHIP: { label: 'Sẵn sàng giao', color: 'bg-sky-50 text-sky-700 border-sky-200', step: 6, desc: 'Đơn hàng đã sẵn sàng bàn giao vận chuyển' },
  SHIPPING: { label: 'Đang giao hàng', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', step: 7, desc: 'Đơn hàng đang trên đường giao tới bạn' },
  DELIVERED: { label: 'Đã giao hàng', color: 'bg-green-50 text-green-700 border-green-200', step: 8, desc: 'Đơn hàng đã giao thành công' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-50 text-red-600 border-red-200', step: -1, desc: 'Đơn hàng đã được hủy' },
  RETURNED: { label: 'Hoàn trả', color: 'bg-neutral-100 text-neutral-600 border-neutral-300', step: -1, desc: 'Đơn hàng đã được hoàn trả' },
  EXPIRED: { label: 'Hết hạn', color: 'bg-neutral-100 text-neutral-600 border-neutral-300', step: -1, desc: 'Đơn hàng đã hết hạn thanh toán' },
  FAILED: { label: 'Thất bại', color: 'bg-red-50 text-red-600 border-red-200', step: -1, desc: 'Thanh toán hoặc xử lý đơn thất bại' },
};

export const TAILORING_STEPS = ['Đặt hàng', 'Thanh toán', 'Kiểm số đo', 'Chốt số đo', 'Đang may', 'QC', 'Sẵn sàng giao', 'Đang giao', 'Đã giao'];

export const STATUS_MAP: Record<string, { label: string; color: string; step: number; desc: string }> = {
  PENDING: { label: 'Chờ thanh toán', color: 'bg-amber-50 text-amber-700 border-amber-200', step: 0, desc: 'Đơn hàng đang chờ thanh toán online' },
  PAID: { label: 'Đã thanh toán', color: 'bg-blue-50 text-blue-700 border-blue-200', step: 1, desc: 'Thanh toán thành công, chờ shop kiểm tra số đo' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-700 border-blue-200', step: 1, desc: 'Đơn hàng đã được xác nhận và đang đóng gói' },
  MEASUREMENT_REVIEW: { label: 'Đang may đo', color: 'bg-purple-50 text-purple-700 border-purple-200', step: 2, desc: 'Shop đang kiểm tra số đo và chuẩn bị may đo' },
  MEASUREMENT_CONFIRMED: { label: 'Đang may đo', color: 'bg-purple-50 text-purple-700 border-purple-200', step: 2, desc: 'Số đo đã được xác nhận, đơn hàng chuẩn bị vào xưởng' },
  TAILORING: { label: 'Đang may đo', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', step: 2, desc: 'Trang phục đang được may theo số đo' },
  QUALITY_CHECK: { label: 'Đang may đo', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', step: 2, desc: 'Đơn hàng đang được hoàn thiện và kiểm tra chất lượng' },
  READY_TO_SHIP: { label: 'Sẵn sàng giao', color: 'bg-sky-50 text-sky-700 border-sky-200', step: 3, desc: 'Đơn hàng đã sẵn sàng bàn giao vận chuyển' },
  SHIPPING: { label: 'Đang giao hàng', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', step: 4, desc: 'Đơn hàng đang trên đường giao tới bạn' },
  DELIVERED: { label: 'Đã giao hàng', color: 'bg-green-50 text-green-700 border-green-200', step: 5, desc: 'Đơn vị vận chuyển báo đã giao hàng. Vui lòng xác nhận khi bạn đã nhận được.' },
  COMPLETED: { label: 'Hoàn tất', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', step: 5, desc: 'Bạn đã xác nhận nhận hàng thành công' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-50 text-red-600 border-red-200', step: -1, desc: 'Đơn hàng đã được hủy' },
  RETURNED: { label: 'Hoàn trả', color: 'bg-neutral-100 text-neutral-600 border-neutral-300', step: -1, desc: 'Đơn hàng đã được hoàn trả' },
  EXPIRED: { label: 'Hết hạn', color: 'bg-neutral-100 text-neutral-600 border-neutral-300', step: -1, desc: 'Đơn hàng đã hết hạn thanh toán' },
  FAILED: { label: 'Thất bại', color: 'bg-red-50 text-red-600 border-red-200', step: -1, desc: 'Thanh toán hoặc xử lý đơn thất bại' },
};

export const TAILORING_STEPS = ['Đặt hàng', 'Thanh toán', 'May đo', 'Sẵn sàng giao', 'Đang giao', 'Đã giao'];

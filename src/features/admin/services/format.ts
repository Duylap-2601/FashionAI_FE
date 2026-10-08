export function fmt(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

const SHIPMENT_RAW_STATUS_LABELS: Record<string, string> = {
  ready_to_pick: 'Chờ lấy hàng',
  picking: 'Đang lấy hàng',
  money_collect_picking: 'Đang thu tiền khi lấy hàng',
  picked: 'Đã lấy hàng',
  storing: 'Đang lưu kho',
  sorting: 'Đang phân loại',
  transporting: 'Đang trung chuyển',
  delivering: 'Đang giao hàng',
  money_collect_delivering: 'Đang thu tiền khi giao hàng',
  delivered: 'Đã giao hàng',
  delivery_fail: 'Giao hàng không thành công',
  waiting_to_return: 'Chờ hoàn hàng',
  return: 'Đang hoàn hàng',
  return_transporting: 'Đang trung chuyển hoàn hàng',
  return_sorting: 'Đang phân loại hoàn hàng',
  returning: 'Đang trả hàng',
  return_fail: 'Hoàn hàng không thành công',
  returned: 'Đã hoàn hàng',
  cancel: 'Vận đơn đã hủy',
  exception: 'Vận đơn gặp sự cố',
  lost: 'Thất lạc hàng',
  damage: 'Hàng bị hư hỏng',
  scrap: 'Hàng bị hủy',
};

const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ tạo vận đơn',
  UNKNOWN: 'Chưa rõ',
  CREATED: 'Đã tạo vận đơn',
  READY_TO_PICK: 'Chờ lấy hàng',
  PICKING: 'Đang lấy hàng',
  PICKED: 'Đã lấy hàng',
  SHIPPING: 'Đang vận chuyển',
  IN_TRANSIT: 'Đang vận chuyển',
  DELIVERING: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  DELIVERY_FAILED: 'Giao hàng không thành công',
  RETURNING: 'Đang hoàn hàng',
  RETURNED: 'Đã hoàn hàng',
  CANCELLED: 'Đã hủy',
  FAILED: 'Tạo vận đơn thất bại',
};

export function shipmentStatusLabel(status?: string | null, rawStatus?: string | null): string {
  const raw = (rawStatus ?? '').trim().toLowerCase();
  if (raw) return SHIPMENT_RAW_STATUS_LABELS[raw] ?? raw;
  if (!status) return '—';
  return SHIPMENT_STATUS_LABELS[status] ?? status;
}

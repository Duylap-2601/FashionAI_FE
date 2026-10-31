'use client';

import { fmt, shipmentStatusLabel } from '@/features/admin/services/format';
import type { AdminOrderModalProps } from '@/features/admin/types/admin-order-modal';
import { useOrder } from '@/features/orders/hooks/useOrders';
import type { BackendOrderStatus } from '@/features/orders/types/orders';
import {
  Loader2,
  Package,
  Scissors,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const ORDER_STATUS_OPTIONS: Record<BackendOrderStatus, string> = {
  CREATED: 'Đã tạo',
  PENDING_PAYMENT: 'Chờ thanh toán',
  PENDING: 'Chờ xác nhận',
  PAID: 'Đã thanh toán',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  MEASUREMENT_REVIEW: 'Kiểm tra số đo',
  MEASUREMENT_CONFIRMED: 'Chốt số đo',
  TAILORING: 'Đang may',
  QUALITY_CHECK: 'Kiểm tra chất lượng',
  READY_TO_SHIP: 'Sẵn sàng giao',
  SHIPPING: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Hủy đơn',
  RETURN_REQUESTED: 'Yêu cầu hoàn trả',
  RETURN_APPROVED: 'Duyệt hoàn trả',
  RETURNING: 'Đang hoàn trả',
  RETURNED: 'Hoàn trả',
  EXPIRED: 'Hết hạn',
  FAILED: 'Thất bại',
};

const ADMIN_ORDER_STATUS_OPTIONS: BackendOrderStatus[] = [
  'CREATED',
  'MEASUREMENT_REVIEW',
  'MEASUREMENT_CONFIRMED',
  'TAILORING',
  'READY_TO_SHIP',
  'CANCELLED',
];

export function AdminOrderModal({ setSelectedOrder, selectedOrder, handleUpdateOrderStatus, handleConfirmManualPayment, handleUpdateRefund, handleCreateShipment }: AdminOrderModalProps) {
  const { order: orderDetail, isLoading: isLoadingDetail } = useOrder(selectedOrder.id);

  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [refundNote, setRefundNote] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [creatingShipment, setCreatingShipment] = useState(false);
  const createShipmentAbortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const isPending = selectedOrder.status === 'PENDING' || selectedOrder.paymentStatus === 'PENDING' || selectedOrder.status === 'CREATED';
  const refundRequired = selectedOrder.refundStatus === 'REQUIRED' || selectedOrder.refundStatus === 'PROCESSING';
  const refundCompleted = selectedOrder.refundStatus === 'COMPLETED';
  const statusOptions = ADMIN_ORDER_STATUS_OPTIONS.includes(selectedOrder.status)
    ? ADMIN_ORDER_STATUS_OPTIONS
    : [selectedOrder.status, ...ADMIN_ORDER_STATUS_OPTIONS];
  const canCreateShipment = selectedOrder.status === 'READY_TO_SHIP' && selectedOrder.paymentStatus === 'PAID' && !selectedOrder.shipment;

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      createShipmentAbortRef.current?.abort();
    };
  }, []);

  const onConfirmManualPayment = async () => {
    const confirmNote = note.trim() || 'Xác nhận thanh toán thủ công';
    setSubmitting(true);
    try {
      await handleConfirmManualPayment(selectedOrder.orderCode, confirmNote, confirmNote);
      setNote('');
    } finally {
      setSubmitting(false);
    }
  };

  const onConfirmRefund = async () => {
    if (!refundNote.trim()) {
      toast.error('Vui lòng nhập ghi chú xác nhận hoàn tiền.');
      return;
    }
    setRefundSubmitting(true);
    try {
      await handleUpdateRefund(selectedOrder.id, refundNote.trim(), refundNote.trim());
      setRefundNote('');
    } finally {
      setRefundSubmitting(false);
    }
  };

  const handleStatusChange = (newStatus: BackendOrderStatus) => {
    handleUpdateOrderStatus(selectedOrder.id, newStatus);
  };

  const onCreateShipment = async () => {
    if (creatingShipment) return;
    createShipmentAbortRef.current?.abort();

    const controller = new AbortController();
    createShipmentAbortRef.current = controller;
    setCreatingShipment(true);

    try {
      await handleCreateShipment(selectedOrder.id, controller.signal);
    } finally {
      if (createShipmentAbortRef.current === controller) {
        createShipmentAbortRef.current = null;
      }
      if (mountedRef.current) {
        setCreatingShipment(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <motion.div
        className="absolute inset-0 bg-landing-obsidian/50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => setSelectedOrder(null)}
      />
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-full max-w-[480px] bg-landing-ivory flex flex-col z-10"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-landing-line">
          <div>
            <h2 className="font-display text-[1.15rem] leading-tight text-landing-obsidian">Chi tiết đơn hàng</h2>
            <p className="text-label-sm text-landing-muted font-mono">{selectedOrder.code}</p>
          </div>
          <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-landing-paper border-0 bg-transparent cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div>
            <p className="text-label-sm font-semibold text-landing-muted uppercase tracking-wide mb-2">Thông tin giao nhận</p>
            <p className="text-body-sm font-medium text-landing-obsidian">Khách hàng: {selectedOrder.customer}</p>
            <p className="text-body-sm text-landing-obsidian mt-1">Điện thoại: {selectedOrder.phone || '—'}</p>
            <p className="text-body-sm text-landing-obsidian mt-1">Địa chỉ: {selectedOrder.address || '—'}</p>
            <p className="text-body-sm text-landing-obsidian mt-1">Email: {selectedOrder.email || '—'}</p>
          </div>

          <div className="rounded-[2px] border border-landing-line p-4 bg-landing-paper/30">
            <p className="text-label-sm font-semibold text-landing-muted uppercase tracking-wide mb-3">Thanh toán & Chi phí</p>
            <div className="space-y-1.5 text-body-sm">
              <div className="flex justify-between text-landing-obsidian">
                <span>Phương thức:</span>
                <span className="font-semibold text-landing-obsidian">{orderDetail?.paymentMethod || selectedOrder.payment || '—'}</span>
              </div>
              <div className="flex justify-between text-landing-obsidian">
                <span>Trạng thái:</span>
                <span className="font-semibold text-landing-obsidian">{orderDetail?.paymentStatus || selectedOrder.paymentStatus || '—'}</span>
              </div>
              {orderDetail?.itemsSubtotalVnd !== undefined ? (
                <div className="flex justify-between text-landing-obsidian">
                  <span>Tiền hàng:</span>
                  <span className="text-landing-obsidian">{fmt(orderDetail.itemsSubtotalVnd)}</span>
                </div>
              ) : orderDetail?.itemsTotal ? (
                <div className="flex justify-between text-landing-obsidian">
                  <span>Tiền hàng:</span>
                  <span className="text-landing-obsidian">{fmt(orderDetail.itemsTotal)}</span>
                </div>
              ) : null}
              {orderDetail?.shippingFeeVnd !== undefined ? (
                <div className="flex justify-between text-landing-obsidian">
                  <span>Phí vận chuyển:</span>
                  <span className="text-landing-obsidian">{fmt(orderDetail.shippingFeeVnd)}</span>
                </div>
              ) : orderDetail?.shippingFee ? (
                <div className="flex justify-between text-landing-obsidian">
                  <span>Phí vận chuyển:</span>
                  <span className="text-landing-obsidian">{fmt(orderDetail.shippingFee)}</span>
                </div>
              ) : null}
              {((orderDetail?.discountVnd && orderDetail.discountVnd > 0) || (orderDetail?.discountAmount && orderDetail.discountAmount > 0)) && (
                <div className="flex justify-between text-metric-products font-medium">
                  <span>Giảm giá:</span>
                  <span>-{fmt(orderDetail.discountVnd ?? orderDetail.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-display text-[1.05rem] leading-tight text-landing-oxblood pt-2 border-t border-landing-line">
                <span>Tổng tiền đơn:</span>
                <span>{fmt(orderDetail?.totalVnd ?? selectedOrder.totalVnd ?? selectedOrder.total)}</span>
              </div>
              {orderDetail?.amountPaidVnd !== undefined && (
                <div className="flex justify-between text-xs text-landing-obsidian pt-1">
                  <span>Đã thu khách:</span>
                  <span className="font-semibold text-metric-products">{fmt(orderDetail.amountPaidVnd)}</span>
                </div>
              )}
              {orderDetail?.amountRefundedVnd !== undefined && orderDetail.amountRefundedVnd > 0 && (
                <div className="flex justify-between text-xs text-landing-obsidian">
                  <span>Đã hoàn lại:</span>
                  <span className="font-semibold text-destructive">-{fmt(orderDetail.amountRefundedVnd)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Transactions Card */}
          {((orderDetail?.payments && orderDetail.payments.length > 0) || (selectedOrder.payments && selectedOrder.payments.length > 0)) && (
            <div className="rounded-[2px] border border-landing-line p-4 bg-landing-ivory">
              <div className="flex items-center justify-between mb-3">
                <p className="text-label-sm font-semibold text-landing-muted uppercase tracking-wide">
                  Chi tiết giao dịch thanh toán
                </p>
                <span className="text-xs bg-landing-paper text-landing-obsidian px-2 py-0.5 rounded-full font-medium">
                  {(orderDetail?.payments || selectedOrder.payments || []).length} GD
                </span>
              </div>
              <div className="space-y-2.5">
                {(orderDetail?.payments || selectedOrder.payments || []).map((p, idx) => (
                  <div key={p.id || idx} className="p-3 bg-landing-paper/60 rounded-[2px] border border-landing-line text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-landing-obsidian uppercase px-2 py-0.5 bg-landing-taupe rounded text-[11px]">
                          {p.provider || 'SEPAY'}
                        </span>
                        {p.transactionId && (
                          <span className="font-mono text-landing-muted text-[11px]">
                            Mã GD: {p.transactionId}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'PAID'
                          ? 'bg-metric-products/10 text-metric-products'
                          : p.status === 'FAILED'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-metric-users/10 text-metric-users'
                      }`}>
                        {p.status || 'PENDING'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-landing-muted">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString('vi-VN') : '—'}
                      </span>
                      <span className="font-bold text-landing-oxblood text-body-sm">
                        {p.amountVnd !== undefined ? fmt(p.amountVnd) : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refund History Card */}
          {((orderDetail?.refunds && orderDetail.refunds.length > 0) || (selectedOrder.refunds && selectedOrder.refunds.length > 0)) && (
            <div className="rounded-[2px] border border-metric-users/30 p-4 bg-metric-users/10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-label-sm font-semibold text-metric-users uppercase tracking-wide">
                  Lịch sử hoàn tiền
                </p>
                <span className="text-xs bg-metric-users/10 text-metric-users px-2 py-0.5 rounded-full font-bold">
                  {(orderDetail?.refunds || selectedOrder.refunds || []).length} lượt
                </span>
              </div>
              <div className="space-y-2.5">
                {(orderDetail?.refunds || selectedOrder.refunds || []).map((r, idx) => (
                  <div key={r.id || idx} className="p-3 bg-landing-ivory rounded-[2px] border border-metric-users/30 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-destructive text-body-sm">
                        -{fmt(r.amountVnd)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'COMPLETED'
                          ? 'bg-metric-products/10 text-metric-products'
                          : r.status === 'FAILED'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-metric-users/10 text-metric-users'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    {r.reason && (
                      <p className="text-landing-obsidian"><strong>Lý do:</strong> {r.reason}</p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-landing-muted">
                      <span>Cổng: {r.provider}</span>
                      <span>Yêu cầu: {new Date(r.requestedAt).toLocaleString('vi-VN')}</span>
                    </div>
                    {r.processedAt && (
                      <p className="text-[11px] text-landing-muted">
                        Xử lý lúc: {new Date(r.processedAt).toLocaleString('vi-VN')}
                      </p>
                    )}
                    {r.failedReason && (
                      <p className="text-[11px] text-destructive font-medium">
                        Lỗi: {r.failedReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {orderDetail?.refundEvidence && (
                <div className="mt-2 text-xs text-metric-users bg-metric-users/10 p-2 rounded-[2px]">
                  <strong>Bằng chứng hoàn tiền:</strong> {orderDetail.refundEvidence}
                </div>
              )}
            </div>
          )}

          {/* Dedicated Measurements Sheet Link */}
          <div className="rounded-[2px] border border-metric-ai/30 bg-metric-ai/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-metric-ai" />
                <span className="text-body-sm font-bold text-metric-ai">Phiếu số đo may đo cho thợ may</span>
              </div>
              <span className="text-[11px] bg-metric-ai/20 text-metric-ai font-bold px-2 py-0.5 rounded-full">
                {orderDetail?.items?.length ?? selectedOrder.items} món
              </span>
            </div>
            <p className="text-xs text-metric-ai mb-3 leading-relaxed">
              Bảng thông số may đo theo loại trang phục, đối chiếu 16 số đo thô ban đầu và hồ sơ cá nhân của khách được hiển thị đầy đủ trên trang riêng.
            </p>
            <Link
              href={`/admin/orders/${selectedOrder.id}/measurements`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-metric-ai hover:bg-landing-obsidian text-landing-paper rounded-[2px] text-xs font-bold transition-colors no-underline cursor-pointer"
            >
              <Scissors className="w-4 h-4" />
              <span>Mở phiếu xem số đo chi tiết (Trang riêng)</span>
            </Link>
          </div>

          {/* Compact Order Items Summary */}
          <div className="rounded-[2px] border border-landing-line p-4 bg-landing-paper/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-label-sm font-semibold text-landing-muted uppercase tracking-wide">
                Sản phẩm trong đơn ({orderDetail?.items?.length ?? selectedOrder.items} món)
              </p>
              {isLoadingDetail && <Loader2 className="w-3.5 h-3.5 animate-spin text-landing-muted" />}
            </div>

            {orderDetail?.items && orderDetail.items.length > 0 ? (
              <div className="space-y-2.5">
                {orderDetail.items.map((item, idx) => {
                  const displayImage = item.productImageSnapshot || item.product?.images?.[0];
                  const itemUnitPrice = item.unitPriceVnd ?? item.price;
                  const itemLineTotal = item.lineTotalVnd ?? (item.price * item.quantity);
                  return (
                    <div key={item.id || idx} className="bg-landing-ivory rounded-[2px] border border-landing-line p-3 flex items-center gap-3">
                      {displayImage ? (
                        <Image
                          src={displayImage}
                          alt={item.productNameSnapshot || item.product?.name || 'Sản phẩm'}
                          width={44}
                          height={52}
                          unoptimized
                          className="h-13 w-11 shrink-0 rounded-[2px] border border-landing-line bg-landing-paper object-cover"
                        />
                      ) : (
                        <div className="w-11 h-13 bg-landing-paper rounded-[2px] flex items-center justify-center shrink-0 border border-landing-line">
                          <Package className="w-4 h-4 text-landing-muted" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-bold text-landing-oxblood truncate">
                          {item.productNameSnapshot || item.product?.name || `Sản phẩm #${item.productId}`}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-landing-muted mt-0.5">
                          {item.productSkuSnapshot && (
                            <span className="font-mono text-[11px] text-landing-muted">SKU: {item.productSkuSnapshot}</span>
                          )}
                          <span>Màu: <strong className="text-landing-obsidian">{item.color || 'Mặc định'}</strong></span>
                          <span>•</span>
                          <span>SL: <strong className="text-landing-oxblood font-bold">{item.quantity}</strong></span>
                        </div>
                        <div className="text-[11px] text-landing-muted mt-0.5">
                          Đơn giá: {fmt(itemUnitPrice)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-landing-oxblood">
                          {fmt(itemLineTotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-landing-muted py-2 text-center">
                {isLoadingDetail ? 'Đang tải dữ liệu sản phẩm...' : 'Không có chi tiết sản phẩm.'}
              </div>
            )}
          </div>

          <div className="rounded-[2px] border border-landing-line p-4">
            <p className="text-label-sm font-semibold text-landing-muted uppercase tracking-wide mb-2">Vận chuyển</p>
            {selectedOrder.shipment ? (
              <div className="text-body-sm text-landing-obsidian space-y-1">
                <p>Provider: <span className="font-semibold">{selectedOrder.shipment.provider}</span></p>
                <p>Mã GHN: <span className="font-mono font-semibold">{selectedOrder.shipment.providerOrderCode || '—'}</span></p>
                <p>Trạng thái: {shipmentStatusLabel(selectedOrder.shipment.status, selectedOrder.shipment.rawStatus)}</p>
                <p>Dự kiến giao: {selectedOrder.shipment.expectedDeliveryTime?.substring(0, 16).replace('T', ' ') || '—'}</p>
                <p>Sync cuối: {selectedOrder.shipment.lastSyncedAt?.substring(0, 16).replace('T', ' ') || '—'}</p>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('admin:navigate', { detail: { tab: 'shipments', shipmentCode: selectedOrder.shipment?.providerOrderCode, orderCode: selectedOrder.orderCode } }))}
                  className="mt-2 text-landing-oxblood font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Xem trong tab Vận đơn
                </button>
              </div>
            ) : (
              <div className="text-body-sm text-landing-obsidian">
                <p>Đơn chưa có vận đơn.</p>
                {canCreateShipment ? (
                  <button
                    onClick={onCreateShipment}
                    disabled={creatingShipment}
                    className="mt-3 h-9 px-4 rounded-[2px] bg-landing-oxblood text-landing-paper font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer"
                  >
                    {creatingShipment ? 'Đang tạo...' : 'Tạo vận đơn GHN'}
                  </button>
                ) : (
                  <p className="mt-2 text-label-sm text-landing-muted">Chỉ tạo vận đơn khi đơn sẵn sàng giao và đã thanh toán.</p>
                )}
              </div>
            )}
          </div>

          {refundCompleted && (
            <div className="rounded-[2px] border border-metric-products/30 bg-metric-products/10 p-4">
              <p className="text-body-sm font-semibold text-metric-products">Đã hoàn tiền cho khách</p>
            </div>
          )}

          {refundRequired && (
            <div className="rounded-[2px] border border-metric-users/30 bg-metric-users/10 p-4">
              <p className="text-body-sm font-semibold text-metric-users mb-2">Cần hoàn tiền cho khách</p>
              <p className="text-label-sm text-metric-users mb-3">
                Đơn đã bị hủy sau khi khách đã thanh toán. Sau khi admin chuyển khoản hoàn lại tiền, ghi chú lại để lưu vết.
              </p>
              <div className="flex flex-col gap-2">
                <textarea
                  placeholder="Ghi chú xác nhận đã hoàn tiền (ví dụ: đã chuyển khoản ngày ... qua ...)"
                  value={refundNote}
                  onChange={e => setRefundNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-[2px] border border-metric-users text-body-sm resize-none"
                />
                <button
                  onClick={onConfirmRefund}
                  disabled={refundSubmitting}
                  className="h-9 rounded-[2px] bg-metric-users text-landing-paper text-body-sm font-semibold hover:bg-landing-obsidian disabled:opacity-50 border-0 cursor-pointer"
                >
                  {refundSubmitting ? 'Đang xác nhận...' : 'Xác nhận đã hoàn tiền'}
                </button>
              </div>
            </div>
          )}

          {isPending && (
            <div className="rounded-[2px] border border-metric-users/30 bg-metric-users/10 p-4">
              <p className="text-body-sm font-semibold text-metric-users mb-2">Xác nhận thanh toán thủ công</p>
              <p className="text-label-sm text-metric-users mb-3">
                Dùng khi khách đã chuyển khoản và đã nhận được tiền nhưng hệ thống chưa tự cập nhật trạng thái.
              </p>
              <div className="flex flex-col gap-2">
                <textarea
                  placeholder="Ghi chú xác nhận (ví dụ: đã nhận tiền qua sao kê ngày ...)"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-[2px] border border-metric-users text-body-sm resize-none"
                />
                <button
                  onClick={onConfirmManualPayment}
                  disabled={submitting}
                  className="h-9 rounded-[2px] bg-metric-users text-landing-paper text-body-sm font-semibold hover:bg-landing-obsidian disabled:opacity-50 border-0 cursor-pointer"
                >
                  {submitting ? 'Đang xác nhận...' : 'Xác nhận đã nhận tiền'}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-body-sm font-semibold text-landing-obsidian mb-2">Trạng thái đơn hàng</label>
            <select
              value={selectedOrder.status}
              onChange={e => handleStatusChange(e.target.value as BackendOrderStatus)}
              className="w-full h-10 px-3 rounded-[2px] border border-landing-taupe"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{ORDER_STATUS_OPTIONS[status]}</option>
              ))}
            </select>
            {isPending && (
              <p className="text-label-sm text-landing-muted mt-1">
                Đơn đang chờ thanh toán chỉ có thể hủy, hoặc xác nhận thanh toán thủ công ở trên khi đã nhận được tiền.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

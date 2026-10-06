'use client';

import { fmt } from '@/features/admin/services/format';
import type { AdminOrderModalProps } from '@/features/admin/types/admin-order-modal';
import { allMeasurementFields } from '@/features/measurements/constants/profile-measurements-page';
import { useUserMeasurements } from '@/features/measurements/hooks/useMeasurements';
import { useOrder } from '@/features/orders/hooks/useOrders';
import type { BackendOrderStatus } from '@/features/orders/types/orders';
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  Package,
  Scissors,
  UserCheck,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const ORDER_STATUS_OPTIONS: Record<BackendOrderStatus, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PENDING: 'Chờ xác nhận',
  PAID: 'Đã thanh toán',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  MEASUREMENT_REVIEW: 'Kiểm tra số đo',
  MEASUREMENT_CONFIRMED: 'Chốt số đo',
  TAILORING: 'Đang may',
  QUALITY_CHECK: 'QC',
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

const NEXT_ORDER_STATUSES: Partial<Record<BackendOrderStatus, BackendOrderStatus[]>> = {
  PENDING: ['CANCELLED', 'EXPIRED', 'FAILED'],
  PAID: ['MEASUREMENT_REVIEW', 'CANCELLED'],
  MEASUREMENT_REVIEW: ['MEASUREMENT_CONFIRMED', 'CANCELLED'],
  MEASUREMENT_CONFIRMED: ['TAILORING', 'CANCELLED'],
  TAILORING: ['QUALITY_CHECK'],
  QUALITY_CHECK: ['READY_TO_SHIP', 'TAILORING'],
  READY_TO_SHIP: ['CANCELLED'],
  SHIPPING: ['RETURN_REQUESTED', 'RETURNING', 'RETURNED'],
  DELIVERED: ['COMPLETED', 'RETURN_REQUESTED', 'RETURNING', 'RETURNED'],
  COMPLETED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURN_APPROVED', 'RETURNING', 'RETURNED', 'CANCELLED'],
  RETURN_APPROVED: ['RETURNING', 'RETURNED'],
  RETURNING: ['RETURNED'],
};

export function AdminOrderModal({ setSelectedOrder, selectedOrder, handleUpdateOrderStatus, handleConfirmManualPayment, handleUpdateRefund, handleCreateShipment }: AdminOrderModalProps) {
  const { order: orderDetail, isLoading: isLoadingDetail } = useOrder(selectedOrder.id);
  const [showUserProfileMeasurements, setShowUserProfileMeasurements] = useState(false);
  const { measurements: userMeasurements, isLoading: isLoadingUserMeasurements } = useUserMeasurements(
    showUserProfileMeasurements ? orderDetail?.userId : undefined
  );

  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [refundNote, setRefundNote] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [creatingShipment, setCreatingShipment] = useState(false);
  const createShipmentAbortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const isPending = selectedOrder.status === 'PENDING';
  const refundRequired = selectedOrder.refundStatus === 'REQUIRED' || selectedOrder.refundStatus === 'PROCESSING';
  const refundCompleted = selectedOrder.refundStatus === 'COMPLETED';
  const statusOptions = [selectedOrder.status, ...(NEXT_ORDER_STATUSES[selectedOrder.status] ?? [])];
  const canCreateShipment = selectedOrder.status === 'READY_TO_SHIP' && selectedOrder.paymentStatus === 'PAID' && !selectedOrder.shipment;

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      createShipmentAbortRef.current?.abort();
    };
  }, []);

  const onConfirmManualPayment = async () => {
    if (!note.trim()) {
      toast.error('Vui lòng nhập ghi chú xác nhận.');
      return;
    }
    setSubmitting(true);
    try {
      await handleConfirmManualPayment(selectedOrder.orderCode, note.trim(), note.trim());
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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => setSelectedOrder(null)}
      />
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-full max-w-[560px] bg-white shadow-2xl flex flex-col z-10"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div>
            <h2 className="text-body-lg font-bold text-neutral-900">Chi tiết đơn hàng</h2>
            <p className="text-label-sm text-neutral-500 font-mono">{selectedOrder.code}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/orders/${selectedOrder.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-navy bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors no-underline"
              title="Xem trang chi tiết đơn hàng (/orders/:id)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Trang chi tiết</span>
            </a>
            <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 border-0 bg-transparent cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div>
            <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Thông tin giao nhận</p>
            <p className="text-body-sm font-medium text-neutral-800">Khách hàng: {selectedOrder.customer}</p>
            <p className="text-body-sm text-neutral-600 mt-1">Điện thoại: {selectedOrder.phone || '—'}</p>
            <p className="text-body-sm text-neutral-600 mt-1">Địa chỉ: {selectedOrder.address || '—'}</p>
            <p className="text-body-sm text-neutral-600 mt-1">Email: {selectedOrder.email || '—'}</p>
          </div>

          <div>
            <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Thanh toán</p>
            <p className="text-body-sm text-neutral-600">Phương thức: {selectedOrder.payment || '—'}</p>
            <p className="text-body-sm text-neutral-600 mt-1">Trạng thái: {selectedOrder.paymentStatus || '—'}</p>
            {orderDetail && orderDetail.discountAmount > 0 && (
              <p className="text-body-sm text-emerald-600 mt-1 font-medium">Giảm giá: -{fmt(orderDetail.discountAmount)}</p>
            )}
            <p className="text-body-sm font-bold text-brand-navy mt-1">Tổng tiền: {fmt(selectedOrder.total)}</p>
          </div>

          {/* Order Items & Tailor Measurements */}
          <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide">
                Chi tiết sản phẩm & May đo ({orderDetail?.items?.length ?? selectedOrder.items} món)
              </p>
              {isLoadingDetail && <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />}
            </div>

            {orderDetail?.items && orderDetail.items.length > 0 ? (
              <div className="space-y-3">
                {orderDetail.items.map((item, idx) => (
                  <div key={item.id || idx} className="bg-white rounded-xl border border-neutral-200 p-3.5 shadow-2xs">
                    <div className="flex items-start gap-3">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-12 h-14 object-cover rounded-lg bg-neutral-100 shrink-0 border border-neutral-200"
                        />
                      ) : (
                        <div className="w-12 h-14 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0 border border-neutral-200">
                          <Package className="w-5 h-5 text-neutral-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-bold text-brand-navy truncate">
                          {item.productNameSnapshot || item.product?.name || `Sản phẩm #${item.productId}`}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                          <span>Màu: <strong className="text-neutral-700">{item.color || 'Mặc định'}</strong></span>
                          <span>•</span>
                          <span>Vải: <strong className="text-neutral-700">{item.fabricSnapshot || 'Tiêu chuẩn'}</strong></span>
                          <span>•</span>
                          <span>SL: <strong className="text-brand-navy">{item.quantity}</strong></span>
                        </div>
                        <p className="text-xs font-semibold text-brand-navy mt-1">
                          {fmt(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>

                    {/* Tailor Measurements Display */}
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      {item.measurementDisplay && item.measurementDisplay.length > 0 ? (
                        <div className="bg-purple-50/70 rounded-lg p-2.5 border border-purple-100">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 mb-2">
                            <Scissors className="w-3.5 h-3.5 text-purple-700" />
                            <span>Số đo cho thợ may (đã lọc theo loại trang phục):</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-xs">
                            {item.measurementDisplay.map(m => (
                              <div key={m.field} className="flex items-center justify-between bg-white px-2.5 py-1 rounded border border-purple-100/80">
                                <span className="text-neutral-600">{m.label}:</span>
                                <span className="font-bold text-purple-950 font-mono">{m.value}{m.unit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : item.measurementDisplay && item.measurementDisplay.length === 0 ? (
                        <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200/80 text-xs text-amber-800 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Chưa đủ dữ liệu số đo bắt buộc cho món này</span>
                        </div>
                      ) : item.measurementSnapshot && Object.keys(item.measurementSnapshot).length > 0 ? (
                        <div className="bg-neutral-50 rounded-lg p-2.5 border border-neutral-200 text-xs text-neutral-700">
                          <span className="font-semibold text-brand-navy block mb-1">Số đo snapshot:</span>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(item.measurementSnapshot).map(([k, v]) => v ? (
                              <span key={k} className="bg-white px-2 py-0.5 rounded border border-neutral-200 text-[11px]">
                                {k}: <strong>{String(v)}cm</strong>
                              </span>
                            ) : null)}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 italic">Không có thông tin số đo.</p>
                      )}

                      {/* Collapsible raw 16-field snapshot if measurementDisplay exists */}
                      {item.measurementDisplay && item.measurementDisplay.length > 0 && item.measurementSnapshot && (
                        <details className="mt-2 text-[11px] text-neutral-500">
                          <summary className="cursor-pointer hover:text-brand-navy transition-colors select-none font-medium">
                            Đối chiếu 16 số đo thô gốc (measurementSnapshot)
                          </summary>
                          <div className="mt-1.5 p-2 bg-neutral-100/60 rounded border border-neutral-200 flex flex-wrap gap-1.5">
                            {Object.entries(item.measurementSnapshot).map(([k, v]) => v != null && v !== '' ? (
                              <span key={k} className="bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-[10.5px]">
                                {k}: <strong>{String(v)}</strong>
                              </span>
                            ) : null)}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-neutral-500 py-3 text-center">
                {isLoadingDetail ? 'Đang tải dữ liệu sản phẩm & số đo...' : 'Không có chi tiết sản phẩm.'}
              </div>
            )}
          </div>

          {/* User Profile Measurement Inspection (Route GET /users/:id/measurements) */}
          {orderDetail?.userId && (
            <div className="rounded-xl border border-neutral-200 p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-brand-navy" />
                  <span className="text-label-sm font-semibold text-neutral-700">Hồ sơ số đo của khách (User Measurements)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUserProfileMeasurements(!showUserProfileMeasurements)}
                  className="text-xs font-semibold text-brand-navy hover:underline bg-transparent border-0 cursor-pointer"
                >
                  {showUserProfileMeasurements ? 'Thu gọn' : 'Xem hồ sơ số đo'}
                </button>
              </div>
              {showUserProfileMeasurements && (
                <div className="mt-3 pt-3 border-t border-neutral-100">
                  {isLoadingUserMeasurements ? (
                    <div className="flex items-center justify-center py-4 text-xs text-neutral-500 gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tải hồ sơ số đo người dùng...
                    </div>
                  ) : userMeasurements && Object.values(userMeasurements).some(v => v !== null && v !== undefined) ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {allMeasurementFields.map(field => {
                        const val = userMeasurements[field.id as keyof typeof userMeasurements];
                        if (val === null || val === undefined) return null;
                        return (
                          <div key={field.id} className="flex justify-between bg-neutral-50 px-2.5 py-1.5 rounded-lg border border-neutral-200">
                            <span className="text-neutral-600">{field.label}:</span>
                            <span className="font-bold text-neutral-900 font-mono">{String(val)} {field.unit}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 italic py-2">
                      Khách hàng chưa cập nhật số đo nào trong hồ sơ cá nhân.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 p-4">
            <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Vận chuyển</p>
            {selectedOrder.shipment ? (
              <div className="text-body-sm text-neutral-700 space-y-1">
                <p>Provider: <span className="font-semibold">{selectedOrder.shipment.provider}</span></p>
                <p>Mã GHN: <span className="font-mono font-semibold">{selectedOrder.shipment.providerOrderCode || '—'}</span></p>
                <p>Trạng thái: {selectedOrder.shipment.status}{selectedOrder.shipment.rawStatus ? ` · ${selectedOrder.shipment.rawStatus}` : ''}</p>
                <p>Dự kiến giao: {selectedOrder.shipment.expectedDeliveryTime?.substring(0, 16).replace('T', ' ') || '—'}</p>
                <p>Sync cuối: {selectedOrder.shipment.lastSyncedAt?.substring(0, 16).replace('T', ' ') || '—'}</p>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('admin:navigate', { detail: { tab: 'shipments', shipmentCode: selectedOrder.shipment?.providerOrderCode, orderCode: selectedOrder.orderCode } }))}
                  className="mt-2 text-brand-navy font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Xem trong tab Vận đơn
                </button>
              </div>
            ) : (
              <div className="text-body-sm text-neutral-600">
                <p>Đơn chưa có vận đơn.</p>
                {canCreateShipment ? (
                  <button
                    onClick={onCreateShipment}
                    disabled={creatingShipment}
                    className="mt-3 h-9 px-4 rounded-lg bg-brand-navy text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer"
                  >
                    {creatingShipment ? 'Đang tạo...' : 'Tạo vận đơn GHN'}
                  </button>
                ) : (
                  <p className="mt-2 text-label-sm text-neutral-500">Chỉ tạo vận đơn khi đơn sẵn sàng giao và đã thanh toán.</p>
                )}
              </div>
            )}
          </div>

          {refundCompleted && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-body-sm font-semibold text-emerald-800">Đã hoàn tiền cho khách</p>
            </div>
          )}

          {refundRequired && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-body-sm font-semibold text-amber-800 mb-2">Cần hoàn tiền cho khách</p>
              <p className="text-label-sm text-amber-700 mb-3">
                Đơn đã bị hủy sau khi khách đã thanh toán. Sau khi admin chuyển khoản hoàn lại tiền, ghi chú lại để lưu vết.
              </p>
              <div className="flex flex-col gap-2">
                <textarea
                  placeholder="Ghi chú xác nhận đã hoàn tiền (ví dụ: đã chuyển khoản ngày ... qua ...)"
                  value={refundNote}
                  onChange={e => setRefundNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-amber-300 text-body-sm resize-none"
                />
                <button
                  onClick={onConfirmRefund}
                  disabled={refundSubmitting}
                  className="h-9 rounded-lg bg-amber-600 text-white text-body-sm font-semibold hover:bg-amber-700 disabled:opacity-50 border-0 cursor-pointer"
                >
                  {refundSubmitting ? 'Đang xác nhận...' : 'Xác nhận đã hoàn tiền'}
                </button>
              </div>
            </div>
          )}

          {isPending && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-body-sm font-semibold text-amber-800 mb-2">Xác nhận thanh toán thủ công</p>
              <p className="text-label-sm text-amber-700 mb-3">
                Dùng khi khách đã chuyển khoản và đã nhận được tiền nhưng hệ thống chưa tự cập nhật trạng thái.
              </p>
              <div className="flex flex-col gap-2">
                <textarea
                  placeholder="Ghi chú xác nhận (ví dụ: đã nhận tiền qua sao kê ngày ...)"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-amber-300 text-body-sm resize-none"
                />
                <button
                  onClick={onConfirmManualPayment}
                  disabled={submitting}
                  className="h-9 rounded-lg bg-amber-600 text-white text-body-sm font-semibold hover:bg-amber-700 disabled:opacity-50 border-0 cursor-pointer"
                >
                  {submitting ? 'Đang xác nhận...' : 'Xác nhận đã nhận tiền'}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-body-sm font-semibold text-neutral-700 mb-2">Trạng thái đơn hàng</label>
            <select
              value={selectedOrder.status}
              onChange={e => handleStatusChange(e.target.value as BackendOrderStatus)}
              className="w-full h-10 px-3 rounded-lg border border-neutral-300"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{ORDER_STATUS_OPTIONS[status]}</option>
              ))}
            </select>
            {isPending && (
              <p className="text-label-sm text-neutral-500 mt-1">
                Đơn đang chờ thanh toán chỉ có thể hủy, hoặc xác nhận thanh toán thủ công ở trên khi đã nhận được tiền.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

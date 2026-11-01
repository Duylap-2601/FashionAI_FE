'use client';

import { getAdminOrderStatusOptions, ORDER_STATUS_OPTIONS } from '@/features/admin/constants/admin-dashboard-page';
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

export function AdminOrderModal({
  setSelectedOrder,
  selectedOrder,
  handleUpdateOrderStatus,
  handleConfirmManualPayment,
  handleUpdateRefund,
  handleFinalizeRefund,
  handleCreateShipment,
}: AdminOrderModalProps) {
  const { order: orderDetail, isLoading: isLoadingDetail } = useOrder(selectedOrder.id);

  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [refundNote, setRefundNote] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  const [finalizingRefundId, setFinalizingRefundId] = useState<string | null>(null);
  const [finalizeOutcome, setFinalizeOutcome] = useState<'COMPLETED' | 'FAILED'>('COMPLETED');
  const [finalizeNote, setFinalizeNote] = useState('');
  const [finalizeSubmitting, setFinalizeSubmitting] = useState(false);

  const [creatingShipment, setCreatingShipment] = useState(false);
  const createShipmentAbortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const isPending = selectedOrder.status === 'PENDING' || selectedOrder.paymentStatus === 'PENDING' || selectedOrder.status === 'CREATED';
  const refundRequired =
    selectedOrder.refundStatus === 'REQUIRED' ||
    selectedOrder.refundStatus === 'PROCESSING' ||
    orderDetail?.refundStatus === 'REQUIRED' ||
    orderDetail?.refundStatus === 'PROCESSING' ||
    (selectedOrder.status === 'RETURNED' && selectedOrder.refundStatus !== 'COMPLETED');
  const refundCompleted = selectedOrder.refundStatus === 'COMPLETED' || orderDetail?.refundStatus === 'COMPLETED';

  const paidVnd = orderDetail?.amountPaidVnd ?? selectedOrder.amountPaidVnd ?? 0;
  const refundedVnd = orderDetail?.amountRefundedVnd ?? selectedOrder.amountRefundedVnd ?? 0;
  const remainingRefundable = Math.max(0, paidVnd - refundedVnd);

  // Trả hàng: chỉ chốt hoàn tiền sau khi admin đã nhận lại hàng (RETURNED).
  const effectiveStatus = orderDetail?.status ?? selectedOrder.status;
  const returnInTransit = ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNING'].includes(effectiveStatus);
  const isReturnReceived = effectiveStatus === 'RETURNED';
  const canConfirmRefund = refundRequired && (isReturnReceived || !returnInTransit);

  const statusOptions = getAdminOrderStatusOptions(selectedOrder.status);
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
    const parsedAmount = refundAmount.trim() ? parseInt(refundAmount.trim(), 10) : undefined;
    if (parsedAmount !== undefined && (isNaN(parsedAmount) || parsedAmount < 1)) {
      toast.error('Số tiền hoàn phải là số nguyên ≥ 1 VNĐ.');
      return;
    }
    setRefundSubmitting(true);
    try {
      const ok = await handleUpdateRefund(selectedOrder.id, refundNote.trim(), refundNote.trim(), parsedAmount);
      if (ok !== false) {
        setRefundNote('');
        setRefundAmount('');
      }
    } finally {
      setRefundSubmitting(false);
    }
  };

  const onFinalizeRefund = async () => {
    if (!finalizingRefundId || !handleFinalizeRefund) return;
    setFinalizeSubmitting(true);
    try {
      const ok = await handleFinalizeRefund(finalizingRefundId, finalizeOutcome, finalizeNote.trim() || undefined);
      if (ok !== false) {
        setFinalizingRefundId(null);
        setFinalizeNote('');
      }
    } finally {
      setFinalizeSubmitting(false);
    }
  };

  const handleStatusChange = (newStatus: BackendOrderStatus) => {
    handleUpdateOrderStatus(selectedOrder.id, newStatus);
  };

  const onReceiveReturnedGoods = () => {
    handleUpdateOrderStatus(selectedOrder.id, 'RETURNED');
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
        className="absolute right-0 top-0 bottom-0 w-full max-w-[480px] bg-white shadow-2xl flex flex-col z-10"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div>
            <h2 className="text-body-lg font-bold text-neutral-900">Chi tiết đơn hàng</h2>
            <p className="text-label-sm text-neutral-500 font-mono">{selectedOrder.code}</p>
          </div>
          <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 border-0 bg-transparent cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div>
            <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Thông tin giao nhận</p>
            <p className="text-body-sm font-medium text-neutral-800">Khách hàng: {selectedOrder.customer}</p>
            <p className="text-body-sm text-neutral-600 mt-1">Điện thoại: {selectedOrder.phone || '—'}</p>
            <p className="text-body-sm text-neutral-600 mt-1">Địa chỉ: {selectedOrder.address || '—'}</p>
            <p className="text-body-sm text-neutral-600 mt-1">Email: {selectedOrder.email || '—'}</p>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50/30">
            <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">Thanh toán & Chi phí</p>
            <div className="space-y-1.5 text-body-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Phương thức:</span>
                <span className="font-semibold text-neutral-800">{orderDetail?.paymentMethod || selectedOrder.payment || '—'}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Trạng thái:</span>
                <span className="font-semibold text-neutral-800">{orderDetail?.paymentStatus || selectedOrder.paymentStatus || '—'}</span>
              </div>
              {orderDetail?.itemsSubtotalVnd !== undefined ? (
                <div className="flex justify-between text-neutral-600">
                  <span>Tiền hàng:</span>
                  <span className="text-neutral-800">{fmt(orderDetail.itemsSubtotalVnd)}</span>
                </div>
              ) : orderDetail?.itemsTotal ? (
                <div className="flex justify-between text-neutral-600">
                  <span>Tiền hàng:</span>
                  <span className="text-neutral-800">{fmt(orderDetail.itemsTotal)}</span>
                </div>
              ) : null}
              {orderDetail?.shippingFeeVnd !== undefined ? (
                <div className="flex justify-between text-neutral-600">
                  <span>Phí vận chuyển:</span>
                  <span className="text-neutral-800">{fmt(orderDetail.shippingFeeVnd)}</span>
                </div>
              ) : orderDetail?.shippingFee ? (
                <div className="flex justify-between text-neutral-600">
                  <span>Phí vận chuyển:</span>
                  <span className="text-neutral-800">{fmt(orderDetail.shippingFee)}</span>
                </div>
              ) : null}
              {((orderDetail?.discountVnd && orderDetail.discountVnd > 0) || (orderDetail?.discountAmount && orderDetail.discountAmount > 0)) && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Giảm giá:</span>
                  <span>-{fmt(orderDetail.discountVnd ?? orderDetail.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-body-md font-bold text-brand-navy pt-2 border-t border-neutral-200">
                <span>Tổng tiền đơn:</span>
                <span>{fmt(orderDetail?.totalVnd ?? selectedOrder.totalVnd ?? selectedOrder.total)}</span>
              </div>
              {paidVnd > 0 && (
                <div className="flex justify-between text-xs text-neutral-600 pt-1">
                  <span>Đã thu khách:</span>
                  <span className="font-semibold text-emerald-700">{fmt(paidVnd)}</span>
                </div>
              )}
              {refundedVnd > 0 && (
                <div className="flex justify-between text-xs text-neutral-600">
                  <span>
                    {paidVnd > 0 && refundedVnd < paidVnd ? 'Đã hoàn một phần:' : 'Đã hoàn lại:'}
                  </span>
                  <span className="font-semibold text-red-600">
                    {paidVnd > 0 && refundedVnd < paidVnd
                      ? `Đã hoàn ${fmt(refundedVnd)} / ${fmt(paidVnd)}`
                      : `-${fmt(refundedVnd)}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Transactions Card */}
          {((orderDetail?.payments && orderDetail.payments.length > 0) || (selectedOrder.payments && selectedOrder.payments.length > 0)) && (
            <div className="rounded-xl border border-neutral-200 p-4 bg-white shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide">
                  Chi tiết giao dịch thanh toán
                </p>
                <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium">
                  {(orderDetail?.payments || selectedOrder.payments || []).length} GD
                </span>
              </div>
              <div className="space-y-2.5">
                {(orderDetail?.payments || selectedOrder.payments || []).map((p, idx) => (
                  <div key={p.id || idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 uppercase px-2 py-0.5 bg-neutral-200 rounded text-[11px]">
                          {p.provider || 'SEPAY'}
                        </span>
                        {p.transactionId && (
                          <span className="font-mono text-neutral-500 text-[11px]">
                            Mã GD: {p.transactionId}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'PAID' || p.status === 'COD_COLLECTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : p.status === 'REFUNDED'
                              ? 'bg-blue-100 text-blue-800'
                              : p.status === 'PARTIALLY_REFUNDED'
                                ? 'bg-sky-100 text-sky-800'
                                : p.status === 'EXPIRED'
                                  ? 'bg-neutral-100 text-neutral-600'
                                  : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status || 'PENDING'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-neutral-500">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString('vi-VN') : '—'}
                      </span>
                      <span className="font-bold text-brand-navy text-body-sm">
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
            <div className="rounded-xl border border-amber-200 p-4 bg-amber-50/40">
              <div className="flex items-center justify-between mb-3">
                <p className="text-label-sm font-semibold text-amber-800 uppercase tracking-wide">
                  Lịch sử hoàn tiền
                </p>
                <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  {(orderDetail?.refunds || selectedOrder.refunds || []).length} lượt
                </span>
              </div>
              <div className="space-y-2.5">
                {(orderDetail?.refunds || selectedOrder.refunds || []).map((r, idx) => (
                  <div key={r.id || idx} className="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-600 text-body-sm">
                        -{fmt(r.amountVnd)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'FAILED' || r.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status === 'COMPLETED'
                          ? 'Thành công'
                          : r.status === 'PROCESSING'
                            ? 'Đang xử lý'
                            : r.status === 'PENDING'
                              ? 'Chờ xử lý'
                              : r.status === 'FAILED'
                                ? 'Thất bại'
                                : r.status === 'CANCELLED'
                                  ? 'Đã hủy'
                                  : r.status}
                      </span>
                    </div>
                    {r.reason && (
                      <p className="text-neutral-700"><strong>Lý do:</strong> {r.reason}</p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span>Cổng: {r.provider}</span>
                      <span>Yêu cầu: {new Date(r.requestedAt).toLocaleString('vi-VN')}</span>
                    </div>
                    {r.processedAt && (
                      <p className="text-[11px] text-neutral-500">
                        Xử lý lúc: {new Date(r.processedAt).toLocaleString('vi-VN')}
                      </p>
                    )}
                    {r.failedReason && (
                      <p className="text-[11px] text-red-600 font-medium">
                        Lỗi: {r.failedReason}
                      </p>
                    )}

                    {/* Nút Chốt hoàn tiền cho refund đang PROCESSING (MoMo kẹt) */}
                    {r.status === 'PROCESSING' && handleFinalizeRefund && (
                      <div className="pt-2 border-t border-amber-100 mt-2 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-medium text-amber-900">
                            Xử lý refund MoMo kẹt:
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setFinalizingRefundId(r.id);
                                setFinalizeOutcome('COMPLETED');
                                setFinalizeNote('');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700 cursor-pointer border-0"
                            >
                              Chốt thành công
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFinalizingRefundId(r.id);
                                setFinalizeOutcome('FAILED');
                                setFinalizeNote('');
                              }}
                              className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-semibold hover:bg-rose-700 cursor-pointer border-0"
                            >
                              Chốt thất bại
                            </button>
                          </div>
                        </div>

                        {finalizingRefundId === r.id && (
                          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 space-y-2 animate-fadeInUp">
                            <p className="text-[11px] font-bold text-amber-950">
                              Chốt kết quả: {finalizeOutcome === 'COMPLETED' ? 'Thành công (COMPLETED)' : 'Thất bại (FAILED)'}
                            </p>
                            <input
                              type="text"
                              placeholder="Ghi chú nội bộ (tùy chọn)..."
                              value={finalizeNote}
                              onChange={(e) => setFinalizeNote(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded focus:outline-none focus:border-amber-500"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setFinalizingRefundId(null)}
                                className="px-2 py-1 text-[11px] text-neutral-600 hover:text-neutral-900 bg-transparent border-0 cursor-pointer"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                onClick={onFinalizeRefund}
                                disabled={finalizeSubmitting}
                                className={`px-3 py-1 text-white rounded text-[11px] font-bold border-0 cursor-pointer disabled:opacity-50 ${
                                  finalizeOutcome === 'COMPLETED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                                }`}
                              >
                                {finalizeSubmitting ? 'Đang lưu...' : 'Xác nhận chốt'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {orderDetail?.refundEvidence && (
                <div className="mt-2 text-xs text-amber-800 bg-amber-100/60 p-2 rounded-lg">
                  <strong>Bằng chứng hoàn tiền:</strong> {orderDetail.refundEvidence}
                </div>
              )}
            </div>
          )}

          {/* Dedicated Measurements Sheet Link */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-purple-700" />
                <span className="text-body-sm font-bold text-purple-950">Phiếu số đo may đo cho thợ may</span>
              </div>
              <span className="text-[11px] bg-purple-200/70 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                {orderDetail?.items?.length ?? selectedOrder.items} món
              </span>
            </div>
            <p className="text-xs text-purple-800 mb-3 leading-relaxed">
              Bảng thông số may đo theo loại trang phục, đối chiếu 16 số đo thô ban đầu và hồ sơ cá nhân của khách được hiển thị đầy đủ trên trang riêng.
            </p>
            <Link
              href={`/admin/orders/${selectedOrder.id}/measurements`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors no-underline shadow-xs cursor-pointer"
            >
              <Scissors className="w-4 h-4" />
              <span>Mở phiếu xem số đo chi tiết (Trang riêng)</span>
            </Link>
          </div>

          {/* Compact Order Items Summary */}
          <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide">
                Sản phẩm trong đơn ({orderDetail?.items?.length ?? selectedOrder.items} món)
              </p>
              {isLoadingDetail && <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />}
            </div>

            {orderDetail?.items && orderDetail.items.length > 0 ? (
              <div className="space-y-2.5">
                {orderDetail.items.map((item, idx) => {
                  const displayImage = item.productImageSnapshot || item.product?.images?.[0];
                  const itemUnitPrice = item.unitPriceVnd ?? item.price;
                  const itemLineTotal = item.lineTotalVnd ?? (item.price * item.quantity);
                  return (
                    <div key={item.id || idx} className="bg-white rounded-xl border border-neutral-200 p-3 shadow-2xs flex items-center gap-3">
                      {displayImage ? (
                        <Image
                          src={displayImage}
                          alt={item.productNameSnapshot || item.product?.name || 'Sản phẩm'}
                          width={44}
                          height={52}
                          unoptimized
                          className="h-13 w-11 shrink-0 rounded-lg border border-neutral-200 bg-neutral-100 object-cover"
                        />
                      ) : (
                        <div className="w-11 h-13 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0 border border-neutral-200">
                          <Package className="w-4 h-4 text-neutral-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-bold text-brand-navy truncate">
                          {item.productNameSnapshot || item.product?.name || `Sản phẩm #${item.productId}`}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-500 mt-0.5">
                          {item.productSkuSnapshot && (
                            <span className="font-mono text-[11px] text-neutral-400">SKU: {item.productSkuSnapshot}</span>
                          )}
                          <span>Màu: <strong className="text-neutral-700">{item.color || 'Mặc định'}</strong></span>
                          <span>•</span>
                          <span>SL: <strong className="text-brand-navy font-bold">{item.quantity}</strong></span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          Đơn giá: {fmt(itemUnitPrice)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-brand-navy">
                          {fmt(itemLineTotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-neutral-500 py-2 text-center">
                {isLoadingDetail ? 'Đang tải dữ liệu sản phẩm...' : 'Không có chi tiết sản phẩm.'}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-neutral-200 p-4">
            <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Vận chuyển</p>
            {selectedOrder.shipment ? (
              <div className="text-body-sm text-neutral-700 space-y-1">
                <p>Provider: <span className="font-semibold">{selectedOrder.shipment.provider}</span></p>
                <p>Mã GHN: <span className="font-mono font-semibold">{selectedOrder.shipment.providerOrderCode || '—'}</span></p>
                <p>Trạng thái: {shipmentStatusLabel(selectedOrder.shipment.status, selectedOrder.shipment.rawStatus)}</p>
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

          {orderDetail?.refundAccountNumber && (
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-body-sm font-semibold text-sky-900">Tài khoản nhận hoàn tiền của khách</p>
                  <p className="text-label-sm text-sky-800 mt-1">
                    {orderDetail.refundBankName || 'Ngân hàng'} ·{' '}
                    <span className="font-mono font-semibold">{orderDetail.refundAccountNumber}</span>
                    {orderDetail.refundAccountHolder ? ` · ${orderDetail.refundAccountHolder}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const text = [orderDetail?.refundBankName, orderDetail?.refundAccountNumber, orderDetail?.refundAccountHolder]
                      .filter(Boolean)
                      .join(' · ');
                    if (!navigator.clipboard) {
                      toast.error('Trình duyệt không hỗ trợ sao chép, vui lòng copy thủ công.');
                      return;
                    }
                    navigator.clipboard
                      .writeText(text)
                      .then(() => toast.success('Đã sao chép thông tin tài khoản'))
                      .catch(() => toast.error('Không thể sao chép, vui lòng copy thủ công.'));
                  }}
                  className="shrink-0 text-[11px] font-semibold text-sky-800 underline hover:text-sky-950 cursor-pointer bg-transparent border-0"
                >
                  Sao chép
                </button>
              </div>
            </div>
          )}

          {refundRequired && returnInTransit && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-body-sm font-semibold text-amber-800 mb-1">Chờ nhận hàng hoàn</p>
              <p className="text-label-sm text-amber-700 mb-3">
                Đơn đang trên đường hoàn trả. Sau khi nhận và kiểm tra hàng xong, xác nhận đã nhận hàng để mở bước hoàn tiền.
              </p>
              <button
                type="button"
                onClick={onReceiveReturnedGoods}
                className="h-9 px-4 rounded-lg bg-amber-600 text-white text-body-sm font-semibold hover:bg-amber-700 border-0 cursor-pointer transition-colors"
              >
                Đã nhận hàng hoàn
              </button>
            </div>
          )}

          {canConfirmRefund && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-body-sm font-semibold text-amber-800 mb-1">
                {isReturnReceived
                  ? 'Đã nhận hàng hoàn — Cần hoàn tiền cho khách'
                  : 'Cần hoàn tiền cho khách'}
              </p>
              <p className="text-label-sm text-amber-700 mb-3">
                {isReturnReceived
                  ? 'Hàng hoàn đã về kho và được kiểm tra. Vui lòng chuyển khoản hoàn lại tiền cho khách theo STK bên trên và ghi chú lưu vết.'
                  : 'Đơn đã bị hủy sau khi khách đã thanh toán. Sau khi admin chuyển khoản hoàn lại tiền, ghi chú lại để lưu vết.'}
              </p>
              <div className="flex flex-col gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-amber-900">
                      Số tiền hoàn (VNĐ)
                    </label>
                    <span className="text-[11px] text-amber-700 font-normal">
                      Để trống = hoàn toàn bộ phần còn lại
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    step={1000}
                    placeholder={
                      remainingRefundable > 0
                        ? `Gợi ý: ${fmt(remainingRefundable)} (hoàn toàn bộ còn lại)`
                        : 'Nhập số tiền hoàn (VNĐ)...'
                    }
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 text-body-sm bg-white focus:outline-none focus:border-amber-500"
                  />
                  {remainingRefundable > 0 && (
                    <button
                      type="button"
                      onClick={() => setRefundAmount(String(remainingRefundable))}
                      className="text-[11px] text-amber-800 hover:text-amber-950 underline mt-1 cursor-pointer bg-transparent border-0 p-0 text-left font-medium"
                    >
                      Điền số tiền còn lại: {fmt(remainingRefundable)}
                    </button>
                  )}
                </div>
                <textarea
                  placeholder="Ghi chú xác nhận đã hoàn tiền (ví dụ: đã chuyển khoản ngày ... tới STK ...)"
                  value={refundNote}
                  onChange={(e) => setRefundNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-amber-300 text-body-sm resize-none bg-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={onConfirmRefund}
                  disabled={refundSubmitting}
                  className="h-9 rounded-lg bg-amber-600 text-white text-body-sm font-semibold hover:bg-amber-700 disabled:opacity-50 border-0 cursor-pointer transition-colors"
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

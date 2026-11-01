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

  const statusOptions = getAdminOrderStatusOptions(selectedOrder.status);
  const canCreateShipment = selectedOrder.status === 'READY_TO_SHIP' && selectedOrder.paymentStatus === 'PAID' && !selectedOrder.shipment;

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      createShipmentAbortRef.current?.abort();
    };
  }, []);

  const onConfirmManualPayment = async () => {
    const confirmNote = note.trim() || 'XÃ¡c nháº­n thanh toÃ¡n thá»§ cÃ´ng';
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
      toast.error('Vui lÃ²ng nháº­p ghi chÃº xÃ¡c nháº­n hoÃ n tiá»n.');
      return;
    }
    const parsedAmount = refundAmount.trim() ? parseInt(refundAmount.trim(), 10) : undefined;
    if (parsedAmount !== undefined && (isNaN(parsedAmount) || parsedAmount < 1)) {
      toast.error('Sá»‘ tiá»n hoÃ n pháº£i lÃ  sá»‘ nguyÃªn â‰¥ 1 VNÄ.');
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
            <h2 className="font-display text-[1.15rem] leading-tight text-landing-obsidian">Chi tiáº¿t Ä‘Æ¡n hÃ ng</h2>
            <p className="text-label-sm text-landing-muted font-mono">{selectedOrder.code}</p>
          </div>
          <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-landing-paper border-0 bg-transparent cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div>
            <p className="text-label-sm font-semibold text-landing-muted uppercase tracking-wide mb-2">ThÃ´ng tin giao nháº­n</p>
            <p className="text-body-sm font-medium text-landing-obsidian">KhÃ¡ch hÃ ng: {selectedOrder.customer}</p>
            <p className="text-body-sm text-landing-obsidian mt-1">Äiá»‡n thoáº¡i: {selectedOrder.phone || 'â€”'}</p>
            <p className="text-body-sm text-landing-obsidian mt-1">Äá»‹a chá»‰: {selectedOrder.address || 'â€”'}</p>
            <p className="text-body-sm text-landing-obsidian mt-1">Email: {selectedOrder.email || 'â€”'}</p>
          </div>

          <div className="rounded-[2px] border border-landing-line p-4 bg-landing-paper/30">
            <p className="text-label-sm font-semibold text-landing-muted uppercase tracking-wide mb-3">Thanh toÃ¡n & Chi phÃ­</p>
            <div className="space-y-1.5 text-body-sm">
              <div className="flex justify-between text-landing-obsidian">
                <span>PhÆ°Æ¡ng thá»©c:</span>
                <span className="font-semibold text-landing-obsidian">{orderDetail?.paymentMethod || selectedOrder.payment || 'â€”'}</span>
              </div>
              <div className="flex justify-between text-landing-obsidian">
                <span>Tráº¡ng thÃ¡i:</span>
                <span className="font-semibold text-landing-obsidian">{orderDetail?.paymentStatus || selectedOrder.paymentStatus || 'â€”'}</span>
              </div>
              {orderDetail?.itemsSubtotalVnd !== undefined ? (
                <div className="flex justify-between text-landing-obsidian">
                  <span>Tiá»n hÃ ng:</span>
                  <span className="text-landing-obsidian">{fmt(orderDetail.itemsSubtotalVnd)}</span>
                </div>
              ) : orderDetail?.itemsTotal ? (
                <div className="flex justify-between text-landing-obsidian">
                  <span>Tiá»n hÃ ng:</span>
                  <span className="text-landing-obsidian">{fmt(orderDetail.itemsTotal)}</span>
                </div>
              ) : null}
              {orderDetail?.shippingFeeVnd !== undefined ? (
                <div className="flex justify-between text-landing-obsidian">
                  <span>PhÃ­ váº­n chuyá»ƒn:</span>
                  <span className="text-landing-obsidian">{fmt(orderDetail.shippingFeeVnd)}</span>
                </div>
              ) : orderDetail?.shippingFee ? (
                <div className="flex justify-between text-landing-obsidian">
                  <span>PhÃ­ váº­n chuyá»ƒn:</span>
                  <span className="text-landing-obsidian">{fmt(orderDetail.shippingFee)}</span>
                </div>
              ) : null}
              {((orderDetail?.discountVnd && orderDetail.discountVnd > 0) || (orderDetail?.discountAmount && orderDetail.discountAmount > 0)) && (
                <div className="flex justify-between text-metric-products font-medium">
                  <span>Giáº£m giÃ¡:</span>
                  <span>-{fmt(orderDetail.discountVnd ?? orderDetail.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-display text-[1.05rem] leading-tight text-landing-oxblood pt-2 border-t border-landing-line">
                <span>Tá»•ng tiá»n Ä‘Æ¡n:</span>
                <span>{fmt(orderDetail?.totalVnd ?? selectedOrder.totalVnd ?? selectedOrder.total)}</span>
              </div>
              {paidVnd > 0 && (
                <div className="flex justify-between text-xs text-landing-obsidian pt-1">
                  <span>ÄÃ£ thu khÃ¡ch:</span>
                  <span className="font-semibold text-metric-products">{fmt(paidVnd)}</span>
                </div>
              )}
              {refundedVnd > 0 && (
                <div className="flex justify-between text-xs text-landing-obsidian">
                  <span>
                    {paidVnd > 0 && refundedVnd < paidVnd ? 'ÄÃ£ hoÃ n má»™t pháº§n:' : 'ÄÃ£ hoÃ n láº¡i:'}
                  </span>
                  <span className="font-semibold text-destructive">
                    {paidVnd > 0 && refundedVnd < paidVnd
                      ? `ÄÃ£ hoÃ n ${fmt(refundedVnd)} / ${fmt(paidVnd)}`
                      : `-${fmt(refundedVnd)}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Transactions Card */}
          {((orderDetail?.payments && orderDetail.payments.length > 0) || (selectedOrder.payments && selectedOrder.payments.length > 0)) && (
            <div className="rounded-[2px] border border-landing-line p-4 bg-landing-ivory">
              <div className="flex items-center justify-between mb-3">
                <p className="text-label-sm font-semibold text-landing-muted uppercase tracking-wide">
                  Chi tiáº¿t giao dá»‹ch thanh toÃ¡n
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
                            MÃ£ GD: {p.transactionId}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'PAID' || p.status === 'COD_COLLECTED'
                          ? 'bg-metric-products/10 text-metric-products'
                          : p.status === 'FAILED'
                            ? 'bg-destructive/10 text-destructive'
                            : p.status === 'REFUNDED'
                              ? 'bg-metric-orders/10 text-metric-orders'
                              : p.status === 'PARTIALLY_REFUNDED'
                                ? 'bg-metric-ai/10 text-metric-ai'
                                : p.status === 'EXPIRED'
                                  ? 'bg-landing-paper text-landing-muted'
                                  : 'bg-metric-users/10 text-metric-users'
                      }`}>
                        {p.status || 'PENDING'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-landing-muted">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString('vi-VN') : 'â€”'}
                      </span>
                      <span className="font-bold text-landing-oxblood text-body-sm">
                        {p.amountVnd !== undefined ? fmt(p.amountVnd) : 'â€”'}
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
                  Lá»‹ch sá»­ hoÃ n tiá»n
                </p>
                <span className="text-xs bg-metric-users/10 text-metric-users px-2 py-0.5 rounded-full font-bold">
                  {(orderDetail?.refunds || selectedOrder.refunds || []).length} lÆ°á»£t
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
                          : r.status === 'FAILED' || r.status === 'CANCELLED'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-metric-users/10 text-metric-users'
                      }`}>
                        {r.status === 'COMPLETED'
                          ? 'ThÃ nh cÃ´ng'
                          : r.status === 'PROCESSING'
                            ? 'Äang xá»­ lÃ½'
                            : r.status === 'PENDING'
                              ? 'Chá» xá»­ lÃ½'
                              : r.status === 'FAILED'
                                ? 'Tháº¥t báº¡i'
                                : r.status === 'CANCELLED'
                                  ? 'ÄÃ£ há»§y'
                                  : r.status}
                      </span>
                    </div>
                    {r.reason && (
                      <p className="text-landing-obsidian"><strong>LÃ½ do:</strong> {r.reason}</p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-landing-muted">
                      <span>Cá»•ng: {r.provider}</span>
                      <span>YÃªu cáº§u: {new Date(r.requestedAt).toLocaleString('vi-VN')}</span>
                    </div>
                    {r.processedAt && (
                      <p className="text-[11px] text-landing-muted">
                        Xá»­ lÃ½ lÃºc: {new Date(r.processedAt).toLocaleString('vi-VN')}
                      </p>
                    )}
                    {r.failedReason && (
                      <p className="text-[11px] text-destructive font-medium">
                        Lá»—i: {r.failedReason}
                      </p>
                    )}

                    {/* NÃºt Chá»‘t hoÃ n tiá»n cho refund Ä‘ang PROCESSING (MoMo káº¹t) */}
                    {r.status === 'PROCESSING' && handleFinalizeRefund && (
                      <div className="pt-2 border-t border-amber-100 mt-2 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-medium text-amber-900">
                            Xá»­ lÃ½ refund MoMo káº¹t:
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
                              Chá»‘t thÃ nh cÃ´ng
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
                              Chá»‘t tháº¥t báº¡i
                            </button>
                          </div>
                        </div>

                        {finalizingRefundId === r.id && (
                          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 space-y-2 animate-fadeInUp">
                            <p className="text-[11px] font-bold text-amber-950">
                              Chá»‘t káº¿t quáº£: {finalizeOutcome === 'COMPLETED' ? 'ThÃ nh cÃ´ng (COMPLETED)' : 'Tháº¥t báº¡i (FAILED)'}
                            </p>
                            <input
                              type="text"
                              placeholder="Ghi chÃº ná»™i bá»™ (tÃ¹y chá»n)..."
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
                                Há»§y
                              </button>
                              <button
                                type="button"
                                onClick={onFinalizeRefund}
                                disabled={finalizeSubmitting}
                                className={`px-3 py-1 text-white rounded text-[11px] font-bold border-0 cursor-pointer disabled:opacity-50 ${
                                  finalizeOutcome === 'COMPLETED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                                }`}
                              >
                                {finalizeSubmitting ? 'Äang lÆ°u...' : 'XÃ¡c nháº­n chá»‘t'}
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
                <div className="mt-2 text-xs text-metric-users bg-metric-users/10 p-2 rounded-[2px]">
                  <strong>Báº±ng chá»©ng hoÃ n tiá»n:</strong> {orderDetail.refundEvidence}
                </div>
              )}
            </div>
          )}

          {/* Dedicated Measurements Sheet Link */}
          <div className="rounded-[2px] border border-metric-ai/30 bg-metric-ai/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-metric-ai" />
                <span className="text-body-sm font-bold text-metric-ai">Phiáº¿u sá»‘ Ä‘o may Ä‘o cho thá»£ may</span>
              </div>
              <span className="text-[11px] bg-metric-ai/20 text-metric-ai font-bold px-2 py-0.5 rounded-full">
                {orderDetail?.items?.length ?? selectedOrder.items} mÃ³n
              </span>
            </div>
            <p className="text-xs text-metric-ai mb-3 leading-relaxed">
              Báº£ng thÃ´ng sá»‘ may Ä‘o theo loáº¡i trang phá»¥c, Ä‘á»‘i chiáº¿u 16 sá»‘ Ä‘o thÃ´ ban Ä‘áº§u vÃ  há»“ sÆ¡ cÃ¡ nhÃ¢n cá»§a khÃ¡ch Ä‘Æ°á»£c hiá»ƒn thá»‹ Ä‘áº§y Ä‘á»§ trÃªn trang riÃªng.
            </p>
            <Link
              href={`/admin/orders/${selectedOrder.id}/measurements`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-metric-ai hover:bg-landing-obsidian text-landing-paper rounded-[2px] text-xs font-bold transition-colors no-underline cursor-pointer"
            >
              <Scissors className="w-4 h-4" />
              <span>Má»Ÿ phiáº¿u xem sá»‘ Ä‘o chi tiáº¿t (Trang riÃªng)</span>
            </Link>
          </div>

          {/* Compact Order Items Summary */}
          <div className="rounded-[2px] border border-landing-line p-4 bg-landing-paper/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-label-sm font-semibold text-landing-muted uppercase tracking-wide">
                Sáº£n pháº©m trong Ä‘Æ¡n ({orderDetail?.items?.length ?? selectedOrder.items} mÃ³n)
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
                          alt={item.productNameSnapshot || item.product?.name || 'Sáº£n pháº©m'}
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
                          {item.productNameSnapshot || item.product?.name || `Sáº£n pháº©m #${item.productId}`}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-landing-muted mt-0.5">
                          {item.productSkuSnapshot && (
                            <span className="font-mono text-[11px] text-landing-muted">SKU: {item.productSkuSnapshot}</span>
                          )}
                          <span>MÃ u: <strong className="text-landing-obsidian">{item.color || 'Máº·c Ä‘á»‹nh'}</strong></span>
                          <span>â€¢</span>
                          <span>SL: <strong className="text-landing-oxblood font-bold">{item.quantity}</strong></span>
                        </div>
                        <div className="text-[11px] text-landing-muted mt-0.5">
                          ÄÆ¡n giÃ¡: {fmt(itemUnitPrice)}
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
                {isLoadingDetail ? 'Äang táº£i dá»¯ liá»‡u sáº£n pháº©m...' : 'KhÃ´ng cÃ³ chi tiáº¿t sáº£n pháº©m.'}
              </div>
            )}
          </div>

          <div className="rounded-[2px] border border-landing-line p-4">
            <p className="text-label-sm font-semibold text-landing-muted uppercase tracking-wide mb-2">Váº­n chuyá»ƒn</p>
            {selectedOrder.shipment ? (
              <div className="text-body-sm text-landing-obsidian space-y-1">
                <p>Provider: <span className="font-semibold">{selectedOrder.shipment.provider}</span></p>
                <p>MÃ£ GHN: <span className="font-mono font-semibold">{selectedOrder.shipment.providerOrderCode || 'â€”'}</span></p>
                <p>Tráº¡ng thÃ¡i: {shipmentStatusLabel(selectedOrder.shipment.status, selectedOrder.shipment.rawStatus)}</p>
                <p>Dá»± kiáº¿n giao: {selectedOrder.shipment.expectedDeliveryTime?.substring(0, 16).replace('T', ' ') || 'â€”'}</p>
                <p>Sync cuá»‘i: {selectedOrder.shipment.lastSyncedAt?.substring(0, 16).replace('T', ' ') || 'â€”'}</p>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('admin:navigate', { detail: { tab: 'shipments', shipmentCode: selectedOrder.shipment?.providerOrderCode, orderCode: selectedOrder.orderCode } }))}
                  className="mt-2 text-landing-oxblood font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Xem trong tab Váº­n Ä‘Æ¡n
                </button>
              </div>
            ) : (
              <div className="text-body-sm text-landing-obsidian">
                <p>ÄÆ¡n chÆ°a cÃ³ váº­n Ä‘Æ¡n.</p>
                {canCreateShipment ? (
                  <button
                    onClick={onCreateShipment}
                    disabled={creatingShipment}
                    className="mt-3 h-9 px-4 rounded-[2px] bg-landing-oxblood text-landing-paper font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer"
                  >
                    {creatingShipment ? 'Äang táº¡o...' : 'Táº¡o váº­n Ä‘Æ¡n GHN'}
                  </button>
                ) : (
                  <p className="mt-2 text-label-sm text-landing-muted">Chá»‰ táº¡o váº­n Ä‘Æ¡n khi Ä‘Æ¡n sáºµn sÃ ng giao vÃ  Ä‘Ã£ thanh toÃ¡n.</p>
                )}
              </div>
            )}
          </div>

          {refundCompleted && (
            <div className="rounded-[2px] border border-metric-products/30 bg-metric-products/10 p-4">
              <p className="text-body-sm font-semibold text-metric-products">ÄÃ£ hoÃ n tiá»n cho khÃ¡ch</p>
            </div>
          )}

          {refundRequired && (
            <div className="rounded-[2px] border border-metric-users/30 bg-metric-users/10 p-4">
              <p className="text-body-sm font-semibold text-metric-users mb-1">
                {selectedOrder.status === 'RETURNED'
                  ? 'ÄÆ¡n Ä‘Ã£ hoÃ n tráº£ â€” Cáº§n hoÃ n tiá»n cho khÃ¡ch'
                  : 'Cáº§n hoÃ n tiá»n cho khÃ¡ch'}
              </p>
              <p className="text-label-sm text-metric-users mb-3">
                {selectedOrder.status === 'RETURNED'
                  ? 'ÄÆ¡n hÃ ng Ä‘Ã£ Ä‘Æ°á»£c hoÃ n tráº£ vá» kho. Vui lÃ²ng chuyá»ƒn khoáº£n hoÃ n láº¡i tiá»n cho khÃ¡ch vÃ  ghi chÃº lÆ°u váº¿t.'
                  : 'ÄÆ¡n Ä‘Ã£ bá»‹ há»§y sau khi khÃ¡ch Ä‘Ã£ thanh toÃ¡n. Sau khi admin chuyá»ƒn khoáº£n hoÃ n láº¡i tiá»n, ghi chÃº láº¡i Ä‘á»ƒ lÆ°u váº¿t.'}
              </p>
              <div className="flex flex-col gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-metric-users">
                      Sá»‘ tiá»n hoÃ n (VNÄ)
                    </label>
                    <span className="text-[11px] text-metric-users/80 font-normal">
                      Äá»ƒ trá»‘ng = hoÃ n toÃ n bá»™ pháº§n cÃ²n láº¡i
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    step={1000}
                    placeholder={
                      remainingRefundable > 0
                        ? `Gá»£i Ã½: ${fmt(remainingRefundable)} (hoÃ n toÃ n bá»™ cÃ²n láº¡i)`
                        : 'Nháº­p sá»‘ tiá»n hoÃ n (VNÄ)...'
                    }
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-[2px] border border-metric-users text-body-sm bg-landing-ivory focus:outline-none focus:border-metric-users"
                  />
                  {remainingRefundable > 0 && (
                    <button
                      type="button"
                      onClick={() => setRefundAmount(String(remainingRefundable))}
                      className="text-[11px] text-metric-users hover:text-landing-obsidian underline mt-1 cursor-pointer bg-transparent border-0 p-0 text-left font-medium"
                    >
                      Äiá»n sá»‘ tiá»n cÃ²n láº¡i: {fmt(remainingRefundable)}
                    </button>
                  )}
                </div>
                <textarea
                  placeholder="Ghi chÃº xÃ¡c nháº­n Ä‘Ã£ hoÃ n tiá»n (vÃ­ dá»¥: Ä‘Ã£ chuyá»ƒn khoáº£n ngÃ y ... qua ...)"
                  value={refundNote}
                  onChange={(e) => setRefundNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-[2px] border border-metric-users text-body-sm resize-none bg-landing-ivory focus:outline-none focus:border-metric-users"
                />
                <button
                  type="button"
                  onClick={onConfirmRefund}
                  disabled={refundSubmitting}
                  className="h-9 rounded-[2px] bg-metric-users text-landing-paper text-body-sm font-semibold hover:bg-landing-obsidian disabled:opacity-50 border-0 cursor-pointer transition-colors"
                >
                  {refundSubmitting ? 'Äang xÃ¡c nháº­n...' : 'XÃ¡c nháº­n Ä‘Ã£ hoÃ n tiá»n'}
                </button>
              </div>
            </div>
          )}

          {isPending && (
            <div className="rounded-[2px] border border-metric-users/30 bg-metric-users/10 p-4">
              <p className="text-body-sm font-semibold text-metric-users mb-2">XÃ¡c nháº­n thanh toÃ¡n thá»§ cÃ´ng</p>
              <p className="text-label-sm text-metric-users mb-3">
                DÃ¹ng khi khÃ¡ch Ä‘Ã£ chuyá»ƒn khoáº£n vÃ  Ä‘Ã£ nháº­n Ä‘Æ°á»£c tiá»n nhÆ°ng há»‡ thá»‘ng chÆ°a tá»± cáº­p nháº­t tráº¡ng thÃ¡i.
              </p>
              <div className="flex flex-col gap-2">
                <textarea
                  placeholder="Ghi chÃº xÃ¡c nháº­n (vÃ­ dá»¥: Ä‘Ã£ nháº­n tiá»n qua sao kÃª ngÃ y ...)"
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
                  {submitting ? 'Äang xÃ¡c nháº­n...' : 'XÃ¡c nháº­n Ä‘Ã£ nháº­n tiá»n'}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-body-sm font-semibold text-landing-obsidian mb-2">Tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng</label>
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
                ÄÆ¡n Ä‘ang chá» thanh toÃ¡n chá»‰ cÃ³ thá»ƒ há»§y, hoáº·c xÃ¡c nháº­n thanh toÃ¡n thá»§ cÃ´ng á»Ÿ trÃªn khi Ä‘Ã£ nháº­n Ä‘Æ°á»£c tiá»n.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

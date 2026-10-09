'use client';

import { AdminGuard } from '@/features/auth/components/AdminGuard';
import { resolveOrderStatusCfg } from '@/features/admin/constants/admin-dashboard-page';
import { fmt, shipmentStatusLabel } from '@/features/admin/services/format';
import {
  confirmManualPayment,
  createShipment,
  updateOrderRefund,
  updateOrderStatus,
} from '@/features/admin/services/mutations';
import { allMeasurementFields } from '@/features/measurements/constants/profile-measurements-page';
import { useUserMeasurements } from '@/features/measurements/hooks/useMeasurements';
import { useOrder } from '@/features/orders/hooks/useOrders';
import type { BackendOrderStatus } from '@/features/orders/types/orders';
import { getErrorMessage } from '@/lib/errors';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Printer,
  Receipt,
  RefreshCw,
  Scissors,
  Truck,
  User,
  UserCheck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  'PENDING',
  'MEASUREMENT_REVIEW',
  'MEASUREMENT_CONFIRMED',
  'TAILORING',
  'READY_TO_SHIP',
  'CANCELLED',
];

function getPaymentBadgeStyle(status?: string) {
  switch (status?.toUpperCase()) {
    case 'PAID':
      return 'bg-emerald-500/10 text-emerald-800 ring-1 ring-emerald-600/25';
    case 'FAILED':
      return 'bg-red-500/10 text-red-700 ring-1 ring-red-600/25';
    case 'PENDING':
    default:
      return 'bg-amber-500/10 text-amber-800 ring-1 ring-amber-600/25';
  }
}

export default function AdminOrderMeasurementsPage() {
  const params = useParams();
  const id = params?.id as string;

  const { order, isLoading, isError, refetch } = useOrder(id);
  const { measurements: userMeasurements, isLoading: isLoadingUserMeasurements } = useUserMeasurements(
    order?.userId
  );

  const [expandedSnapshots, setExpandedSnapshots] = useState<Record<string, boolean>>({});
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [manualPaymentNote, setManualPaymentNote] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [refundNote, setRefundNote] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const createShipmentAbortRef = useRef<AbortController | null>(null);
  const statusMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      createShipmentAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!statusMenuRef.current?.contains(event.target as Node)) {
        setStatusMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const toggleSnapshot = (itemId: string) => {
    setExpandedSnapshots((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleStatusChange = async (newStatus: BackendOrderStatus) => {
    if (!order?.id || updatingStatus || newStatus === order.status) return;
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(order.id, { status: newStatus });
      toast.success(`Đã cập nhật trạng thái sang "${ORDER_STATUS_OPTIONS[newStatus] || newStatus}"`);
      await refetch();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể cập nhật trạng thái đơn hàng.'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const onConfirmManualPayment = async () => {
    if (!order?.orderCode) return;
    if (!manualPaymentNote.trim()) {
      toast.error('Vui lòng nhập ghi chú xác nhận thanh toán.');
      return;
    }
    setSubmittingPayment(true);
    try {
      await confirmManualPayment(order.orderCode, {
        reference: manualPaymentNote.trim(),
        note: manualPaymentNote.trim(),
      });
      toast.success('Xác nhận thanh toán thủ công thành công');
      setManualPaymentNote('');
      await refetch();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể xác nhận thanh toán thủ công.'));
    } finally {
      setSubmittingPayment(false);
    }
  };

  const onConfirmRefund = async () => {
    if (!order?.id) return;
    if (!refundNote.trim()) {
      toast.error('Vui lòng nhập ghi chú xác nhận hoàn tiền.');
      return;
    }
    setSubmittingRefund(true);
    try {
      await updateOrderRefund(order.id, {
        refundStatus: 'COMPLETED',
        evidence: { reference: refundNote.trim() },
        internalNote: refundNote.trim(),
      });
      toast.success('Đã ghi nhận hoàn tiền thành công');
      setRefundNote('');
      await refetch();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể ghi nhận hoàn tiền.'));
    } finally {
      setSubmittingRefund(false);
    }
  };

  const onCreateShipment = async () => {
    if (creatingShipment || !order?.id) return;
    createShipmentAbortRef.current?.abort();

    const controller = new AbortController();
    createShipmentAbortRef.current = controller;
    setCreatingShipment(true);

    try {
      await createShipment(order.id, undefined, { signal: controller.signal });
      toast.success('Đã tạo vận đơn GHN thành công');
      await refetch();
    } catch (e) {
      if (controller.signal.aborted) return;
      toast.error(getErrorMessage(e, 'Không thể tạo vận đơn GHN.'));
    } finally {
      if (createShipmentAbortRef.current === controller) {
        createShipmentAbortRef.current = null;
      }
      setCreatingShipment(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-brand-cream flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-navy" />
            <p className="text-body-sm text-neutral-600 font-medium">Đang tải chi tiết đơn hàng & phiếu may đo...</p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  if (isError || !order) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-brand-cream p-6 flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl border border-[#E5DFD5] text-center max-w-md w-full shadow-sm">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h2 className="text-body-lg font-bold text-brand-navy mb-1">Không tìm thấy đơn hàng</h2>
            <p className="text-body-sm text-neutral-500 mb-6">Mã đơn hàng không tồn tại hoặc bạn không có quyền truy cập.</p>
            <Link
              href="/admin/dashboard?tab=orders"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-navy text-white text-xs font-semibold rounded-full hover:bg-brand-navy/90 transition-colors no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Quản lý đơn hàng</span>
            </Link>
          </div>
        </div>
      </AdminGuard>
    );
  }

  const isPending = order.status === 'PENDING' || order.paymentStatus === 'PENDING';
  const refundRequired = order.refundStatus === 'REQUIRED' || order.refundStatus === 'PROCESSING';
  const refundCompleted = order.refundStatus === 'COMPLETED';
  const canCreateShipment = order.status === 'READY_TO_SHIP' && order.paymentStatus === 'PAID' && !order.shipment;
  const statusOptions = ADMIN_ORDER_STATUS_OPTIONS.includes(order.status)
    ? ADMIN_ORDER_STATUS_OPTIONS
    : [order.status, ...ADMIN_ORDER_STATUS_OPTIONS];
  const shipmentBlockedReason = order.shipment
    ? null
    : order.paymentStatus !== 'PAID'
      ? 'Cần thanh toán trước khi tạo vận đơn.'
      : order.status !== 'READY_TO_SHIP'
        ? 'Chuyển trạng thái sang Sẵn sàng giao để tạo vận đơn.'
        : null;

  const statusCfg = resolveOrderStatusCfg(order.status, order.displayStatus);
  const StatusIcon = statusCfg.icon;

  const customerEmail = (order as unknown as { user?: { email?: string } })?.user?.email;
  const rawShipment = order.shipment as (typeof order.shipment & { rawStatus?: string | null }) | undefined;

  return (
    <AdminGuard>
      <div className="min-h-screen bg-brand-cream text-neutral-900 font-sans p-4 sm:p-6 md:p-8 print:bg-white print:p-0">
        <div className="max-w-[1360px] mx-auto space-y-6">

          {/* Top Navigation & Actions Bar (Hidden when printing) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <Link
              href="/admin/dashboard?tab=orders"
              className="inline-flex items-center gap-2 text-body-sm font-semibold text-neutral-600 hover:text-brand-navy transition-colors no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Quản lý đơn hàng</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Switcher Dropdown */}
              <div ref={statusMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setStatusMenuOpen((open) => !open)}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-2 rounded-full border border-[#E5DFD5] bg-white px-4 py-2 text-xs font-bold text-neutral-900 shadow-2xs hover:border-brand-navy/40 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 transition-all cursor-pointer"
                >
                  {updatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-navy" /> : <StatusIcon className="w-3.5 h-3.5 text-brand-navy" />}
                  <span className="text-neutral-500 font-semibold hidden sm:inline">Trạng thái:</span>
                  <span className="text-brand-navy">{statusCfg.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${statusMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {statusMenuOpen && (
                  <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-[#E5DFD5] bg-white p-1.5 shadow-xl">
                    <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#8B8880]">
                      Chọn trạng thái đơn
                    </div>
                    <div className="max-h-72 overflow-y-auto custom-scrollbar pr-1">
                      {statusOptions.map((st) => {
                        const selected = st === order.status;
                        const optionLabel = selected ? statusCfg.label : (ORDER_STATUS_OPTIONS[st] || st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setStatusMenuOpen(false);
                              void handleStatusChange(st);
                            }}
                            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors border-0 cursor-pointer ${
                              selected
                                ? 'bg-brand-navy text-white'
                                : 'bg-transparent text-neutral-700 hover:bg-brand-cream'
                            }`}
                          >
                            <span>{optionLabel}</span>
                            {selected && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Create GHN Shipment Button */}
              {!order.shipment && (
                <button
                  type="button"
                  onClick={onCreateShipment}
                  disabled={!canCreateShipment || creatingShipment}
                  title={shipmentBlockedReason || undefined}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-navy text-white text-xs font-bold rounded-full hover:bg-brand-navy/90 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed transition-all border-0 cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  {creatingShipment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                  <span>{creatingShipment ? 'Đang tạo...' : 'Tạo vận đơn GHN'}</span>
                </button>
              )}

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-brand-navy border border-[#E5DFD5] rounded-full text-xs font-bold hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer active:scale-[0.98]"
              >
                <Printer className="w-4 h-4 text-brand-navy" />
                <span>In phiếu</span>
              </button>
            </div>
          </div>

          {/* Action Banners for Admin Workflow (Hidden when printing) */}
          <div className="space-y-3 print:hidden">
            {/* Manual Payment Confirmation Banner */}
            {isPending && (
              <div className="bg-amber-50/70 border border-amber-300/80 rounded-2xl sm:rounded-3xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100/80 border border-amber-300/50 flex items-center justify-center shrink-0 text-amber-800 shadow-2xs">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-body-md font-bold text-amber-950">Xác nhận thanh toán thủ công</h3>
                    <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                      Đơn hàng đang chờ thanh toán. Dùng khi khách đã chuyển khoản và bạn đã nhận được tiền nhưng hệ thống chưa tự động cập nhật.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
                  <input
                    type="text"
                    placeholder="Ghi chú / Mã sao kê giao dịch..."
                    value={manualPaymentNote}
                    onChange={(e) => setManualPaymentNote(e.target.value)}
                    className="px-4 py-2.5 text-xs bg-white border border-amber-300/80 rounded-xl focus:outline-none focus:border-amber-600 min-w-[280px] shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={onConfirmManualPayment}
                    disabled={submittingPayment}
                    className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-full transition-colors disabled:opacity-50 border-0 cursor-pointer shadow-xs whitespace-nowrap active:scale-[0.98]"
                  >
                    {submittingPayment ? 'Đang xác nhận...' : 'Xác nhận đã nhận tiền'}
                  </button>
                </div>
              </div>
            )}

            {/* Refund Required Banner */}
            {refundRequired && (
              <div className="bg-rose-50/70 border border-rose-300/80 rounded-2xl sm:rounded-3xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-rose-100/80 border border-rose-300/50 flex items-center justify-center shrink-0 text-rose-800 shadow-2xs">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-body-md font-bold text-rose-950">Cần hoàn tiền cho khách</h3>
                    <p className="text-xs text-rose-800/90 mt-0.5 leading-relaxed">
                      Đơn đã bị hủy sau khi khách thanh toán. Sau khi chuyển khoản hoàn lại tiền, vui lòng nhập mã giao dịch/bằng chứng hoàn và xác nhận.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
                  <input
                    type="text"
                    placeholder="Ghi chú / Bằng chứng hoàn tiền..."
                    value={refundNote}
                    onChange={(e) => setRefundNote(e.target.value)}
                    className="px-4 py-2.5 text-xs bg-white border border-rose-300/80 rounded-xl focus:outline-none focus:border-rose-600 min-w-[280px] shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={onConfirmRefund}
                    disabled={submittingRefund}
                    className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-full transition-colors disabled:opacity-50 border-0 cursor-pointer shadow-xs whitespace-nowrap active:scale-[0.98]"
                  >
                    {submittingRefund ? 'Đang xác nhận...' : 'Xác nhận đã hoàn tiền'}
                  </button>
                </div>
              </div>
            )}

            {/* Refund Completed Notification */}
            {refundCompleted && (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl sm:rounded-3xl p-4 flex items-center gap-3 text-emerald-800 text-xs shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">Đã hoàn tiền cho khách thành công cho đơn hàng này.</span>
                {order.refundEvidence && <span className="text-emerald-700 italic">({order.refundEvidence})</span>}
              </div>
            )}
          </div>

          {/* Main Dossier Paper / Card */}
          <div className="bg-white rounded-3xl border border-[#E5DFD5] shadow-[0_4px_24px_rgba(93,28,52,0.03)] p-6 sm:p-8 md:p-9 print:border-none print:shadow-none print:p-0">

            {/* Document Header */}
            <div className="border-b border-[#E5DFD5] pb-6 mb-7 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-navy mb-1.5">
                  <Scissors className="w-4 h-4 text-brand-navy" />
                  <span>Chi tiết đơn hàng &amp; Phiếu may đo kỹ thuật</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-brand-navy tracking-tight">
                  Đơn Hàng #{order.orderCode}
                </h1>
                <p className="text-[12px] text-neutral-400 font-mono mt-1">Mã hệ thống: {order.id}</p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusCfg.cls}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusCfg.label}</span>
                  </span>

                  {order.paymentStatus && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getPaymentBadgeStyle(order.paymentStatus)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{order.paymentStatus === 'PAID' ? 'Đã thanh toán' : order.paymentStatus === 'PENDING' ? 'Chờ thanh toán' : order.paymentStatus}</span>
                    </span>
                  )}
                </div>

                <p className="flex items-center gap-1.5 text-xs text-[#8B8880]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                </p>
              </div>
            </div>

            {/* Customer, Delivery & Shipping Information Bar */}
            <div className="bg-[#F9F7F5] rounded-2xl sm:rounded-3xl border border-[#E5DFD5] p-2 sm:p-3 mb-8 shadow-2xs">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5DFD5]">
                {/* Customer */}
                <div className="p-4 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E5DFD5] flex items-center justify-center shrink-0 text-brand-navy shadow-2xs">
                    <User className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B8880]">Khách hàng</p>
                    <p className="text-body-sm font-bold text-brand-navy truncate mt-0.5">{order.shippingInfo?.name || 'Khách vãng lai'}</p>
                    {customerEmail && (
                      <p className="text-[12px] text-neutral-600 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span>{customerEmail}</span>
                      </p>
                    )}
                    {order.userId && <p className="text-[11px] text-neutral-400 font-mono mt-0.5 truncate">User ID: {order.userId}</p>}
                  </div>
                </div>

                {/* Delivery Address & Contact */}
                <div className="p-4 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E5DFD5] flex items-center justify-center shrink-0 text-brand-navy shadow-2xs">
                    <MapPin className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B8880]">Liên hệ &amp; Giao nhận</p>
                    <p className="text-body-sm font-semibold text-neutral-800 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{order.shippingInfo?.phone || '—'}</span>
                    </p>
                    <p className="text-[12px] text-neutral-600 line-clamp-2 mt-0.5 leading-relaxed">{order.shippingInfo?.address || '—'}</p>
                    {(order.shippingInfo?.notes || order.shippingInfo?.note) && (
                      <p className="text-[11px] text-neutral-500 italic mt-1">
                        Ghi chú: {order.shippingInfo?.notes || order.shippingInfo?.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Shipment Tracking / GHN */}
                <div className="p-4 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E5DFD5] flex items-center justify-center shrink-0 text-brand-navy shadow-2xs">
                    <Truck className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B8880]">Vận chuyển GHN</p>
                    {order.shipment ? (
                      <div className="mt-0.5 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-xs text-brand-navy">
                            {order.shipment.providerOrderCode || 'Chưa có mã'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-cream border border-[#E5DFD5] text-brand-navy font-bold uppercase">
                            {order.shipment.provider}
                          </span>
                        </div>
                        <p className="text-[12px] text-neutral-600">
                          Trạng thái: <strong className="text-neutral-800">{shipmentStatusLabel(order.shipment.status, rawShipment?.rawStatus)}</strong>
                        </p>
                        {order.shipment.expectedDeliveryTime && (
                          <p className="text-[11px] text-neutral-500">
                            Dự kiến: {order.shipment.expectedDeliveryTime.substring(0, 16).replace('T', ' ')}
                          </p>
                        )}
                        <Link
                          href={`/admin/dashboard?tab=shipments&shipmentCode=${order.shipment.providerOrderCode || ''}`}
                          className="inline-flex items-center gap-1 text-[11px] text-brand-navy font-bold hover:underline no-underline mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Xem trong tab Vận đơn</span>
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-0.5">
                        <p className="text-xs text-neutral-500 italic">Đơn chưa tạo vận đơn GHN.</p>
                        {shipmentBlockedReason && (
                          <p className="text-[11px] text-neutral-500 mt-1">{shipmentBlockedReason}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Layout: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* LEFT: Order Items & Tailor Garment Measurements */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3.5">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-brand-navy" />
                    <h2 className="text-lg font-bold text-brand-navy">
                      Sản phẩm &amp; Thông số may đo ({order.items?.length || 0} món)
                    </h2>
                  </div>
                  <span className="text-xs text-[#8B8880] font-medium uppercase tracking-wider">Bảng kỹ thuật may</span>
                </div>

                {order.items && order.items.length > 0 ? (
                  <div className="space-y-6">
                    {order.items.map((item, idx) => {
                      const itemId = item.id || `item-${idx}`;
                      const isExpanded = !!expandedSnapshots[itemId];
                      const rawImg = item.productImageSnapshot || (typeof item.product?.images?.[0] === 'string' ? item.product.images[0] : (item.product?.images?.[0] as unknown as { imageUrl?: string })?.imageUrl);
                      const img = typeof rawImg === 'string' ? rawImg : '/images/726470431_1311184104081177_6052756217829444481_n.png';
                      const name = item.productNameSnapshot || item.product?.name || `Trang phục #${item.productId}`;
                      const itemUnitPrice = item.unitPriceVnd ?? item.price;
                      const itemLineTotal = item.lineTotalVnd ?? (item.price * item.quantity);

                      return (
                        <div key={itemId} className="rounded-2xl sm:rounded-3xl border border-[#E5DFD5] overflow-hidden bg-white shadow-2xs">
                          {/* Item Card Header */}
                          <div className="p-4 sm:p-5 bg-brand-cream/60 border-b border-[#E5DFD5] flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <Image
                                src={img}
                                alt={name}
                                width={60}
                                height={75}
                                className="w-15 h-19 sm:w-16 sm:h-20 object-cover rounded-xl bg-white shrink-0 border border-[#E5DFD5] shadow-2xs"
                              />
                              <div className="min-w-0">
                                <h3 className="text-body-md font-bold text-brand-navy truncate">{name}</h3>
                                {item.productSkuSnapshot && (
                                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">SKU: {item.productSkuSnapshot}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-600 mt-1.5">
                                  <span className="px-2 py-0.5 rounded bg-white border border-[#E5DFD5]/80">
                                    Màu: <strong className="text-brand-navy font-semibold">{item.color || 'Mặc định'}</strong>
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-white border border-[#E5DFD5]/80">
                                    Vải: <strong className="text-brand-navy font-semibold">{item.fabricSnapshot || 'Tiêu chuẩn'}</strong>
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-white border border-[#E5DFD5]/80">
                                    SL: <strong className="text-brand-navy font-bold">{item.quantity}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-body-md font-bold text-brand-navy">{fmt(itemLineTotal)}</span>
                              {item.quantity > 1 && (
                                <p className="text-[11px] text-neutral-400 mt-0.5">({fmt(itemUnitPrice)}/cái)</p>
                              )}
                            </div>
                          </div>

                          {/* Garment Measurements Display (Warm Bespoke Styling) */}
                          <div className="p-5 sm:p-6">
                            <div className="mb-3.5 flex items-center justify-between">
                              <span className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                                <Scissors className="w-3.5 h-3.5 text-brand-navy" />
                                <span>Số đo may đo thành phẩm</span>
                              </span>
                              {item.measurementDisplay && item.measurementDisplay.length > 0 && (
                                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-cream border border-[#E5DFD5] text-brand-navy">
                                  {item.measurementDisplay.length} thông số
                                </span>
                              )}
                            </div>

                            {item.measurementDisplay && item.measurementDisplay.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {item.measurementDisplay.map((m) => (
                                  <div
                                    key={m.field}
                                    className="p-3.5 rounded-xl bg-brand-cream/60 border border-[#E5DFD5]/90 hover:border-brand-navy/30 transition-all flex flex-col justify-between shadow-2xs"
                                  >
                                    <span className="text-[11px] font-semibold text-[#8B8880] uppercase tracking-wider mb-1 truncate">{m.label}</span>
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-lg font-bold text-brand-navy font-mono tracking-tight">
                                        {m.value}
                                      </span>
                                      <span className="text-xs text-[#8B8880] font-normal">{m.unit}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : item.measurementDisplay && item.measurementDisplay.length === 0 ? (
                              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>Chưa đủ dữ liệu số đo bắt buộc cho loại trang phục này. Thợ may cần yêu cầu khách bổ sung số đo.</span>
                              </div>
                            ) : (
                              <p className="text-xs text-neutral-400 italic">Không có thông số may đo cho sản phẩm này.</p>
                            )}

                            {/* Raw 16-field snapshot accordion for cross-referencing */}
                            {item.measurementSnapshot && Object.keys(item.measurementSnapshot).length > 0 && (
                              <div className="mt-4 pt-4 border-t border-[#E5DFD5]/70">
                                <button
                                  type="button"
                                  onClick={() => toggleSnapshot(itemId)}
                                  className="w-full flex items-center justify-between text-xs font-semibold text-neutral-600 hover:text-brand-navy py-1 bg-transparent border-0 cursor-pointer"
                                >
                                  <span>Đối chiếu bảng 16 số đo thô ban đầu (measurementSnapshot)</span>
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {isExpanded && (
                                  <div className="mt-3 p-3.5 bg-brand-cream/40 rounded-xl border border-[#E5DFD5] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    {Object.entries(item.measurementSnapshot).map(([key, val]) => {
                                      if (val === null || val === undefined || val === '') return null;
                                      return (
                                        <div key={key} className="bg-white p-2 rounded-lg border border-[#E5DFD5] flex flex-col">
                                          <span className="text-[10.5px] text-[#8B8880] font-mono truncate">{key}</span>
                                          <span className="font-bold text-brand-navy font-mono mt-0.5">{String(val)} cm</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-brand-cream/50 rounded-2xl border border-[#E5DFD5] text-neutral-400 text-body-sm">
                    Đơn hàng không có sản phẩm nào.
                  </div>
                )}
              </div>

              {/* RIGHT: Customer Profile & Financial Breakdown */}
              <div className="lg:col-span-4 space-y-6">

                {/* Payment & Financial Breakdown Card */}
                <div className="rounded-2xl sm:rounded-3xl border border-[#E5DFD5] p-5 sm:p-6 bg-white shadow-2xs">
                  <div className="flex items-center gap-2 border-b border-[#E5DFD5] pb-3.5 mb-4">
                    <Receipt className="w-4 h-4 text-brand-navy" />
                    <h3 className="text-body-md font-bold text-brand-navy">Thanh toán &amp; Chi phí</h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Phương thức:</span>
                      <span className="font-semibold text-brand-navy">{order.paymentMethod || '—'}</span>
                    </div>

                    {order.paymentProvider && (
                      <div className="flex justify-between text-neutral-600">
                        <span>Cổng thanh toán:</span>
                        <span className="font-semibold text-brand-navy">{order.paymentProvider}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-neutral-600">
                      <span>Trạng thái thanh toán:</span>
                      <span className="font-semibold text-brand-navy">{order.paymentStatus || '—'}</span>
                    </div>

                    {order.itemsSubtotalVnd !== undefined ? (
                      <div className="flex justify-between text-neutral-600">
                        <span>Tiền hàng:</span>
                        <span className="text-neutral-900 font-medium">{fmt(order.itemsSubtotalVnd)}</span>
                      </div>
                    ) : order.itemsTotal ? (
                      <div className="flex justify-between text-neutral-600">
                        <span>Tiền hàng:</span>
                        <span className="text-neutral-900 font-medium">{fmt(order.itemsTotal)}</span>
                      </div>
                    ) : null}

                    {order.shippingFeeVnd !== undefined ? (
                      <div className="flex justify-between text-neutral-600">
                        <span>Phí vận chuyển:</span>
                        <span className="text-neutral-900 font-medium">{fmt(order.shippingFeeVnd)}</span>
                      </div>
                    ) : order.shippingFee ? (
                      <div className="flex justify-between text-neutral-600">
                        <span>Phí vận chuyển:</span>
                        <span className="text-neutral-900 font-medium">{fmt(order.shippingFee)}</span>
                      </div>
                    ) : null}

                    {/* Fixed rogue 0 bug with explicit Boolean check */}
                    {Boolean((order.discountVnd && order.discountVnd > 0) || (order.discountAmount && order.discountAmount > 0)) && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Giảm giá{(order as unknown as { couponCode?: string })?.couponCode ? ` (${(order as unknown as { couponCode?: string }).couponCode})` : ''}:</span>
                        <span>-{fmt(order.discountVnd ?? order.discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-body-md font-bold text-brand-navy pt-3 border-t border-[#E5DFD5]">
                      <span>Tổng tiền đơn:</span>
                      <span className="text-lg">{fmt(order.totalVnd ?? order.totalAmount)}</span>
                    </div>

                    {order.amountPaidVnd !== undefined && (
                      <div className="flex justify-between text-xs text-neutral-600 pt-1">
                        <span>Đã thu khách:</span>
                        <span className="font-bold text-emerald-700">{fmt(order.amountPaidVnd)}</span>
                      </div>
                    )}

                    {order.amountRefundedVnd !== undefined && order.amountRefundedVnd > 0 && (
                      <div className="flex justify-between text-xs text-neutral-600">
                        <span>Đã hoàn lại:</span>
                        <span className="font-bold text-red-600">-{fmt(order.amountRefundedVnd)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Profile Measurements */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E5DFD5] p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3.5">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-brand-navy" />
                      <h3 className="text-body-md font-bold text-brand-navy">
                        Hồ sơ số đo của khách
                      </h3>
                    </div>
                    <span className="text-[10px] text-[#8B8880] font-mono uppercase tracking-wider">Hồ sơ cá nhân</span>
                  </div>

                  {isLoadingUserMeasurements ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-neutral-500">
                      <Loader2 className="w-5 h-5 animate-spin text-brand-navy" />
                      <span>Đang tải hồ sơ số đo khách hàng...</span>
                    </div>
                  ) : !order.userId ? (
                    <div className="p-4 rounded-xl bg-brand-cream/50 border border-[#E5DFD5] text-xs text-neutral-500 italic text-center">
                      Đơn hàng không có mã tài khoản khách hàng (khách vãng lai).
                    </div>
                  ) : userMeasurements && Object.values(userMeasurements).some((v) => v !== null && v !== undefined) ? (
                    <div className="space-y-4">
                      {/* Overview group */}
                      <div>
                        <h4 className="text-[11px] font-bold text-[#8B8880] uppercase tracking-wider mb-2">Chỉ số tổng quan</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 bg-brand-cream/60 rounded-xl border border-[#E5DFD5] flex justify-between items-center text-xs">
                            <span className="text-neutral-600">Chiều cao</span>
                            <span className="font-bold text-brand-navy font-mono">
                              {userMeasurements.height ? `${userMeasurements.height} cm` : '—'}
                            </span>
                          </div>
                          <div className="p-2.5 bg-brand-cream/60 rounded-xl border border-[#E5DFD5] flex justify-between items-center text-xs">
                            <span className="text-neutral-600">Cân nặng</span>
                            <span className="font-bold text-brand-navy font-mono">
                              {userMeasurements.weight ? `${userMeasurements.weight} kg` : '—'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Measurements List */}
                      <div>
                        <h4 className="text-[11px] font-bold text-[#8B8880] uppercase tracking-wider mb-2">Số đo chi tiết</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {allMeasurementFields
                            .filter((f) => f.id !== 'height' && f.id !== 'weight')
                            .map((field) => {
                              const val = userMeasurements[field.id as keyof typeof userMeasurements];
                              if (val === null || val === undefined) return null;
                              return (
                                <div
                                  key={field.id}
                                  className="p-2 bg-brand-cream/60 rounded-lg border border-[#E5DFD5] flex justify-between items-center"
                                >
                                  <span className="text-neutral-600 truncate">{field.label}:</span>
                                  <span className="font-bold text-brand-navy font-mono shrink-0 ml-1">{val} {field.unit}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-brand-cream/50 rounded-xl border border-[#E5DFD5] text-xs text-neutral-500 italic">
                      Khách hàng chưa cập nhật số đo nào trong hồ sơ cá nhân.
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Document Signature for Print Preview */}
            <div className="hidden print:grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-neutral-300 text-center text-xs text-neutral-600">
              <div>
                <p className="font-bold text-neutral-900 mb-12">Người lập phiếu</p>
                <p className="border-t border-neutral-400 pt-2 w-36 mx-auto">(Ký và ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-bold text-neutral-900 mb-12">Thợ cắt / Kỹ thuật</p>
                <p className="border-t border-neutral-400 pt-2 w-36 mx-auto">(Ký và ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-bold text-neutral-900 mb-12">Quản lý kiểm tra (QC)</p>
                <p className="border-t border-neutral-400 pt-2 w-36 mx-auto">(Ký và ghi rõ họ tên)</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

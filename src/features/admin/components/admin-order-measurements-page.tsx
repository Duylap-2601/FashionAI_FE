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
import { AtelierLoader } from '@/components/ui/AtelierLoader';
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
  'MEASUREMENT_REVIEW',
  'MEASUREMENT_CONFIRMED',
  'TAILORING',
  'READY_TO_SHIP',
  'CANCELLED',
];

function getPaymentBadgeStyle(status?: string) {
  switch (status?.toUpperCase()) {
    case 'PAID':
      return 'bg-metric-products/10 text-metric-products ring-1 ring-metric-products';
    case 'FAILED':
      return 'bg-destructive/10 text-destructive ring-1 ring-destructive';
    case 'PENDING':
    default:
      return 'bg-metric-users/10 text-metric-users ring-1 ring-metric-users';
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
    if (!order?.orderCode || !order?.id) return;
    const finalNote = manualPaymentNote.trim() || 'Xác nhận thanh toán chuyển khoản thủ công';
    const finalRef = manualPaymentNote.trim() || `SEPAY-${order.orderCode}-${Date.now()}`;
    setSubmittingPayment(true);
    try {
      await confirmManualPayment(order.orderCode, {
        reference: finalRef,
        note: finalNote,
      });

      // Nếu đơn hàng đang ở trạng thái 'CREATED' (Đã tạo) hoặc 'PENDING',
      // tự động chuyển trạng thái đơn hàng sang 'MEASUREMENT_REVIEW' (Kiểm tra số đo)
      if (order.status === 'CREATED' || order.status === 'PENDING') {
        try {
          await updateOrderStatus(order.id, { status: 'MEASUREMENT_REVIEW' });
        } catch (statusError) {
          console.warn('Auto transition to MEASUREMENT_REVIEW failed:', statusError);
        }
      }

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
        <div className="min-h-dvh bg-landing-paper flex items-center justify-center">
          <AtelierLoader size="md" label="Đang may phiếu đo" />
        </div>
      </AdminGuard>
    );
  }

  if (isError || !order) {
    return (
      <AdminGuard>
        <div className="min-h-dvh bg-landing-paper p-6 flex items-center justify-center">
          <div className="bg-landing-ivory p-8 rounded-[2px] border border-landing-line text-center max-w-md w-full">
            <AlertTriangle className="w-12 h-12 text-metric-users mx-auto mb-3" />
            <h2 className="font-display text-[1.15rem] leading-tight text-landing-oxblood mb-1">Không tìm thấy đơn hàng</h2>
            <p className="text-body-sm text-landing-muted mb-6">Mã đơn hàng không tồn tại hoặc bạn không có quyền truy cập.</p>
            <Link
              href="/admin/dashboard?tab=orders"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-landing-oxblood text-landing-paper text-xs font-semibold rounded-[2px] hover:bg-landing-obsidian transition-colors no-underline"
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
  const isTerminalStatus = order.status === 'CANCELLED' || order.status === 'COMPLETED' || order.status === 'RETURNED' || order.status === 'FAILED';
  const statusOptions = Array.from(
    new Set(
      ADMIN_ORDER_STATUS_OPTIONS.includes(order.status)
        ? ADMIN_ORDER_STATUS_OPTIONS
        : [order.status, ...ADMIN_ORDER_STATUS_OPTIONS]
    )
  );
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
      <div className="min-h-dvh bg-landing-paper text-landing-obsidian font-sans p-4 sm:p-6 md:p-8 print:bg-landing-ivory print:p-0">
        <div className="max-w-[1360px] mx-auto space-y-6">

          {/* Top Navigation & Actions Bar (Hidden when printing) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <Link
              href="/admin/dashboard?tab=orders"
              className="inline-flex items-center gap-2 text-body-sm font-semibold text-landing-obsidian hover:text-landing-oxblood transition-colors no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Quản lý đơn hàng</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Switcher Dropdown (Disabled if order is in terminal state like CANCELLED/COMPLETED) */}
              <div ref={statusMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => !isTerminalStatus && setStatusMenuOpen((open) => !open)}
                  disabled={updatingStatus || isTerminalStatus}
                  title={isTerminalStatus ? `Đơn hàng đã ở trạng thái "${statusCfg.label}", không thể thay đổi` : undefined}
                  className="inline-flex items-center gap-2 rounded-[2px] border border-landing-line bg-landing-ivory px-4 py-2 text-xs font-bold text-landing-obsidian hover:border-landing-oxblood/40 hover:bg-landing-paper/60 disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:border-landing-line disabled:hover:bg-landing-ivory transition-all cursor-pointer"
                >
                  {updatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin text-landing-oxblood" /> : <StatusIcon className="w-3.5 h-3.5 text-landing-oxblood" />}
                  <span className="text-landing-muted font-semibold hidden sm:inline">Trạng thái:</span>
                  <span className="text-landing-oxblood">{statusCfg.label}</span>
                  {!isTerminalStatus && (
                    <ChevronDown className={`w-3.5 h-3.5 text-landing-muted transition-transform ${statusMenuOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {statusMenuOpen && !isTerminalStatus && (
                  <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-[2px] border border-landing-line bg-landing-ivory p-1.5">
                    <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-landing-muted">
                      Chọn trạng thái đơn
                    </div>
                    <div className="max-h-72 overflow-y-auto custom-scrollbar pr-1">
                      {statusOptions.map((st) => {
                        const selected = st === order.status;
                        const optionLabel = ORDER_STATUS_OPTIONS[st] || (selected ? statusCfg.label : st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setStatusMenuOpen(false);
                              void handleStatusChange(st);
                            }}
                            className={`flex w-full items-center justify-between gap-3 rounded-[2px] px-3 py-2 text-left text-xs font-semibold transition-colors border-0 cursor-pointer ${
                              selected
                                ? 'bg-landing-oxblood text-landing-paper'
                                : 'bg-transparent text-landing-obsidian hover:bg-landing-paper'
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-landing-oxblood text-landing-paper text-xs font-bold rounded-[2px] hover:bg-landing-obsidian disabled:bg-landing-taupe disabled:text-landing-muted disabled:cursor-not-allowed transition-all border-0 cursor-pointer active:scale-[0.98]"
                >
                  {creatingShipment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                  <span>{creatingShipment ? 'Đang tạo...' : 'Tạo vận đơn GHN'}</span>
                </button>
              )}

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-landing-ivory text-landing-oxblood border border-landing-line rounded-[2px] text-xs font-bold hover:bg-landing-paper/60 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <Printer className="w-4 h-4 text-landing-oxblood" />
                <span>In phiếu</span>
              </button>
            </div>
          </div>

          {/* Action Banners for Admin Workflow (Hidden when printing) */}
          <div className="space-y-3 print:hidden">
            {/* Manual Payment Confirmation Banner */}
            {isPending && (
              <div className="bg-metric-users/10 border border-metric-users rounded-[2px] sm:rounded-[2px] p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-[2px] bg-metric-users/10 border border-metric-users flex items-center justify-center shrink-0 text-metric-users">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-[1.05rem] leading-tight text-metric-users">Xác nhận thanh toán thủ công</h3>
                    <p className="text-xs text-metric-users mt-0.5 leading-relaxed">
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
                    className="px-4 py-2.5 text-xs bg-landing-ivory border border-metric-users rounded-[2px] focus:outline-none focus:border-metric-users min-w-[280px]"
                  />
                  <button
                    type="button"
                    onClick={onConfirmManualPayment}
                    disabled={submittingPayment}
                    className="px-5 py-2.5 bg-landing-oxblood hover:bg-landing-obsidian text-landing-paper text-xs font-bold rounded-[2px] transition-colors disabled:opacity-50 border-0 cursor-pointer whitespace-nowrap active:scale-[0.98]"
                  >
                    {submittingPayment ? 'Đang xác nhận...' : 'Xác nhận đã nhận tiền'}
                  </button>
                </div>
              </div>
            )}

            {/* Refund Required Banner */}
            {refundRequired && (
              <div className="bg-destructive/10 border border-destructive rounded-[2px] sm:rounded-[2px] p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-[2px] bg-destructive/10 border border-destructive flex items-center justify-center shrink-0 text-destructive">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-[1.05rem] leading-tight text-destructive">Cần hoàn tiền cho khách</h3>
                    <p className="text-xs text-destructive mt-0.5 leading-relaxed">
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
                    className="px-4 py-2.5 text-xs bg-landing-ivory border border-destructive rounded-[2px] focus:outline-none focus:border-destructive min-w-[280px]"
                  />
                  <button
                    type="button"
                    onClick={onConfirmRefund}
                    disabled={submittingRefund}
                    className="px-5 py-2.5 bg-destructive hover:bg-destructive/90 text-landing-paper text-xs font-bold rounded-[2px] transition-colors disabled:opacity-50 border-0 cursor-pointer whitespace-nowrap active:scale-[0.98]"
                  >
                    {submittingRefund ? 'Đang xác nhận...' : 'Xác nhận đã hoàn tiền'}
                  </button>
                </div>
              </div>
            )}

            {/* Refund Completed Notification */}
            {refundCompleted && (
              <div className="bg-metric-products/10 border border-metric-products/30 rounded-[2px] sm:rounded-[2px] p-4 flex items-center gap-3 text-metric-products text-xs">
                <CheckCircle2 className="w-5 h-5 text-metric-products shrink-0" />
                <span className="font-semibold">Đã hoàn tiền cho khách thành công cho đơn hàng này.</span>
                {order.refundEvidence && <span className="text-metric-products italic">({order.refundEvidence})</span>}
              </div>
            )}
          </div>

          {/* Main Dossier Paper / Card */}
          <div className="bg-landing-ivory rounded-[2px] border border-landing-line p-6 sm:p-8 md:p-9 print:border-none print:shadow-none print:p-0">

            {/* Document Header */}
            <div className="border-b border-landing-line pb-6 mb-7 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-landing-oxblood mb-1.5">
                  <Scissors className="w-4 h-4 text-landing-oxblood" />
                  <span>Chi tiết đơn hàng &amp; Phiếu may đo kỹ thuật</span>
                </div>
                <h1 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] font-medium leading-[1.08] tracking-[-0.025em] text-landing-oxblood">
                  Đơn Hàng #{order.orderCode}
                </h1>
                <p className="text-[12px] text-landing-muted font-mono mt-1">Mã hệ thống: {order.id}</p>
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

                <p className="flex items-center gap-1.5 text-xs text-landing-muted">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                </p>
              </div>
            </div>

            {/* Customer, Delivery & Shipping Information Bar */}
            <div className="bg-landing-paper/60 rounded-[2px] sm:rounded-[2px] border border-landing-line p-2 sm:p-3 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5DFD5]">
                {/* Customer */}
                <div className="p-4 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-[2px] bg-landing-ivory border border-landing-line flex items-center justify-center shrink-0 text-landing-oxblood">
                    <User className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-landing-muted">Khách hàng</p>
                    <p className="text-body-sm font-bold text-landing-oxblood truncate mt-0.5">{order.shippingInfo?.name || 'Khách vãng lai'}</p>
                    {customerEmail && (
                      <p className="text-[12px] text-landing-obsidian truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-landing-muted shrink-0" />
                        <span>{customerEmail}</span>
                      </p>
                    )}
                    {order.userId && <p className="text-[11px] text-landing-muted font-mono mt-0.5 truncate">User ID: {order.userId}</p>}
                  </div>
                </div>

                {/* Delivery Address & Contact */}
                <div className="p-4 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-[2px] bg-landing-ivory border border-landing-line flex items-center justify-center shrink-0 text-landing-oxblood">
                    <MapPin className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-landing-muted">Liên hệ &amp; Giao nhận</p>
                    <p className="text-body-sm font-semibold text-landing-obsidian flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-landing-muted" />
                      <span>{order.shippingInfo?.phone || '—'}</span>
                    </p>
                    <p className="text-[12px] text-landing-obsidian line-clamp-2 mt-0.5 leading-relaxed">{order.shippingInfo?.address || '—'}</p>
                    {(order.shippingInfo?.notes || order.shippingInfo?.note) && (
                      <p className="text-[11px] text-landing-muted italic mt-1">
                        Ghi chú: {order.shippingInfo?.notes || order.shippingInfo?.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Shipment Tracking / GHN */}
                <div className="p-4 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-[2px] bg-landing-ivory border border-landing-line flex items-center justify-center shrink-0 text-landing-oxblood">
                    <Truck className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-landing-muted">Vận chuyển GHN</p>
                    {order.shipment ? (
                      <div className="mt-0.5 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-xs text-landing-oxblood">
                            {order.shipment.providerOrderCode || 'Chưa có mã'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-landing-paper border border-landing-line text-landing-oxblood font-bold uppercase">
                            {order.shipment.provider}
                          </span>
                        </div>
                        <p className="text-[12px] text-landing-obsidian">
                          Trạng thái: <strong className="text-landing-obsidian">{shipmentStatusLabel(order.shipment.status, rawShipment?.rawStatus)}</strong>
                        </p>
                        {order.shipment.expectedDeliveryTime && (
                          <p className="text-[11px] text-landing-muted">
                            Dự kiến: {order.shipment.expectedDeliveryTime.substring(0, 16).replace('T', ' ')}
                          </p>
                        )}
                        <Link
                          href={`/admin/dashboard?tab=shipments&shipmentCode=${order.shipment.providerOrderCode || ''}`}
                          className="inline-flex items-center gap-1 text-[11px] text-landing-oxblood font-bold hover:underline no-underline mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Xem trong tab Vận đơn</span>
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-0.5">
                        <p className="text-xs text-landing-muted italic">Đơn chưa tạo vận đơn GHN.</p>
                        {shipmentBlockedReason && (
                          <p className="text-[11px] text-landing-muted mt-1">{shipmentBlockedReason}</p>
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
                <div className="flex items-center justify-between border-b border-landing-line pb-3.5">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-landing-oxblood" />
                    <h2 className="font-display text-[1.15rem] leading-tight text-landing-oxblood">
                      Sản phẩm &amp; Thông số may đo ({order.items?.length || 0} món)
                    </h2>
                  </div>
                  <span className="text-xs text-landing-muted font-medium uppercase tracking-wider">Bảng kỹ thuật may</span>
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
                        <div key={itemId} className="rounded-[2px] sm:rounded-[2px] border border-landing-line overflow-hidden bg-landing-ivory">
                          {/* Item Card Header */}
                          <div className="p-4 sm:p-5 bg-landing-paper/60 border-b border-landing-line flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <Image
                                src={img}
                                alt={name}
                                width={60}
                                height={75}
                                className="w-15 h-19 sm:w-16 sm:h-20 object-cover rounded-[2px] bg-landing-ivory shrink-0 border border-landing-line"
                              />
                              <div className="min-w-0">
                                <h3 className="font-display text-[1.05rem] leading-tight text-landing-oxblood truncate">{name}</h3>
                                {item.productSkuSnapshot && (
                                  <p className="text-[11px] text-landing-muted font-mono mt-0.5">SKU: {item.productSkuSnapshot}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-1.5 text-xs text-landing-obsidian mt-1.5">
                                  <span className="px-2 py-0.5 rounded bg-landing-ivory border border-landing-line/80">
                                    Màu: <strong className="text-landing-oxblood font-semibold">{item.color || 'Mặc định'}</strong>
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-landing-ivory border border-landing-line/80">
                                    Vải: <strong className="text-landing-oxblood font-semibold">{item.fabricSnapshot || 'Tiêu chuẩn'}</strong>
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-landing-ivory border border-landing-line/80">
                                    SL: <strong className="text-landing-oxblood font-bold">{item.quantity}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-display text-[1.05rem] leading-tight text-landing-oxblood">{fmt(itemLineTotal)}</span>
                              {item.quantity > 1 && (
                                <p className="text-[11px] text-landing-muted mt-0.5">({fmt(itemUnitPrice)}/cái)</p>
                              )}
                            </div>
                          </div>

                          {/* Garment Measurements Display (Warm Bespoke Styling) */}
                          <div className="p-5 sm:p-6">
                            <div className="mb-3.5 flex items-center justify-between">
                              <span className="text-xs font-bold text-landing-oxblood uppercase tracking-wider flex items-center gap-1.5">
                                <Scissors className="w-3.5 h-3.5 text-landing-oxblood" />
                                <span>Số đo may đo thành phẩm</span>
                              </span>
                              {item.measurementDisplay && item.measurementDisplay.length > 0 && (
                                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-landing-paper border border-landing-line text-landing-oxblood">
                                  {item.measurementDisplay.length} thông số
                                </span>
                              )}
                            </div>

                            {item.measurementDisplay && item.measurementDisplay.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {item.measurementDisplay.map((m) => (
                                  <div
                                    key={m.field}
                                    className="p-3.5 rounded-[2px] bg-landing-paper/60 border border-landing-line/90 hover:border-landing-oxblood/30 transition-all flex flex-col justify-between"
                                  >
                                    <span className="text-[11px] font-semibold text-landing-muted uppercase tracking-wider mb-1 truncate">{m.label}</span>
                                    <div className="flex items-baseline gap-1">
                                      <span className="font-display text-[1.15rem] leading-tight text-landing-oxblood font-mono tracking-tight">
                                        {m.value}
                                      </span>
                                      <span className="text-xs text-landing-muted font-normal">{m.unit}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : item.measurementDisplay && item.measurementDisplay.length === 0 ? (
                              <div className="p-4 rounded-[2px] bg-metric-users/10 border border-metric-users/30 text-xs text-metric-users flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-metric-users shrink-0" />
                                <span>Chưa đủ dữ liệu số đo bắt buộc cho loại trang phục này. Thợ may cần yêu cầu khách bổ sung số đo.</span>
                              </div>
                            ) : (
                              <p className="text-xs text-landing-muted italic">Không có thông số may đo cho sản phẩm này.</p>
                            )}

                            {/* Raw 16-field snapshot accordion for cross-referencing */}
                            {item.measurementSnapshot && Object.keys(item.measurementSnapshot).length > 0 && (
                              <div className="mt-4 pt-4 border-t border-landing-line/70">
                                <button
                                  type="button"
                                  onClick={() => toggleSnapshot(itemId)}
                                  className="w-full flex items-center justify-between text-xs font-semibold text-landing-obsidian hover:text-landing-oxblood py-1 bg-transparent border-0 cursor-pointer"
                                >
                                  <span>Đối chiếu bảng 16 số đo thô ban đầu (measurementSnapshot)</span>
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {isExpanded && (
                                  <div className="mt-3 p-3.5 bg-landing-paper/40 rounded-[2px] border border-landing-line grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    {Object.entries(item.measurementSnapshot).map(([key, val]) => {
                                      if (val === null || val === undefined || val === '') return null;
                                      return (
                                        <div key={key} className="bg-landing-ivory p-2 rounded-[2px] border border-landing-line flex flex-col">
                                          <span className="text-[10.5px] text-landing-muted font-mono truncate">{key}</span>
                                          <span className="font-bold text-landing-oxblood font-mono mt-0.5">{String(val)} cm</span>
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
                  <div className="p-8 text-center bg-landing-paper/50 rounded-[2px] border border-landing-line text-landing-muted text-body-sm">
                    Đơn hàng không có sản phẩm nào.
                  </div>
                )}
              </div>

              {/* RIGHT: Customer Profile & Financial Breakdown */}
              <div className="lg:col-span-4 space-y-6">

                {/* Payment & Financial Breakdown Card */}
                <div className="rounded-[2px] sm:rounded-[2px] border border-landing-line p-5 sm:p-6 bg-landing-ivory">
                  <div className="flex items-center gap-2 border-b border-landing-line pb-3.5 mb-4">
                    <Receipt className="w-4 h-4 text-landing-oxblood" />
                    <h3 className="font-display text-[1.05rem] leading-tight text-landing-oxblood">Thanh toán &amp; Chi phí</h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-landing-obsidian">
                      <span>Phương thức:</span>
                      <span className="font-semibold text-landing-oxblood">{order.paymentMethod || '—'}</span>
                    </div>

                    {order.paymentProvider && (
                      <div className="flex justify-between text-landing-obsidian">
                        <span>Cổng thanh toán:</span>
                        <span className="font-semibold text-landing-oxblood">{order.paymentProvider}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-landing-obsidian">
                      <span>Trạng thái thanh toán:</span>
                      <span className="font-semibold text-landing-oxblood">{order.paymentStatus || '—'}</span>
                    </div>

                    {order.itemsSubtotalVnd !== undefined ? (
                      <div className="flex justify-between text-landing-obsidian">
                        <span>Tiền hàng:</span>
                        <span className="text-landing-obsidian font-medium">{fmt(order.itemsSubtotalVnd)}</span>
                      </div>
                    ) : order.itemsTotal ? (
                      <div className="flex justify-between text-landing-obsidian">
                        <span>Tiền hàng:</span>
                        <span className="text-landing-obsidian font-medium">{fmt(order.itemsTotal)}</span>
                      </div>
                    ) : null}

                    {order.shippingFeeVnd !== undefined ? (
                      <div className="flex justify-between text-landing-obsidian">
                        <span>Phí vận chuyển:</span>
                        <span className="text-landing-obsidian font-medium">{fmt(order.shippingFeeVnd)}</span>
                      </div>
                    ) : order.shippingFee ? (
                      <div className="flex justify-between text-landing-obsidian">
                        <span>Phí vận chuyển:</span>
                        <span className="text-landing-obsidian font-medium">{fmt(order.shippingFee)}</span>
                      </div>
                    ) : null}

                    {/* Fixed rogue 0 bug with explicit Boolean check */}
                    {Boolean((order.discountVnd && order.discountVnd > 0) || (order.discountAmount && order.discountAmount > 0)) && (
                      <div className="flex justify-between text-metric-products font-medium">
                        <span>Giảm giá{(order as unknown as { couponCode?: string })?.couponCode ? ` (${(order as unknown as { couponCode?: string }).couponCode})` : ''}:</span>
                        <span>-{fmt(order.discountVnd ?? order.discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-display text-[1.05rem] leading-tight text-landing-oxblood pt-3 border-t border-landing-line">
                      <span>Tổng tiền đơn:</span>
                      <span className="text-lg">{fmt(order.totalVnd ?? order.totalAmount)}</span>
                    </div>

                    {order.amountPaidVnd !== undefined && (
                      <div className="flex justify-between text-xs text-landing-obsidian pt-1">
                        <span>Đã thu khách:</span>
                        <span className="font-bold text-metric-products">{fmt(order.amountPaidVnd)}</span>
                      </div>
                    )}

                    {order.amountRefundedVnd !== undefined && order.amountRefundedVnd > 0 && (
                      <div className="flex justify-between text-xs text-landing-obsidian">
                        <span>Đã hoàn lại:</span>
                        <span className="font-bold text-destructive">-{fmt(order.amountRefundedVnd)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Profile Measurements */}
                <div className="bg-landing-ivory rounded-[2px] sm:rounded-[2px] border border-landing-line p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-landing-line pb-3.5">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-landing-oxblood" />
                      <h3 className="font-display text-[1.05rem] leading-tight text-landing-oxblood">
                        Hồ sơ số đo của khách
                      </h3>
                    </div>
                    <span className="text-[10px] text-landing-muted font-mono uppercase tracking-wider">Hồ sơ cá nhân</span>
                  </div>

                  {isLoadingUserMeasurements ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-landing-muted">
                      <AtelierLoader size="sm" label="Đang may số đo" />
                    </div>
                  ) : !order.userId ? (
                    <div className="p-4 rounded-[2px] bg-landing-paper/50 border border-landing-line text-xs text-landing-muted italic text-center">
                      Đơn hàng không có mã tài khoản khách hàng (khách vãng lai).
                    </div>
                  ) : userMeasurements && Object.values(userMeasurements).some((v) => v !== null && v !== undefined) ? (
                    <div className="space-y-4">
                      {/* Overview group */}
                      <div>
                        <h4 className="text-[11px] font-bold text-landing-muted uppercase tracking-wider mb-2">Chỉ số tổng quan</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 bg-landing-paper/60 rounded-[2px] border border-landing-line flex justify-between items-center text-xs">
                            <span className="text-landing-obsidian">Chiều cao</span>
                            <span className="font-bold text-landing-oxblood font-mono">
                              {userMeasurements.height ? `${userMeasurements.height} cm` : '—'}
                            </span>
                          </div>
                          <div className="p-2.5 bg-landing-paper/60 rounded-[2px] border border-landing-line flex justify-between items-center text-xs">
                            <span className="text-landing-obsidian">Cân nặng</span>
                            <span className="font-bold text-landing-oxblood font-mono">
                              {userMeasurements.weight ? `${userMeasurements.weight} kg` : '—'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Measurements List */}
                      <div>
                        <h4 className="text-[11px] font-bold text-landing-muted uppercase tracking-wider mb-2">Số đo chi tiết</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {allMeasurementFields
                            .filter((f) => f.id !== 'height' && f.id !== 'weight')
                            .map((field) => {
                              const val = userMeasurements[field.id as keyof typeof userMeasurements];
                              if (val === null || val === undefined) return null;
                              return (
                                <div
                                  key={field.id}
                                  className="p-2 bg-landing-paper/60 rounded-[2px] border border-landing-line flex justify-between items-center"
                                >
                                  <span className="text-landing-obsidian truncate">{field.label}:</span>
                                  <span className="font-bold text-landing-oxblood font-mono shrink-0 ml-1">{val} {field.unit}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-landing-paper/50 rounded-[2px] border border-landing-line text-xs text-landing-muted italic">
                      Khách hàng chưa cập nhật số đo nào trong hồ sơ cá nhân.
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Document Signature for Print Preview */}
            <div className="hidden print:grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-landing-taupe text-center text-xs text-landing-obsidian">
              <div>
                <p className="font-bold text-landing-obsidian mb-12">Người lập phiếu</p>
                <p className="border-t border-landing-muted pt-2 w-36 mx-auto">(Ký và ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-bold text-landing-obsidian mb-12">Thợ cắt / Kỹ thuật</p>
                <p className="border-t border-landing-muted pt-2 w-36 mx-auto">(Ký và ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-bold text-landing-obsidian mb-12">Quản lý kiểm tra (QC)</p>
                <p className="border-t border-landing-muted pt-2 w-36 mx-auto">(Ký và ghi rõ họ tên)</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

'use client';

import { AdminGuard } from '@/features/auth/components/AdminGuard';
import { ORDER_STATUS_CFG } from '@/features/admin/constants/admin-dashboard-page';
import { fmt } from '@/features/admin/services/format';
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
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  Receipt,
  RefreshCw,
  Scissors,
  ShieldCheck,
  Truck,
  User,
  UserCheck,
  XCircle,
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
  const createShipmentAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      createShipmentAbortRef.current?.abort();
    };
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
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-navy" />
            <p className="text-body-sm text-neutral-600">Đang tải chi tiết đơn hàng & phiếu may đo...</p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  if (isError || !order) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-neutral-100 p-6 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center max-w-md w-full shadow-sm">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h2 className="text-body-lg font-bold text-neutral-900 mb-1">Không tìm thấy đơn hàng</h2>
            <p className="text-body-sm text-neutral-500 mb-6">Mã đơn hàng không tồn tại hoặc bạn không có quyền truy cập.</p>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white text-xs font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors no-underline"
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
  const statusOptions = [order.status, ...(NEXT_ORDER_STATUSES[order.status] ?? [])];

  const statusCfg = ORDER_STATUS_CFG[order.status] || {
    label: order.status,
    cls: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    icon: FileText,
  };
  const StatusIcon = statusCfg.icon;

  const customerEmail = (order as unknown as { user?: { email?: string } })?.user?.email;
  const rawShipment = order.shipment as (typeof order.shipment & { rawStatus?: string | null }) | undefined;

  return (
    <AdminGuard>
      <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans p-4 md:p-8 print:bg-white print:p-0">
        <div className="max-w-[1400px] mx-auto space-y-6">

          {/* Top Navigation & Actions Bar (Hidden when printing) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-body-sm font-semibold text-neutral-600 hover:text-brand-navy transition-colors no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Quản lý đơn hàng</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Quick Tailor Status Transitions */}
              {order.status === 'MEASUREMENT_REVIEW' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange('MEASUREMENT_CONFIRMED')}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 text-white text-xs font-bold rounded-xl hover:bg-purple-800 disabled:opacity-50 transition-colors border-0 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Chốt số đo (MEASUREMENT_CONFIRMED)</span>
                </button>
              )}

              {order.status === 'MEASUREMENT_CONFIRMED' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange('TAILORING')}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-700 text-white text-xs font-bold rounded-xl hover:bg-indigo-800 disabled:opacity-50 transition-colors border-0 cursor-pointer shadow-xs"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Bắt đầu may (TAILORING)</span>
                </button>
              )}

              {order.status === 'TAILORING' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange('QUALITY_CHECK')}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-cyan-700 text-white text-xs font-bold rounded-xl hover:bg-cyan-800 disabled:opacity-50 transition-colors border-0 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Chuyển sang QC</span>
                </button>
              )}

              {order.status === 'QUALITY_CHECK' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange('READY_TO_SHIP')}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-700 text-white text-xs font-bold rounded-xl hover:bg-sky-800 disabled:opacity-50 transition-colors border-0 cursor-pointer shadow-xs"
                >
                  <Package className="w-4 h-4" />
                  <span>Sẵn sàng giao (READY_TO_SHIP)</span>
                </button>
              )}

              {/* Create GHN Shipment Quick Button */}
              {canCreateShipment && (
                <button
                  type="button"
                  onClick={onCreateShipment}
                  disabled={creatingShipment}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-navy text-white text-xs font-bold rounded-xl hover:bg-brand-navy/90 disabled:opacity-50 transition-colors border-0 cursor-pointer shadow-xs"
                >
                  {creatingShipment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                  <span>{creatingShipment ? 'Đang tạo...' : 'Tạo vận đơn GHN'}</span>
                </button>
              )}

              {/* Status Transition Selector */}
              <div className="flex items-center gap-2 bg-white border border-neutral-300 rounded-xl px-3 py-1.5 shadow-2xs">
                <span className="text-xs font-medium text-neutral-500 hidden sm:inline">Trạng thái:</span>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value as BackendOrderStatus)}
                  disabled={updatingStatus}
                  className="text-xs font-bold text-neutral-800 bg-transparent border-0 focus:outline-none cursor-pointer"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {ORDER_STATUS_OPTIONS[st] || st}
                    </option>
                  ))}
                </select>
                {updatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-navy" />}
              </div>

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-brand-navy border border-neutral-300 rounded-xl text-xs font-bold hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
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
              <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-body-md font-bold text-amber-900">Xác nhận thanh toán thủ công</h3>
                    <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
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
                    className="px-3.5 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:border-amber-600 min-w-[260px]"
                  />
                  <button
                    type="button"
                    onClick={onConfirmManualPayment}
                    disabled={submittingPayment}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 border-0 cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    {submittingPayment ? 'Đang xác nhận...' : 'Xác nhận đã nhận tiền'}
                  </button>
                </div>
              </div>
            )}

            {/* Refund Required Banner */}
            {refundRequired && (
              <div className="bg-rose-50 border border-rose-300/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-700">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-body-md font-bold text-rose-900">Cần hoàn tiền cho khách</h3>
                    <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
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
                    className="px-3.5 py-2 text-xs bg-white border border-rose-300 rounded-xl focus:outline-none focus:border-rose-600 min-w-[260px]"
                  />
                  <button
                    type="button"
                    onClick={onConfirmRefund}
                    disabled={submittingRefund}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 border-0 cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    {submittingRefund ? 'Đang xác nhận...' : 'Xác nhận đã hoàn tiền'}
                  </button>
                </div>
              </div>
            )}

            {/* Refund Completed Notification */}
            {refundCompleted && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">Đã hoàn tiền cho khách thành công cho đơn hàng này.</span>
                {order.refundEvidence && <span className="text-emerald-700 italic">({order.refundEvidence})</span>}
              </div>
            )}
          </div>

          {/* Main Paper / Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 md:p-8 print:border-none print:shadow-none print:p-0">

            {/* Document Header */}
            <div className="border-b border-neutral-200 pb-6 mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#5D1C34] mb-1">
                  <Scissors className="w-4 h-4" />
                  <span>FashionAI Atelier • Chi tiết đơn hàng & Phiếu may đo</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  Đơn Hàng #{order.orderCode}
                </h1>
                <p className="text-xs text-neutral-500 font-mono mt-1">Mã hệ thống: {order.id}</p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusCfg.cls}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusCfg.label}</span>
                  </span>

                  {order.paymentStatus && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.paymentStatus === 'FAILED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <span>TT: {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : order.paymentStatus === 'PENDING' ? 'Chờ thanh toán' : order.paymentStatus}</span>
                    </span>
                  )}
                </div>

                <span className="text-xs text-neutral-500">
                  Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Customer, Delivery & Shipping Information Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200 mb-8">
              {/* Customer */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-brand-navy" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Khách hàng</p>
                  <p className="text-body-sm font-bold text-neutral-900 truncate">{order.shippingInfo?.name || 'Khách vãng lai'}</p>
                  {customerEmail && (
                    <p className="text-xs text-neutral-600 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span>{customerEmail}</span>
                    </p>
                  )}
                  {order.userId && <p className="text-[11px] text-neutral-400 font-mono mt-0.5">User ID: {order.userId}</p>}
                </div>
              </div>

              {/* Delivery Address & Contact */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-brand-navy" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Liên hệ & Giao nhận</p>
                  <p className="text-body-sm font-semibold text-neutral-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{order.shippingInfo?.phone || '—'}</span>
                  </p>
                  <p className="text-xs text-neutral-600 line-clamp-2 mt-0.5">{order.shippingInfo?.address || '—'}</p>
                  {(order.shippingInfo?.notes || order.shippingInfo?.note) && (
                    <p className="text-[11px] text-neutral-500 italic mt-1">
                      Ghi chú: {order.shippingInfo?.notes || order.shippingInfo?.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Shipment Tracking / GHN */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-brand-navy" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Vận chuyển GHN</p>
                  {order.shipment ? (
                    <div className="mt-0.5 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-xs text-brand-navy">
                          {order.shipment.providerOrderCode || 'Chưa có mã'}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700 font-medium">
                          {order.shipment.provider}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600">
                        Trạng thái: <strong className="text-neutral-800">{order.shipment.status}</strong>
                        {rawShipment?.rawStatus ? ` (${rawShipment.rawStatus})` : ''}
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
                      {canCreateShipment ? (
                        <button
                          type="button"
                          onClick={onCreateShipment}
                          disabled={creatingShipment}
                          className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-brand-navy text-white text-xs font-bold rounded-lg hover:bg-brand-navy/90 disabled:opacity-50 transition-colors border-0 cursor-pointer shadow-2xs"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{creatingShipment ? 'Đang tạo...' : 'Tạo vận đơn ngay'}</span>
                        </button>
                      ) : (
                        <p className="text-[11px] text-neutral-400 mt-1">
                          (Cần trạng thái Sẵn sàng giao & Đã thanh toán)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Layout: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* LEFT: Order Items & Tailor Garment Measurements (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-purple-700" />
                    <h2 className="text-lg font-bold text-neutral-900">
                      Sản phẩm & Thông số may đo ({order.items?.length || 0} món)
                    </h2>
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">Bảng kỹ thuật may</span>
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
                        <div key={itemId} className="rounded-2xl border border-neutral-200 overflow-hidden bg-white shadow-2xs">
                          {/* Item Card Header */}
                          <div className="p-4 bg-neutral-50/80 border-b border-neutral-200 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <Image
                                src={img}
                                alt={name}
                                width={56}
                                height={64}
                                className="w-14 h-16 object-cover rounded-xl bg-neutral-200 shrink-0 border border-neutral-200"
                              />
                              <div className="min-w-0">
                                <h3 className="text-body-md font-bold text-neutral-900 truncate">{name}</h3>
                                {item.productSkuSnapshot && (
                                  <p className="text-[11px] text-neutral-400 font-mono">SKU: {item.productSkuSnapshot}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-neutral-500 mt-1">
                                  <span>Màu: <strong className="text-neutral-800">{item.color || 'Mặc định'}</strong></span>
                                  <span>•</span>
                                  <span>Vải: <strong className="text-neutral-800">{item.fabricSnapshot || 'Tiêu chuẩn'}</strong></span>
                                  <span>•</span>
                                  <span>SL: <strong className="text-brand-navy font-bold">{item.quantity}</strong></span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-body-sm font-bold text-brand-navy">{fmt(itemLineTotal)}</span>
                              {item.quantity > 1 && (
                                <p className="text-[11px] text-neutral-400">({fmt(itemUnitPrice)}/cái)</p>
                              )}
                            </div>
                          </div>

                          {/* Garment Measurements Display (Backend-filtered by garment type) */}
                          <div className="p-5">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-xs font-bold text-purple-950 uppercase tracking-wide flex items-center gap-1.5">
                                <Scissors className="w-3.5 h-3.5 text-purple-700" />
                                Số đo may đo thành phẩm (measurementDisplay):
                              </span>
                              {item.measurementDisplay && item.measurementDisplay.length > 0 && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                                  {item.measurementDisplay.length} thông số
                                </span>
                              )}
                            </div>

                            {item.measurementDisplay && item.measurementDisplay.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {item.measurementDisplay.map((m) => (
                                  <div
                                    key={m.field}
                                    className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex flex-col justify-between"
                                  >
                                    <span className="text-[11.5px] font-medium text-neutral-600 mb-1">{m.label}</span>
                                    <span className="text-base font-extrabold text-purple-950 font-mono tracking-tight">
                                      {m.value} <span className="text-xs font-normal text-purple-700">{m.unit}</span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : item.measurementDisplay && item.measurementDisplay.length === 0 ? (
                              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>Chưa đủ dữ liệu số đo bắt buộc cho loại trang phục này. Thợ may cần yêu cầu khách bổ sung số đo.</span>
                              </div>
                            ) : (
                              <p className="text-xs text-neutral-400 italic">Không có thông số may đo cho sản phẩm này.</p>
                            )}

                            {/* Raw 16-field snapshot accordion for cross-referencing */}
                            {item.measurementSnapshot && Object.keys(item.measurementSnapshot).length > 0 && (
                              <div className="mt-4 pt-4 border-t border-neutral-100">
                                <button
                                  type="button"
                                  onClick={() => toggleSnapshot(itemId)}
                                  className="w-full flex items-center justify-between text-xs font-semibold text-neutral-600 hover:text-brand-navy py-1 bg-transparent border-0 cursor-pointer"
                                >
                                  <span>Đối chiếu bảng 16 số đo thô ban đầu (measurementSnapshot)</span>
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {isExpanded && (
                                  <div className="mt-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    {Object.entries(item.measurementSnapshot).map(([key, val]) => {
                                      if (val === null || val === undefined || val === '') return null;
                                      return (
                                        <div key={key} className="bg-white p-2 rounded-lg border border-neutral-200 flex flex-col">
                                          <span className="text-[10.5px] text-neutral-500 font-mono truncate">{key}</span>
                                          <span className="font-bold text-neutral-900 font-mono mt-0.5">{String(val)} cm</span>
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
                  <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 text-neutral-400 text-body-sm">
                    Đơn hàng không có sản phẩm nào.
                  </div>
                )}
              </div>

              {/* RIGHT: Financial Breakdown, History & Customer Profile (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">

                {/* Payment & Financial Breakdown Card */}
                <div className="rounded-2xl border border-neutral-200 p-5 bg-white shadow-2xs">
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 mb-4">
                    <Receipt className="w-4 h-4 text-brand-navy" />
                    <h3 className="text-body-md font-bold text-neutral-900">Thanh toán & Chi phí</h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Phương thức:</span>
                      <span className="font-semibold text-neutral-800">{order.paymentMethod || '—'}</span>
                    </div>

                    {order.paymentProvider && (
                      <div className="flex justify-between text-neutral-600">
                        <span>Cổng thanh toán:</span>
                        <span className="font-semibold text-neutral-800">{order.paymentProvider}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-neutral-600">
                      <span>Trạng thái thanh toán:</span>
                      <span className="font-semibold text-neutral-800">{order.paymentStatus || '—'}</span>
                    </div>

                    {order.itemsSubtotalVnd !== undefined ? (
                      <div className="flex justify-between text-neutral-600">
                        <span>Tiền hàng:</span>
                        <span className="text-neutral-800">{fmt(order.itemsSubtotalVnd)}</span>
                      </div>
                    ) : order.itemsTotal ? (
                      <div className="flex justify-between text-neutral-600">
                        <span>Tiền hàng:</span>
                        <span className="text-neutral-800">{fmt(order.itemsTotal)}</span>
                      </div>
                    ) : null}

                    {order.shippingFeeVnd !== undefined ? (
                      <div className="flex justify-between text-neutral-600">
                        <span>Phí vận chuyển:</span>
                        <span className="text-neutral-800">{fmt(order.shippingFeeVnd)}</span>
                      </div>
                    ) : order.shippingFee ? (
                      <div className="flex justify-between text-neutral-600">
                        <span>Phí vận chuyển:</span>
                        <span className="text-neutral-800">{fmt(order.shippingFee)}</span>
                      </div>
                    ) : null}

                    {((order.discountVnd && order.discountVnd > 0) || (order.discountAmount && order.discountAmount > 0)) && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Giảm giá{(order as unknown as { couponCode?: string })?.couponCode ? ` (${(order as unknown as { couponCode?: string }).couponCode})` : ''}:</span>
                        <span>-{fmt(order.discountVnd ?? order.discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-body-md font-bold text-brand-navy pt-2.5 border-t border-neutral-200">
                      <span>Tổng tiền đơn:</span>
                      <span>{fmt(order.totalVnd ?? order.totalAmount)}</span>
                    </div>

                    {order.amountPaidVnd !== undefined && (
                      <div className="flex justify-between text-xs text-neutral-600 pt-1">
                        <span>Đã thu khách:</span>
                        <span className="font-semibold text-emerald-700">{fmt(order.amountPaidVnd)}</span>
                      </div>
                    )}

                    {order.amountRefundedVnd !== undefined && order.amountRefundedVnd > 0 && (
                      <div className="flex justify-between text-xs text-neutral-600">
                        <span>Đã hoàn lại:</span>
                        <span className="font-semibold text-red-600">-{fmt(order.amountRefundedVnd)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Transactions List */}
                {order.payments && order.payments.length > 0 && (
                  <div className="rounded-2xl border border-neutral-200 p-5 bg-white shadow-2xs">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-brand-navy" />
                        <h3 className="text-body-md font-bold text-neutral-900">Lịch sử giao dịch thanh toán</h3>
                      </div>
                      <span className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium">
                        {order.payments.length} GD
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {order.payments.map((p, idx) => (
                        <div key={p.id || idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neutral-900 uppercase px-2 py-0.5 bg-neutral-200 rounded text-[10px]">
                                {p.provider || 'SEPAY'}
                              </span>
                              {p.transactionId && (
                                <span className="font-mono text-neutral-500 text-[11px]">
                                  {p.transactionId}
                                </span>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'FAILED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                            }`}>
                              {p.status || 'PENDING'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-neutral-500 text-[11px]">
                              {p.createdAt ? new Date(p.createdAt).toLocaleString('vi-VN') : '—'}
                            </span>
                            <span className="font-bold text-brand-navy text-xs">
                              {p.amountVnd !== undefined ? fmt(p.amountVnd) : '—'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Refund History List */}
                {order.refunds && order.refunds.length > 0 && (
                  <div className="rounded-2xl border border-amber-200 p-5 bg-amber-50/40 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-amber-200/60 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-amber-800" />
                        <h3 className="text-body-md font-bold text-amber-900">Lịch sử hoàn tiền</h3>
                      </div>
                      <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                        {order.refunds.length} lượt
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {order.refunds.map((r, idx) => (
                        <div key={r.id || idx} className="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-red-600 text-xs">
                              -{fmt(r.amountVnd)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'FAILED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                            }`}>
                              {r.status}
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
                        </div>
                      ))}
                    </div>

                    {order.refundEvidence && (
                      <div className="mt-3 text-xs text-amber-900 bg-amber-100/70 p-2.5 rounded-xl border border-amber-200">
                        <strong>Bằng chứng hoàn tiền:</strong> {order.refundEvidence}
                      </div>
                    )}
                  </div>
                )}

                {/* Customer Profile Measurements */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-brand-navy" />
                      <h3 className="text-body-md font-bold text-neutral-900">
                        Hồ sơ số đo của khách
                      </h3>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">Hồ sơ cá nhân</span>
                  </div>

                  {isLoadingUserMeasurements ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-neutral-500">
                      <Loader2 className="w-5 h-5 animate-spin text-brand-navy" />
                      <span>Đang tải hồ sơ số đo khách hàng...</span>
                    </div>
                  ) : !order.userId ? (
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-500 italic text-center">
                      Đơn hàng không có mã tài khoản khách hàng (khách vãng lai).
                    </div>
                  ) : userMeasurements && Object.values(userMeasurements).some((v) => v !== null && v !== undefined) ? (
                    <div className="space-y-4">
                      {/* Overview group */}
                      <div>
                        <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Chỉ số tổng quan</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 flex justify-between items-center text-xs">
                            <span className="text-neutral-600">Chiều cao</span>
                            <span className="font-bold text-brand-navy font-mono">
                              {userMeasurements.height ? `${userMeasurements.height} cm` : '—'}
                            </span>
                          </div>
                          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 flex justify-between items-center text-xs">
                            <span className="text-neutral-600">Cân nặng</span>
                            <span className="font-bold text-brand-navy font-mono">
                              {userMeasurements.weight ? `${userMeasurements.weight} kg` : '—'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Measurements List */}
                      <div>
                        <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Số đo chi tiết</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {allMeasurementFields
                            .filter((f) => f.id !== 'height' && f.id !== 'weight')
                            .map((field) => {
                              const val = userMeasurements[field.id as keyof typeof userMeasurements];
                              if (val === null || val === undefined) return null;
                              return (
                                <div
                                  key={field.id}
                                  className="p-2 bg-neutral-50 rounded-lg border border-neutral-200 flex justify-between items-center"
                                >
                                  <span className="text-neutral-600">{field.label}:</span>
                                  <span className="font-bold text-neutral-900 font-mono">{val} {field.unit}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-500 italic">
                      Khách hàng chưa cập nhật số đo nào trong hồ sơ cá nhân.
                    </div>
                  )}
                </div>

                {/* Tailor Work Notes Callout */}
                <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-5 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Lưu ý dành cho xưởng may</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-amber-800 leading-relaxed">
                    <li>Ưu tiên may theo các thông số trong bảng <strong>measurementDisplay</strong> của từng món.</li>
                    <li>Nếu cần đối chiếu thêm chiều dài phụ hoặc độ cử động, xem bảng 16 số đo thô hoặc hồ sơ cá nhân.</li>
                    <li>Sau khi cắt và hoàn tất rập may, hãy chuyển trạng thái sang <strong>Đang may (TAILORING)</strong>.</li>
                  </ul>
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

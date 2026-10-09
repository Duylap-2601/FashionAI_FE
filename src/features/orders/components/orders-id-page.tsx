'use client';

import { STATUS_MAP, TAILORING_STEPS } from '@/features/orders/constants/orders-id-page';
import { useCart } from '@/features/cart/store/cartStore';
import { useCancelOrder, useConfirmDelivery, useOrder } from '@/features/orders/hooks/useOrders';
import { OrderIssuesList } from '@/features/orders/components/order-issues-list';
import { ReportIssueModal } from '@/features/orders/components/report-issue-modal';
import type { OrderItem } from '@/features/orders/types/orders';
import {
  AlertTriangle,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Phone,
  Scissors,
  ShoppingBag,
  Truck,
  User
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const ISSUE_HISTORY_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  ORDER_ISSUE_REJECTED: {
    label: 'Yêu cầu báo lỗi bị từ chối',
    badgeClass: 'text-red-600 font-semibold',
  },
  ORDER_ISSUE_REFUND_APPROVED: {
    label: 'Admin duyệt hoàn tiền cho báo lỗi',
    badgeClass: 'text-emerald-700 font-semibold',
  },
  ORDER_ISSUE_EXCHANGE_APPROVED: {
    label: 'Admin duyệt đổi hàng 1-1 (Đang xử lý)',
    badgeClass: 'text-blue-700 font-semibold',
  },
  ORDER_ISSUE_EXCHANGE_RESOLVED: {
    label: 'Đổi hàng 1-1 đã hoàn tất',
    badgeClass: 'text-emerald-700 font-semibold',
  },
};

function getStatusBadgeStyle(status?: string) {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
    case 'DELIVERED':
      return 'bg-emerald-500/10 text-emerald-800 ring-1 ring-emerald-600/25';
    case 'READY_TO_SHIP':
    case 'SHIPPING':
      return 'bg-sky-500/10 text-sky-800 ring-1 ring-sky-600/25';
    case 'CONFIRMED':
    case 'PROCESSING':
    case 'TAILORING':
    case 'QUALITY_CHECK':
    case 'MEASUREMENT_CONFIRMED':
      return 'bg-brand-navy/10 text-brand-navy ring-1 ring-brand-navy/20';
    case 'CREATED':
    case 'PENDING':
    case 'MEASUREMENT_REVIEW':
      return 'bg-amber-500/10 text-amber-800 ring-1 ring-amber-600/25';
    case 'CANCELLED':
    case 'FAILED':
    case 'EXPIRED':
      return 'bg-red-500/10 text-red-700 ring-1 ring-red-600/25';
    case 'RETURNED':
      return 'bg-neutral-500/10 text-neutral-700 ring-1 ring-neutral-500/20';
    default:
      return 'bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200';
  }
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { order, isLoading, isError, refetch } = useOrder(id);
  const { cancelOrder, isCancelling } = useCancelOrder();
  const { confirmDelivery, isConfirmingDelivery } = useConfirmDelivery();
  const { addToCart, setIsCartOpen } = useCart();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [reportingItem, setReportingItem] = useState<OrderItem | null>(null);

  const statusInfo = STATUS_MAP[order?.status || 'CREATED'] || STATUS_MAP.CREATED;

  const isCompleted = order?.status?.toUpperCase() === 'COMPLETED';
  const completedEvent = order?.history
    ?.filter((e) => e.toStatus === 'COMPLETED' || e.type === 'COMPLETED' || e.type?.includes('COMPLETED'))
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];
  const completedAt = completedEvent?.occurredAt || order?.updatedAt || order?.createdAt;
  const isExpired = completedAt
    ? (Date.now() - new Date(completedAt).getTime()) > 7 * 24 * 60 * 60 * 1000
    : false;
  const canReportIssue = isCompleted && !isExpired;

  const handleCancel = () => {
    if (!order?.id) return;
    cancelOrder(order.id, {
      onSuccess: () => {
        toast.success('Đã hủy đơn hàng thành công');
        setShowCancelConfirm(false);
        refetch();
      },
      onError: () => {
        toast.error('Không thể hủy đơn hàng lúc này.');
      }
    });
  };

  const handleConfirmDelivery = () => {
    if (!order?.id) return;
    confirmDelivery({ id: order.id }, {
      onSuccess: () => {
        toast.success('Cảm ơn bạn đã xác nhận nhận hàng');
        refetch();
      },
      onError: () => {
        toast.error('Không thể xác nhận nhận hàng lúc này.');
      },
    });
  };

  const handleReorder = () => {
    if (!order?.items || order.items.length === 0) return;
    order.items.forEach(item => {
      addToCart({
        productId: item.productId,
        name: item.product?.name || 'Trang phục FashionAI',
        price: item.price,
        quantity: item.quantity,
        color: item.color || 'Mặc định',
        image: item.product?.images?.[0] || '/images/726470431_1311184104081177_6052756217829444481_n.png',
        variant: `Màu: ${item.color || 'Mặc định'} · May đo`
      });
    });
    toast.success('Đã thêm các sản phẩm vào giỏ hàng!');
    setIsCartOpen(true);
  };

  if (isLoading) {
    return (
      <div className="bg-brand-cream min-h-screen py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
          <p className="text-body-sm font-medium text-neutral-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="bg-brand-cream min-h-screen py-16 px-4">
        <div className="max-w-[560px] mx-auto bg-white p-8 rounded-3xl border border-[#E5DFD5] text-center shadow-sm">
          <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-[20px] font-bold text-brand-navy mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-neutral-500 mb-6">Mã đơn hàng &quot;#{id}&quot; không tồn tại hoặc đã bị xóa.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/profile/orders" className="px-6 py-2.5 bg-neutral-100 text-brand-navy font-semibold rounded-full hover:bg-neutral-200 transition-colors">
              Xem đơn của tôi
            </Link>
            <Link href="/products" className="px-6 py-2.5 bg-brand-navy text-white font-semibold rounded-full hover:bg-brand-navy/90 transition-colors">
              Mua sắm ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderCode = `ORD-${order.orderCode}`;
  const steps = order.fulfillmentFlowVersion === 1 ? TAILORING_STEPS : ['Đặt hàng', 'Xác nhận', 'Đang giao', 'Đã nhận'];
  const maxStep = Math.max(1, steps.length - 1);
  const paymentLabel = order.paymentStatus === 'PAID'
    ? 'Đã thanh toán'
    : order.paymentStatus === 'FAILED'
      ? 'Thanh toán thất bại'
      : order.paymentStatus === 'REFUNDED'
        ? 'Đã hoàn tiền'
        : 'Chờ thanh toán';

  return (
    <div className="bg-brand-cream min-h-screen py-8 pb-24">
      <div className="max-w-[1060px] w-full mx-auto px-4 sm:px-6 md:px-8">

        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-label-sm font-medium">
          <Link href="/profile/orders" className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-brand-navy transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Đơn hàng của tôi</span>
          </Link>
          <span className="text-[#8B8880]/50">/</span>
          <span className="font-mono text-[13px] font-semibold text-brand-navy tracking-wide">#{orderCode}</span>
        </div>

        {/* Header summary & Stepper Card */}
        <div className="bg-white border border-[#E5DFD5] rounded-3xl p-6 sm:p-8 md:p-9 mb-6 shadow-[0_4px_24px_rgba(93,28,52,0.03)] relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-[#E5DFD5]/80">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl sm:text-[26px] font-bold text-brand-navy tracking-tight">
                  Đơn hàng #{orderCode}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold tracking-wide ${getStatusBadgeStyle(order.status)}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {order.displayStatus?.label ?? statusInfo.label}
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-[13px] text-[#8B8880]">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              {order.allowedActions?.cancel && (
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-body-sm font-medium rounded-full transition-colors cursor-pointer"
                >
                  Hủy đơn hàng
                </button>
              )}
              {order.allowedActions?.confirmDelivery && (
                <button
                  type="button"
                  onClick={handleConfirmDelivery}
                  disabled={isConfirmingDelivery}
                  className="px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 text-body-sm font-semibold rounded-full transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] shadow-sm"
                >
                  {isConfirmingDelivery ? 'Đang xác nhận...' : 'Tôi đã nhận hàng'}
                </button>
              )}
              {canReportIssue && (
                <button
                  type="button"
                  onClick={() => {
                    if (order.items && order.items.length === 1) {
                      setReportingItem(order.items[0]);
                    } else {
                      document.getElementById('order-items')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-amber-600/25 bg-amber-50/70 hover:bg-amber-100/80 text-amber-900 text-body-sm font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-2xs"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Báo lỗi sản phẩm</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleReorder}
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-brand-navy hover:bg-brand-navy/92 text-white text-body-sm font-semibold rounded-full transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-[0_4px_14px_rgba(93,28,52,0.18)]"
              >
                <ShoppingBag className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                <span>Mua lại đơn này</span>
              </button>
            </div>
          </div>

          {/* Tracking Step Progress (Zero horizontal scrollbar, bounded connecting rail) */}
          {statusInfo.step >= 0 && (
            <div className="pt-8">
              <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
                {/* Connecting Rail Track: perfectly links centers of first step (12.5%) and last step (87.5%) */}
                <div className="absolute top-4 sm:top-5 left-[12.5%] right-[12.5%] h-[2px] bg-[#E5DFD5] -z-0 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-navy transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, (statusInfo.step / maxStep) * 100))}%` }}
                  />
                </div>

                <div className="grid grid-cols-4 relative z-10">
                  {steps.map((label, idx) => {
                    const isPassed = idx <= statusInfo.step;
                    const isCurrent = idx === statusInfo.step;
                    return (
                      <div key={label} className="flex flex-col items-center gap-2.5 text-center">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-[12px] sm:text-[13px] transition-all duration-300 ${
                            isPassed
                              ? 'bg-brand-navy text-white ring-4 ring-white shadow-xs'
                              : 'bg-white border border-[#E5DFD5] text-[#8B8880] ring-4 ring-white'
                          } ${isCurrent ? 'ring-brand-navy/20 ring-4' : ''}`}
                        >
                          {isPassed ? (
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        <span
                          className={`text-[11px] sm:text-[12px] md:text-[13px] leading-tight transition-colors ${
                            isCurrent
                              ? 'text-brand-navy font-bold'
                              : isPassed
                                ? 'text-neutral-800 font-medium'
                                : 'text-neutral-400 font-normal'
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {statusInfo.desc && (
                <div className="text-center mt-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F9F7F5] border border-[#E5DFD5] text-[12px] sm:text-[13px] text-neutral-700 font-medium shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    {statusInfo.desc}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Intelligence Ribbon */}
        <div className="bg-white border border-[#E5DFD5] rounded-2xl sm:rounded-3xl p-2 sm:p-3 mb-6 shadow-[0_2px_16px_rgba(93,28,52,0.03)]">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5DFD5]">

            {/* Payment Summary */}
            <div className="p-4 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-cream border border-[#E5DFD5]/80 flex items-center justify-center text-brand-navy shrink-0 shadow-2xs">
                <CreditCard className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B8880]">Thanh toán</p>
                <p className="mt-0.5 text-[15px] font-bold text-brand-navy leading-snug">{paymentLabel}</p>
                <p className="text-[12px] text-neutral-500 truncate mt-0.5">
                  {order.paymentMethod === 'BANK_TRANSFER' || order.paymentMethod === 'BANK' || order.paymentMethod === 'Bank' ? 'Chuyển khoản trực tuyến' : order.paymentMethod || 'Chưa xác định'}
                </p>
              </div>
            </div>

            {/* Shipment Summary */}
            <div className="p-4 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-cream border border-[#E5DFD5]/80 flex items-center justify-center text-brand-navy shrink-0 shadow-2xs">
                <Truck className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B8880]">Vận chuyển</p>
                <p className="mt-0.5 text-[15px] font-bold text-brand-navy leading-snug truncate">
                  {order.displayStatus?.source !== 'ORDER' ? order.displayStatus?.label : order.currentShipment?.status || 'Chưa tạo vận đơn'}
                </p>
                <p className="text-[12px] text-neutral-500 truncate mt-0.5">
                  {order.currentShipment?.providerOrderCode ? `Mã vận đơn: ${order.currentShipment.providerOrderCode}` : 'Chờ bàn giao hãng vận chuyển'}
                </p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="p-4 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-cream border border-[#E5DFD5]/80 flex items-center justify-center text-brand-navy shrink-0 shadow-2xs">
                <Clock className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B8880]">Cập nhật lần cuối</p>
                <p className="mt-0.5 text-[15px] font-bold text-brand-navy leading-snug">
                  {order.updatedAt ? new Date(order.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                </p>
                <p className="text-[12px] text-neutral-500 truncate mt-0.5">
                  {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chưa có dữ liệu'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

          {/* LEFT COLUMN: Products List & Order Issues */}
          <div className="flex flex-col gap-6">

            {/* Products Card */}
            <div id="order-items" className="bg-white border border-[#E5DFD5] rounded-2xl sm:rounded-3xl p-6 md:p-8 shadow-[0_2px_16px_rgba(93,28,52,0.03)] flex flex-col gap-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD5]">
                <h3 className="text-[18px] font-bold text-brand-navy">
                  Sản phẩm trong đơn
                </h3>
                <span className="px-2.5 py-1 rounded-full bg-brand-cream border border-[#E5DFD5] text-[12px] font-semibold text-brand-navy">
                  {order.items.reduce((acc, i) => acc + i.quantity, 0)} sản phẩm
                </span>
              </div>

              <div className="flex flex-col divide-y divide-[#E5DFD5]/70">
                {order.items.map((item, index) => {
                  const rawImg = item.productImageSnapshot || item.product?.images?.[0];
                  const img = (typeof rawImg === 'object' && rawImg !== null ? (rawImg as { url?: string; imageUrl?: string }).url || (rawImg as { url?: string; imageUrl?: string }).imageUrl : rawImg) || '/images/726470431_1311184104081177_6052756217829444481_n.png';
                  const name = item.productNameSnapshot || item.product?.name || `Trang phục #${item.productId}`;
                  const itemUnitPrice = item.unitPriceVnd ?? item.price;
                  const itemLineTotal = item.lineTotalVnd ?? (item.price * item.quantity);

                  return (
                    <div key={item.id || index} className="py-5 flex gap-4 items-start sm:items-center">
                      <Image
                        src={img}
                        alt={name}
                        width={72}
                        height={90}
                        className="w-18 h-22 sm:w-20 sm:h-24 object-cover rounded-xl bg-brand-cream border border-[#E5DFD5] shrink-0 shadow-2xs"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/726470431_1311184104081177_6052756217829444481_n.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.productId}`} className="text-body-md font-bold text-brand-navy hover:text-brand-navy/80 transition-colors line-clamp-1">
                          {name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[12px] text-neutral-600">
                          {item.productSkuSnapshot && (
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                              SKU: {item.productSkuSnapshot}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded bg-brand-cream border border-[#E5DFD5]/70 text-neutral-700">
                            Màu: <strong className="font-semibold text-brand-navy">{item.color || 'Mặc định'}</strong>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-brand-cream border border-[#E5DFD5]/70 text-neutral-700">
                            Vải: <strong className="font-semibold text-brand-navy">{item.fabricSnapshot || 'Theo sản phẩm'}</strong>
                          </span>
                        </div>
                        {item.measurementDisplay && item.measurementDisplay.length > 0 ? (
                          <div className="mt-2.5 p-3 bg-brand-cream/60 rounded-xl border border-[#E5DFD5]/80 text-[12px] text-neutral-700">
                            <div className="flex items-center gap-1.5 font-semibold text-brand-navy mb-1.5 text-[11px] uppercase tracking-wider">
                              <Scissors className="w-3.5 h-3.5 text-brand-navy/70" />
                              <span>Số đo may riêng</span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                              {item.measurementDisplay.map((m) => (
                                <span key={m.field} className="text-neutral-600">
                                  {m.label}: <strong className="text-brand-navy font-semibold">{m.value}{m.unit}</strong>
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : item.measurementDisplay && item.measurementDisplay.length === 0 ? (
                          <div className="mt-2.5 p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/60 text-[11px] text-amber-800">
                            Chưa đủ dữ liệu số đo bắt buộc cho món này
                          </div>
                        ) : item.measurementSnapshot && Object.keys(item.measurementSnapshot).length > 0 ? (
                          <div className="mt-2.5 p-3 bg-brand-cream/60 rounded-xl border border-[#E5DFD5]/80 text-[12px] text-neutral-700">
                            <div className="flex items-center gap-1.5 font-semibold text-brand-navy mb-1.5 text-[11px] uppercase tracking-wider">
                              <Scissors className="w-3.5 h-3.5 text-brand-navy/70" />
                              <span>Số đo đã chốt</span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                              {item.measurementSnapshot.chest && <span>Ngực: <strong className="text-brand-navy font-semibold">{item.measurementSnapshot.chest}cm</strong></span>}
                              {item.measurementSnapshot.waist && <span>Eo: <strong className="text-brand-navy font-semibold">{item.measurementSnapshot.waist}cm</strong></span>}
                              {item.measurementSnapshot.hip && <span>Hông: <strong className="text-brand-navy font-semibold">{item.measurementSnapshot.hip}cm</strong></span>}
                              {item.measurementSnapshot.shoulder && <span>Vai: <strong className="text-brand-navy font-semibold">{item.measurementSnapshot.shoulder}cm</strong></span>}
                              {item.measurementSnapshot.height && <span>Cao: <strong className="text-brand-navy font-semibold">{item.measurementSnapshot.height}cm</strong></span>}
                            </div>
                          </div>
                        ) : null}
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-[#E5DFD5]/70">
                          <div className="text-[13px] text-neutral-600">
                            Số lượng: <strong className="text-brand-navy font-bold">{item.quantity}</strong>
                          </div>
                          {canReportIssue && (
                            <button
                              type="button"
                              onClick={() => setReportingItem(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-600/30 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-[12px] font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-2xs"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Báo lỗi sản phẩm này</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 pt-1 sm:pt-0">
                        <div className="text-body-md font-bold text-brand-navy">
                          {itemLineTotal.toLocaleString('vi-VN')}đ
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            {itemUnitPrice.toLocaleString('vi-VN')}đ / cái
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Left Column: Order Issues List */}
            <OrderIssuesList orderId={order.id} />
          </div>

          {/* RIGHT COLUMN: Customer Info, Payment Summary, History */}
          <div className="flex flex-col gap-6">

            {/* Customer Info Card */}
            <div className="bg-white border border-[#E5DFD5] rounded-2xl sm:rounded-3xl p-6 shadow-[0_2px_16px_rgba(93,28,52,0.03)]">
              <h3 className="text-[16px] font-bold text-brand-navy mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-navy" /> Địa chỉ nhận hàng
              </h3>
              <div className="flex flex-col gap-2.5 text-body-sm">
                <div className="font-bold text-brand-navy flex items-center gap-2">
                  <User className="w-4 h-4 text-[#8B8880]" />
                  {order.shippingInfo?.name || 'Khách hàng'}
                </div>
                <div className="text-neutral-600 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#8B8880]" />
                  {order.shippingInfo?.phone || '—'}
                </div>
                <div className="text-neutral-600 pl-6 text-[13px] leading-relaxed">
                  {order.shippingInfo?.address || '—'}
                </div>
                {order.shippingInfo?.notes && (
                  <div className="mt-2 p-3 bg-brand-cream/70 rounded-xl text-[12px] text-neutral-600 border border-[#E5DFD5]/80">
                    <strong className="text-brand-navy">Ghi chú:</strong> {order.shippingInfo.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white border border-[#E5DFD5] rounded-2xl sm:rounded-3xl p-6 shadow-[0_2px_16px_rgba(93,28,52,0.03)]">
              <h3 className="text-[16px] font-bold text-brand-navy mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-navy" /> Thanh toán
              </h3>

              {order.status === 'CREATED' && order.paymentStatus === 'PENDING' && (
                <div className="bg-brand-navy/5 border border-brand-navy/20 rounded-2xl p-4 mb-4">
                  <p className="text-label-sm text-neutral-600 mb-1">Nội dung chuyển khoản</p>
                  <p className="text-body-lg font-bold text-brand-navy font-mono">FAI{order.orderCode}</p>
                  <p className="text-label-sm text-neutral-600 mt-2">
                    Nếu đã chuyển khoản nhưng đơn chưa cập nhật, vui lòng kiểm tra đã ghi đúng mã này trong nội dung chuyển khoản chưa.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-body-sm py-2.5 border-b border-[#E5DFD5]/70">
                <span className="text-neutral-500">Hình thức</span>
                <span className="font-semibold text-brand-navy">
                  {order.paymentMethod === 'BANK_TRANSFER' || order.paymentMethod === 'BANK' || order.paymentMethod === 'Bank' ? 'Chuyển khoản trực tuyến' : order.paymentMethod}
                </span>
              </div>

              <div className="flex items-center justify-between text-body-sm py-2.5 border-b border-[#E5DFD5]/70">
                <span className="text-neutral-500">Tạm tính</span>
                <span className="text-neutral-800 font-medium">{(order.itemsSubtotalVnd ?? order.itemsTotal).toLocaleString('vi-VN')}đ</span>
              </div>

              <div className="flex items-center justify-between text-body-sm py-2.5 border-b border-[#E5DFD5]/70">
                <span className="text-neutral-500">Phí vận chuyển</span>
                <span className="text-neutral-800 font-medium">{(order.shippingFeeVnd ?? order.shippingFee).toLocaleString('vi-VN')}đ</span>
              </div>

              {((order.discountVnd !== undefined && order.discountVnd > 0) || (order.discountAmount > 0)) && (
                <div className="flex items-center justify-between text-body-sm py-2.5 border-b border-[#E5DFD5]/70">
                  <span className="text-neutral-500">Giảm giá</span>
                  <span className="text-emerald-700 font-semibold">-{(order.discountVnd ?? order.discountAmount).toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-b border-[#E5DFD5] pb-3.5">
                <span className="text-body-md font-bold text-brand-navy">Tổng đơn hàng</span>
                <span className="text-2xl font-bold text-brand-navy tracking-tight">
                  {(order.totalVnd ?? order.totalAmount).toLocaleString('vi-VN')}đ
                </span>
              </div>

              {order.amountPaidVnd !== undefined && (
                <div className="flex items-center justify-between text-body-sm pt-3">
                  <span className="text-neutral-500">Đã thanh toán</span>
                  <span className="font-bold text-emerald-700">
                    {order.amountPaidVnd.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              )}

              {order.amountRefundedVnd !== undefined && order.amountRefundedVnd > 0 && (
                <div className="flex items-center justify-between text-body-sm pt-2.5">
                  <span className="text-neutral-500">Đã hoàn tiền</span>
                  <span className="font-bold text-red-600">
                    -{order.amountRefundedVnd.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              )}
            </div>

            {/* Refunds list if any */}
            {order.refunds && order.refunds.length > 0 && (
              <div className="bg-white border border-amber-200/80 rounded-2xl sm:rounded-3xl p-6 shadow-[0_2px_16px_rgba(93,28,52,0.03)]">
                <h3 className="text-[16px] font-bold text-amber-900 mb-3">Lịch sử hoàn tiền</h3>
                <div className="flex flex-col gap-2.5">
                  {order.refunds.map(r => (
                    <div key={r.id} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-red-600">-{r.amountVnd.toLocaleString('vi-VN')}đ</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800">{r.status}</span>
                      </div>
                      {r.reason && <p className="text-neutral-600 mt-1">Lý do: {r.reason}</p>}
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Ngày yêu cầu: {new Date(r.requestedAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Timeline History */}
            <div className="bg-white border border-[#E5DFD5] rounded-2xl sm:rounded-3xl p-6 shadow-[0_2px_16px_rgba(93,28,52,0.03)]">
              <h3 className="text-[16px] font-bold text-brand-navy mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-navy" /> Lịch sử đơn hàng
              </h3>
              {order.history && order.history.length > 0 ? (
                <div className="flex flex-col gap-3.5">
                  {order.history.map(event => {
                    const issueCfg = ISSUE_HISTORY_CONFIG[event.type];
                    const issueId = (event.metadata as { issueId?: string } | undefined)?.issueId;
                    return (
                      <div key={event.id} className="relative pl-4 border-l-2 border-brand-navy/20">
                        <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-brand-navy" />
                        <p className={`text-body-sm font-semibold ${issueCfg ? issueCfg.badgeClass : 'text-brand-navy'}`}>
                          {event.publicMessage || issueCfg?.label || event.toStatus || event.type}
                        </p>
                        <div className="flex items-center justify-between text-[12px] text-neutral-500 mt-0.5">
                          <span>{new Date(event.occurredAt).toLocaleString('vi-VN')}</span>
                          {issueId && (
                            <a href="#order-issues" className="text-brand-navy hover:underline text-[11px] font-semibold">
                              Xem báo lỗi →
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-body-sm text-neutral-500">Chưa có lịch sử chi tiết.</p>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E5DFD5] animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-[18px] font-bold text-brand-navy mb-2">Xác nhận hủy đơn hàng?</h3>
            <p className="text-body-sm text-neutral-600 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn hủy đơn hàng <strong>#{orderCode}</strong> không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="px-5 py-2.5 border border-[#E5DFD5] text-neutral-700 font-semibold rounded-full hover:bg-neutral-50 transition-colors cursor-pointer text-body-sm"
              >
                Giữ đơn
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancel}
                className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer text-body-sm shadow-sm"
              >
                {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={Boolean(reportingItem)}
        onClose={() => setReportingItem(null)}
        orderId={order.id}
        orderItem={reportingItem}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

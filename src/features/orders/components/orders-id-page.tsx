'use client';

import { STATUS_MAP, TAILORING_STEPS } from '@/features/orders/constants/orders-id-page';
import { useCart } from '@/features/cart/store/cartStore';
import { useCancelOrder, useConfirmDelivery, useOrder } from '@/features/orders/hooks/useOrders';
import { OrderIssuesList } from '@/features/orders/components/order-issues-list';
import { ReportIssueModal } from '@/features/orders/components/report-issue-modal';
import type { OrderItem } from '@/features/orders/types/orders';
import {
  AlertTriangle,
  ChevronLeft,
  CreditCard,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
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
        <div className="max-w-[560px] mx-auto bg-white p-8 rounded-2xl border border-neutral-200 text-center shadow-sm">
          <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-[20px] font-bold text-brand-navy mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-neutral-500 mb-6">Mã đơn hàng &quot;#{id}&quot; không tồn tại hoặc đã bị xóa.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/profile/orders" className="px-6 py-2.5 bg-neutral-100 text-brand-navy font-semibold rounded-xl hover:bg-neutral-200 transition-colors">
              Xem đơn của tôi
            </Link>
            <Link href="/products" className="px-6 py-2.5 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors">
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
    <div className="bg-brand-cream min-h-screen py-8 pb-20">
      <div className="max-w-[1024px] w-full mx-auto px-4 md:px-8">

        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-label-sm font-medium">
          <Link href="/profile/orders" className="inline-flex items-center gap-1 text-neutral-500 hover:text-brand-navy transition-colors">
            <ChevronLeft className="w-4 h-4" /> Đơn hàng của tôi
          </Link>
          <span className="text-neutral-400">/</span>
          <span className="text-brand-navy font-bold">#{orderCode}</span>
        </div>

        {/* Header summary */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <h1 className="text-[22px] font-bold text-brand-navy">
                  Đơn hàng #{orderCode}
                </h1>
                <span className={`px-3 py-1 rounded-full text-label-sm font-bold border ${statusInfo.color}`}>
                  {order.displayStatus?.label ?? statusInfo.label}
                </span>
              </div>
              <p className="text-[13px] text-neutral-500">
                Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {order.allowedActions?.cancel && (
                  <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-body-sm font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Hủy đơn hàng
                </button>
              )}
              {order.allowedActions?.confirmDelivery && (
                <button
                  type="button"
                  onClick={handleConfirmDelivery}
                  disabled={isConfirmingDelivery}
                  className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-body-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
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
                  className="px-4 py-2 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-body-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Báo lỗi sản phẩm
                </button>
              )}
              <button
                type="button"
                onClick={handleReorder}
                className="px-5 py-2 bg-brand-navy text-white hover:bg-brand-navy/90 text-body-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" /> Mua lại đơn này
              </button>
            </div>
          </div>

          {/* Tracking Step Progress */}
          {statusInfo.step >= 0 && (
            <div className="pt-6">
              <div className="flex items-start justify-between relative max-w-2xl mx-auto py-2 overflow-x-auto no-scrollbar">
                <div className="absolute top-5 left-8 right-8 h-[3px] bg-neutral-200 -z-0" />
                <div
                  className="absolute top-5 left-8 h-[3px] bg-brand-navy transition-all duration-500 -z-0"
                  style={{ width: `${Math.min(100, Math.max(0, (statusInfo.step / maxStep) * 100))}%` }}
                />
                {steps.map((label, idx) => {
                  const isPassed = idx <= statusInfo.step;
                  const isCurrent = idx === statusInfo.step;
                  return (
                    <div key={label} className="flex flex-col items-center gap-2 z-10 min-w-[82px] sm:min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] transition-all ${isPassed
                        ? 'bg-brand-navy text-white ring-4 ring-white shadow-sm'
                        : 'bg-neutral-200 text-neutral-500'
                        }`}>
                        {isPassed ? '✓' : idx + 1}
                      </div>
                      <span className={`text-[11px] sm:text-[12px] font-medium text-center leading-tight ${isCurrent ? 'text-brand-navy font-bold' : 'text-neutral-500'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-[13px] text-neutral-600 mt-4">
                {statusInfo.desc}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-500">Thanh toán</p>
            <p className="mt-1 text-body-md font-bold text-brand-navy">{paymentLabel}</p>
            <p className="text-[12px] text-neutral-500">{order.paymentMethod || 'Chưa xác định'}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-500">Vận chuyển</p>
            <p className="mt-1 text-body-md font-bold text-brand-navy">{order.displayStatus?.source !== 'ORDER' ? order.displayStatus?.label : order.currentShipment?.status || 'Chưa tạo vận đơn'}</p>
            <p className="text-[12px] text-neutral-500">{order.currentShipment?.providerOrderCode ? `Mã: ${order.currentShipment.providerOrderCode}` : 'Chờ shop bàn giao'}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-500">Cập nhật</p>
            <p className="mt-1 text-body-md font-bold text-brand-navy">{order.updatedAt ? new Date(order.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
            <p className="text-[12px] text-neutral-500">{order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('vi-VN') : 'Chưa có dữ liệu'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* LEFT: Products List */}
          <div id="order-items" className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-[18px] font-bold text-brand-navy pb-3 border-b border-neutral-100">
                Sản phẩm trong đơn ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
              </h3>

            <div className="flex flex-col divide-y divide-neutral-100">
              {order.items.map((item, index) => {
                const rawImg = item.productImageSnapshot || item.product?.images?.[0];
                const img = (typeof rawImg === 'object' && rawImg !== null ? (rawImg as { url?: string; imageUrl?: string }).url || (rawImg as { url?: string; imageUrl?: string }).imageUrl : rawImg) || '/images/726470431_1311184104081177_6052756217829444481_n.png';
                const name = item.productNameSnapshot || item.product?.name || `Trang phục #${item.productId}`;
                const itemUnitPrice = item.unitPriceVnd ?? item.price;
                const itemLineTotal = item.lineTotalVnd ?? (item.price * item.quantity);

                return (
                  <div key={item.id || index} className="py-4 flex gap-4 items-center">
                    <Image
                      src={img}
                      alt={name}
                      width={64}
                      height={80}
                      className="w-16 h-20 object-cover rounded-xl bg-neutral-100 border border-neutral-200 shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/726470431_1311184104081177_6052756217829444481_n.png';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.productId}`} className="text-body-md font-bold text-brand-navy hover:underline line-clamp-1">
                        {name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[13px] text-neutral-500">
                        {item.productSkuSnapshot && (
                          <span className="font-mono text-[11px] text-neutral-400">SKU: {item.productSkuSnapshot} •</span>
                        )}
                        <span>Màu: <strong className="text-neutral-700">{item.color || 'Mặc định'}</strong></span>
                        <span>•</span>
                        <span>Vải: <strong className="text-neutral-700">{item.fabricSnapshot || 'Theo sản phẩm'}</strong></span>
                      </div>
                      {item.measurementDisplay && item.measurementDisplay.length > 0 ? (
                        <div className="mt-2 p-2.5 bg-neutral-50 rounded-lg border border-neutral-100 text-[11px] text-neutral-600 flex flex-wrap gap-x-3 gap-y-1">
                          <span className="font-semibold text-brand-navy">Số đo may:</span>
                          {item.measurementDisplay.map((m) => (
                            <span key={m.field}>
                              {m.label}: <strong className="text-neutral-700">{m.value}{m.unit}</strong>
                            </span>
                          ))}
                        </div>
                      ) : item.measurementDisplay && item.measurementDisplay.length === 0 ? (
                        <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200/60 text-[11px] text-amber-800">
                          Chưa đủ dữ liệu số đo bắt buộc cho món này
                        </div>
                      ) : item.measurementSnapshot && Object.keys(item.measurementSnapshot).length > 0 ? (
                        <div className="mt-2 p-2.5 bg-neutral-50 rounded-lg border border-neutral-100 text-[11px] text-neutral-600 flex flex-wrap gap-x-3 gap-y-1">
                          <span className="font-semibold text-brand-navy">Số đo đã chốt:</span>
                          {item.measurementSnapshot.chest && <span>Ngực: {item.measurementSnapshot.chest}cm</span>}
                          {item.measurementSnapshot.waist && <span>Eo: {item.measurementSnapshot.waist}cm</span>}
                          {item.measurementSnapshot.hip && <span>Hông: {item.measurementSnapshot.hip}cm</span>}
                          {item.measurementSnapshot.shoulder && <span>Vai: {item.measurementSnapshot.shoulder}cm</span>}
                          {item.measurementSnapshot.height && <span>Cao: {item.measurementSnapshot.height}cm</span>}
                        </div>
                      ) : null}
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-neutral-100">
                        <div className="text-[13px] text-neutral-500">
                          Số lượng: <strong className="text-brand-navy">{item.quantity}</strong>
                        </div>
                        {canReportIssue && (
                          <button
                            type="button"
                            onClick={() => setReportingItem(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[12px] font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Báo lỗi sản phẩm</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-body-md font-bold text-brand-navy">
                        {itemLineTotal.toLocaleString('vi-VN')}đ
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-[11px] text-neutral-400">
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

          {/* RIGHT: Delivery info & Totals */}
          <div className="flex flex-col gap-6">

            {/* Customer Info Card */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-brand-navy mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-navy" /> Địa chỉ nhận hàng
              </h3>
              <div className="flex flex-col gap-2 text-body-sm">
                <div className="font-bold text-brand-navy flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-400" />
                  {order.shippingInfo?.name || 'Khách hàng'}
                </div>
                <div className="text-neutral-600 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  {order.shippingInfo?.phone || '—'}
                </div>
                <div className="text-neutral-600 mt-1 pl-6">
                  {order.shippingInfo?.address || '—'}
                </div>
                {order.shippingInfo?.notes && (
                  <div className="mt-2 p-3 bg-neutral-50 rounded-xl text-[12px] text-neutral-500 border border-neutral-100">
                    <strong>Ghi chú:</strong> {order.shippingInfo.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-brand-navy mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-navy" /> Thanh toán
              </h3>

              {order.status === 'CREATED' && order.paymentStatus === 'PENDING' && (
                <div className="bg-brand-navy/5 border border-brand-navy/20 rounded-xl p-4 mb-4">
                  <p className="text-label-sm text-neutral-600 mb-1">Nội dung chuyển khoản</p>
                  <p className="text-body-lg font-bold text-brand-navy font-mono">FAI{order.orderCode}</p>
                  <p className="text-label-sm text-neutral-600 mt-2">
                    Nếu đã chuyển khoản nhưng đơn chưa cập nhật, vui lòng kiểm tra đã ghi đúng mã này trong nội dung chuyển khoản chưa.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-body-sm py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Hình thức</span>
                <span className="font-semibold text-brand-navy">{order.paymentMethod === 'BANK_TRANSFER' || order.paymentMethod === 'BANK' || order.paymentMethod === 'Bank' ? 'Chuyển khoản online' : order.paymentMethod}</span>
              </div>

              <div className="flex items-center justify-between text-body-sm py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Tạm tính</span>
                <span className="text-neutral-700 font-medium">{(order.itemsSubtotalVnd ?? order.itemsTotal).toLocaleString('vi-VN')}đ</span>
              </div>

              <div className="flex items-center justify-between text-body-sm py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Phí vận chuyển</span>
                <span className="text-neutral-700 font-medium">{(order.shippingFeeVnd ?? order.shippingFee).toLocaleString('vi-VN')}đ</span>
              </div>

              {((order.discountVnd !== undefined && order.discountVnd > 0) || (order.discountAmount > 0)) && (
                <div className="flex items-center justify-between text-body-sm py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Giảm giá</span>
                  <span className="text-emerald-600 font-medium">-{(order.discountVnd ?? order.discountAmount).toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-b border-neutral-100 pb-3">
                <span className="text-body-md font-bold text-brand-navy">Tổng đơn hàng</span>
                <span className="text-[20px] font-bold text-brand-navy">
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
                <div className="flex items-center justify-between text-body-sm pt-2">
                  <span className="text-neutral-500">Đã hoàn tiền</span>
                  <span className="font-bold text-red-600">
                    -{order.amountRefundedVnd.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              )}
            </div>

            {/* Refunds list if any */}
            {order.refunds && order.refunds.length > 0 && (
              <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm">
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

            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-brand-navy mb-4">Lịch sử đơn hàng</h3>
              {order.history && order.history.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {order.history.map(event => {
                    const issueCfg = ISSUE_HISTORY_CONFIG[event.type];
                    const issueId = (event.metadata as { issueId?: string } | undefined)?.issueId;
                    return (
                      <div key={event.id} className="border-l-2 border-brand-navy/20 pl-3">
                        <p className={`text-body-sm font-semibold ${issueCfg ? issueCfg.badgeClass : 'text-brand-navy'}`}>
                          {event.publicMessage || issueCfg?.label || event.toStatus || event.type}
                        </p>
                        <div className="flex items-center justify-between text-[12px] text-neutral-500 mt-0.5">
                          <span>{new Date(event.occurredAt).toLocaleString('vi-VN')}</span>
                          {issueId && (
                            <a href="#order-issues" className="text-brand-navy hover:underline text-[11px] font-medium">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-[18px] font-bold text-brand-navy mb-2">Xác nhận hủy đơn hàng?</h3>
            <p className="text-body-sm text-neutral-600 mb-6">
              Bạn có chắc chắn muốn hủy đơn hàng <strong>#{orderCode}</strong> không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2.5 border border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Giữ đơn
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancel}
                className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
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

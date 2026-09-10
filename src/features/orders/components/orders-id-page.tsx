'use client';

import { STATUS_MAP, TAILORING_STEPS } from '@/features/orders/constants/orders-id-page';
import { useCart } from '@/features/cart/store/cartStore';
import { useCancelOrder, useOrder } from '@/features/orders/hooks/useOrders';
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
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { order, isLoading, isError, refetch } = useOrder(id);
  const { cancelOrder, isCancelling } = useCancelOrder();
  const { addToCart, setIsCartOpen } = useCart();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const statusInfo = STATUS_MAP[order?.status || 'PENDING'] || STATUS_MAP.PENDING;

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
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-[13px] text-neutral-500">
                Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {order.status === 'PENDING' && (
                  <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-body-sm font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Hủy đơn hàng
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
              <div className="flex items-center justify-between relative max-w-xl mx-auto py-2">
                <div className="absolute top-5 left-8 right-8 h-[3px] bg-neutral-200 -z-0" />
                <div
                  className="absolute top-5 left-8 h-[3px] bg-brand-navy transition-all duration-500 -z-0"
                  style={{ width: `${Math.min(100, Math.max(0, (statusInfo.step / maxStep) * 100))}%` }}
                />
                {steps.map((label, idx) => {
                  const isPassed = idx <= statusInfo.step;
                  const isCurrent = idx === statusInfo.step;
                  return (
                    <div key={label} className="flex flex-col items-center gap-2 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] transition-all ${isPassed
                        ? 'bg-brand-navy text-white ring-4 ring-white shadow-sm'
                        : 'bg-neutral-200 text-neutral-500'
                        }`}>
                        {isPassed ? '✓' : idx + 1}
                      </div>
                      <span className={`text-[12px] font-medium ${isCurrent ? 'text-brand-navy font-bold' : 'text-neutral-500'}`}>
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
            <p className="mt-1 text-body-md font-bold text-brand-navy">{order.shipment?.status || 'Chưa tạo vận đơn'}</p>
            <p className="text-[12px] text-neutral-500">{order.shipment?.providerOrderCode ? `Mã: ${order.shipment.providerOrderCode}` : 'Chờ shop bàn giao'}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-500">Cập nhật</p>
            <p className="mt-1 text-body-md font-bold text-brand-navy">{order.updatedAt ? new Date(order.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
            <p className="text-[12px] text-neutral-500">{order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('vi-VN') : 'Chưa có dữ liệu'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* LEFT: Products List */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-[18px] font-bold text-brand-navy pb-3 border-b border-neutral-100">
                Sản phẩm trong đơn ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
              </h3>

            <div className="flex flex-col divide-y divide-neutral-100">
              {order.items.map((item, index) => {
                const img = item.product?.images?.[0] || '/images/726470431_1311184104081177_6052756217829444481_n.png';
                const name = item.productNameSnapshot || item.product?.name || `Trang phục #${item.productId}`;

                return (
                  <div key={item.id || index} className="py-4 flex gap-4 items-center">
                    <img
                      src={img}
                      alt={name}
                      className="w-16 h-20 object-cover rounded-xl bg-neutral-100 border border-neutral-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.productId}`} className="text-body-md font-bold text-brand-navy hover:underline line-clamp-1">
                        {name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-[13px] text-neutral-500">
                        <span>Màu: <strong className="text-neutral-700">{item.color || 'Mặc định'}</strong></span>
                        <span>•</span>
                        <span>Vải: <strong className="text-neutral-700">{item.fabricSnapshot || 'Theo sản phẩm'}</strong></span>
                      </div>
                      {item.measurementSnapshot && Object.keys(item.measurementSnapshot).length > 0 && (
                        <div className="mt-2 p-2.5 bg-neutral-50 rounded-lg border border-neutral-100 text-[11px] text-neutral-600 flex flex-wrap gap-x-3 gap-y-1">
                          <span className="font-semibold text-brand-navy">Số đo đã chốt:</span>
                          {item.measurementSnapshot.chest && <span>Ngực: {item.measurementSnapshot.chest}cm</span>}
                          {item.measurementSnapshot.waist && <span>Eo: {item.measurementSnapshot.waist}cm</span>}
                          {item.measurementSnapshot.hip && <span>Hông: {item.measurementSnapshot.hip}cm</span>}
                          {item.measurementSnapshot.shoulder && <span>Vai: {item.measurementSnapshot.shoulder}cm</span>}
                          {item.measurementSnapshot.height && <span>Cao: {item.measurementSnapshot.height}cm</span>}
                        </div>
                      )}
                      <div className="text-[13px] text-neutral-500 mt-0.5">
                        Số lượng: <strong className="text-brand-navy">{item.quantity}</strong>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-body-md font-bold text-brand-navy">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-[11px] text-neutral-400">
                          {item.price.toLocaleString('vi-VN')}đ / cái
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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

              <div className="flex items-center justify-between text-body-sm py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Hình thức</span>
                <span className="font-semibold text-brand-navy">{order.paymentMethod === 'BANK_TRANSFER' || order.paymentMethod === 'BANK' || order.paymentMethod === 'Bank' ? 'Chuyển khoản online' : order.paymentMethod}</span>
              </div>

              <div className="flex items-center justify-between text-body-sm py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Tạm tính</span>
                <span className="text-neutral-700 font-medium">{order.itemsTotal.toLocaleString('vi-VN')}đ</span>
              </div>

              <div className="flex items-center justify-between text-body-sm py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Phí vận chuyển</span>
                <span className="text-neutral-700 font-medium">{order.shippingFee.toLocaleString('vi-VN')}đ</span>
              </div>

              <div className="flex items-center justify-between text-body-sm py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Giảm giá</span>
                <span className="text-neutral-700 font-medium">-{order.discountAmount.toLocaleString('vi-VN')}đ</span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-body-md font-bold text-brand-navy">Tổng thanh toán</span>
                <span className="text-[20px] font-bold text-brand-navy">
                  {order.totalAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-brand-navy mb-4">Lịch sử đơn hàng</h3>
              {order.history && order.history.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {order.history.map(event => (
                    <div key={event.id} className="border-l-2 border-brand-navy/20 pl-3">
                      <p className="text-body-sm font-semibold text-brand-navy">{event.publicMessage || event.toStatus || event.type}</p>
                      <p className="text-[12px] text-neutral-500">{new Date(event.occurredAt).toLocaleString('vi-VN')}</p>
                    </div>
                  ))}
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
    </div>
  );
}

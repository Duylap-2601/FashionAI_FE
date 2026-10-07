'use client';

import { CheckoutSummary } from '@/features/checkout/components/checkout-summary';
import { DeliveryOptions } from '@/features/checkout/components/delivery-options';
import type { CheckoutPaymentMethod } from '@/features/checkout/types/delivery-options';
import { useCart } from '@/features/cart/store/cartStore';
import { useMeasurementsCompleteness } from '@/features/measurements/hooks/useMeasurementsCompleteness';
import { useCreateOrder } from '@/features/orders/hooks/useOrders';
import { quoteOrder } from '@/features/orders/services/mutations';
import type { OrderQuote } from '@/features/orders/types/orders';
import { useCheckout, usePaymentStatus } from '@/features/payments/hooks/usePayments';
import type { CheckoutResponse } from '@/features/payments/types/payments';
import { AddressForm } from '@/features/profile/components/address-form';
import { useAddressMutations, useUserAddresses } from '@/features/profile/hooks/use-addresses';
import { getErrorData, getErrorMessage, isRecord } from '@/lib/errors';
import { AlertCircle, CheckCircle2, ChevronRight, Copy, ExternalLink, Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems: items, totalPrice, clearCart } = useCart();
  const { canOrder, completeness } = useMeasurementsCompleteness();
  const { createOrderAsync, isSubmitting } = useCreateOrder();
  const { checkout, isLoading: isCheckoutLoading } = useCheckout();
  const { data: addresses = [], isLoading: isLoadingAddresses, refetch: refetchAddresses } = useUserAddresses();
  const { createAddress } = useAddressMutations();

  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('zalopay');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [orderQuote, setOrderQuote] = useState<OrderQuote | null>(null);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [pendingCheckout, setPendingCheckout] = useState<CheckoutResponse | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [notes, setNotes] = useState('');
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) ?? null;

  useEffect(() => {
    if (selectedAddressId || addresses.length === 0) return;
    setSelectedAddressId((addresses.find((address) => address.isDefault) ?? addresses[0]).id);
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    let isMounted = true;

    async function loadQuote() {
      if (!selectedAddress || items.length === 0) {
        setOrderQuote(null);
        setDiscount(0);
        setPricingError(null);
        return;
      }

      setIsPricingLoading(true);
      setPricingError(null);
      try {
        const quote = await quoteOrder({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            color: item.color,
            price: item.price,
          })),
          shippingAddressId: selectedAddress.id,
          addressVersion: selectedAddress.version,
          shippingNote: notes,
          paymentMethod: 'BANK_TRANSFER',
          couponCode: appliedCoupon || undefined,
        });
        if (!isMounted) return;
        setOrderQuote(quote);
        setDiscount(quote.discountAmount);
      } catch (error: unknown) {
        if (!isMounted) return;
        console.error('Failed to quote order:', error);
        setOrderQuote(null);
        setDiscount(0);
        const errMsg = getErrorMessage(error, 'Không thể tính tổng đơn hàng. Vui lòng kiểm tra địa chỉ hoặc mã giảm giá.');
        setPricingError(errMsg);
        if (appliedCoupon) {
          toast.error(errMsg);
        }
      } finally {
        if (isMounted) setIsPricingLoading(false);
      }
    }

    loadQuote();

    return () => {
      isMounted = false;
    };
  }, [appliedCoupon, items, notes, selectedAddress]);

  const shippingFee = orderQuote?.shippingFee ?? 0;
  const total = orderQuote?.totalAmount ?? Math.max(0, totalPrice);
  const isOrderBlocked = isSubmitting || isCheckoutLoading || isPricingLoading || !!pricingError || (!!selectedAddress && !orderQuote);
  const submitLabel = isPricingLoading
    ? 'Đang tính phí...'
    : isSubmitting
      ? 'Đang đặt hàng...'
      : isCheckoutLoading
        ? 'Đang tạo thanh toán...'
        : pricingError
          ? 'Cần kiểm tra lại đơn hàng'
          : 'Xác nhận đặt hàng →';

  const handleApplyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    setAppliedCoupon(code);
  };

  const handleDiscountStateChange: React.Dispatch<React.SetStateAction<number>> = (value) => {
    const nextValue = typeof value === 'function' ? value(discount) : value;
    setDiscount(nextValue);
    if (nextValue === 0) {
      setAppliedCoupon('');
      setPricingError(null);
    }
  };

  const handleCouponChange: React.Dispatch<React.SetStateAction<string>> = (value) => {
    const nextValue = typeof value === 'function' ? value(coupon) : value;
    setCoupon(nextValue);
    if (appliedCoupon && discount === 0) {
      setAppliedCoupon('');
      setPricingError(null);
    }
  };

  const proceedToGateway = (checkoutResult: CheckoutResponse) => {
    if (!checkoutResult.checkoutUrl) {
      toast.error('Không nhận được link thanh toán');
      return;
    }

    if (checkoutResult.provider === 'SEPAY' && checkoutResult.extra?.formAction && checkoutResult.extra?.formFields) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = checkoutResult.extra.formAction;
      Object.entries(checkoutResult.extra.formFields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
      return;
    }

    try {
      const parsedUrl = new URL(checkoutResult.checkoutUrl, window.location.origin);
      if (
        checkoutResult.provider === 'SEPAY' &&
        (parsedUrl.hostname.includes('sepay.vn') || parsedUrl.pathname.includes('/checkout/init')) &&
        parsedUrl.searchParams.size > 0
      ) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `${parsedUrl.origin}${parsedUrl.pathname}`;
        parsedUrl.searchParams.forEach((value, key) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }
    } catch (urlErr) {
      console.warn('Could not parse checkoutUrl as URL object:', urlErr);
    }

    window.location.href = checkoutResult.checkoutUrl;
  };

  const copyTransferContent = async () => {
    const transferContent = pendingCheckout?.extra?.invoiceNumber || `FAI${pendingCheckout?.orderCode ?? ''}`;
    try {
      await navigator.clipboard.writeText(transferContent);
      toast.success('Đã sao chép nội dung chuyển khoản');
    } catch {
      toast.error('Không thể sao chép tự động');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isOrderBlocked) return;

    if (!canOrder && completeness) {
      const missingLabels: string[] = [];
      completeness.byCategory.forEach((cat) => {
        if (!cat.complete && cat.missing) {
          cat.missing.forEach((m) => {
            if (!missingLabels.includes(m.label)) missingLabels.push(m.label);
          });
        }
      });

      toast.error('Chưa đủ số đo cơ thể để may trang phục!', {
        description: `Còn thiếu: ${missingLabels.join(', ') || 'số đo bắt buộc'}. Vui lòng bổ sung trước khi đặt hàng.`,
        action: {
          label: 'Nhập số đo',
          onClick: () => router.push('/profile/measurements'),
        },
      });
      return;
    }

    if (!selectedAddress) {
      setShowAddressForm(true);
      toast.error('Vui lòng chọn hoặc thêm địa chỉ giao hàng.');
      return;
    }
    if (!orderQuote) {
      toast.error('Vui lòng đợi hệ thống tính phí giao hàng trước khi đặt hàng.');
      return;
    }

    try {
      const order = await createOrderAsync({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          price: item.price,
        })),
        shippingAddressId: selectedAddress.id,
        addressVersion: selectedAddress.version,
        shippingNote: notes,
        quoteToken: orderQuote.quoteToken,
        idempotencyKey: idempotencyKeyRef.current,
        paymentMethod: 'BANK_TRANSFER',
        couponCode: appliedCoupon || undefined,
        totalAmount: orderQuote.totalAmount,
      });
      const orderId = order?.id;

      if (!orderId) {
        throw new Error('Không nhận được ID đơn hàng từ server');
      }

      try {
        const checkoutResult = await checkout({
          orderId,
          provider: paymentMethod === 'sepay' ? 'SEPAY' : 'ZALOPAY',
        });
        if (checkoutResult.checkoutUrl) {
          setPendingOrderId(orderId);
          setPendingCheckout(checkoutResult);
        } else {
          throw new Error('Không nhận được link thanh toán');
        }
      } catch (checkoutError) {
        console.error('Checkout failed, order still pending:', checkoutError);
        toast.error('Tạo đơn hàng thành công nhưng không thể chuyển tới cổng thanh toán. Vui lòng thanh toán lại từ trang đơn hàng.');
        router.push(`/orders/${orderId}`);
      }
    } catch (error: unknown) {
      console.error('Failed to create order:', error);
      const data = getErrorData(error);
      if (data?.code === 'MEASUREMENTS_INCOMPLETE') {
        const missing = Array.isArray(data.missing)
          ? data.missing.filter(isRecord).map(m => typeof m.label === 'string' ? m.label : '').filter(Boolean).join(', ')
          : 'vui lòng kiểm tra lại số đo';
        toast.error('Thiếu số đo bắt buộc để đặt may!', {
          description: `Còn thiếu: ${missing}. Vui lòng bổ sung số đo trước khi đặt hàng.`,
          action: {
            label: 'Nhập số đo',
            onClick: () => router.push('/profile/measurements'),
          },
        });
      } else {
        toast.error(getErrorMessage(error, 'Đã xảy ra lỗi khi tạo đơn hàng.'));
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-brand-cream min-h-screen py-20 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm max-w-md w-full text-center">
          <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-4" strokeWidth={1} />
          <h2 className="text-[20px] font-bold text-brand-navy mb-2">Giỏ hàng trống</h2>
          <p className="text-neutral-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng để thực hiện thanh toán.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-brand-navy text-white text-body-sm font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors"
          >
            Khám phá sản phẩm &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen pb-20">
      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center gap-3 text-label-sm font-medium mb-12">
          <span className="text-brand-navy font-bold">1. Thông tin giao hàng</span>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
          <span className="text-brand-navy font-bold">2. Thanh toán</span>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
          <span className="text-neutral-400">3. Hoàn tất đơn</span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[60%_1fr] gap-12 items-start">
          <div className="flex flex-col gap-10">
            {!canOrder && completeness && (
              <div className="p-5 bg-brand-navy/5 border border-brand-navy/20 rounded-2xl animate-in fade-in duration-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-brand-navy/10 rounded-xl text-brand-navy shrink-0 mt-0.5">
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-body-md font-bold text-brand-navy mb-1">
                      Cần bổ sung số đo cơ thể để hoàn tất đơn may đo
                    </h3>
                    <p className="text-[13px] text-neutral-700 mb-3 leading-relaxed">
                      Sản phẩm bạn chọn là hình thức may đo riêng. Tài khoản của bạn hiện còn thiếu một số thông số bắt buộc:
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {completeness.byCategory.flatMap(c => c.missing || []).map((m, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-brand-navy/10 text-brand-navy rounded-lg text-[12px] font-semibold border border-brand-navy/20">
                          {m.label}
                        </span>
                      ))}
                    </div>
                    <Link
                      href="/profile/measurements"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5D1C34] text-white rounded-xl text-[13px] font-bold hover:bg-[#5D1C34]/90 transition-colors shadow-2xs"
                    >
                      Bổ sung số đo tại Profile &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-[18px] font-bold text-brand-navy">Địa chỉ giao hàng</h2>
                  <p className="text-sm text-neutral-500">Vui lòng kiểm tra địa chỉ. Bạn không thể đổi địa chỉ sau khi đặt hàng.</p>
                </div>
                <button type="button" onClick={() => setShowAddressForm((value) => !value)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-brand-navy">
                  {addresses.length === 0 ? 'Thêm địa chỉ' : 'Thay đổi'}
                </button>
              </div>

              {isLoadingAddresses && <p className="text-sm text-neutral-500">Đang tải sổ địa chỉ...</p>}
              {!isLoadingAddresses && addresses.length === 0 && !showAddressForm && <p className="text-sm text-neutral-600">Bạn chưa có địa chỉ giao hàng.</p>}

              {addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label key={address.id} className={`block rounded-xl border p-4 cursor-pointer ${selectedAddressId === address.id ? 'border-brand-navy bg-brand-navy/5' : 'border-neutral-200'}`}>
                      <div className="flex gap-3">
                        <input type="radio" checked={selectedAddressId === address.id} onChange={() => setSelectedAddressId(address.id)} className="mt-1" />
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-bold text-brand-navy">{address.recipientName}</span>
                            <span className="text-neutral-300">|</span>
                            <span>{address.phone}</span>
                            {address.isDefault && <span className="rounded-full bg-brand-navy/10 px-2 py-0.5 text-xs font-semibold text-brand-navy">Mặc định</span>}
                          </div>
                          <p className="mt-1 text-sm text-neutral-700">{address.addressLine}, {address.wardName}, {address.districtName}, {address.provinceName}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {showAddressForm && (
                <div className="mt-4">
                  <AddressForm
                    renderAsForm={false}
                    isSaving={createAddress.isPending}
                    onCancel={() => setShowAddressForm(false)}
                    onSubmit={(payload) => {
                      createAddress.mutateAsync(payload)
                        .then((address) => { setSelectedAddressId(address.id); setShowAddressForm(false); refetchAddresses(); toast.success('Đã thêm địa chỉ giao hàng'); })
                        .catch((error) => toast.error(getErrorMessage(error, 'Không thể thêm địa chỉ')));
                    }}
                  />
                </div>
              )}

              <div className="mt-4">
                <label className="text-sm font-semibold text-brand-navy">Ghi chú giao hàng</label>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} className="mt-2 min-h-20 w-full rounded-xl border border-neutral-200 p-3 text-sm" placeholder="Ví dụ: giao giờ hành chính" />
              </div>
            </section>

            <DeliveryOptions paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

            <div className="lg:hidden mt-8">
              <button
                type="submit"
                disabled={isOrderBlocked}
                className="w-full h-[52px] bg-brand-navy text-white text-body-md font-bold rounded-xl flex items-center justify-between px-6 hover:bg-brand-navy/90 transition-colors disabled:opacity-50"
              >
                  <span>{submitLabel.replace(' →', '')}</span>
                <span>{total.toLocaleString('vi-VN')}đ</span>
              </button>
            </div>
          </div>

          <CheckoutSummary
            items={items}
            totalPrice={orderQuote?.itemsTotal ?? totalPrice}
            shippingFee={shippingFee}
            discount={discount}
            total={total}
            isSubmitting={isOrderBlocked}
            submitLabel={submitLabel}
            isPricingLoading={isPricingLoading}
            pricingError={pricingError}
            coupon={coupon}
            setCoupon={handleCouponChange}
            setDiscount={handleDiscountStateChange}
            handleApplyCoupon={handleApplyCoupon}
          />
        </form>
      </div>

      {pendingCheckout?.provider === 'ZALOPAY' && (
        <ZaloPayCheckoutDialog
          checkoutResult={pendingCheckout}
          orderId={pendingOrderId}
          total={total}
          onClose={() => {
            setPendingCheckout(null);
            setPendingOrderId(null);
            toast.info('Đơn hàng đã được tạo. Bạn có thể tiếp tục thanh toán trong trang chi tiết đơn hàng.');
          }}
          onPaid={clearCart}
        />
      )}

      {pendingCheckout && pendingCheckout.provider !== 'ZALOPAY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-[18px] font-bold text-brand-navy">Thanh toán chuyển khoản ngân hàng</h3>
              <button
                type="button"
                onClick={() => {
                  setPendingCheckout(null);
                  setPendingOrderId(null);
                }}
                className="text-neutral-400 hover:text-brand-navy"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
            <p className="text-body-sm text-neutral-600 mb-4">
              Vui lòng ghi đúng nội dung dưới đây để hệ thống tự động xác nhận thanh toán.
            </p>
            <div className="bg-brand-cream rounded-xl p-4 mb-4">
              <p className="text-label-sm text-neutral-500 mb-1">Nội dung chuyển khoản</p>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[20px] font-bold text-brand-navy font-mono break-all">
                  {pendingCheckout.extra?.invoiceNumber || `FAI${pendingCheckout.orderCode ?? ''}`}
                </p>
                <button type="button" onClick={copyTransferContent} className="shrink-0 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-brand-navy hover:bg-neutral-50 inline-flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" /> Sao chép
                </button>
              </div>
              <p className="text-label-sm text-neutral-500 mt-3 mb-1">Số tiền cần thanh toán</p>
              <p className="text-body-lg font-bold text-brand-navy">{total.toLocaleString('vi-VN')}đ</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const result = pendingCheckout;
                setPendingCheckout(null);
                setPendingOrderId(null);
                if (result) proceedToGateway(result);
              }}
              className="w-full h-12 rounded-xl bg-brand-navy text-white font-semibold hover:bg-brand-navy/90 transition-colors"
            >
              Mở cổng chuyển khoản
            </button>
            {pendingOrderId && (
              <Link
                href={`/orders/${pendingOrderId}`}
                className="block text-center text-label-sm text-neutral-500 mt-3 hover:text-brand-navy"
              >
                Để thanh toán sau, xem đơn hàng
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ZaloPayCheckoutDialog({
  checkoutResult,
  orderId,
  total,
  onClose,
  onPaid,
}: {
  checkoutResult: CheckoutResponse;
  orderId: string | null;
  total: number;
  onClose: () => void;
  onPaid: () => void;
}) {
  const router = useRouter();
  const paymentId = checkoutResult.paymentId ?? null;
  const { data: payment, isLoading } = usePaymentStatus(paymentId);
  const qrValue = checkoutResult.qrCode || checkoutResult.checkoutUrl || checkoutResult.payUrl || '';
  const isPaid = payment?.status === 'PAID' || payment?.orderStatus === 'PAID';
  const isFailed = payment?.status === 'FAILED';
  const isRefundRequired = payment?.status === 'REFUND_REQUIRED';

  useEffect(() => {
    if (!isPaid || !paymentId) return;
    onPaid();
    toast.success('Thanh toán ZaloPay thành công');
    router.push(`/payment/result?paymentId=${encodeURIComponent(paymentId)}`);
  }, [isPaid, onPaid, paymentId, router]);

  const openGateway = () => {
    if (!checkoutResult.checkoutUrl) return;
    window.open(checkoutResult.checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-[20px] font-bold text-brand-navy">Thanh toán ZaloPay</h3>
            <p className="text-body-sm text-neutral-600 mt-1">
              Mở ZaloPay hoặc quét QR. Bạn có thể giữ trang này, hệ thống sẽ tự cập nhật khi thanh toán thành công.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-brand-navy" aria-label="Đóng">
            ✕
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-[180px_1fr] items-center">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 flex items-center justify-center">
            {qrValue ? (
              <QRCodeSVG value={qrValue} size={148} level="M" includeMargin />
            ) : (
              <div className="h-[148px] w-[148px] rounded-xl bg-neutral-100 flex items-center justify-center text-center text-xs text-neutral-500">
                Không có dữ liệu QR
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-xl bg-brand-cream p-4">
              <p className="text-label-sm text-neutral-500 mb-1">Mã đơn hàng</p>
              <p className="font-mono text-[18px] font-bold text-brand-navy">#{checkoutResult.orderCode}</p>
              <p className="text-label-sm text-neutral-500 mt-3 mb-1">Số tiền</p>
              <p className="text-body-lg font-bold text-brand-navy">{total.toLocaleString('vi-VN')}đ</p>
            </div>

            <button
              type="button"
              onClick={openGateway}
              disabled={!checkoutResult.checkoutUrl}
              className="w-full h-12 rounded-xl bg-brand-navy text-white font-semibold hover:bg-brand-navy/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Mở ZaloPay <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-neutral-200 p-4">
          {isPaid && (
            <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5" /> Thanh toán thành công, đang chuyển trang...
            </div>
          )}
          {isFailed && (
            <div className="flex items-start gap-2 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <span>{payment?.failureReason || 'Thanh toán thất bại hoặc link đã hết hạn. Vui lòng tạo lại thanh toán.'}</span>
            </div>
          )}
          {isRefundRequired && (
            <div className="flex items-start gap-2 text-amber-700 text-sm">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <span>Đã nhận tiền nhưng đơn chưa thể ghi nhận thanh toán. Khoản tiền sẽ được xử lý hoàn lại.</span>
            </div>
          )}
          {!isPaid && !isFailed && !isRefundRequired && (
            <div className="flex items-center gap-2 text-neutral-600 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              {isLoading ? 'Đang kiểm tra trạng thái thanh toán...' : 'Đang chờ ZaloPay xác nhận thanh toán...'}
            </div>
          )}
        </div>

        {orderId && (
          <Link href={`/orders/${orderId}`} className="block text-center text-label-sm text-neutral-500 mt-4 hover:text-brand-navy">
            Xem chi tiết đơn hàng
          </Link>
        )}
      </div>
    </div>
  );
}

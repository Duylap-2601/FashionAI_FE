'use client';

import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { useCommerceViewTracking } from '@/features/analytics/hooks/use-commerce-view-tracking';
import { cartItemToGaItem } from '@/features/analytics/services/ga-items';
import { formatCartPrice } from '@/features/cart/components/cart-line';
import { CheckoutOption } from '@/features/checkout/components/checkout-option';
import { CheckoutSummary } from '@/features/checkout/components/checkout-summary';
import { DeliveryOptions } from '@/features/checkout/components/delivery-options';
import type { CheckoutPaymentMethod } from '@/features/checkout/types/delivery-options';
import { useCart } from '@/features/cart/hooks/use-cart';
import { toCartLineInput } from '@/features/cart/services/cart-mapper';
import type { CartItem } from '@/features/cart/types/cart-store';
import { useMeasurementsCompleteness } from '@/features/measurements/hooks/useMeasurementsCompleteness';
import { useCreateOrder, useUnpaidOrders } from '@/features/orders/hooks/useOrders';
import { formatOrderDateTime, getOrderCode, getOrderTotal } from '@/features/orders/services/order-display';
import { quoteOrder } from '@/features/orders/services/mutations';
import type { OrderQuote } from '@/features/orders/types/orders';
import { PaymentDialog } from '@/features/payments/components/payment-dialog';
import { useCheckout } from '@/features/payments/hooks/usePayments';
import type { CheckoutResponse } from '@/features/payments/types/payments';
import { AddressForm } from '@/features/profile/components/address-form';
import {
  accountButtonClassName,
  accountFocusRing,
  accountInputClassName,
  accountLabelClassName,
} from '@/features/profile/components/account-ui';
import { useAddressMutations, useUserAddresses } from '@/features/profile/hooks/use-addresses';
import { toCommerceParams, trackEvent } from '@/lib/analytics';
import { getErrorData, getErrorMessage, isRecord } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// Ghi chú nằm trong quote token nên đổi ghi chú phải báo giá lại: chờ gõ xong mới gọi.
const NOTE_QUOTE_DELAY_MS = 600;
// Quote còn hạn ít hơn mức này thì báo giá lại thay vì dùng bản đã lưu.
const QUOTE_REUSE_MARGIN_MS = 60 * 1000;

function formatCheckoutAddress(address: { addressLine: string; wardName: string; provinceName: string }) {
  return [address.addressLine, address.wardName, address.provinceName].filter(Boolean).join(', ');
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems,
    purchasableItems,
    totalPrice,
    refreshAfterPayment,
    isLoading: isCartLoading,
    isError: isCartError,
    refetch: refetchCart,
  } = useCart();
  // Từ lúc bấm đặt hàng tới khi thanh toán xong, giữ nguyên danh sách món và báo giá: giỏ
  // có thể đổi giữa chừng (thiết bị khác, hoặc BE bỏ món đã mua ngay khi nhận tiền kèm
  // realtime), trang không được báo giá lại, đổi số tiền, hay nhảy sang "giỏ trống" và mất modal.
  const [lockedItems, setLockedItems] = useState<CartItem[] | null>(null);
  const items = lockedItems ?? purchasableItems;
  const unavailableCount = cartItems.length - purchasableItems.length;
  const { canOrder, completeness } = useMeasurementsCompleteness();
  // Categories share fields (height, chest...), so list each missing field once.
  const missingMeasurementLabels = [
    ...new Set(
      (completeness?.byCategory ?? [])
        .filter((cat) => !cat.complete)
        .flatMap((cat) => cat.missing ?? [])
        .map((m) => m.label)
    ),
  ];
  const { createOrderAsync, isSubmitting } = useCreateOrder();
  const unpaidOrders = useUnpaidOrders();

  // Cổng thanh toán cấu hình cũ trả khách về /checkout?orderCode=..&status=cancel|error:
  // chuyển sang trang kết quả (thanh toán lại ở trang đơn), không để khách đặt thêm đơn mới.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gatewayStatus = params.get('status');
    if (!params.get('orderCode') || (gatewayStatus !== 'cancel' && gatewayStatus !== 'error')) return;
    router.replace(`/payment/${gatewayStatus}?${params.toString()}`);
  }, [router]);
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
  // Lỗi của mã giảm giá tách khỏi lỗi báo giá: mã sai thì bỏ mã và báo giá lại, không khoá đơn.
  const [couponError, setCouponError] = useState<string | null>(null);
  const [pendingCheckout, setPendingCheckout] = useState<CheckoutResponse | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [notes, setNotes] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());
  // Quote theo đúng đầu vào: bỏ mã sai hay gõ lại ghi chú cũ thì dùng lại, không hỏi lại BE.
  const quoteCacheRef = useRef(new Map<string, OrderQuote>());
  // Địa chỉ + món hàng của quote đang hiện: chỉ khi chúng đổi thì phí giao hàng cũ mới sai.
  const quotedShippingKeyRef = useRef<string | null>(null);

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) ?? null;
  useCommerceViewTracking('begin_checkout', purchasableItems, !isCartLoading);

  useEffect(() => {
    if (selectedAddressId || addresses.length === 0) return;
    setSelectedAddressId((addresses.find((address) => address.isDefault) ?? addresses[0]).id);
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    const timer = setTimeout(() => setQuoteNotes(notes), NOTE_QUOTE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [notes]);

  const quoteLines = useMemo(() => items.map((item) => ({ ...toCartLineInput(item), price: item.price })), [items]);
  const shippingKey = selectedAddress ? JSON.stringify([selectedAddress.id, selectedAddress.version, quoteLines]) : null;

  useEffect(() => {
    let isMounted = true;

    async function loadQuote() {
      if (lockedItems) return;
      if (!selectedAddress || !shippingKey || quoteLines.length === 0) {
        quotedShippingKeyRef.current = null;
        setOrderQuote(null);
        setDiscount(0);
        setPricingError(null);
        return;
      }

      const quoteKey = JSON.stringify([shippingKey, quoteNotes, appliedCoupon]);
      const applyQuote = (quote: OrderQuote) => {
        quotedShippingKeyRef.current = shippingKey;
        setOrderQuote(quote);
        setDiscount(quote.discountAmount);
        setPricingError(null);
      };
      const cached = quoteCacheRef.current.get(quoteKey);
      if (cached?.expiresAt && new Date(cached.expiresAt).getTime() - Date.now() > QUOTE_REUSE_MARGIN_MS) {
        applyQuote(cached);
        return;
      }

      // Đổi mã hay ghi chú thì giữ phí giao hàng đang hiện; đổi địa chỉ/món thì phí cũ không còn đúng.
      if (quotedShippingKeyRef.current !== shippingKey) {
        quotedShippingKeyRef.current = null;
        setOrderQuote(null);
      }
      setIsPricingLoading(true);
      setPricingError(null);
      try {
        const quote = await quoteOrder({
          items: quoteLines,
          shippingAddressId: selectedAddress.id,
          addressVersion: selectedAddress.version,
          shippingNote: quoteNotes,
          paymentMethod: 'BANK_TRANSFER',
          couponCode: appliedCoupon || undefined,
        });
        quoteCacheRef.current.set(quoteKey, quote);
        if (!isMounted) return;
        applyQuote(quote);
      } catch (error: unknown) {
        if (!isMounted) return;
        const errorData = getErrorData(error);
        const errorCode = typeof errorData.code === 'string' ? errorData.code : '';
        const isAddressError = errorCode === 'ADDRESS_RECONFIRM_REQUIRED' || errorCode === 'SHIPPING_ROUTE_UNAVAILABLE';
        if (appliedCoupon && !isAddressError) {
          // Bỏ mã: quote không kèm mã vừa hiện vẫn còn trong cache nên không phải báo giá lại.
          setCouponError(getErrorMessage(error, 'Mã giảm giá không dùng được cho đơn này.'));
          setAppliedCoupon('');
          return;
        }
        console.error('Failed to quote order:', error);
        quotedShippingKeyRef.current = null;
        setOrderQuote(null);
        setDiscount(0);
        setPricingError(
          isAddressError
            ? 'GHN báo địa chỉ này không giao được. Vui lòng kiểm tra số nhà/tên đường và Phường/Xã rồi thử lại.'
            : getErrorMessage(error, 'Không thể tính tổng đơn hàng. Vui lòng kiểm tra lại địa chỉ.'),
        );
      } finally {
        if (isMounted) setIsPricingLoading(false);
      }
    }

    loadQuote();

    return () => {
      isMounted = false;
    };
  }, [appliedCoupon, lockedItems, quoteLines, quoteNotes, selectedAddress, shippingKey]);

  const shippingFee = orderQuote ? orderQuote.shippingFee : null;
  const total = orderQuote?.totalAmount ?? Math.max(0, totalPrice);
  // Ghi chú đang chờ báo giá: quote token chưa khớp ghi chú sẽ gửi.
  const isNotePending = notes !== quoteNotes;
  const isCheckingCoupon = Boolean(appliedCoupon) && (orderQuote?.couponCode ?? '').toUpperCase() !== appliedCoupon;
  const isOrderBlocked =
    isSubmitting || isCheckoutLoading || isPricingLoading || isNotePending || !!pricingError || (!!selectedAddress && !orderQuote);
  const submitLabel = isPricingLoading || isNotePending
    ? !orderQuote
      ? 'Đang tính phí giao hàng'
      : isCheckingCoupon
        ? 'Đang kiểm tra mã'
        : 'Đang cập nhật tổng tiền'
    : isSubmitting
      ? 'Đang đặt hàng...'
      : isCheckoutLoading
        ? 'Đang tạo thanh toán...'
        : pricingError
          ? 'Cần kiểm tra lại đơn hàng'
          : 'Đặt hàng';

  const handleApplyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    setCouponError(null);
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
    setCouponError(null);
    if (appliedCoupon && discount === 0) {
      setAppliedCoupon('');
      setPricingError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isOrderBlocked) return;

    if (!canOrder && completeness) {
      toast.error('Chưa đủ số đo cơ thể để may trang phục!', {
        description: `Còn thiếu: ${missingMeasurementLabels.join(', ') || 'số đo bắt buộc'}. Vui lòng bổ sung trước khi đặt hàng.`,
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

    setLockedItems(items);
    const checkoutParams = {
      ...toCommerceParams(items.map((item) => cartItemToGaItem(item))),
      ...(appliedCoupon ? { coupon: appliedCoupon } : {}),
    };
    trackEvent('add_shipping_info', { ...checkoutParams, shipping_tier: 'GHN' });
    trackEvent('add_payment_info', { ...checkoutParams, payment_type: paymentMethod });
    try {
      const order = await createOrderAsync({
        items: quoteLines,
        shippingAddressId: selectedAddress.id,
        addressVersion: selectedAddress.version,
        shippingNote: quoteNotes,
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
      setLockedItems(null);
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

  if (isCartError && !lockedItems) {
    return (
      <CheckoutFrame>
        <CheckoutState
          tone="error"
          title="Không tải được giỏ hàng"
          description="Kiểm tra kết nối mạng rồi thử lại."
          action={
            <button type="button" onClick={() => refetchCart()} className={accountButtonClassName('primary')}>
              Thử lại
            </button>
          }
        />
      </CheckoutFrame>
    );
  }

  if (isCartLoading && !lockedItems) {
    return (
      <CheckoutFrame>
        <div className="flex min-h-[50vh] items-center justify-center">
          <AtelierLoader size="md" label="Đang may đơn hàng" />
        </div>
      </CheckoutFrame>
    );
  }

  if (items.length === 0) {
    return (
      <CheckoutFrame>
        <CheckoutState
          title="Chưa có gì để đặt"
          description={
            unavailableCount > 0
              ? 'Các sản phẩm trong giỏ đã ngừng bán. Chọn thiết kế khác để đặt may.'
              : 'Giỏ hàng đang trống. Chọn một thiết kế rồi quay lại đây để đặt may.'
          }
          action={
            <Link href="/products" className={accountButtonClassName('primary')}>
              Xem sản phẩm <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </Link>
          }
        />
      </CheckoutFrame>
    );
  }

  const closePayment = () => {
    setPendingCheckout(null);
    setPendingOrderId(null);
    setLockedItems(null);
  };

  return (
    <CheckoutFrame>
      <header className="mb-8 flex flex-col gap-6 border-b border-landing-line pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className={accountLabelClassName}>Đặt hàng</p>
          <h1 className="mt-3 font-display text-landing-h2 text-landing-obsidian">Giao hàng và thanh toán</h1>
          <p className="mt-3 max-w-xl text-landing-body text-landing-muted">
            Phí giao hàng do GHN báo theo địa chỉ. Tổng tiền được tính lại ở máy chủ trước khi tạo đơn.
          </p>
        </div>
        <ol className="flex shrink-0 items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.16em]" aria-label="Các bước đặt hàng">
          {CHECKOUT_STEPS.map((step, index) => (
            <li key={step} aria-current={index === 1 ? 'step' : undefined} className="flex items-center gap-2">
              <span className={cn('font-mono', index === 1 ? 'text-landing-oxblood' : 'text-landing-muted')}>0{index + 1}</span>
              {index === 0 ? (
                <Link href="/cart" className={cn('text-landing-muted underline-offset-4 hover:text-landing-oxblood hover:underline', accountFocusRing)}>
                  {step}
                </Link>
              ) : (
                <span className={index === 1 ? 'text-landing-oxblood' : 'text-landing-muted/70'}>{step}</span>
              )}
            </li>
          ))}
        </ol>
      </header>

      <form onSubmit={handleSubmit} className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
        <div className="flex flex-col gap-10">
          {unavailableCount > 0 && !lockedItems ? (
            <CheckoutNotice title={`${unavailableCount} sản phẩm đã ngừng bán`}>
              <p>Những sản phẩm này vẫn nằm trong giỏ nhưng không được đưa vào đơn hàng này.</p>
            </CheckoutNotice>
          ) : null}

          {unpaidOrders.length > 0 && !lockedItems && !pendingCheckout ? (
            <CheckoutNotice title={`Bạn còn ${unpaidOrders.length} đơn chưa thanh toán`}>
              <p>Nếu đây là các món bạn đã đặt, hãy thanh toán đơn cũ thay vì đặt thêm đơn mới. Đơn quá hạn thanh toán sẽ tự hủy.</p>
              <ul className="divide-y divide-landing-line/60 border-y border-landing-line/60">
                {unpaidOrders.map((order) => (
                  <li key={order.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5">
                    <span className="text-xs">
                      <span className="font-mono text-landing-obsidian">{getOrderCode(order)}</span> ·{' '}
                      <span className="font-mono text-landing-obsidian">{formatCartPrice(getOrderTotal(order))}</span>
                      {order.paymentDueAt ? (
                        <>
                          {' '}· hạn <span className="font-mono">{formatOrderDateTime(order.paymentDueAt)}</span>
                        </>
                      ) : null}
                    </span>
                    <Link href={`/orders/${order.id}`} className={accountButtonClassName('outline', 'sm')}>
                      Thanh toán đơn này
                    </Link>
                  </li>
                ))}
              </ul>
            </CheckoutNotice>
          ) : null}

          {!canOrder && completeness ? (
            <CheckoutNotice title="Cần bổ sung số đo để đặt may">
              <p>
                Đơn may đo cần đủ số đo trong hồ sơ. Còn thiếu:{' '}
                <span className="text-landing-obsidian">{missingMeasurementLabels.join(' · ') || 'số đo bắt buộc'}</span>.
              </p>
              <Link href="/profile/measurements" className={accountButtonClassName('outline', 'sm')}>
                Bổ sung số đo
              </Link>
            </CheckoutNotice>
          ) : null}

          <CheckoutSection
            index={1}
            title="Địa chỉ giao hàng"
            description="Kiểm tra kỹ: không đổi được địa chỉ sau khi đặt hàng."
            action={
              <button
                type="button"
                onClick={() => setShowAddressForm((value) => !value)}
                className={accountButtonClassName('quiet', 'sm')}
              >
                {showAddressForm ? 'Đóng' : 'Thêm địa chỉ'}
              </button>
            }
          >
            {isLoadingAddresses ? <p className="text-sm text-landing-muted">Đang tải sổ địa chỉ...</p> : null}
            {!isLoadingAddresses && addresses.length === 0 && !showAddressForm ? (
              <p className="text-sm text-landing-muted">Bạn chưa có địa chỉ giao hàng. Thêm một địa chỉ để GHN báo phí giao.</p>
            ) : null}

            {addresses.length > 0 ? (
              <fieldset className="space-y-2.5">
                <legend className="sr-only">Chọn địa chỉ giao hàng</legend>
                {addresses.map((address) => (
                  <CheckoutOption
                    key={address.id}
                    name="shipping-address"
                    value={address.id}
                    checked={selectedAddressId === address.id}
                    onSelect={() => setSelectedAddressId(address.id)}
                  >
                    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-sm font-medium text-landing-obsidian">{address.recipientName}</span>
                      <span className="font-mono text-xs text-landing-obsidian">{address.phone}</span>
                      {address.isDefault ? (
                        <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">Mặc định</span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-landing-muted">{formatCheckoutAddress(address)}</span>
                  </CheckoutOption>
                ))}
              </fieldset>
            ) : null}

            {showAddressForm ? (
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
            ) : null}

            <div className="mt-6">
              <label htmlFor="checkout-note" className={accountLabelClassName}>
                Ghi chú giao hàng
              </label>
              <textarea
                id="checkout-note"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Ví dụ: giao giờ hành chính"
                className={cn(accountInputClassName, 'mt-2 h-auto min-h-20 resize-y py-2.5 leading-relaxed')}
              />
            </div>
          </CheckoutSection>

          <CheckoutSection index={2} title="Phương thức thanh toán" description="Đơn được xác nhận khi cổng thanh toán báo đã nhận tiền.">
            <DeliveryOptions paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
          </CheckoutSection>
        </div>

        <CheckoutSummary
          items={items}
          totalPrice={orderQuote?.itemsTotal ?? totalPrice}
          saleDiscount={Math.max(0, (orderQuote?.listItemsTotal ?? orderQuote?.itemsTotal ?? totalPrice) - (orderQuote?.itemsTotal ?? totalPrice))}
          shippingFee={shippingFee}
          discount={discount}
          total={total}
          isSubmitting={isOrderBlocked}
          submitLabel={submitLabel}
          isPricingLoading={isPricingLoading || isNotePending}
          pricingError={pricingError}
          couponError={couponError}
          coupon={coupon}
          setCoupon={handleCouponChange}
          setDiscount={handleDiscountStateChange}
          handleApplyCoupon={handleApplyCoupon}
        />
      </form>

      {pendingCheckout ? (
        <PaymentDialog
          checkoutResult={pendingCheckout}
          total={total}
          orderHref={pendingOrderId ? `/orders/${pendingOrderId}` : null}
          onClose={() => {
            if (pendingCheckout.provider === 'ZALOPAY') {
              toast.info('Đơn hàng đã được tạo. Bạn có thể tiếp tục thanh toán trong trang chi tiết đơn hàng.');
            }
            closePayment();
          }}
          onPaid={refreshAfterPayment}
        />
      ) : null}
    </CheckoutFrame>
  );
}

const CHECKOUT_STEPS = ['Giỏ hàng', 'Giao hàng & thanh toán', 'Hoàn tất'];

function CheckoutFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-paper-texture">
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-6 md:px-8 md:pt-10">{children}</div>
    </div>
  );
}

function CheckoutState({
  title,
  description,
  action,
  tone = 'default',
}: {
  title: string;
  description: string;
  action: React.ReactNode;
  tone?: 'default' | 'error';
}) {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center border border-landing-line bg-landing-ivory/60 px-6 py-16 text-center">
      <p className={accountLabelClassName}>Đặt hàng</p>
      <h1 className={cn('mt-3 font-display text-3xl leading-tight', tone === 'error' ? 'text-destructive' : 'text-landing-obsidian')}>{title}</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-landing-muted">{description}</p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        {action}
        <Link href="/cart" className={accountButtonClassName('outline')}>
          Về giỏ hàng
        </Link>
      </div>
    </div>
  );
}

/** Ghi chú có vạch brass bên trái cho việc khách cần xử lý trước khi đặt. */
function CheckoutNotice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-landing-brass bg-landing-ivory/70 px-4 py-3">
      <p className="text-sm font-medium text-landing-obsidian">{title}</p>
      <div className="mt-1.5 space-y-3 text-sm leading-relaxed text-landing-muted">{children}</div>
    </div>
  );
}

function CheckoutSection({
  index,
  title,
  description,
  action,
  children,
}: {
  index: number;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-landing-line pt-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h2 className="flex items-baseline gap-3 font-display text-[1.375rem] leading-tight text-landing-obsidian">
            <span className="font-mono text-sm text-landing-brass-ink">0{index}</span>
            {title}
          </h2>
          {description ? <p className="mt-1 text-sm text-landing-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

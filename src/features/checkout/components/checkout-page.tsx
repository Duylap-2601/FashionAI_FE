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
import { useCreateOrder } from '@/features/orders/hooks/useOrders';
import { quoteOrder } from '@/features/orders/services/mutations';
import type { OrderQuote } from '@/features/orders/types/orders';
import { useCheckout, usePaymentStatus } from '@/features/payments/hooks/usePayments';
import type { CheckoutResponse } from '@/features/payments/types/payments';
import { AddressForm } from '@/features/profile/components/address-form';
import {
  AccountDialog,
  accountButtonClassName,
  accountFocusRing,
  accountInputClassName,
  accountLabelClassName,
} from '@/features/profile/components/account-ui';
import { useAddressMutations, useUserAddresses } from '@/features/profile/hooks/use-addresses';
import { toCommerceParams, trackEvent } from '@/lib/analytics';
import { getErrorData, getErrorMessage, isRecord } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { AlertCircle, ArrowRight, CheckCircle2, Copy, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
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

  const closeBankTransfer = () => {
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

      {pendingCheckout?.provider === 'ZALOPAY' ? (
        <ZaloPayCheckoutDialog
          checkoutResult={pendingCheckout}
          orderId={pendingOrderId}
          total={total}
          onClose={() => {
            setPendingCheckout(null);
            setPendingOrderId(null);
            setLockedItems(null);
            toast.info('Đơn hàng đã được tạo. Bạn có thể tiếp tục thanh toán trong trang chi tiết đơn hàng.');
          }}
          onPaid={refreshAfterPayment}
        />
      ) : null}

      <AccountDialog
        open={Boolean(pendingCheckout && pendingCheckout.provider !== 'ZALOPAY')}
        onOpenChange={(open) => {
          if (!open) closeBankTransfer();
        }}
        eyebrow="Thanh toán"
        title="Chuyển khoản ngân hàng"
        description="Ghi đúng nội dung dưới đây để hệ thống tự xác nhận thanh toán."
      >
        {pendingCheckout ? (
          <div className="flex flex-col gap-5">
            <dl className="border border-landing-line bg-landing-ivory/60">
              <div className="border-b border-landing-line/70 px-4 py-3">
                <dt className={accountLabelClassName}>Nội dung chuyển khoản</dt>
                <dd className="mt-2 flex items-center justify-between gap-3">
                  <span className="break-all font-mono text-xl text-landing-oxblood">
                    {pendingCheckout.extra?.invoiceNumber || `FAI${pendingCheckout.orderCode ?? ''}`}
                  </span>
                  <button type="button" onClick={copyTransferContent} className={accountButtonClassName('outline', 'sm')}>
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" /> Sao chép
                  </button>
                </dd>
              </div>
              <div className="px-4 py-3">
                <dt className={accountLabelClassName}>Số tiền</dt>
                <dd className="mt-2 font-mono text-xl text-landing-obsidian">{formatCartPrice(total)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => {
                const result = pendingCheckout;
                setPendingCheckout(null);
                setPendingOrderId(null);
                if (result) proceedToGateway(result);
              }}
              className={cn(accountButtonClassName('primary'), 'w-full')}
            >
              Mở cổng chuyển khoản <ExternalLink className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
            {pendingOrderId ? (
              <Link
                href={`/orders/${pendingOrderId}`}
                className={cn('text-center text-sm text-landing-muted underline-offset-4 hover:text-landing-oxblood hover:underline', accountFocusRing)}
              >
                Để thanh toán sau, xem đơn hàng
              </Link>
            ) : null}
          </div>
        ) : null}
      </AccountDialog>
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
    <AccountDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      eyebrow="Thanh toán"
      title="ZaloPay"
      description="Quét QR hoặc mở ZaloPay. Giữ trang này, đơn tự cập nhật khi thanh toán xong."
      className="sm:max-w-[520px]"
    >
      <div className="flex flex-col gap-5">
        <div className="grid items-center gap-5 sm:grid-cols-[172px_minmax(0,1fr)]">
          <div className="flex items-center justify-center border border-landing-line bg-white p-3">
            {qrValue ? (
              <QRCodeSVG value={qrValue} size={148} level="M" includeMargin />
            ) : (
              <div className="flex h-[148px] w-[148px] items-center justify-center bg-landing-paper text-center text-xs text-landing-muted">
                Không có dữ liệu QR
              </div>
            )}
          </div>
          <dl className="space-y-3">
            <div>
              <dt className={accountLabelClassName}>Mã đơn</dt>
              <dd className="mt-1 font-mono text-lg text-landing-obsidian">ORD-{checkoutResult.orderCode}</dd>
            </div>
            <div>
              <dt className={accountLabelClassName}>Số tiền</dt>
              <dd className="mt-1 font-mono text-xl text-landing-oxblood">{formatCartPrice(total)}</dd>
            </div>
          </dl>
        </div>

        <button
          type="button"
          onClick={openGateway}
          disabled={!checkoutResult.checkoutUrl}
          className={cn(accountButtonClassName('primary'), 'w-full')}
        >
          Mở ZaloPay <ExternalLink className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </button>

        <div role="status" className="border-t border-landing-line/70 pt-4 text-sm">
          {isPaid ? (
            <p className="flex items-center gap-2 text-landing-sage-ink">
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} /> Thanh toán thành công, đang chuyển trang...
            </p>
          ) : isFailed ? (
            <p className="flex items-start gap-2 text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
              {payment?.failureReason || 'Thanh toán thất bại hoặc link đã hết hạn. Vui lòng tạo lại thanh toán.'}
            </p>
          ) : isRefundRequired ? (
            <p className="flex items-start gap-2 text-landing-brass-ink">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
              Đã nhận tiền nhưng đơn chưa ghi nhận được thanh toán. Khoản tiền sẽ được hoàn lại.
            </p>
          ) : (
            <p className="flex items-center gap-2 text-landing-muted">
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
              {isLoading ? 'Đang kiểm tra trạng thái thanh toán...' : 'Đang chờ ZaloPay xác nhận thanh toán...'}
            </p>
          )}
        </div>

        {orderId ? (
          <Link
            href={`/orders/${orderId}`}
            className={cn('text-center text-sm text-landing-muted underline-offset-4 hover:text-landing-oxblood hover:underline', accountFocusRing)}
          >
            Xem chi tiết đơn hàng
          </Link>
        ) : null}
      </div>
    </AccountDialog>
  );
}

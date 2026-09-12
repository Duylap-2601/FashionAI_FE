'use client';

import { CheckoutSummary } from '@/features/checkout/components/checkout-summary';
import { DeliveryOptions } from '@/features/checkout/components/delivery-options';
import { ShippingAddressForm } from '@/features/checkout/components/shipping-address-form';
import { useGhnDistricts, useGhnProvinces, useGhnWards } from '@/features/checkout/hooks/useGhnLocations';
import { useCart } from '@/features/cart/store/cartStore';
import { useMeasurementsCompleteness } from '@/features/measurements/hooks/useMeasurementsCompleteness';
import { useCreateOrder } from '@/features/orders/hooks/useOrders';
import { quoteOrder } from '@/features/orders/services/mutations';
import type { OrderQuote } from '@/features/orders/types/orders';
import { useCheckout } from '@/features/payments/hooks/usePayments';
import type { CheckoutResponse } from '@/features/payments/types/payments';
import { useUserProfile } from '@/features/profile/hooks/use-profile';
import { getErrorData, getErrorMessage, isRecord } from '@/lib/errors';
import { ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems: items, totalPrice, clearCart } = useCart();
  const { profile } = useUserProfile();
  const { canOrder, completeness } = useMeasurementsCompleteness();
  const { createOrderAsync, isSubmitting } = useCreateOrder();
  const { checkout, isLoading: isCheckoutLoading } = useCheckout();

  const [paymentMethod, setPaymentMethod] = useState<'bank'>('bank');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [orderQuote, setOrderQuote] = useState<OrderQuote | null>(null);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [pendingCheckout, setPendingCheckout] = useState<CheckoutResponse | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [provinceId, setProvinceId] = useState<number | ''>('');
  const [districtId, setDistrictId] = useState<number | ''>('');
  const [wardCode, setWardCode] = useState('');
  const [notes, setNotes] = useState('');

  const { provinces, isLoading: isLoadingProvinces, isError: isProvincesError } = useGhnProvinces();
  const { districts, isLoading: isLoadingDistricts, isError: isDistrictsError } = useGhnDistricts(provinceId);
  const { wards, isLoading: isLoadingWards, isError: isWardsError } = useGhnWards(districtId);

  const currentProvince = useMemo(
    () => provinces.find((province) => province.id === provinceId) || null,
    [provinceId, provinces],
  );
  const currentDistrict = useMemo(
    () => districts.find((district) => district.id === districtId) || null,
    [districtId, districts],
  );
  const currentWard = useMemo(
    () => wards.find((ward) => ward.code === wardCode) || null,
    [wardCode, wards],
  );

  useEffect(() => {
    if (profile?.name) setFullName(profile.name);
    if (profile?.phone) setPhone(profile.phone);
    if (profile?.address) setAddressDetail(profile.address);
  }, [profile]);

  useEffect(() => {
    if (provinceId || provinces.length === 0) return;
    const cityLower = profile?.city?.toLowerCase() || '';
    const matched = cityLower
      ? provinces.find((province) => cityLower.includes(province.name.toLowerCase()) || province.name.toLowerCase().includes(cityLower))
      : null;
    setProvinceId(matched?.id || provinces[0].id);
  }, [profile?.city, provinceId, provinces]);

  useEffect(() => {
    setDistrictId('');
    setWardCode('');
  }, [provinceId]);

  useEffect(() => {
    if (districtId || districts.length === 0) return;
    setDistrictId(districts[0].id);
  }, [districtId, districts]);

  useEffect(() => {
    setWardCode('');
  }, [districtId]);

  useEffect(() => {
    if (wardCode || wards.length === 0) return;
    setWardCode(wards[0].code);
  }, [wardCode, wards]);

  useEffect(() => {
    if (isProvincesError) toast.error('Không thể tải danh sách Tỉnh/Thành từ GHN. Vui lòng thử lại sau.');
  }, [isProvincesError]);

  useEffect(() => {
    if (isDistrictsError) toast.error('Không thể tải danh sách Quận/Huyện từ GHN. Vui lòng thử lại sau.');
  }, [isDistrictsError]);

  useEffect(() => {
    if (isWardsError) toast.error('Không thể tải dữ liệu Phường/Xã từ GHN để tính phí giao hàng. Vui lòng thử lại sau.');
  }, [isWardsError]);

  useEffect(() => {
    let isMounted = true;

    async function loadQuote() {
      if (!currentProvince || !currentDistrict || !currentWard || items.length === 0) {
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
          shippingInfo: {
            name: fullName || 'Customer',
            phone: phone || '0000000000',
            address: addressDetail || 'Pending address',
            ghnProvinceId: currentProvince.id,
            ghnDistrictId: currentDistrict.id,
            ghnWardCode: currentWard.code,
          },
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
        setPricingError(getErrorMessage(error, 'Không thể tính tổng đơn hàng. Vui lòng kiểm tra địa chỉ hoặc mã giảm giá.'));
      } finally {
        if (isMounted) setIsPricingLoading(false);
      }
    }

    loadQuote();

    return () => {
      isMounted = false;
    };
  }, [addressDetail, appliedCoupon, currentDistrict, currentProvince, currentWard, fullName, items, phone]);

  const shippingFee = orderQuote?.shippingFee ?? 0;
  const total = orderQuote?.totalAmount ?? Math.max(0, totalPrice);
  const isOrderBlocked = isSubmitting || isCheckoutLoading || isPricingLoading || !!pricingError || !orderQuote;

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

    clearCart();

    if (checkoutResult.extra?.formAction && checkoutResult.extra?.formFields) {
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

    if (!currentProvince || !currentDistrict || !currentWard) {
      toast.error('Vui lòng chọn Tỉnh/Thành phố, Quận/Huyện và Phường/Xã giao hàng.');
      return;
    }

    const fullAddress = `${addressDetail}, ${currentWard.name}, ${currentDistrict.name}, ${currentProvince.name}`;

    try {
      const order = await createOrderAsync({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          price: item.price,
        })),
        shippingInfo: {
          name: fullName,
          phone,
          address: fullAddress,
          notes,
          ghnProvinceId: currentProvince.id,
          ghnDistrictId: currentDistrict.id,
          ghnWardCode: currentWard.code,
        },
        paymentMethod: 'BANK_TRANSFER',
        couponCode: appliedCoupon || undefined,
        totalAmount: orderQuote.totalAmount,
      });
      const orderId = order?.id;

      if (!orderId) {
        throw new Error('Không nhận được ID đơn hàng từ server');
      }

      try {
        const checkoutResult = await checkout({ orderId, provider: 'SEPAY' });
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
        toast.error(`Lỗi tạo đơn: ${getErrorMessage(error, 'Đã xảy ra lỗi khi tạo đơn hàng.')}`);
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
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl animate-in fade-in duration-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-body-md font-bold text-amber-900 mb-1">
                      Cần bổ sung số đo cơ thể để hoàn tất đơn may đo
                    </h3>
                    <p className="text-[13px] text-amber-700 mb-3 leading-relaxed">
                      Sản phẩm bạn chọn là hình thức may đo riêng. Tài khoản của bạn hiện còn thiếu một số thông số bắt buộc:
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {completeness.byCategory.flatMap(c => c.missing || []).map((m, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-amber-100/80 text-amber-800 rounded-lg text-[12px] font-semibold border border-amber-200">
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

            <ShippingAddressForm
              fullName={fullName}
              setFullName={setFullName}
              phone={phone}
              setPhone={setPhone}
              addressDetail={addressDetail}
              setAddressDetail={setAddressDetail}
              provinceId={provinceId}
              setProvinceId={setProvinceId}
              provinces={provinces}
              isLoadingProvinces={isLoadingProvinces}
              districtId={districtId}
              setDistrictId={setDistrictId}
              districts={districts}
              isLoadingDistricts={isLoadingDistricts}
              wardCode={wardCode}
              setWardCode={setWardCode}
              wards={wards}
              isLoadingWards={isLoadingWards}
              notes={notes}
              setNotes={setNotes}
            />

            <DeliveryOptions paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

            <div className="lg:hidden mt-8">
              <button
                type="submit"
                disabled={isOrderBlocked}
                className="w-full h-[52px] bg-brand-navy text-white text-body-md font-bold rounded-xl flex items-center justify-between px-6 hover:bg-brand-navy/90 transition-colors disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng'}</span>
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
            isPricingLoading={isPricingLoading}
            pricingError={pricingError}
            coupon={coupon}
            setCoupon={handleCouponChange}
            setDiscount={handleDiscountStateChange}
            handleApplyCoupon={handleApplyCoupon}
          />
        </form>
      </div>

      {pendingCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-[18px] font-bold text-brand-navy mb-2">Ghi nhớ mã đơn hàng của bạn</h3>
            <p className="text-body-sm text-neutral-600 mb-4">
              Khi chuyển khoản, vui lòng ghi đúng nội dung dưới đây để hệ thống tự động xác nhận thanh toán.
            </p>
            <div className="bg-brand-cream rounded-xl p-4 mb-4">
              <p className="text-label-sm text-neutral-500 mb-1">Nội dung chuyển khoản</p>
              <p className="text-[20px] font-bold text-brand-navy font-mono">
                {pendingCheckout.extra?.invoiceNumber || `FAI${pendingCheckout.orderCode ?? ''}`}
              </p>
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
              Tiếp tục thanh toán
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

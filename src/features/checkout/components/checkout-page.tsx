'use client';
import { getErrorData, getErrorMessage, isRecord } from '@/lib/errors';


import { CheckoutSummary } from '@/features/checkout/components/checkout-summary';
import { DeliveryOptions } from '@/features/checkout/components/delivery-options';
import { PaymentMethodSelector } from '@/features/checkout/components/payment-method-selector';
import { ShippingAddressForm } from '@/features/checkout/components/shipping-address-form';
import { useCart } from '@/features/cart/store/cartStore';
import { VIETNAM_PROVINCES } from '@/features/checkout/constants/vietnam-provinces';
import { calculateShippingFee } from '@/features/checkout/services/shipping';
import { useMeasurementsCompleteness } from '@/features/measurements/hooks/useMeasurementsCompleteness';
import { useCreateOrder } from '@/features/orders/hooks/useOrders';
import { useCheckout } from '@/features/payments/hooks/usePayments';
import type { CheckoutResponse } from '@/features/payments/types/payments';
import { useUserProfile } from '@/features/profile/hooks/use-profile';
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
  const [shippingFeeQuote, setShippingFeeQuote] = useState(0);
  const [pendingCheckout, setPendingCheckout] = useState<CheckoutResponse | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // Form fields state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [provinceId, setProvinceId] = useState('hcm');
  const [districtId, setDistrictId] = useState('q1');
  const [notes, setNotes] = useState('');

  const currentProvince = useMemo(() => {
    return VIETNAM_PROVINCES.find(p => p.id === provinceId) || VIETNAM_PROVINCES[0];
  }, [provinceId]);

  const availableDistricts = currentProvince.districts;
  const currentDistrict = availableDistricts.find(d => d.id === districtId);

  // Prefill profile data if available
  useEffect(() => {
    if (profile) {
      if (profile.name) setFullName(profile.name);
      if (profile.phone) setPhone(profile.phone);
      if (profile.address) setAddressDetail(profile.address);
      if (profile.city) {
        const cityLower = profile.city.toLowerCase();
        const matched = VIETNAM_PROVINCES.find(p =>
          cityLower.includes(p.name.toLowerCase()) || p.id === cityLower
        );
        if (matched) {
          setProvinceId(matched.id);
          setDistrictId(matched.districts[0]?.id || '');
        }
      }
    }
  }, [profile]);

  useEffect(() => {
    const ghnDistrictId = (currentDistrict as { ghnDistrictId?: number } | undefined)?.ghnDistrictId;
    const ghnWardCode = (currentDistrict as { ghnWardCode?: string } | undefined)?.ghnWardCode;
    if (!ghnDistrictId || !ghnWardCode) {
      setShippingFeeQuote(0);
      return;
    }

    let cancelled = false;
    calculateShippingFee({
      toDistrictId: ghnDistrictId,
      toWardCode: ghnWardCode,
      weight: Math.max(500, items.reduce((sum, item) => sum + item.quantity * 500, 0)),
      length: 25,
      width: 20,
      height: 8,
      insuranceValue: totalPrice,
    })
      .then((quote) => {
        if (!cancelled) setShippingFeeQuote(quote.totalFee);
      })
      .catch(() => {
        if (!cancelled) setShippingFeeQuote(0);
      });

    return () => {
      cancelled = true;
    };
  }, [currentDistrict, items, totalPrice]);

  const shippingFee = shippingFeeQuote;
  const total = Math.max(0, totalPrice - discount + shippingFee);

  const handleApplyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;

    if (code === 'WELCOME') {
      const disc = Math.min(100000, totalPrice);
      setDiscount(disc);
      toast.success('Áp dụng mã WELCOME thành công!');
    } else if (code === 'STALE10') {
      const disc = Math.round(totalPrice * 0.1);
      setDiscount(disc);
      toast.success('Áp dụng mã STALE10 thành công!');
    } else if (code === 'FASHIONAI') {
      const disc = Math.min(150000, totalPrice);
      setDiscount(disc);
      toast.success('Áp dụng mã FASHIONAI thành công!');
    } else {
      toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    }
  };

  const proceedToGateway = (checkoutResult: CheckoutResponse) => {
    if (!checkoutResult.checkoutUrl) {
      toast.error('Không nhận được link thanh toán');
      return;
    }

    clearCart();

    // Case 1: Backend explicitly returned formAction and formFields for POST (SePay)
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

    // Case 2: Backend returned a SePay checkout/init URL with query params (SePay gateway REQUIRES POST)
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

    // Case 3: Standard direct GET redirect (PayOS, VNPAY, Momo, etc.)
    window.location.href = checkoutResult.checkoutUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting || isCheckoutLoading) return;

    if (!canOrder && completeness) {
      const missingLabels: string[] = [];
      completeness.byCategory.forEach(cat => {
        if (!cat.complete && cat.missing) {
          cat.missing.forEach(m => {
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

    const formattedProvince = currentProvince.name;
    const formattedDistrict = currentDistrict ? currentDistrict.name : '';
    const ghnDistrictId = (currentDistrict as { ghnDistrictId?: number } | undefined)?.ghnDistrictId;
    const ghnWardCode = (currentDistrict as { ghnWardCode?: string } | undefined)?.ghnWardCode;
    const fullAddress = `${addressDetail}, ${formattedDistrict ? formattedDistrict + ', ' : ''}${formattedProvince}`;

    const orderPayload = {
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        color: item.color,
        price: item.price,
      })),
      shippingInfo: {
        name: fullName,
        phone: phone,
        address: fullAddress,
        notes: notes,
        provinceName: formattedProvince,
        districtName: formattedDistrict,
        ghnDistrictId: ghnDistrictId,
        ghnWardCode: ghnWardCode,
      },
      paymentMethod: 'BANK_TRANSFER' as const,
      couponCode: discount > 0 ? coupon.toUpperCase() : undefined,
      discountAmount: discount || undefined,
      shippingFee: shippingFee,
      totalAmount: total,
    };

    try {
      const order = await createOrderAsync(orderPayload);
      const orderId = order?.id;

      if (!orderId) {
        throw new Error('Không nhận được ID đơn hàng từ server');
      }

      // Bank/SePay/PayOS: create checkout link, show transfer code, then redirect to gateway
      try {
        const checkoutResult = await checkout({ orderId, provider: 'SEPAY' });

        if (checkoutResult.checkoutUrl) {
          setPendingOrderId(orderId);
          setPendingCheckout(checkoutResult);
        } else {
          throw new Error('Không nhận được link thanh toán');
        }
      } catch (checkoutError) {
        // Order created but checkout failed - don't clear cart, redirect to order detail
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
        const msg = getErrorMessage(error, 'Đã xảy ra lỗi khi tạo đơn hàng.');
        toast.error(`Lỗi tạo đơn: ${Array.isArray(msg) ? msg[0] : msg}`);
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

        {/* Progress Steps */}
        <div className="flex items-center gap-3 text-label-sm font-medium mb-12">
          <span className="text-brand-navy font-bold">1. Thông tin giao hàng</span>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
          <span className="text-brand-navy font-bold">2. Thanh toán</span>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
          <span className="text-neutral-400">3. Hoàn tất đơn</span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[60%_1fr] gap-12 items-start">

          {/* LEFT - Form */}
          <div className="flex flex-col gap-10">

            {/* Incomplete Measurements Notice */}
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
                      Sản phẩm bạn chọn là hình thức may đo riêng (Made-to-Measure). Tài khoản của bạn hiện còn thiếu một số thông số bắt buộc:
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

            {/* Section 1 */}
            <ShippingAddressForm
              fullName={fullName}
              setFullName={setFullName}
              phone={phone}
              setPhone={setPhone}
              addressDetail={addressDetail}
              setAddressDetail={setAddressDetail}
              provinceId={provinceId}
              setProvinceId={setProvinceId}
              setDistrictId={setDistrictId}
              districtId={districtId}
              availableDistricts={availableDistricts}
              notes={notes}
              setNotes={setNotes}
            />

            {/* Section 2 */}
            <DeliveryOptions paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

            {/* Section 3 */}
            <PaymentMethodSelector coupon={coupon} setCoupon={setCoupon} discount={discount} setDiscount={setDiscount} handleApplyCoupon={handleApplyCoupon} />

            {/* Mobile Submit Button */}
            <div className="lg:hidden mt-8">
              <button type="submit" disabled={isSubmitting} className="w-full h-[52px] bg-brand-navy text-white text-body-md font-bold rounded-xl flex items-center justify-between px-6 hover:bg-brand-navy/90 transition-colors disabled:opacity-50">
                <span>{isSubmitting ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng'}</span>
                <span>{total.toLocaleString('vi-VN')}đ</span>
              </button>
            </div>

          </div>

          {/* RIGHT - Order Summary */}
          <CheckoutSummary items={items} totalPrice={totalPrice} shippingFee={shippingFee} discount={discount} total={total} isSubmitting={isSubmitting} />

        </form>
      </div>

      {pendingCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-[18px] font-bold text-brand-navy mb-2">Ghi nhớ mã đơn hàng của bạn</h3>
            <p className="text-body-sm text-neutral-600 mb-4">
              Khi chuyển khoản, vui lòng ghi đúng nội dung dưới đây để hệ thống tự động xác nhận thanh toán. Nếu nội dung chuyển khoản sai, đơn hàng có thể không được cập nhật dù bạn đã chuyển tiền thành công.
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

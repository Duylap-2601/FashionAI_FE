'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, CreditCard, Building2, Sparkles, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/store/cartStore';
import { useUserProfile } from '@/hooks/useMeasurements';
import { useCreateOrder } from '@/hooks/useOrders';
import { useCheckout } from '@/hooks/usePayments';
import { VIETNAM_PROVINCES } from '@/lib/vietnam-provinces';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems: items, totalPrice, clearCart } = useCart();
  const { profile } = useUserProfile();
  const { createOrderAsync, isSubmitting } = useCreateOrder();
  const { checkout, isLoading: isCheckoutLoading } = useCheckout();

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank'>('cod');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

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

  const shippingFee = paymentMethod === 'cod' ? 50000 : 0;
  const total = Math.max(0, totalPrice - discount + shippingFee);

  const handleApplyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;

    if (code === 'WELCOME') {
      const disc = Math.min(100000, totalPrice);
      setDiscount(disc);
      setCouponMessage('Mã WELCOME: Giảm 100.000đ');
      toast.success('Áp dụng mã WELCOME thành công!');
    } else if (code === 'STALE10') {
      const disc = Math.round(totalPrice * 0.1);
      setDiscount(disc);
      setCouponMessage('Mã STALE10: Giảm 10%');
      toast.success('Áp dụng mã STALE10 thành công!');
    } else if (code === 'FASHIONAI') {
      const disc = Math.min(150000, totalPrice);
      setDiscount(disc);
      setCouponMessage('Mã FASHIONAI: Giảm 150.000đ');
      toast.success('Áp dụng mã FASHIONAI thành công!');
    } else {
      toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting || isCheckoutLoading) return;

    const formattedProvince = currentProvince.name;
    const currentDistrict = availableDistricts.find(d => d.id === districtId);
    const formattedDistrict = currentDistrict ? currentDistrict.name : '';
    const fullAddress = `${addressDetail}, ${formattedDistrict ? formattedDistrict + ', ' : ''}${formattedProvince}`;

    const orderPayload = {
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
      })),
      shippingInfo: {
        name: fullName,
        phone: phone,
        address: fullAddress,
        notes: notes,
      },
      paymentMethod: (paymentMethod === 'cod' ? 'COD' : 'Bank') as 'COD' | 'Bank',
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

      // COD: redirect to success page directly
      if (paymentMethod === 'cod') {
        clearCart();
        toast.success('Đặt hàng thành công!');
        router.push(`/orders/${orderId}/success`);
        return;
      }

      // Bank/SePay/PayOS: create checkout link and redirect to payment gateway
      try {
        const checkoutResult = await checkout({ orderId, provider: 'SEPAY' });
        
        if (checkoutResult.checkoutUrl) {
          clearCart();
          // SePay returns form fields for POST redirect, PayOS returns direct URL
          if (checkoutResult.extra?.formAction && checkoutResult.extra?.formFields) {
            // SePay: submit form via POST
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
          } else {
            // PayOS: direct GET redirect
            window.location.href = checkoutResult.checkoutUrl;
          }
        } else {
          throw new Error('Không nhận được link thanh toán');
        }
      } catch (checkoutError) {
        // Order created but checkout failed - don't clear cart, redirect to order detail
        console.error('Checkout failed, order still pending:', checkoutError);
        toast.error('Tạo đơn hàng thành công nhưng không thể chuyển tới cổng thanh toán. Vui lòng thanh toán lại từ trang đơn hàng.');
        router.push(`/orders/${orderId}`);
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại.');
      // Don't clear cart, don't redirect to fake order
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-brand-cream min-h-screen py-20 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm max-w-md w-full text-center">
          <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-4" strokeWidth={1} />
          <h2 className="text-[20px] font-bold text-brand-navy mb-2">Giỏ hàng trống</h2>
          <p className="text-neutral-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng để thực hiện thanh toán.</p>
          <Link href="/products" className="inline-flex items-center justify-center px-6 py-3 bg-brand-navy text-white text-body-sm font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors">
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

            {/* Section 1 */}
            <section>
              <h2 className="text-[20px] font-bold text-brand-navy mb-6">Thông tin giao hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-body-sm font-medium text-brand-navy mb-1.5">Họ và tên *</label>
                  <input required type="text" placeholder="Nguyễn Văn A" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all" />
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-brand-navy mb-1.5">Số điện thoại *</label>
                  <input required type="tel" placeholder="090 123 4567" value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-body-sm font-medium text-brand-navy mb-1.5">Địa chỉ chi tiết *</label>
                <input required type="text" placeholder="Số nhà, Tên đường, Phường/Xã..." value={addressDetail} onChange={e => setAddressDetail(e.target.value)} className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-body-sm font-medium text-brand-navy mb-1.5">Tỉnh/Thành phố *</label>
                  <select
                    required
                    value={provinceId}
                    onChange={e => {
                      const newProvId = e.target.value;
                      setProvinceId(newProvId);
                      const prov = VIETNAM_PROVINCES.find(p => p.id === newProvId);
                      if (prov && prov.districts.length > 0) {
                        setDistrictId(prov.districts[0].id);
                      }
                    }}
                    className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all cursor-pointer"
                  >
                    {VIETNAM_PROVINCES.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-brand-navy mb-1.5">Quận/Huyện *</label>
                  <select
                    required
                    value={districtId}
                    onChange={e => setDistrictId(e.target.value)}
                    className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all cursor-pointer"
                  >
                    {availableDistricts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-brand-navy mb-1.5">Ghi chú cho người giao hàng</label>
                <textarea rows={3} placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all resize-none"></textarea>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mt-6">
              <div className="flex flex-col items-center">
                <div className="bg-[#f0ece5] p-6 rounded-[24px] border border-[#e5dfd5] w-full shadow-sm">
                  <h2 className="text-[20px] font-bold text-brand-navy mb-5">Phương thức thanh toán</h2>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className={`relative p-4 rounded-[16px] cursor-pointer transition-all flex items-center gap-4 bg-white border ${paymentMethod === 'cod' ? 'border-brand-navy' : 'border-transparent hover:border-neutral-200'} shadow-sm`}>
                        <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="peer sr-only" />
                        <div className={`w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center ${paymentMethod === 'cod' ? 'border-brand-navy' : 'border-[#b5b0a8]'}`}>
                          {paymentMethod === 'cod' && <div className="w-[10px] h-[10px] rounded-full bg-brand-navy"></div>}
                        </div>
                        <CreditCard className="w-5 h-5 text-brand-navy" />
                        <span className="text-[15px] font-medium text-brand-navy">Thanh toán khi nhận hàng (COD)</span>
                      </label>
                      {paymentMethod === 'cod' && (
                        <div className="text-[12px] text-[#A67D44] font-semibold px-4 py-2 bg-[#FDFBF7] border border-[#F5EAD4] rounded-xl animate-in slide-in-from-top-1 duration-200">
                          ⚠️ Bắt buộc Cọc 50% và thu phí ship 50.000 VNĐ nếu chọn COD
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className={`relative p-4 rounded-[16px] cursor-pointer transition-all flex items-center gap-4 bg-white border ${paymentMethod === 'bank' ? 'border-brand-navy' : 'border-transparent hover:border-neutral-200'} shadow-sm`}>
                        <input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="peer sr-only" />
                        <div className={`w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center ${paymentMethod === 'bank' ? 'border-brand-navy' : 'border-[#b5b0a8]'}`}>
                          {paymentMethod === 'bank' && <div className="w-[10px] h-[10px] rounded-full bg-brand-navy"></div>}
                        </div>
                        <Building2 className="w-5 h-5 text-brand-navy" />
                        <span className="text-[15px] font-medium text-brand-navy">Chuyển khoản ngân hàng (QR Pay / VietQR / SePay)</span>
                      </label>
                      {paymentMethod === 'bank' && (
                        <div className="text-[12px] text-green-700 font-semibold px-4 py-3 bg-green-50 border border-green-200 rounded-xl animate-in slide-in-from-top-1 duration-200 flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>Miễn phí vận chuyển (Freeship) khi Chuyển khoản 100%</span>
                          </div>
                          <p className="text-[11px] text-neutral-600 pl-5">Sau khi bấm &quot;Xác nhận đặt hàng&quot;, hệ thống sẽ cung cấp mã QR chuyển khoản chính xác.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-[20px] font-bold text-brand-navy mb-6">Mã giảm giá</h2>
              <div className="flex gap-3 max-w-[400px]">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Nhập mã giảm giá..."
                  className="flex-1 h-[48px] px-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all uppercase"
                  disabled={discount > 0}
                />
                {discount > 0 ? (
                  <button type="button" onClick={() => { setDiscount(0); setCoupon('') }} className="px-6 h-[48px] border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors">
                    Hủy
                  </button>
                ) : (
                  <button type="button" onClick={handleApplyCoupon} className="px-6 h-[48px] bg-brand-navy text-white font-medium rounded-xl hover:bg-brand-navy/90 transition-colors">
                    Áp dụng
                  </button>
                )}
              </div>
              {discount > 0 && (
                <p className="text-[13px] text-semantic-success mt-2">✓ Đã áp dụng mã giảm giá 100,000đ</p>
              )}
            </section>

            {/* Mobile Submit Button */}
            <div className="lg:hidden mt-8">
              <button type="submit" disabled={isSubmitting} className="w-full h-[52px] bg-brand-navy text-white text-body-md font-bold rounded-xl flex items-center justify-between px-6 hover:bg-brand-navy/90 transition-colors disabled:opacity-50">
                <span>{isSubmitting ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng'}</span>
                <span>{total.toLocaleString('vi-VN')}đ</span>
              </button>
            </div>

          </div>

          {/* RIGHT - Order Summary */}
          <div className="lg:sticky lg:top-[100px]">
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-[20px] font-bold text-brand-navy mb-6">Đơn hàng của bạn</h2>

              <div className="flex flex-col gap-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="w-[64px] h-[64px] object-cover rounded-lg bg-neutral-100" />
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-body-sm font-medium text-brand-navy line-clamp-1">{item.name}</h3>
                      <p className="text-[12px] text-neutral-500">Màu: {item.color} | Size: {item.size}</p>
                    </div>
                    <div className="text-body-sm font-medium text-brand-navy">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full h-px bg-neutral-200 mb-4"></div>

              <div className="flex flex-col gap-3 mb-4">
                <div className="flex justify-between text-body-sm text-neutral-600">
                  <span>Tạm tính</span>
                  <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-body-sm text-neutral-600">
                  <span>Vận chuyển</span>
                  {shippingFee === 0 ? (
                    <span className="text-semantic-success font-medium">Miễn phí</span>
                  ) : (
                    <span>{shippingFee.toLocaleString('vi-VN')}đ</span>
                  )}
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-body-sm text-semantic-error">
                    <span>Giảm giá</span>
                    <span>-{discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
              </div>

              <div className="w-full h-px border-t border-dashed border-neutral-300 mb-4"></div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-body-md font-medium text-brand-navy">Tổng cộng</span>
                <div className="text-right">
                  <div className="text-[12px] text-neutral-500 mb-1">Đã bao gồm VAT</div>
                  <div className="text-[24px] font-bold text-brand-navy leading-none">
                    {total.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="hidden lg:flex w-full h-[52px] bg-brand-navy text-white text-body-md font-bold rounded-xl items-center justify-center hover:bg-brand-navy/90 transition-colors mb-6 shadow-sm disabled:opacity-50">
                {isSubmitting ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng \u2192'}
              </button>

              <div className="bg-[#EEF0FD] rounded-xl p-4 flex items-start gap-3 border border-[#AFA9EC]">
                <div className="mt-0.5 text-brand-navy"><Sparkles className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-body-sm font-bold text-[#3C3489] mb-1">Thử đồ trước khi thanh toán</h4>
                  <p className="text-[12px] text-[#3C3489]/80 mb-2 leading-relaxed">
                    Xem trước form dáng trang phục công sở trên cơ thể hoặc mannequin để chọn đúng size!
                  </p>
                  <Link href="/try-on" className="text-[12px] font-semibold text-brand-navy hover:underline">
                    Dùng Try-On ngay &rarr;
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

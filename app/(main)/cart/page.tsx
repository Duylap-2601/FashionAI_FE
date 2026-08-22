'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Minus, Plus, Trash2, ShieldCheck, Truck, RotateCcw, ChevronLeft } from 'lucide-react';
import { useCart } from '@/store/cartStore';

export default function CartPage() {
  const { cartItems: items, updateQuantity, removeFromCart, clearCart } = useCart();

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="bg-brand-cream min-h-screen py-16 px-4">
        <div className="max-w-[560px] mx-auto bg-white rounded-2xl border border-neutral-200 p-8 md:p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-[24px] font-bold text-brand-navy mb-2">Giỏ hàng của bạn đang trống</h1>
          <p className="text-body-md text-neutral-500 mb-8 max-w-[360px] mx-auto">
            Hãy khám phá các trang phục công sở cao cấp và thử đồ ảo cùng AI trước khi đặt hàng nhé.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="h-[50px] px-8 bg-brand-navy text-white text-body-md font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-navy/90 transition-colors shadow-sm"
            >
              Khám phá bộ sưu tập <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/profile/orders"
              className="h-[50px] px-6 bg-neutral-100 text-neutral-700 text-body-md font-semibold rounded-xl flex items-center justify-center hover:bg-neutral-200 transition-colors"
            >
              Đơn hàng của tôi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen py-10 px-4 md:px-8">
      <div className="max-w-[1180px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-body-sm text-neutral-500 hover:text-brand-navy font-medium mb-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Tiếp tục mua sắm
            </Link>
            <h1 className="text-[28px] md:text-[32px] font-bold text-brand-navy tracking-tight">
              Giỏ hàng của bạn <span className="text-neutral-400 font-normal text-[20px]">({totalQuantity} sản phẩm)</span>
            </h1>
          </div>
          <button
            onClick={() => clearCart()}
            className="text-body-sm text-semantic-error hover:underline font-medium"
          >
            Xóa tất cả
          </button>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Items list (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden divide-y divide-neutral-100">
            {items.map((item) => (
              <div key={item.id} className="p-5 md:p-6 flex flex-col sm:flex-row gap-5 relative group">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full sm:w-[100px] h-[120px] object-cover rounded-xl bg-neutral-100 border border-neutral-200 shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div className="pr-8">
                    <h3 className="text-body-md font-bold text-brand-navy line-clamp-1 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-label-sm text-neutral-500 mb-3">{item.variant}</p>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-neutral-300 rounded-xl h-[38px] bg-white shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-10 h-full flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-l-xl transition-colors"
                        aria-label="Giảm số lượng"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-10 h-full flex items-center justify-center text-body-sm font-bold text-brand-navy border-x border-neutral-200">
                        {item.quantity}
                      </div>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-10 h-full flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-r-xl transition-colors"
                        aria-label="Tăng số lượng"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-body-lg font-bold text-brand-navy">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-label-sm text-neutral-400">
                          {item.price.toLocaleString('vi-VN')}đ / cái
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-semantic-error rounded-lg hover:bg-red-50 transition-colors"
                  aria-label="Xóa sản phẩm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Right: Order Summary (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
              <h2 className="text-body-lg font-bold text-brand-navy mb-5">Tóm tắt đơn hàng</h2>

              <div className="flex flex-col gap-3.5 text-body-sm pb-5 border-b border-neutral-100">
                <div className="flex justify-between text-neutral-600">
                  <span>Tạm tính ({totalQuantity} sản phẩm)</span>
                  <span className="font-semibold text-neutral-900">{total.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600 font-medium">Tính khi đặt hàng</span>
                </div>
              </div>

              <div className="py-4 flex justify-between items-baseline mb-6">
                <span className="text-body-md font-bold text-brand-navy">Tổng thanh toán</span>
                <span className="text-[24px] font-bold text-[#5D1C34]">{total.toLocaleString('vi-VN')}đ</span>
              </div>

              <Link
                href="/checkout"
                className="w-full h-[52px] bg-gradient-to-r from-[#5D1C34] to-[#A67D44] text-white text-body-md font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-md shadow-[#5D1C34]/20"
              >
                Tiến hành đặt hàng <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Value Props */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col gap-3.5 text-label-sm text-neutral-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <span>Giao hàng toàn quốc 2-4 ngày</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <span>Đổi size & trả hàng trong 7 ngày</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Bảo mật thông tin & thanh toán 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

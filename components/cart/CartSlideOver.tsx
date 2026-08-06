import React from 'react';
import Link from 'next/link';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/store/cartStore';

interface CartSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSlideOver({ isOpen, onClose }: CartSlideOverProps) {
  const { cartItems: items, updateQuantity, removeFromCart } = useCart();

  if (!isOpen) return null;

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-[420px] bg-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="text-[20px] font-bold text-brand-navy">Giỏ hàng ({items.length})</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-neutral-500 hover:text-brand-navy rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <ShoppingBag className="w-16 h-16 text-neutral-300 mb-4" strokeWidth={1} />
              <p className="text-body-lg text-brand-navy font-semibold mb-2">Giỏ hàng của bạn đang trống</p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-3 bg-brand-navy text-white text-body-sm font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors"
              >
                Khám phá sản phẩm &rarr;
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {items.map(item => (
                <div key={item.id} className="p-4 border-b border-neutral-100 relative group">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-[72px] h-[96px] object-cover rounded-md bg-neutral-100"
                    />
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="pr-8">
                        <h3 className="text-body-sm font-medium text-brand-navy line-clamp-1 mb-1">{item.name}</h3>
                        <p className="text-[13px] text-neutral-500 mb-3">{item.variant}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-neutral-200 rounded-lg h-[32px] bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-full flex items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:text-brand-navy transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <div className="w-8 h-full flex items-center justify-center text-[13px] font-medium text-brand-navy border-x border-neutral-200">
                            {item.quantity}
                          </div>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-full flex items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:text-brand-navy transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-body-sm font-semibold text-brand-navy">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-semantic-error rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {item.hasTryOn && (
                    <div className="mt-4 flex items-center justify-between px-3 py-2 bg-[#EEF0FD] rounded-lg">
                      <span className="text-[12px] font-medium text-[#3C3489]">✦ Bạn đã thử đồ này — </span>
                      <button className="text-[12px] font-semibold text-[#5D1C34] hover:underline">Xem kết quả</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-neutral-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-body-sm text-neutral-600">Tạm tính ({items.reduce((a, b) => a + b.quantity, 0)} sản phẩm)</span>
              <span className="text-body-lg font-bold text-brand-navy">{total.toLocaleString('vi-VN')}đ</span>
            </div>



            <Link
              href="/checkout"
              onClick={onClose}
              className="w-full h-[52px] bg-brand-navy text-white text-body-md font-bold rounded-xl flex items-center justify-center hover:bg-brand-navy/90 transition-colors mb-3"
            >
              Đặt hàng &rarr;
            </Link>

            <button
              onClick={onClose}
              className="w-full text-center text-body-sm text-neutral-500 hover:text-brand-navy font-medium"
            >
              Hoặc tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
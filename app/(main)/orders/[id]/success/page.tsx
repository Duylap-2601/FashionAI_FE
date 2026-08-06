'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Check, Star, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useOrder } from '@/hooks/useOrders';
import { useSession } from 'next-auth/react';

export default function OrderSuccessPage() {
  const { id } = useParams() as { id: string };
  const { order, isLoading } = useOrder(id);
  const { data: session } = useSession();

  const userEmail = session?.user?.email || 'email@example.com';
  const userTier = session?.user?.tier || 'free';

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[640px] w-full mx-auto px-4 py-[80px] flex flex-col items-center text-center">
        
        {/* Checkmark Animation */}
        <div className="w-[80px] h-[80px] rounded-full bg-semantic-success flex items-center justify-center mb-8 shadow-[0_0_0_12px_rgba(16,185,129,0.1)]">
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </div>

        <h1 className="text-[32px] font-bold text-brand-navy mb-4 tracking-tight">Đặt hàng thành công!</h1>
        <p className="text-body-md text-neutral-600 mb-10 max-w-[400px]">
          Cảm ơn bạn đã đặt hàng. Email xác nhận và vận đơn đã được gửi đến <span className="font-medium text-brand-navy">{userEmail}</span>
        </p>

        {/* Order Info Card */}
        <div className="w-full bg-white border border-neutral-200 rounded-2xl overflow-hidden mb-10">
          {isLoading ? (
            <div className="p-6 flex justify-center items-center">
              <div className="w-6 h-6 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-3 text-left">
              <div className="flex justify-between items-center text-body-sm">
                <span className="text-neutral-500">Mã đơn hàng</span>
                <span className="font-semibold text-brand-navy">#{id.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center text-body-sm">
                <span className="text-neutral-500">Tổng cộng</span>
                <span className="font-semibold text-brand-navy">{order ? formatPrice(order.totalAmount) : '—'}</span>
              </div>
              <div className="flex justify-between items-center text-body-sm">
                <span className="text-neutral-500">Trạng thái</span>
                <span className="font-medium text-brand-navy flex items-center gap-2">
                  Đã nhận đơn <span className="w-2 h-2 rounded-full bg-semantic-success"></span>
                </span>
              </div>
              <div className="flex justify-between items-center text-body-sm">
                <span className="text-neutral-500">Dự kiến giao</span>
                <span className="font-medium text-brand-navy">3–5 ngày làm việc</span>
              </div>
            </div>
          )}
          
          <div className="px-6 py-4 bg-[#EFF6FF] border-t border-[#2563EB]/20 flex items-start gap-3">
            <Star className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" fill="currentColor" />
            <div className="text-left">
              <h4 className="text-body-sm font-bold text-[#1E3A8A] mb-1">Chúc mừng! Bạn đã được nâng cấp</h4>
              <p className="text-[13px] text-[#1E3A8A]/80">Hệ thống ghi nhận đơn hàng. Quyền lợi tài khoản của bạn sẽ cập nhật sau khi đơn hàng được xác nhận.</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full mb-16">
          <Link href="/profile/orders" className="w-full sm:flex-1 h-[52px] bg-white border border-neutral-200 text-neutral-700 text-body-md font-semibold rounded-xl flex items-center justify-center hover:bg-neutral-50 transition-colors">
            Xem đơn hàng
          </Link>
          <Link href="/products" className="w-full sm:flex-1 h-[52px] bg-brand-navy text-white text-body-md font-bold rounded-xl flex items-center justify-center hover:bg-brand-navy/90 transition-colors shadow-sm">
            Tiếp tục mua sắm
          </Link>
        </div>

        {/* Cross-sell */}
        <div className="w-full text-left">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-brand-navy font-semibold text-label-sm uppercase tracking-wider">✦ Gợi ý phối đồ AI dành cho bạn</span>
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {[1, 2].map(i => (
              <Link href={`/products`} key={i} className="group flex flex-col bg-white border border-neutral-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-1594938298603-c8148c4dae35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw${i}fHxwZXJzb24lMjBzdWl0fGVufDF8fHx8MTc4MTE1MjY4OHww&ixlib=rb-4.1.0&q=80&w=400`} 
                    alt="Product" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded text-[10px] font-bold text-brand-navy tracking-wider shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" /> Gợi ý phối hợp
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-1.5 text-left">
                  <h4 className="text-body-sm font-medium text-brand-navy line-clamp-1">{i === 1 ? 'Áo Sơ Mi Oxford Slim-Fit' : 'Quần Tây Xám Cao Cấp'}</h4>
                  <div className="text-[12px] text-[#5D1C34] font-semibold hover:underline mt-1">Khám phá sản phẩm &rarr;</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

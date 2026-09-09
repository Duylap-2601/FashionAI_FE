'use client';

import { Mail, Phone } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

export function NewsletterBar() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    setIsSubscribed(true);
    toast.success('Đăng ký nhận bản tin thành công! Mã ưu đãi 10% đã được gửi vào hòm thư.');
    setEmail('');
  };

  return (
    <section className="bg-[#15434e] text-white py-12 border-t border-[#1b505c] hidden md:block">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 ">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Newsletter Info */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
              <Mail className="w-7 h-7 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-1.5">
                ĐĂNG KÝ NHẬN BẢN TIN BỘ SƯU TẬP
              </h3>
              <p className="text-white/80 text-body-sm font-light">
                Nhận voucher giảm 10% cho đơn hàng đầu tiên và thông báo sớm nhất khi có bộ sưu tập mới ra mắt.
              </p>
            </div>
          </div>

          {/* Right: Email Input & Phone Support */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn..."
                className="flex-1 h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-body-sm focus:outline-none focus:bg-white/15 focus:border-brand-gold transition-colors"
              />
              <button
                type="submit"
                className="h-12 px-6 rounded-xl bg-brand-gold hover:bg-[#b58b52] text-brand-navy font-bold text-xs uppercase tracking-wider transition-colors shrink-0 shadow-md cursor-pointer"
              >
                ĐĂNG KÝ
              </button>
            </form>

            <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-white/15 shrink-0 text-white/90">
              <Phone className="w-4 h-4 text-brand-gold" />
              <div className="text-xs">
                <div className="text-white/60 text-[10px] uppercase">Hotline hỗ trợ</div>
                <div className="font-bold">1900 6868</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

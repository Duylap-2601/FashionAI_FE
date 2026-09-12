'use client';

import { Logo } from '@/components/ui/Logo';
import { Clock, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="bg-[#0B1118] text-white pt-16 pb-8 border-t border-neutral-800">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-14 border-b border-neutral-800/80">
          {/* Col 1: Brand Info (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <div className="mb-4">
              <Logo size="md" variant="light" />
            </div>
            <p className="text-body-sm text-neutral-400 mb-6 leading-relaxed max-w-sm">
              Nền tảng thời trang công sở cao cấp tiên phong ứng dụng công nghệ thử đồ ảo AI. Chuẩn dáng từ đầu, đẹp từng đường may.
            </p>


          </div>

          {/* Col 2: Collections & Shop (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold text-brand-gold uppercase tracking-[0.16em] mb-5">
              BỘ SƯU TẬP & SẢN PHẨM
            </h4>
            <ul className="flex flex-col gap-3 text-body-sm text-neutral-400">
              <li>
                <a href="#collections" className="hover:text-white transition-colors">
                  Bộ sưu tập mới 2026
                </a>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Blazer Nữ Công Sở
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Suit Nguyên Bộ May Đo
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Áo Sơ Mi Cao Cấp
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Quần Tây & Chân Váy
                </Link>
              </li>
              <li>
                <Link href="/try-on" className="text-[#5D1C34] hover:text-brand-gold font-medium transition-colors">
                  ✦ Phòng Thử Đồ AI Virtual Try-On
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Policies (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold text-brand-gold uppercase tracking-[0.16em] mb-5">
              CHÍNH SÁCH
            </h4>
            <ul className="flex flex-col gap-3 text-body-sm text-neutral-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Chính sách đổi trả 7 ngày
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Hướng dẫn chọn size
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Điều khoản dịch vụ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Tra cứu đơn hàng
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Showrooms (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold text-brand-gold uppercase tracking-[0.16em] mb-5">
              THÔNG TIN LIÊN HỆ
            </h4>
            <div className="flex flex-col gap-3 text-body-sm text-neutral-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <span>Số 126 Nguyễn Thị Minh Khai, Phường 6, Quận 3, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>Hotline: 1900 6868 (8:30 - 22:00)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>contact@fashionai.vn</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>Mở cửa tất cả các ngày trong tuần</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-6">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                Phương thức thanh toán
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {['VNPAY', 'MoMo', 'COD'].map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-[10px] font-bold text-neutral-300 rounded"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            &copy; 2026 StAle. FashionAI. Bản quyền thuộc về FashionAI Team. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-neutral-300 transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

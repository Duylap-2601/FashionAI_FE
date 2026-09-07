'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Camera, CheckCircle2, ArrowRight } from 'lucide-react';

export function AiTryOnFeatureBanner() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-[#F9F7F5] border-t border-neutral-200">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="bg-[#1A1A24] rounded-3xl overflow-hidden shadow-2xl border border-white/10 p-8 sm:p-12 lg:p-16 relative">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-radial from-[#5D1C34]/40 via-[#A67D44]/15 to-transparent blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
            {/* Left: Content & 3 Steps */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                CÔNG NGHỆ THỬ ĐỒ ĐỘC QUYỀN
              </span>

              <h2 className="text-[28px] sm:text-[38px] md:text-[44px] font-extrabold text-white tracking-tight leading-tight mb-4">
                THỬ ĐỒ ẢO BẰNG AI <br className="hidden sm:inline" />
                <span className="text-brand-gold">TRƯỚC KHI QUYẾT ĐỊNH MUA</span>
              </h2>

              <p className="text-white/75 text-body-md leading-relaxed mb-10 max-w-xl">
                Không cần đến showroom hay băn khoăn về phom dáng. Công nghệ AI FASHN v1.6 cho phép bạn ghép trực tiếp bất kỳ món đồ nào từ bộ sưu tập lên ảnh thật của chính mình.
              </p>

              {/* 3 Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full mb-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col">
                  <span className="text-xs font-bold text-brand-gold tracking-widest uppercase mb-2">BƯỚC 01</span>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-3">
                    <Sparkles className="w-5 h-5 text-brand-gold" />
                  </div>
                  <h4 className="text-white font-semibold text-body-sm mb-1">Chọn trang phục</h4>
                  <p className="text-white/60 text-xs leading-relaxed">Chọn món đồ bạn muốn thử từ các bộ sưu tập.</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col">
                  <span className="text-xs font-bold text-brand-gold tracking-widest uppercase mb-2">BƯỚC 02</span>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-3">
                    <Camera className="w-5 h-5 text-brand-gold" />
                  </div>
                  <h4 className="text-white font-semibold text-body-sm mb-1">Tải ảnh của bạn</h4>
                  <p className="text-white/60 text-xs leading-relaxed">Ảnh chụp rõ toàn thân đứng thẳng tự nhiên.</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col">
                  <span className="text-xs font-bold text-brand-gold tracking-widest uppercase mb-2">BƯỚC 03</span>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="text-white font-semibold text-body-sm mb-1">Xem kết quả 30s</h4>
                  <p className="text-white/60 text-xs leading-relaxed">AI xuất ảnh chân thực chuẩn phom để bạn ưng ý.</p>
                </div>
              </div>

              {/* CTA button */}
              <Link
                href="/try-on"
                className="h-13 px-8 rounded-full bg-brand-gold hover:bg-[#b58b52] text-brand-navy font-bold text-body-sm inline-flex items-center gap-3 shadow-xl hover:scale-103 active:scale-97 transition-all duration-200"
              >
                <Sparkles className="w-4 h-4 fill-brand-navy" />
                <span>TRẢI NGHIỆM VIRTUAL TRY-ON NGAY</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right: Visual Before/After Demo Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[380px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15">
                <img
                  src="https://images.unsplash.com/photo-1616065297556-f05bc00c9a3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=85"
                  alt="AI Virtual Try On Result"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[11px] font-bold uppercase rounded-full shadow-md flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Kết quả AI thử đồ
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="text-xs text-brand-gold font-bold uppercase tracking-wider mb-1">Mẫu thử</div>
                  <div className="text-body-md font-bold text-white mb-1">Blazer Nữ Công Sở Dáng Ôm</div>
                  <div className="text-xs text-white/70">Độ chuẩn xác 95% • Tự động điều chỉnh theo số đo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

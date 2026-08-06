'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Star, ShoppingBag, Check, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { PRODUCTS } from '@/lib/data';
import { useAuth } from '@/hooks/useAuth';
import { FloatingChat } from '@/components/chat/FloatingChat';
import { AnimateIn, StaggerContainer, StaggerItem } from '@/components/ui/AnimateIn';
import { Logo } from '@/components/ui/Logo';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1616065297556-f05bc00c9a3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBvZmZpY2UlMjBmYXNoaW9uJTIwd29tYW4lMjBlbGVnYW50fGVufDF8fHx8MTc4MTI0NDU2N3ww&ixlib=rb-4.1.0&q=80&w=1080';
const POWER_IMAGE = 'https://images.unsplash.com/photo-1637589267610-6c66fc2a086b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxwcm9mZXNzaW9uYWwlMjBvZmZpY2UlMjBmYXNoaW9uJTIwd29tYW4lMjBlbGVnYW50fGVufDF8fHx8MTc4MTI0NDU2N3ww&ixlib=rb-4.1.0&q=80&w=1080';
const MAN_IMAGE = 'https://images.unsplash.com/photo-1775257796019-3e8db981a1a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxidXNpbmVzcyUyMHN1aXQlMjBtYW4lMjBmb3JtYWwlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzgxMjQ0NTY4fDA&ixlib=rb-4.1.0&q=80&w=1080';

const STATS = [
  { value: '50.000+', label: 'Lượt thử đồ' },
  { value: '2.400+', label: 'Khách hàng' },
  { value: '4.9/5', label: 'Đánh giá' },
  { value: '< 30s', label: 'Kết quả AI' },
];

const TESTIMONIALS = [
  {
    name: 'Trần Minh Châu',
    role: 'Trưởng phòng Marketing',
    text: 'Tôi mua nguyên bộ suit mà không cần thử. AI try-on chuẩn đến 95%! Tiết kiệm cả buổi chiều đi shopping.',
    rating: 5,
    avatar: 'T',
  },
  {
    name: 'Nguyễn Hoàng Anh',
    role: 'Giám đốc tài chính',
    text: 'Bộ sưu tập công sở rất đa dạng và chất lượng. AI stylist đề xuất outfit chuẩn phong cách cho từng cuộc họp.',
    rating: 5,
    avatar: 'N',
  },
  {
    name: 'Lê Thị Hương',
    role: 'Senior Consultant',
    text: 'StAle. giúp tôi tự tin hơn khi chọn đồ. Thử ảo trước, mua thật sau — không lo sai size hay không hợp màu.',
    rating: 5,
    avatar: 'L',
  },
];

const FEATURED_PRODUCTS = PRODUCTS.slice(0, 4);

export default function GuestLanding() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const handleTryOnClick = () => {
    if (isLoggedIn) {
      router.push('/try-on');
    } else {
      router.push('/login');
    }
  };

  const categories = ['Tất cả', 'Blazer', 'Suit', 'Áo sơ mi', 'Quần tây'];

  return (
    <div className="flex flex-col bg-white">

      {/* ── MINIMAL HEADER ───────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center px-6 md:px-10 h-[64px]">
        <Logo size="md" variant="light" />
      </header>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative bg-brand-navy overflow-hidden h-[80vh] min-h-[600px] md:min-h-[680px]">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #A67D44 0, #A67D44 1px, transparent 0, transparent 50%)', backgroundSize: '16px 16px' }}
        />

        <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 h-full flex items-center">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center py-16 md:py-20">

            {/* Left */}
            <div className="flex flex-col items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-brand-gold/30 bg-brand-gold/10 text-brand-gold rounded-full text-label-sm font-semibold mb-8"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Công nghệ AI thử đồ thế hệ mới
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-[44px] md:text-[64px] text-white tracking-[-0.02em] mb-4" style={{ lineHeight: 1.08 }}
              >
                Phong cách<br />
                <span className="text-brand-gold">công sở</span><br />
                đỉnh cao
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="text-white/60 text-body-lg mb-10 max-w-[440px]" style={{ lineHeight: 1.7 }}
              >
                Khám phá bộ sưu tập trang phục công sở cao cấp. Thử đồ ảo bằng AI — thấy kết quả trước khi mua.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-12"
              >
                <motion.button
                  onClick={handleTryOnClick}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="h-[52px] px-7 bg-brand-gold text-brand-navy font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-gold/90 transition-colors shadow-lg shadow-brand-gold/20 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Thử đồ AI miễn phí
                </motion.button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/products"
                    className="h-[52px] px-7 bg-white/10 text-white border border-white/20 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-white/15 transition-colors"
                  >
                    Xem bộ sưu tập
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Trust */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="flex flex-wrap items-center gap-6 text-white/50 text-label-sm"
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-brand-gold text-brand-gold" />)}
                  </div>
                  <span>4.9/5 từ 2.400+ khách</span>
                </div>
                <span className="hidden sm:block">•</span>
                <span className="hidden sm:block">Miễn phí 3 lượt/ngày</span>
              </motion.div>
            </div>

            {/* Right — hero images stacked */}
            <div className="relative hidden md:flex justify-end items-center">
              <div className="relative w-[340px] h-[500px]">
                {/* Main image */}
                <div className="absolute right-0 top-0 w-[260px] h-[420px] rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                  <img src={HERO_IMAGE} alt="Trang phục công sở nữ" className="w-full h-full object-cover object-top" />
                </div>
                {/* Secondary card */}
                <div className="absolute left-0 bottom-0 w-[200px] h-[280px] rounded-xl overflow-hidden border-2 border-brand-gold/20 shadow-xl">
                  <img src={MAN_IMAGE} alt="Trang phục công sở nam" className="w-full h-full object-cover object-top" />
                </div>
                {/* Badge */}
                <div className="absolute top-4 left-6 bg-white rounded-xl px-4 py-3 shadow-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-navy/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-brand-navy" />
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-neutral-500">Kết quả AI</div>
                    <div className="text-[13px] font-bold text-brand-navy">Xử lý 15–30 giây</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────── */}
      <section className="bg-brand-cream border-b border-neutral-200">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-8">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-neutral-300">
            {STATS.map((stat) => (
              <StaggerItem key={stat.label} className="flex flex-col items-center text-center px-4">
                <span className="text-[28px] md:text-[32px] text-brand-navy tracking-tight">{stat.value}</span>
                <span className="text-body-sm text-neutral-500 mt-0.5">{stat.label}</span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────── */}
      <section className="py-[80px] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-label-sm font-semibold text-brand-gold uppercase tracking-[0.12em] block mb-2">Bộ sưu tập</span>
              <h2 className="text-[32px] md:text-[40px] text-brand-navy tracking-tight">Trang phục nổi bật</h2>
            </div>
            <Link href="/products" className="flex items-center gap-2 text-body-sm font-semibold text-brand-navy hover:text-brand-navy/70 transition-colors shrink-0">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 h-9 px-5 rounded-full text-label-sm font-semibold transition-colors ${
                  activeCategory === cat
                    ? 'bg-brand-navy text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {FEATURED_PRODUCTS.map((product) => (
              <StaggerItem key={product.id} className="group flex flex-col bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-brand-navy/30 hover:shadow-lg transition-all duration-200">
                <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <button
                    onClick={handleTryOnClick}
                    className="absolute bottom-3 left-3 right-3 h-9 bg-white/95 backdrop-blur-sm text-brand-navy font-semibold rounded-xl text-label-sm flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 shadow-md cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Thử ngay
                  </button>
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-brand-navy text-white text-[10px] font-bold uppercase rounded-md tracking-wide">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-4">
                  <span className="text-[10px] font-semibold text-brand-gold uppercase tracking-wider mb-1">{product.brand}</span>
                  <Link href={`/products/${product.id}`} className="text-body-sm font-semibold text-neutral-900 hover:text-brand-navy line-clamp-2 leading-snug mb-3 transition-colors">
                    {product.name}
                  </Link>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-body-md text-brand-navy">{product.price}</span>
                    <button
                      onClick={() => router.push(`/products/${product.id}`)}
                      className="p-2 bg-neutral-100 rounded-lg hover:bg-brand-navy hover:text-white text-neutral-600 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────── */}
      <section className="py-[80px] bg-brand-cream">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <AnimateIn className="text-center mb-16">
            <span className="text-label-sm font-semibold text-brand-gold uppercase tracking-[0.12em] block mb-2">Quy trình</span>
            <h2 className="text-[32px] md:text-[40px] text-brand-navy tracking-tight mb-4">Thử đồ chỉ 3 bước</h2>
            <p className="text-body-lg text-neutral-500 max-w-[480px] mx-auto">
              Không cần phòng thử đồ. Không cần app. Chỉ cần ảnh và 30 giây.
            </p>
          </AnimateIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                num: '01',
                title: 'Chọn trang phục',
                desc: 'Duyệt qua bộ sưu tập blazer, suit, áo sơ mi công sở được tuyển chọn kỹ lưỡng.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                  </svg>
                ),
              },
              {
                num: '02',
                title: 'AI xử lý trong 30s',
                desc: 'Upload ảnh của bạn. AI FASHN v1.6 ghép trang phục lên ảnh với độ chính xác cao.',
                icon: <Sparkles className="w-6 h-6" />,
                highlight: true,
              },
              {
                num: '03',
                title: 'Mua hoặc lưu lại',
                desc: 'Hài lòng? Thêm vào giỏ hàng và checkout trong vài click. Muốn xem thêm? Lưu vào lịch sử.',
                icon: <Check className="w-6 h-6" strokeWidth="2" />,
              },
            ].map((step) => (
              <StaggerItem
                key={step.num}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  step.highlight
                    ? 'bg-brand-navy text-white shadow-xl shadow-brand-navy/20'
                    : 'bg-white border border-neutral-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                  step.highlight ? 'bg-white/15 text-white' : 'bg-brand-navy/8 text-brand-navy'
                }`}>
                  {step.icon}
                </div>
                <span className={`text-[11px] font-bold tracking-[0.15em] mb-2 ${step.highlight ? 'text-brand-gold' : 'text-brand-gold'}`}>
                  BƯỚC {step.num}
                </span>
                <h3 className={`text-[18px] mb-3 ${step.highlight ? 'text-white' : 'text-brand-navy'}`}>
                  {step.title}
                </h3>
                <p className={`text-body-sm leading-relaxed ${step.highlight ? 'text-white/70' : 'text-neutral-500'}`}>
                  {step.desc}
                </p>
                {step.highlight && (
                  <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-label-sm text-white/80">
                    <span className="w-1.5 h-1.5 bg-brand-gold rounded-full"></span>
                    Powered by FASHN AI
                  </div>
                )}
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── LIFESTYLE BANNER ──────────────────────────── */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img
          src={POWER_IMAGE}
          alt="Phong cách công sở tự tin"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/90 via-brand-navy/60 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8">
            <div className="max-w-[480px]">
              <span className="text-brand-gold text-label-sm font-semibold uppercase tracking-[0.12em] block mb-4">AI Stylist</span>
              <h2 className="text-[32px] md:text-[44px] text-white tracking-tight mb-5" style={{ lineHeight: 1.12 }}>
                Outfit hoàn chỉnh<br />cho mọi buổi họp
              </h2>
              <p className="text-white/70 text-body-md mb-8 max-w-[380px]">
                AI phân tích màu da, dáng người và đề xuất 3 outfit hoàn chỉnh phù hợp phong cách công sở của bạn.
              </p>
              <button
                onClick={handleTryOnClick}
                className="h-[48px] px-7 bg-brand-gold text-brand-navy font-semibold rounded-xl flex items-center gap-2 hover:bg-brand-gold/90 transition-colors shadow-lg cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Khám phá AI Stylist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────── */}
      <section className="py-[80px] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <AnimateIn className="text-center mb-14">
            <span className="text-label-sm font-semibold text-brand-gold uppercase tracking-[0.12em] block mb-2">Đánh giá</span>
            <h2 className="text-[32px] md:text-[40px] text-brand-navy tracking-tight">Khách hàng nói gì</h2>
          </AnimateIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <StaggerItem key={t.name} className="bg-brand-cream border border-neutral-200 rounded-2xl p-7 flex flex-col">
                <div className="flex mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <p className="text-body-md text-neutral-700 leading-relaxed flex-1 mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-navy text-white font-bold text-label-md flex items-center justify-center shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-label-md font-semibold text-neutral-900">{t.name}</div>
                    <div className="text-label-sm text-neutral-500">{t.role}</div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────── */}
      <section className="bg-brand-navy py-[80px]">
        <div className="max-w-[800px] mx-auto px-4 text-center">
          <span className="text-brand-gold text-label-sm font-semibold uppercase tracking-[0.12em] block mb-4">Bắt đầu miễn phí</span>
          <h2 className="text-[32px] md:text-[48px] text-white tracking-tight mb-5" style={{ lineHeight: 1.12 }}>
            Mặc đẹp. Tự tin.<br />Thành công hơn.
          </h2>
          <p className="text-white/60 text-body-lg mb-10">
            3 lượt thử đồ AI miễn phí mỗi ngày. Không cần thẻ tín dụng.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mb-8">
            <Link
              href="/register"
              className="h-[52px] px-8 bg-brand-gold text-brand-navy font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-gold/90 transition-colors shadow-lg shadow-brand-gold/20"
            >
              <Sparkles className="w-4 h-4" />
              Đăng ký miễn phí
            </Link>
            <Link
              href="/products"
              className="h-[52px] px-8 bg-white/10 border border-white/20 text-white font-semibold rounded-xl flex items-center justify-center hover:bg-white/15 transition-colors"
            >
              Xem bộ sưu tập
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-white/40 text-label-sm">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Miễn phí 3 lượt/ngày</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Không cần thẻ tín dụng</span>
            <span className="hidden sm:flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Kết quả trong 30 giây</span>
          </div>

          <div className="mt-6">
            <Link href="/login" className="text-white/40 hover:text-white/70 text-body-sm transition-colors">
              Đã có tài khoản? Đăng nhập &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="bg-[#0D1826] pt-[64px] pb-[32px] text-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
            <div className="md:col-span-2">
              <Logo size="md" variant="light" />
              <div className="text-brand-gold text-label-sm font-medium mb-4">Phong cách công sở đỉnh cao</div>
              <p className="text-white/40 text-body-sm max-w-[300px]">
                Nền tảng thử đồ ảo AI đầu tiên tại Việt Nam dành riêng cho trang phục công sở. Thử trước, mua thật.
              </p>
            </div>
            <div>
              <h4 className="text-white/80 font-semibold mb-5 text-body-sm">Sản phẩm</h4>
              <ul className="flex flex-col gap-3 text-white/40 text-body-sm">
                {['Áo công sở', 'Quần tây', 'Váy công sở', 'Suit đầy đủ', 'Blazer'].map(item => (
                  <li key={item}>
                    <Link href="/products" className="hover:text-white/80 transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white/80 font-semibold mb-5 text-body-sm">Tính năng AI</h4>
              <ul className="flex flex-col gap-3 text-white/40 text-body-sm">
                <li><button onClick={handleTryOnClick} className="hover:text-white/80 transition-colors text-left cursor-pointer">Virtual Try-On</button></li>
                <li><button onClick={handleTryOnClick} className="hover:text-white/80 transition-colors text-left cursor-pointer">AI Stylist</button></li>
                <li><span className="opacity-50 flex items-center gap-1.5">3D Mannequin <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">Phase 2</span></span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-label-sm">
            <div>&copy; 2026 StAle. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white/60 transition-colors">Điều khoản</a>
              <a href="#" className="hover:text-white/60 transition-colors">Bảo mật</a>
              <a href="#" className="hover:text-white/60 transition-colors">Liên hệ</a>
            </div>
          </div>
        </div>
      </footer>

      <FloatingChat />
    </div>
  );
}

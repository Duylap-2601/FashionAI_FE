'use client';

import { Logo } from '@/components/ui/Logo';
import { cn } from '@/components/ui/utils';
import { LANDING_MEDIA } from '@/features/home/constants/landing-media';
import { ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

// Chỉ nêu những gì tài khoản thật sự mở ra: hồ sơ số đo, giỏ hàng đồng bộ, tính năng AI cần đăng nhập.
const ACCOUNT_BENEFITS = [
  'Lưu số đo cơ thể trong hồ sơ của bạn.',
  'Giỏ hàng đồng bộ trên mọi thiết bị.',
  'Thử đồ AI và nhờ AI Stylist phối đồ.',
] as const;

// Thứ tự các trang: đi tới trang đứng sau thì form trượt vào từ phải, quay lại thì từ trái.
const SPLIT_ROUTE_ORDER: Record<string, number> = {
  '/login': 0,
  '/forgot-password': 1,
  '/register': 2,
};

const PANEL_EASE = [0.22, 1, 0.36, 1] as const;
const FORM_ENTER_OFFSET = 32;

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-landing-oxblood';

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  // Đăng ký đặt form bên trái, ảnh bên phải; đăng nhập và quên mật khẩu thì ngược lại.
  const isFormFirst = pathname === '/register';

  // Ghi nhận hướng chuyển trang ngay trong lúc render (mẫu "điều chỉnh state theo props" của React).
  const [routeChange, setRouteChange] = useState({ path: pathname, direction: 0 });
  if (routeChange.path !== pathname) {
    const direction = Math.sign((SPLIT_ROUTE_ORDER[pathname] ?? 0) - (SPLIT_ROUTE_ORDER[routeChange.path] ?? 0));
    setRouteChange({ path: pathname, direction });
  }

  const animateLayout = shouldReduceMotion ? false : 'position';
  const panelTransition = { layout: { duration: 0.8, ease: PANEL_EASE } };
  const formInitial = shouldReduceMotion || routeChange.direction === 0
    ? false
    : { opacity: 0, x: routeChange.direction * FORM_ENTER_OFFSET };

  return (
    <div
      className={cn(
        'flex min-h-svh bg-landing-paper font-sans text-landing-obsidian selection:bg-landing-oxblood selection:text-landing-paper',
        isFormFirst && 'lg:flex-row-reverse',
      )}
    >
      <motion.aside
        layout={animateLayout}
        transition={panelTransition}
        className="sticky top-0 z-10 hidden h-svh w-[46%] max-w-[760px] shrink-0 overflow-hidden bg-landing-obsidian lg:block"
      >
        <Image
          src={LANDING_MEDIA.look02}
          alt=""
          fill
          sizes="46vw"
          className="object-cover object-[50%_15%]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-landing-obsidian via-landing-obsidian/45 to-landing-obsidian/15" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <Link href="/" aria-label="Về trang chủ StAle." className={cn('self-start', focusRing, 'focus-visible:outline-landing-brass')}>
            <Logo size="lg" variant="light" />
          </Link>

          <div className="max-w-[440px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-landing-brass">Tài khoản StAle.</p>
            <p className="mt-4 font-display text-[clamp(2.25rem,3.4vw,3.25rem)] leading-[1.1] tracking-[-0.025em] text-landing-paper">
              <span className="block">Chuẩn <em className="italic">dáng</em> từ đầu,</span>
              <span className="block">đẹp từng đường may.</span>
            </p>
            <ol className="mt-10 border-t border-landing-paper/15">
              {ACCOUNT_BENEFITS.map((benefit, index) => (
                <li key={benefit} className="flex gap-4 border-b border-landing-paper/15 py-4 text-sm text-landing-paper/75">
                  <span className="pt-0.5 font-mono text-[11px] tracking-[0.2em] text-landing-brass">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {benefit}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </motion.aside>

      <motion.main
        layout={animateLayout}
        transition={panelTransition}
        className="flex min-h-svh min-w-0 flex-1 flex-col"
      >
        <div className={cn('flex items-center justify-between px-4 py-5 sm:px-8 lg:px-12', isFormFirst ? 'lg:justify-start' : 'lg:justify-end')}>
          <Link href="/" aria-label="Về trang chủ StAle." className={`lg:hidden ${focusRing}`}>
            <Logo size="md" />
          </Link>
          <Link
            href="/"
            className={`inline-flex h-11 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-muted transition-colors hover:text-landing-oxblood ${focusRing}`}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            Trang chủ
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-x-clip px-4 pb-16 pt-2 sm:px-8 lg:px-12">
          <motion.div
            key={pathname}
            initial={formInitial}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: PANEL_EASE, delay: shouldReduceMotion ? 0 : 0.2 }}
            className="w-full max-w-[420px]"
          >
            {children}
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}

export function AuthCenteredLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-brand-cream font-sans text-neutral-900 items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-neutral-100">
        <div className="flex justify-center mb-8">
          <Logo size="md" variant="dark" />
        </div>
        {children}
      </div>
    </div>
  );
}

export function GoogleButton() {
  const handleGoogleLogin = async () => {
    const capacitorWindow = window as Window & {
      Capacitor?: { isNativePlatform?: () => boolean };
    };
    const isNative = Boolean(capacitorWindow.Capacitor?.isNativePlatform?.());
    if (isNative) {
      try {
        const { Browser } = await import('@capacitor/browser');
        const origin = window.location.origin;
        await Browser.open({ url: `${origin}/api/auth/google?platform=mobile` });
      } catch {
        window.location.href = '/api/auth/google?platform=mobile';
      }
    } else {
      window.location.href = '/api/auth/google';
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className={cn(
        'flex h-12 w-full items-center justify-center gap-3 rounded-[2px] border border-landing-line bg-landing-ivory/80 text-sm font-medium text-landing-obsidian transition-colors hover:border-landing-obsidian/60 hover:bg-landing-ivory',
        focusRing,
        'focus-visible:outline-offset-2',
      )}
    >
      {/* Logo Google giữ nguyên màu theo quy định thương hiệu của Google, Lucide không có biểu tượng này. */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Tiếp tục với Google
    </button>
  );
}

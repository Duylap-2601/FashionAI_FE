'use client';

import React from 'react';
import { Logo } from '../ui/Logo';

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#EFE9E1] font-sans text-neutral-900">
      <div className="hidden lg:flex w-[45%] bg-[#111111] relative overflow-hidden flex-col justify-center px-16">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1761428961720-38db3883826b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwZmFzaGlvbiUyMHNpbGhvdWV0dGUlMjBhYnN0cmFjdCUyMGdlb21ldHJpY3xlbnwxfHx8fDE3ODExNTI2ODh8MA&ixlib=rb-4.1.0&q=80&w=1080)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent opacity-80" />

        <div className="relative z-10 w-full max-w-[480px]">
          <div className="mb-16">
            <Logo size="md" variant="light" />
          </div>

          <h1 className="text-[40px] leading-[1.2] font-semibold text-white tracking-tight mb-16">
            Trang phục công sở hoàn hảo<br />chỉ cách bạn một cú click
          </h1>

          <div className="flex gap-4 items-start bg-white/5 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Người dùng"
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
            <div>
              <p className="text-white/90 text-[14px] leading-relaxed mb-2 italic">
                &ldquo;Hệ thống AI Stylist gợi ý outfit quá chuẩn, tôi không còn mất thời gian suy nghĩ nên mặc gì mỗi sáng đi làm nữa.&rdquo;
              </p>
              <p className="text-white/60 text-[12px] font-medium">
                - Minh Tú, Marketing Manager
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[55%] flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[400px] bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-neutral-100">
          <div className="lg:hidden flex justify-center mb-8">
            <Logo size="md" variant="dark" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthCenteredLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#EFE9E1] font-sans text-neutral-900 items-center justify-center p-4">
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
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full h-[44px] flex items-center justify-center gap-3 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all font-medium text-body-sm text-neutral-700"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Tiếp tục với Google
    </button>
  );
}

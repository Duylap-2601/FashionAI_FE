'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { AuthSplitLayout, GoogleButton } from '@/components/auth/AuthLayout';
import { OnboardingModal } from '@/components/auth/OnboardingModal';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await login(email, password);
      setIsLoading(false);

      if (res?.error) {
        setError('Email hoặc mật khẩu không chính xác');
      } else {
        const isAdmin = email.toLowerCase().includes('admin');
        if (isAdmin) {
          router.push('/admin');
        } else {
          setShowOnboarding(true);
        }
      }
    } catch {
      setIsLoading(false);
      setError('Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
    }
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    router.push('/products');
  };

  return (
    <AuthSplitLayout>
      <div className="mb-8">
        <h2 className="text-[24px] font-semibold text-brand-navy mb-2 tracking-tight">Đăng nhập</h2>
        <p className="text-body-sm text-neutral-500">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-brand-navy font-semibold hover:text-brand-navy/80 transition-colors">
            Đăng ký ngay -&gt;
          </Link>
        </p>
      </div>

      <GoogleButton />

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-neutral-200"></div>
        <span className="text-label-sm text-neutral-400 font-medium uppercase tracking-wider">hoặc</span>
        <div className="flex-1 h-px bg-neutral-200"></div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-semantic-error text-body-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-label-sm font-medium text-neutral-700 mb-1.5" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full h-11 px-3.5 bg-white border border-neutral-300 rounded-xl text-body-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all"
            placeholder="nhap@email.com"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-label-sm font-medium text-neutral-700 mb-1.5" htmlFor="password">Mật khẩu</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              className="w-full h-11 pl-3.5 pr-10 bg-white border border-neutral-300 rounded-xl text-body-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all"
              placeholder="Nhập mật khẩu"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" className="peer sr-only" disabled={isLoading} />
              <div className="w-4 h-4 border border-neutral-300 rounded bg-white peer-checked:bg-brand-navy peer-checked:border-brand-navy transition-colors"></div>
              <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-body-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">Ghi nhớ đăng nhập</span>
          </label>
          <Link href="/forgot-password" className="text-body-sm text-neutral-600 hover:text-brand-navy font-medium transition-colors">
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-brand-navy text-white text-body-sm font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors mt-2 flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingClose} />
    </AuthSplitLayout>
  );
}

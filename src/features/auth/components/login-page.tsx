'use client';

import { GoogleButton } from '@/features/auth/components/AuthLayout';
import {
  AuthAlert,
  AuthDivider,
  AuthField,
  AuthHeading,
  AuthSubmitButton,
  PasswordInput,
  authInputClassName,
  authTextLinkClassName,
} from '@/features/auth/components/auth-form';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { trackEvent } from '@/lib/analytics';
import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState } from 'react';

function LoginFormContent() {
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isLoggedIn, currentUser, status } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  React.useEffect(() => {
    if (status !== 'loading' && isLoggedIn) {
      if (currentUser.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace(callbackUrl || '/products');
      }
    }
  }, [isLoggedIn, currentUser.role, router, status, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;

    try {
      const res = await login(email, password);
      setIsLoading(false);

      if (res?.error) {
        if (res.status === 403) {
          setUnverifiedEmail(email);
          setError(
            res.error ||
            'Tài khoản chưa xác thực email. Vui lòng xác thực OTP trước khi đăng nhập.',
          );
        } else {
          // Đăng nhập không nêu chi tiết: lỗi validation (400) hay sai thông tin (401) đều chỉ báo sai email/mật khẩu.
          // Quy tắc mật khẩu chỉ hiển thị ở trang đăng ký.
          setError(
            res.status === 400 || res.status === 401
              ? 'Email hoặc mật khẩu không chính xác'
              : 'Đăng nhập thất bại. Vui lòng thử lại.',
          );
        }
      } else {
        const role = res?.user?.role;
        if (role !== 'ADMIN') trackEvent('login', { method: 'email' });
        if (role === 'ADMIN') {
          const targetUrl = callbackUrl && callbackUrl.startsWith('/admin') ? callbackUrl : '/admin/dashboard';
          router.push(targetUrl);
        } else if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.push('/products');
        }
      }
    } catch {
      setIsLoading(false);
      setError('Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
    }
  };

  return (
    <>
      <AuthHeading eyebrow="Tài khoản" title="Đăng nhập">
        Chưa có tài khoản?{' '}
        <Link href="/register" className={authTextLinkClassName}>
          Tạo tài khoản
        </Link>
      </AuthHeading>

      {unverifiedEmail ? (
        <AuthAlert tone="notice">
          <p>Tài khoản chưa xác thực email. Vui lòng xác thực OTP trước khi đăng nhập.</p>
          <Link
            href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
            className={`mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] ${authTextLinkClassName}`}
          >
            Xác thực ngay
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </AuthAlert>
      ) : error ? (
        <AuthAlert tone="error">{error}</AuthAlert>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AuthField id="email" label="Email">
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            className={authInputClassName}
            placeholder="nhap@email.com"
            required
            disabled={isLoading}
          />
        </AuthField>

        <AuthField
          id="password"
          label="Mật khẩu"
          action={(
            <Link href="/forgot-password" className={`text-xs ${authTextLinkClassName}`}>
              Quên mật khẩu?
            </Link>
          )}
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            required
            disabled={isLoading}
          />
        </AuthField>

        <div className="mt-2">
          <AuthSubmitButton isLoading={isLoading} loadingLabel="Đang đăng nhập">
            Đăng nhập
          </AuthSubmitButton>
        </div>
      </form>

      <AuthDivider />

      <GoogleButton />
    </>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[320px] items-center justify-center">
        <AtelierLoader size="md" label="Đang luồn chỉ" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}

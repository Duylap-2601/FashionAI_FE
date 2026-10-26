'use client';

import { GoogleButton } from '@/features/auth/components/AuthLayout';
import {
  AuthAlert,
  AuthCheckbox,
  AuthDivider,
  AuthField,
  AuthHeading,
  AuthSubmitButton,
  PasswordInput,
  authInputClassName,
  authTextLinkClassName,
} from '@/features/auth/components/auth-form';
import { registerWithPassword } from '@/features/auth/services/mutations';
import { AuthClientError } from '@/features/auth/services/session';
import { trackEvent } from '@/lib/analytics';
import { Check, Circle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

// Độ mạnh chỉ dựa trên độ dài, khớp với quy tắc tối thiểu 8 ký tự của backend.
const STRENGTH_COLORS: Record<number, string> = {
  1: 'bg-destructive',
  2: 'bg-landing-brass',
  3: 'bg-landing-sage-ink',
};

export default function Register() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const passwordRules = [
    { label: 'Ít nhất 8 ký tự', isValid: password.length >= 8 },
    { label: 'Xác nhận mật khẩu trùng khớp', isValid: Boolean(confirmPassword) && password === confirmPassword },
  ];

  const getStrength = (pw: string) => {
    if (!pw) return 0;
    if (pw.length < 8) return 1;
    if (pw.length < 12) return 2;
    return 3;
  };

  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSuccess(false);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('name') as string;
    const email = formData.get('email') as string;
    const pass = formData.get('password') as string;
    const confirm = formData.get('confirm') as string;

    if (pass.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    if (pass !== confirm) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await registerWithPassword({
        name: fullName,
        email,
        password: pass,
        confirmPassword: confirm,
      });

      setIsSuccess(true);
      trackEvent('sign_up', { method: 'email' });
      const targetEmail = res?.email || email;
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(targetEmail)}`);
      }, 1000);
    } catch (err: unknown) {
      const errorBody = err instanceof AuthClientError && err.data && typeof err.data === 'object'
        ? err.data as { message?: string; details?: string[] }
        : undefined;
      setIsLoading(false);
      setError(
        errorBody?.details?.[0] ||
        errorBody?.message ||
        'Đăng ký tài khoản thất bại. Email có thể đã tồn tại.',
      );
    }
  };

  return (
    <>
      <AuthHeading eyebrow="Tài khoản mới" title="Tạo tài khoản">
        Đã có tài khoản?{' '}
        <Link href="/login" className={authTextLinkClassName}>
          Đăng nhập
        </Link>
      </AuthHeading>

      {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}
      {isSuccess ? (
        <AuthAlert tone="success">Đăng ký thành công. Đang chuyển đến bước xác thực OTP.</AuthAlert>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AuthField id="name" label="Họ và tên">
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="name"
            className={authInputClassName}
            placeholder="Nguyễn Văn A"
            required
            disabled={isLoading}
          />
        </AuthField>

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

        <AuthField id="password" label="Mật khẩu">
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ít nhất 8 ký tự"
            minLength={8}
            required
            disabled={isLoading}
            aria-describedby="password-rules"
          />
          <div className="mt-3 grid grid-cols-3 gap-1.5" aria-hidden="true">
            {[1, 2, 3].map((level) => (
              <span
                key={level}
                className={`h-0.5 transition-colors ${strength >= level ? STRENGTH_COLORS[strength] : 'bg-landing-line'}`}
              />
            ))}
          </div>
          <ul id="password-rules" className="mt-3 space-y-1.5">
            {passwordRules.map((rule) => (
              <li
                key={rule.label}
                className={`flex items-center gap-2 text-xs transition-colors ${rule.isValid ? 'text-landing-sage-ink' : 'text-landing-muted'}`}
              >
                {rule.isValid ? (
                  <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                ) : (
                  <Circle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                )}
                <span>{rule.label}</span>
              </li>
            ))}
          </ul>
        </AuthField>

        <AuthField id="confirm" label="Xác nhận mật khẩu">
          <PasswordInput
            id="confirm"
            name="confirm"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            minLength={8}
            required
            disabled={isLoading}
            showLabel="Hiện mật khẩu xác nhận"
            hideLabel="Ẩn mật khẩu xác nhận"
          />
        </AuthField>

        <AuthCheckbox required disabled={isLoading}>
          Tôi đồng ý với{' '}
          <Link href="/terms" target="_blank" rel="noopener noreferrer" className={authTextLinkClassName}>
            Điều khoản dịch vụ
          </Link>{' '}
          và{' '}
          <Link href="/privacy" target="_blank" rel="noopener noreferrer" className={authTextLinkClassName}>
            Chính sách bảo mật
          </Link>
        </AuthCheckbox>

        <div className="mt-2">
          <AuthSubmitButton isLoading={isLoading} loadingLabel="Đang tạo tài khoản">
            Tạo tài khoản
          </AuthSubmitButton>
        </div>
      </form>

      <AuthDivider />

      <GoogleButton />
    </>
  );
}

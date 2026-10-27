'use client';

import { cn } from '@/components/ui/utils';
import {
  AuthAlert,
  AuthField,
  AuthHeading,
  AuthSubmitButton,
  authInputClassName,
  authTextLinkClassName,
} from '@/features/auth/components/auth-form';
import { requestPasswordReset } from '@/features/auth/services/mutations';
import { getErrorMessage } from '@/lib/errors';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

const DEFAULT_ERROR = 'Không thể gửi email đặt lại mật khẩu.';

const secondaryButtonClassName = cn(
  'inline-flex h-12 w-full items-center justify-center gap-2 rounded-[2px] border border-landing-obsidian/70 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood disabled:cursor-wait disabled:opacity-60',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood',
);

async function sendResetEmail(email: string) {
  const response = await requestPasswordReset(email);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      body?.details?.[0] ||
      (Array.isArray(body?.message) ? body?.message[0] : body?.message) ||
      DEFAULT_ERROR;
    throw new Error(message);
  }
}

export default function ForgotPassword() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await sendResetEmail(email);
      setResendStatus(null);
      setIsSuccess(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, DEFAULT_ERROR));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setResendStatus(null);
    setIsLoading(true);

    try {
      await sendResetEmail(email);
      setResendStatus('Đã gửi lại link đặt lại mật khẩu.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, DEFAULT_ERROR));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Link
        href="/login"
        className={`mb-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] ${authTextLinkClassName}`}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Quay lại đăng nhập
      </Link>

      {!isSuccess ? (
        <>
          <AuthHeading eyebrow="Khôi phục tài khoản" title="Quên mật khẩu?">
            Nhập email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu.
          </AuthHeading>

          {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <AuthField id="email" label="Email">
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={authInputClassName}
                placeholder="nhap@email.com"
                required
                disabled={isLoading}
              />
            </AuthField>

            <div className="mt-2">
              <AuthSubmitButton isLoading={isLoading} loadingLabel="Đang gửi">
                Gửi link đặt lại
              </AuthSubmitButton>
            </div>
          </form>
        </>
      ) : (
        <div className="animate-in fade-in-0">
          {/* Backend không cho biết email có tồn tại hay không, nên câu chữ không khẳng định đã gửi. */}
          <AuthHeading eyebrow="Đã gửi yêu cầu" title="Kiểm tra email của bạn">
            Nếu <span className="font-medium text-landing-obsidian">{email}</span> đã đăng ký tài khoản, link đặt lại
            mật khẩu đã được gửi tới hộp thư. Link có hiệu lực trong 1 giờ.
          </AuthHeading>

          {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}
          {resendStatus ? <AuthAlert tone="success">{resendStatus}</AuthAlert> : null}

          <div className="flex flex-col gap-3">
            <button type="button" onClick={handleResend} disabled={isLoading} className={secondaryButtonClassName}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : null}
              {isLoading ? 'Đang gửi lại' : 'Gửi lại email'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSuccess(false);
                setError(null);
                setResendStatus(null);
              }}
              className={`h-11 text-[11px] uppercase tracking-[0.18em] ${authTextLinkClassName}`}
            >
              Dùng email khác
            </button>
          </div>
        </div>
      )}
    </>
  );
}

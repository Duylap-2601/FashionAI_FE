'use client';

import { AuthCenteredLayout } from '@/features/auth/components/AuthLayout';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { resendVerification, verifyEmail } from '@/features/auth/services/mutations';
import { getErrorMessage } from '@/lib/errors';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Pencil,
  RotateCw,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(!initialEmail);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Countdown timer for resend OTP cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (codeToVerify?: string) => {
    const finalOtp = (codeToVerify ?? otp).trim();
    const finalEmail = email.trim();

    if (!finalEmail) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }

    if (!finalOtp || finalOtp.length !== 4) {
      setError('Vui lòng nhập đủ 4 chữ số của mã OTP.');
      return;
    }

    setError(null);
    setSuccessNotice(null);
    setIsLoading(true);

    try {
      const response = await verifyEmail({ email: finalEmail, otp: finalOtp });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg =
          body?.message ||
          body?.details?.[0] ||
          'Mã OTP không hợp lệ hoặc đã hết hạn.';

        if (errorMsg.includes('quá nhiều lần')) {
          setIsLocked(true);
        }

        throw new Error(errorMsg);
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1800);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Xác thực OTP thất bại.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    const finalEmail = email.trim();
    if (!finalEmail) {
      setError('Vui lòng nhập địa chỉ email để nhận mã OTP.');
      return;
    }

    setError(null);
    setSuccessNotice(null);
    setIsResending(true);

    try {
      const response = await resendVerification(finalEmail);
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.message || 'Không thể gửi lại mã OTP lúc này.');
      }

      setCountdown(60);
      setOtp('');
      setIsLocked(false);
      setSuccessNotice('Mã OTP mới đã được gửi tới email của bạn.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không thể gửi lại mã OTP.'));
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(null);
    if (value.length === 4) {
      handleVerify(value);
    }
  };

  return (
    <AuthCenteredLayout>
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-body-sm text-neutral-500 hover:text-brand-navy font-medium mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
      </Link>

      {!isSuccess ? (
        <>
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-[#5D1C34]/10 rounded-2xl flex items-center justify-center mb-4 text-[#5D1C34]">
              <Mail className="w-7 h-7" />
            </div>
            <h2 className="text-[24px] font-semibold text-brand-navy mb-2 tracking-tight">
              Xác thực email
            </h2>
            <p className="text-body-sm text-neutral-500 max-w-sm leading-relaxed">
              Vui lòng nhập mã OTP 4 chữ số đã được gửi đến email của bạn để kích hoạt tài khoản.
            </p>
          </div>

          {/* Email badge / edit input */}
          <div className="mb-6 p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
            {isEditingEmail ? (
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="flex-1 h-9 px-3 bg-white border border-neutral-300 rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-[#5D1C34]/20 focus:border-[#5D1C34]"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(false)}
                  className="h-9 px-3 bg-brand-navy text-white text-body-xs font-semibold rounded-lg hover:bg-brand-navy/90 transition-colors"
                >
                  Xong
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-body-xs text-neutral-500 shrink-0">Email:</span>
                  <span className="text-body-sm font-medium text-neutral-900 truncate">
                    {email || '(Chưa nhập email)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(true)}
                  className="inline-flex items-center gap-1 text-body-xs text-[#5D1C34] hover:underline font-medium ml-2 shrink-0"
                >
                  <Pencil className="w-3 h-3" /> Đổi
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-semantic-error text-body-sm animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
                {isLocked && (
                  <p className="mt-1 text-body-xs text-red-700/90 font-medium">
                    Mã đã bị khoá do nhập sai nhiều lần. Hãy bấm &quot;Gửi lại mã&quot; bên dưới để nhận mã mới.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Success / Info Notice */}
          {successNotice && (
            <div className="mb-5 flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-semantic-success text-body-sm animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* 4-digit OTP Input */}
          <div className="flex flex-col items-center justify-center my-6">
            <InputOTP
              maxLength={4}
              value={otp}
              onChange={handleOtpChange}
              pattern={REGEXP_ONLY_DIGITS}
              disabled={isLoading || isSuccess || isLocked}
            >
              <InputOTPGroup className="gap-3">
                <InputOTPSlot
                  index={0}
                  className="w-14 h-16 text-2xl font-bold text-brand-navy rounded-xl border border-neutral-300 focus:border-[#5D1C34] focus:ring-2 focus:ring-[#5D1C34]/20 transition-all bg-white shadow-sm"
                />
                <InputOTPSlot
                  index={1}
                  className="w-14 h-16 text-2xl font-bold text-brand-navy rounded-xl border border-neutral-300 focus:border-[#5D1C34] focus:ring-2 focus:ring-[#5D1C34]/20 transition-all bg-white shadow-sm"
                />
                <InputOTPSlot
                  index={2}
                  className="w-14 h-16 text-2xl font-bold text-brand-navy rounded-xl border border-neutral-300 focus:border-[#5D1C34] focus:ring-2 focus:ring-[#5D1C34]/20 transition-all bg-white shadow-sm"
                />
                <InputOTPSlot
                  index={3}
                  className="w-14 h-16 text-2xl font-bold text-brand-navy rounded-xl border border-neutral-300 focus:border-[#5D1C34] focus:ring-2 focus:ring-[#5D1C34]/20 transition-all bg-white shadow-sm"
                />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-body-xs text-neutral-400 mt-3">Mã OTP có hiệu lực trong 5 phút</p>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={isLoading || otp.length !== 4 || isLocked}
            className="w-full h-11 bg-brand-navy text-white text-body-sm font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" /> Đang xác thực...
              </>
            ) : (
              'Xác thực tài khoản'
            )}
          </button>

          {/* Resend Section */}
          <div className="mt-6 flex flex-col items-center text-center gap-2">
            <span className="text-body-sm text-neutral-500">Chưa nhận được mã?</span>
            {countdown > 0 ? (
              <span className="text-body-sm font-medium text-neutral-400">
                Gửi lại sau <span className="font-semibold text-neutral-600">{countdown}s</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-[#5D1C34] hover:text-[#4A1628] hover:underline transition-colors disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" /> Đang gửi lại...
                  </>
                ) : (
                  'Gửi lại mã OTP'
                )}
              </button>
            )}
          </div>
        </>
      ) : (
        /* Success State */
        <div className="flex flex-col items-center text-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-5 text-semantic-success">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-[22px] font-semibold text-brand-navy mb-2 tracking-tight">
            Xác thực email thành công!
          </h2>
          <p className="text-body-sm text-neutral-600 mb-6">
            Tài khoản của bạn đã được kích hoạt. Đang chuyển hướng đến trang đăng nhập...
          </p>

          <Link
            href="/login"
            className="w-full h-11 bg-brand-navy text-white text-body-sm font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors flex items-center justify-center"
          >
            Đăng nhập ngay
          </Link>
        </div>
      )}
    </AuthCenteredLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-brand-cream">
          <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

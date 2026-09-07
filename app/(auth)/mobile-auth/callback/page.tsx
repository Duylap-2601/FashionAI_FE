'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { AuthCenteredLayout } from '@/components/auth/AuthLayout';

export default function MobileAuthCallbackPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MobileAuthCallbackContent />
    </Suspense>
  );
}

function MobileAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completeLogin = async () => {
      const code = searchParams.get('code');
      const authError = searchParams.get('error');

      if (authError) {
        setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
        return;
      }

      if (!code) {
        setError('Thiếu mã xác thực. Vui lòng thử lại.');
        return;
      }

      try {
        const res = await fetch('/api/backend/auth/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code }),
        });

        const body = await res.json().catch(() => null);
        if (!res.ok) {
          setError(body?.message || 'Không thể xác thực. Vui lòng thử lại.');
          return;
        }

        const payload = body?.data ?? body;
        const result = await signIn('backend-session', {
          accessToken: payload.accessToken,
          accessTokenExpiresAt: payload.accessTokenExpiresAt,
          user: JSON.stringify(payload.user),
          redirect: false,
        });

        if (result?.error) {
          setError('Không thể tạo phiên đăng nhập. Vui lòng thử lại.');
          return;
        }

        router.replace('/products');
      } catch {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    };

    completeLogin();
  }, [router, searchParams]);

  if (error) {
    return (
      <AuthCenteredLayout>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-50 text-semantic-error flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[20px] font-semibold text-brand-navy mb-2">Đăng nhập thất bại</h1>
            <p className="text-body-sm text-neutral-500">{error}</p>
          </div>
        </div>
      </AuthCenteredLayout>
    );
  }

  return <Loading />;
}

function Loading() {
  return (
    <AuthCenteredLayout>
      <div className="flex flex-col items-center text-center gap-4">
        <Loader2 className="w-8 h-8 text-brand-navy animate-spin" />
        <div>
          <h1 className="text-[20px] font-semibold text-brand-navy mb-2">Đang đăng nhập</h1>
          <p className="text-body-sm text-neutral-500">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    </AuthCenteredLayout>
  );
}

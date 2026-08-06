'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { AuthCenteredLayout } from '@/components/auth/AuthLayout';

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<GoogleCallbackLoading />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completeLogin = async () => {
      const authError = searchParams.get('error');
      const accessToken = searchParams.get('accessToken');
      const encodedUser = searchParams.get('user');

      if (authError || !accessToken || !encodedUser) {
        setError('Không thể đăng nhập bằng Google. Vui lòng thử lại.');
        return;
      }

      try {
        const user = JSON.parse(atobUrlSafe(encodedUser));
        const result = await signIn('backend-session', {
          accessToken,
          user: JSON.stringify(user),
          redirect: false,
        });

        if (result?.error) {
          setError('Không thể tạo phiên đăng nhập. Vui lòng thử lại.');
          return;
        }

        router.replace('/products');
      } catch {
        setError('Dữ liệu đăng nhập Google không hợp lệ. Vui lòng thử lại.');
      }
    };

    completeLogin();
  }, [router, searchParams]);

  return (
    <AuthCenteredLayout>
      {error ? (
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-50 text-semantic-error flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[20px] font-semibold text-brand-navy mb-2">Đăng nhập thất bại</h1>
            <p className="text-body-sm text-neutral-500">{error}</p>
          </div>
          <Link
            href="/login"
            className="w-full h-11 bg-brand-navy text-white text-body-sm font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors flex items-center justify-center"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-4">
          <Loader2 className="w-8 h-8 text-brand-navy animate-spin" />
          <div>
            <h1 className="text-[20px] font-semibold text-brand-navy mb-2">Đang đăng nhập</h1>
            <p className="text-body-sm text-neutral-500">Vui lòng chờ trong giây lát.</p>
          </div>
        </div>
      )}
    </AuthCenteredLayout>
  );
}

function GoogleCallbackLoading() {
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

function atobUrlSafe(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  );

  return window.atob(padded);
}

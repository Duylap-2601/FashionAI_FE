'use client';

import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { PROTECTED_ROUTES } from '@/features/auth/constants/auth-bootstrap';
import { subscribeAuthInvalidated } from '@/features/auth/services/auth-events';
import { isSessionRejected, refreshWebSessionWithRetry } from '@/features/auth/services/mutations';
import { fetchCurrentUser } from '@/features/auth/services/queries';
import { toAuthSession } from '@/features/auth/services/session';
import { clearAuthMarker, hasAuthMarker, useAuthStore } from '@/features/auth/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export function AuthBootstrap() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasBootstrappedRef = useRef(false);

  useEffect(() => {
    // If already bootstrapped in this lifecycle, or if user already has an authenticated state, skip!
    if (hasBootstrappedRef.current) return;
    if (useAuthStore.getState().status === 'authenticated') {
      hasBootstrappedRef.current = true;
      return;
    }

    let isMounted = true;
    const store = useAuthStore.getState();

    async function bootstrap() {
      if (!hasAuthMarker()) {
        store.clearSession();
        hasBootstrappedRef.current = true;
        return;
      }

      store.setLoading();
      if (isMounted) setIsRefreshing(true);

      try {
        const payload = await refreshWebSessionWithRetry();
        let user = payload?.user;
        if (!user && payload?.accessToken) {
          user = await fetchCurrentUser(payload.accessToken);
        }

        const session = toAuthSession({ ...payload, user });
        if (!session) throw new Error('Invalid refresh payload');
        if (isMounted) {
          useAuthStore.getState().setSession(session);
          if (session.user?.role === 'ADMIN' && !pathname.startsWith('/admin')) {
            router.replace('/admin/dashboard');
          }
        }
      } catch (error) {
        if (isMounted) {
          if (isSessionRejected(error)) {
            clearInvalidSession(queryClient);
          } else {
            // Máy chủ chưa trả lời: phiên có thể vẫn còn, giữ marker để lần tải sau thử lại.
            useAuthStore.getState().clearSession();
            toast.error('Chưa kết nối được máy chủ. Tải lại trang để vào lại tài khoản.');
          }
          redirectIfProtected(pathname, search, router);
        }
      } finally {
        hasBootstrappedRef.current = true;
        if (isMounted) setIsRefreshing(false);
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [pathname, queryClient, router, search]);

  useEffect(() => {
    return subscribeAuthInvalidated((event) => {
      clearInvalidSession(queryClient);
      if (event.redirectTo) {
        router.replace(event.redirectTo);
      } else {
        redirectIfProtected(pathname, search, router);
      }
    });
  }, [pathname, queryClient, router, search]);

  if (!isRefreshing) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-landing-paper landing-paper-texture">
      <AtelierLoader size="lg" label="Đang luồn chỉ" showBrand />
    </div>
  );
}

function clearInvalidSession(queryClient: ReturnType<typeof useQueryClient>) {
  useAuthStore.getState().clearSession();
  clearAuthMarker();
  queryClient.clear();
  import('@/lib/realtimeSocket')
    .then(({ disconnectAllSockets }) => disconnectAllSockets())
    .catch(() => undefined);
}

function redirectIfProtected(pathname: string, search: string, router: ReturnType<typeof useRouter>) {
  if (!PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) return;
  const callbackUrl = search ? `${pathname}?${search}` : pathname;
  router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
}

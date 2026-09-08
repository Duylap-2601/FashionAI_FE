'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { fetchCurrentUser, refreshWebSession, toAuthSession } from '@/lib/authClient';
import { subscribeAuthInvalidated } from '@/lib/authEvents';
import { clearAuthMarker, hasAuthMarker, useAuthStore } from '@/store/authStore';

const PROTECTED_ROUTES = ['/try-on', '/profile', '/ai-stylist', '/chat', '/checkout', '/admin'];

export function AuthBootstrap() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const store = useAuthStore.getState();

    async function bootstrap() {
      if (!hasAuthMarker()) {
        store.clearSession();
        return;
      }

      store.setLoading();
      if (isMounted) setIsRefreshing(true);

      try {
        const payload = await refreshWebSession();
        let user = payload?.user;
        if (!user && payload?.accessToken) {
          user = await fetchCurrentUser(payload.accessToken);
        }

        const session = toAuthSession({ ...payload, user });
        if (!session) throw new Error('Invalid refresh payload');
        if (isMounted) useAuthStore.getState().setSession(session);
      } catch {
        if (isMounted) {
          clearInvalidSession(queryClient);
          redirectIfProtected(pathname, router);
        }
      } finally {
        if (isMounted) setIsRefreshing(false);
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [pathname, queryClient, router]);

  useEffect(() => {
    return subscribeAuthInvalidated((event) => {
      clearInvalidSession(queryClient);
      if (event.redirectTo) {
        router.replace(event.redirectTo);
      } else {
        redirectIfProtected(pathname, router);
      }
    });
  }, [pathname, queryClient, router]);

  if (!isRefreshing) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#EFE9E1]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#5D1C34] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#5D1C34]/70 font-medium">Đang tải...</p>
      </div>
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

function redirectIfProtected(pathname: string, router: ReturnType<typeof useRouter>) {
  if (!PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) return;
  router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
}

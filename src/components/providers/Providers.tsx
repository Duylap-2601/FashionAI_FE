'use client';

import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';

const AuthBootstrap = dynamic(
  () => import('@/features/auth/components/AuthBootstrap').then((mod) => mod.AuthBootstrap),
  { ssr: false },
);

const RealtimeProvider = dynamic(
  () => import('@/components/providers/RealtimeProvider').then((mod) => mod.RealtimeProvider),
  { ssr: false },
);

export function Providers({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });

    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      });
    }
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error: unknown) => {
              const status = readHttpStatus(error);
              if (status === 401 || status === 403 || status === 404) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <RealtimeProvider>
        {children}
        <Toaster />
        <InstallPrompt />
      </RealtimeProvider>
    </QueryClientProvider>
  );
}

function readHttpStatus(error: unknown) {
  if (!error || typeof error !== 'object' || !('response' in error)) return undefined;
  const response = (error as { response?: { status?: unknown } }).response;
  return typeof response?.status === 'number' ? response.status : undefined;
}

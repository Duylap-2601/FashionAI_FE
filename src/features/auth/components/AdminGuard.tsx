'use client';

import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoggedIn, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!isLoggedIn) {
      router.replace('/login?callbackUrl=/admin/dashboard');
      return;
    }
    if (isLoggedIn && currentUser.role !== 'admin') {
      router.replace('/');
    }
  }, [currentUser, isLoggedIn, router, status]);

  if (status === 'loading' || !isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-100">
        <AtelierLoader size="md" label="Đang mở xưởng" />
      </div>
    );
  }

  if (currentUser.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}


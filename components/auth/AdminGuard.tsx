'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn && currentUser.role !== 'admin') {
      router.replace('/');
    }
  }, [currentUser, isLoggedIn, router]);

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-100">
        <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (currentUser.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}


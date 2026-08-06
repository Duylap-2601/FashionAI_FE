'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser.role !== 'admin') {
      router.replace('/');
    }
  }, [currentUser, router]);

  if (currentUser.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}


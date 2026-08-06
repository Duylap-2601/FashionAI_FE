'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthCenteredLayout } from '@/components/auth/AuthLayout';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Dang xac thuc email...');

  useEffect(() => {
    const verify = async () => {
      const token = new URLSearchParams(window.location.search).get('token');
      if (!token) {
        setStatus('error');
        setMessage('Thieu token xac thuc email.');
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl.replace(/\/$/, '')}/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.message || 'Xac thuc email that bai.');
        setStatus('success');
        setMessage(body?.message || 'Xac thuc email thanh cong.');
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Xac thuc email that bai.');
      }
    };

    verify();
  }, []);

  return (
    <AuthCenteredLayout>
      <div className="text-center">
        <h1 className="text-[24px] font-semibold text-brand-navy mb-3">
          {status === 'loading' ? 'Dang xac thuc' : status === 'success' ? 'Email da xac thuc' : 'Xac thuc that bai'}
        </h1>
        <p className="text-body-sm text-neutral-600 mb-6">{message}</p>
        <Link href="/login" className="w-full h-11 bg-brand-navy text-white text-body-sm font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors flex items-center justify-center">
          Ve trang dang nhap
        </Link>
      </div>
    </AuthCenteredLayout>
  );
}

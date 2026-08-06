'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { AuthCenteredLayout } from '@/components/auth/AuthLayout';

export default function ForgotPassword() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || 'Khong the gui email dat lai mat khau.');
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the gui email dat lai mat khau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCenteredLayout>
      {!isSuccess ? (
        <>
          <Link href="/login" className="inline-flex items-center gap-1.5 text-body-sm text-neutral-500 hover:text-brand-navy font-medium mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          
          <div className="mb-8">
            <h2 className="text-[24px] font-semibold text-brand-navy mb-2 tracking-tight">Quên mật khẩu?</h2>
            <p className="text-body-sm text-neutral-500 leading-relaxed">
              Nhập email của bạn, chúng tôi sẽ gửi link để đặt lại mật khẩu.
            </p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-semantic-error text-body-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-label-sm font-medium text-neutral-700 mb-1.5" htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3.5 bg-white border border-neutral-300 rounded-xl text-body-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5D1C34]/20 focus:border-[#5D1C34] transition-all"
                placeholder="nhap@email.com"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full h-11 bg-brand-navy text-white text-body-sm font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors mt-2"
            >
              Gửi link đặt lại
            </button>
          </form>
        </>
      ) : (
        <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-semantic-success" />
          </div>
          <h3 className="text-[20px] font-semibold text-brand-navy mb-2 tracking-tight">Kiểm tra email của bạn</h3>
          <p className="text-body-sm text-neutral-600 leading-relaxed mb-8">
            Link đặt lại mật khẩu đã được gửi đến <span className="font-medium text-neutral-900">{email || 'email của bạn'}</span>.<br/>Có hiệu lực trong 1 giờ.
          </p>
          
          <div className="flex flex-col w-full gap-3">
            <button 
              onClick={() => setIsSuccess(false)}
              className="w-full h-11 bg-white border border-neutral-200 text-neutral-700 text-body-sm font-semibold rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all"
            >
              Gửi lại
            </button>
            <Link 
              href="/login"
              className="w-full h-11 flex items-center justify-center text-neutral-500 hover:text-brand-navy text-body-sm font-medium transition-colors"
            >
              &larr; Quay lại đăng nhập
            </Link>
          </div>
        </div>
      )}
    </AuthCenteredLayout>
  );
}

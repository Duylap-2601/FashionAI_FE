'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthCenteredLayout } from '@/components/auth/AuthLayout';
import { AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isExpired = false;

  const getStrength = (pw: string) => {
    if (!pw) return 0;
    if (pw.length < 6) return 1;
    if (pw.length < 10) return 2;
    return 3;
  };
  
  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Mat khau phai co it nhat 8 ky tu.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mat khau xac nhan khong trung khop.');
      return;
    }

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setError('Thieu token dat lai mat khau.');
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.details?.[0] || body?.message || 'Khong the dat lai mat khau.');
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the dat lai mat khau.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isExpired) {
    return (
      <AuthCenteredLayout>
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle className="w-5 h-5 text-semantic-error shrink-0 mt-0.5" />
            <div>
              <h3 className="text-body-md font-semibold text-semantic-error mb-1">Link đã hết hạn</h3>
              <p className="text-body-sm text-red-700/80 mb-2">Yêu cầu đặt lại mật khẩu của bạn đã quá 1 giờ hoặc đã được sử dụng.</p>
              <Link href="/forgot-password" className="text-body-sm font-medium text-semantic-error hover:underline">
                Yêu cầu link mới &rarr;
              </Link>
            </div>
          </div>
          
          <Link 
            href="/login"
            className="w-full h-11 flex items-center justify-center border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 hover:text-brand-navy text-body-sm font-medium transition-all"
          >
            Về trang đăng nhập
          </Link>
        </div>
      </AuthCenteredLayout>
    );
  }

  return (
    <AuthCenteredLayout>
      <div className="mb-8">
        <h2 className="text-[24px] font-semibold text-brand-navy mb-2 tracking-tight">Đặt mật khẩu mới</h2>
      </div>

      {isSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-xl text-semantic-success text-body-sm">Dat lai mat khau thanh cong. Ban co the dang nhap lai.</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-semantic-error text-body-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-label-sm font-medium text-neutral-700 mb-1.5" htmlFor="new-password">Mật khẩu mới</label>
          <input 
            type="password" 
            id="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-3.5 bg-white border border-neutral-300 rounded-xl text-body-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5D1C34]/20 focus:border-[#5D1C34] transition-all"
            placeholder="••••••••"
            required
          />
          {password && (
            <div className="flex gap-1.5 mt-2.5">
              <div className={`h-1 flex-1 rounded-full ${strength >= 1 ? (strength === 1 ? 'bg-semantic-error' : strength === 2 ? 'bg-orange-500' : 'bg-semantic-success') : 'bg-neutral-200'}`}></div>
              <div className={`h-1 flex-1 rounded-full ${strength >= 2 ? (strength === 2 ? 'bg-orange-500' : 'bg-semantic-success') : 'bg-neutral-200'}`}></div>
              <div className={`h-1 flex-1 rounded-full ${strength >= 3 ? 'bg-semantic-success' : 'bg-neutral-200'}`}></div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-label-sm font-medium text-neutral-700 mb-1.5" htmlFor="confirm-password">Xác nhận mật khẩu mới</label>
          <input 
            type="password" 
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-11 px-3.5 bg-white border border-neutral-300 rounded-xl text-body-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5D1C34]/20 focus:border-[#5D1C34] transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        <button 
          type="submit" 
          className="w-full h-11 bg-brand-navy text-white text-body-sm font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors mt-2"
        >
          Cập nhật mật khẩu
        </button>
      </form>
    </AuthCenteredLayout>
  );
}

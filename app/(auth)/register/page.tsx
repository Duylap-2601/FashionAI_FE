'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthSplitLayout, GoogleButton } from '@/components/auth/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export default function Register() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const passwordRules = [
    { label: 'Ít nhất 8 ký tự', isValid: password.length >= 8 },
    { label: 'Xác nhận mật khẩu trùng khớp', isValid: Boolean(confirmPassword) && password === confirmPassword },
  ];

  const getStrength = (pw: string) => {
    if (!pw) return 0;
    if (pw.length < 8) return 1;
    if (pw.length < 12) return 2;
    return 3;
  };

  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSuccess(false);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('name') as string;
    const email = formData.get('email') as string;
    const pass = formData.get('password') as string;
    const confirm = formData.get('confirm') as string;

    if (pass.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    if (pass !== confirm) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/register`, {
        name: fullName,
        email,
        password: pass,
        confirmPassword: confirm,
      }, { withCredentials: true });

      setIsSuccess(true);
      await login(email, pass);

      setTimeout(() => {
        router.push('/products');
      }, 1500);
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string; details?: string[] } } };
      setIsLoading(false);
      setError(
        axiosError.response?.data?.details?.[0] ||
        axiosError.response?.data?.message ||
        'Đăng ký tài khoản thất bại. Email có thể đã tồn tại.',
      );
    }
  };

  return (
    <AuthSplitLayout>
      <div className="mb-8">
        <h2 className="text-[24px] font-semibold text-brand-navy mb-2 tracking-tight">Tạo tài khoản</h2>
        <p className="text-body-sm text-neutral-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-[#5D1C34] font-medium hover:text-[#4A1628] transition-colors">
            Đăng nhập -&gt;
          </Link>
        </p>
      </div>

      <GoogleButton />

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-neutral-200"></div>
        <span className="text-label-sm text-neutral-400 font-medium uppercase tracking-wider">hoặc</span>
        <div className="flex-1 h-px bg-neutral-200"></div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-semantic-error text-body-sm animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-label-sm font-medium text-neutral-700 mb-1.5" htmlFor="name">Họ và tên</label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full h-11 px-3.5 bg-white border border-neutral-300 rounded-xl text-body-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5D1C34]/20 focus:border-[#5D1C34] transition-all"
            placeholder="Nguyễn Văn A"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-label-sm font-medium text-neutral-700 mb-1.5" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full h-11 px-3.5 bg-white border border-neutral-300 rounded-xl text-body-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5D1C34]/20 focus:border-[#5D1C34] transition-all"
            placeholder="nhap@email.com"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-label-sm font-medium text-neutral-700 mb-1.5" htmlFor="password">Mật khẩu</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 pl-3.5 pr-10 bg-white border border-neutral-300 rounded-xl text-body-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5D1C34]/20 focus:border-[#5D1C34] transition-all"
              placeholder="Nhập ít nhất 8 ký tự"
              minLength={8}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-1.5 mt-2.5">
            <div className={`h-1 flex-1 rounded-full ${strength >= 1 ? (strength === 1 ? 'bg-semantic-error' : strength === 2 ? 'bg-orange-500' : 'bg-semantic-success') : 'bg-neutral-200'}`}></div>
            <div className={`h-1 flex-1 rounded-full ${strength >= 2 ? (strength === 2 ? 'bg-orange-500' : 'bg-semantic-success') : 'bg-neutral-200'}`}></div>
            <div className={`h-1 flex-1 rounded-full ${strength >= 3 ? 'bg-semantic-success' : 'bg-neutral-200'}`}></div>
          </div>
          <div className="mt-2 space-y-1">
            {passwordRules.map((rule) => (
              <div key={rule.label} className={`flex items-center gap-1.5 text-[12px] ${rule.isValid ? 'text-semantic-success' : 'text-neutral-500'}`}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{rule.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-label-sm font-medium text-neutral-700 mb-1.5" htmlFor="confirm">Xác nhận mật khẩu</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirm"
              name="confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-11 pl-3.5 pr-10 bg-white border border-neutral-300 rounded-xl text-body-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5D1C34]/20 focus:border-[#5D1C34] transition-all"
              placeholder="Nhập lại mật khẩu"
              minLength={8}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer mt-1 mb-2">
          <div className="relative flex items-center justify-center mt-0.5 shrink-0">
            <input type="checkbox" className="peer sr-only" required disabled={isLoading} />
            <div className="w-4 h-4 border border-neutral-300 rounded bg-white peer-checked:bg-[#5D1C34] peer-checked:border-[#5D1C34] transition-colors"></div>
            <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-body-sm text-neutral-600 leading-snug">
            Tôi đồng ý với <a href="#" className="text-brand-navy font-medium hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-brand-navy font-medium hover:underline">Chính sách bảo mật</a>
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-gradient-to-r from-[#5D1C34] to-[#A67D44] text-white text-body-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {isLoading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
        </button>

        {isSuccess && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-xl mt-2 animate-in fade-in zoom-in duration-200">
            <svg className="w-4 h-4 text-semantic-success shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-body-sm text-semantic-success font-medium">Đăng ký thành công! Đang chuyển trang...</span>
          </div>
        )}
      </form>
    </AuthSplitLayout>
  );
}

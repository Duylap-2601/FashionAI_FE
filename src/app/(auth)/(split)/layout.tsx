import { AuthSplitLayout } from '@/features/auth/components/AuthLayout';
import React from 'react';

// Layout giữ nguyên khi chuyển giữa đăng nhập, đăng ký và quên mật khẩu để panel ảnh trượt qua lại.
export default function AuthSplitRouteLayout({ children }: { children: React.ReactNode }) {
  return <AuthSplitLayout>{children}</AuthSplitLayout>;
}

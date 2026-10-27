'use client';

import { useChangePassword } from '@/features/auth/hooks/use-change-password';
import {
  AccountDialog,
  accountButtonClassName,
  accountFocusRing,
  accountInputClassName,
} from '@/features/profile/components/account-ui';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';

const FIELDS: { id: PasswordField; label: string; autoComplete: string; hint?: string }[] = [
  { id: 'currentPassword', label: 'Mật khẩu hiện tại', autoComplete: 'current-password' },
  { id: 'newPassword', label: 'Mật khẩu mới', autoComplete: 'new-password', hint: 'Ít nhất 8 ký tự.' },
  { id: 'confirmPassword', label: 'Nhập lại mật khẩu mới', autoComplete: 'new-password' },
];

const EMPTY_FORM: Record<PasswordField, string> = { currentPassword: '', newPassword: '', confirmPassword: '' };

function readErrorMessage(error: unknown): string | undefined {
  if (!(error instanceof Error) || !('response' in error)) return undefined;
  const response = error.response as { data?: { message?: unknown } };
  const message = response.data?.message;
  if (Array.isArray(message)) return typeof message[0] === 'string' ? message[0] : undefined;
  return typeof message === 'string' ? message : undefined;
}

export function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [visible, setVisible] = useState<Record<PasswordField, boolean>>({ currentPassword: false, newPassword: false, confirmPassword: false });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { changePassword, isChanging } = useChangePassword();

  const reset = () => {
    setForm(EMPTY_FORM);
    setError(null);
    setSuccess(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (form.newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess(true);
      setForm(EMPTY_FORM);
    } catch (err: unknown) {
      setError(readErrorMessage(err) || 'Mật khẩu hiện tại không đúng.');
    }
  };

  return (
    <AccountDialog
      open={open}
      onOpenChange={handleOpenChange}
      eyebrow="Bảo mật"
      title="Đổi mật khẩu"
      description={success ? undefined : 'Dùng mật khẩu bạn chưa dùng ở nơi khác.'}
    >
      {success ? (
        <div className="flex flex-col gap-5">
          <p role="status" className="border-l-2 border-landing-sage-ink bg-landing-ivory px-4 py-3 text-sm text-landing-sage-ink">
            Đã đổi mật khẩu. Lần đăng nhập sau, hãy dùng mật khẩu mới.
          </p>
          <button type="button" onClick={() => handleOpenChange(false)} className={accountButtonClassName('primary')}>
            Xong
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {error ? (
            <p role="alert" className="border-l-2 border-destructive bg-landing-ivory px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {FIELDS.map((field) => (
            <div key={field.id}>
              <label htmlFor={`pw-${field.id}`} className="mb-1.5 block text-sm font-medium text-landing-obsidian">
                {field.label}
              </label>
              <div className="relative">
                <input
                  id={`pw-${field.id}`}
                  type={visible[field.id] ? 'text' : 'password'}
                  autoComplete={field.autoComplete}
                  value={form[field.id]}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, [field.id]: event.target.value }));
                    setError(null);
                  }}
                  required
                  disabled={isChanging}
                  className={cn(accountInputClassName, 'pr-12')}
                />
                <button
                  type="button"
                  onClick={() => setVisible((prev) => ({ ...prev, [field.id]: !prev[field.id] }))}
                  aria-label={visible[field.id] ? `Ẩn ${field.label.toLowerCase()}` : `Hiện ${field.label.toLowerCase()}`}
                  className={cn('absolute inset-y-0 right-0 flex w-11 items-center justify-center text-landing-muted transition-colors hover:text-landing-oxblood', accountFocusRing)}
                >
                  {visible[field.id] ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
                </button>
              </div>
              {field.hint ? <p className="mt-1 text-xs text-landing-muted">{field.hint}</p> : null}
            </div>
          ))}

          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => handleOpenChange(false)} disabled={isChanging} className={accountButtonClassName('outline')}>
              Hủy
            </button>
            <button type="submit" disabled={isChanging} className={accountButtonClassName('primary')}>
              {isChanging ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : null}
              {isChanging ? 'Đang lưu' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      )}
    </AccountDialog>
  );
}

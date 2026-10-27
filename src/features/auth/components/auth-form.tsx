'use client';

import { cn } from '@/components/ui/utils';
import { AlertCircle, ArrowRight, Check, CheckCircle2, Eye, EyeOff, Info, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

// Bộ phần tử form dùng chung cho đăng nhập, đăng ký và quên mật khẩu (Atelier Paper).

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';

export const authInputClassName = cn(
  'h-12 w-full rounded-[2px] border border-landing-line bg-landing-ivory/80 px-3.5 text-[15px] text-landing-obsidian placeholder:text-landing-muted/70 transition-colors hover:border-landing-brass disabled:opacity-50',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-landing-oxblood',
);

export const authTextLinkClassName = cn(
  'font-semibold text-landing-oxblood underline-offset-4 transition-colors hover:underline',
  focusRing,
);

export function AuthHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-landing-brass-ink">{eyebrow}</p>
      <h1 className="mt-3 text-balance font-display text-[2.25rem] leading-[1.1] tracking-[-0.025em] text-landing-obsidian sm:text-[2.75rem]">
        {title}
      </h1>
      {children ? <div className="mt-3 text-landing-body text-landing-muted">{children}</div> : null}
    </div>
  );
}

export function AuthField({ id, label, action, children }: { id: string; label: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-obsidian/80">
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  );
}

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> & {
  showLabel?: string;
  hideLabel?: string;
};

export function PasswordInput({ showLabel = 'Hiện mật khẩu', hideLabel = 'Ẩn mật khẩu', disabled, ...inputProps }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...inputProps}
        type={isVisible ? 'text' : 'password'}
        disabled={disabled}
        className={cn(authInputClassName, 'pr-12')}
      />
      <button
        type="button"
        onClick={() => setIsVisible((value) => !value)}
        aria-label={isVisible ? hideLabel : showLabel}
        disabled={disabled}
        className={cn('absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-landing-muted transition-colors hover:text-landing-oxblood disabled:opacity-50', focusRing)}
      >
        {isVisible ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
      </button>
    </div>
  );
}

const ALERT_TONES = {
  error: { icon: AlertCircle, border: 'border-destructive', iconColor: 'text-destructive' },
  notice: { icon: Info, border: 'border-landing-brass', iconColor: 'text-landing-brass-ink' },
  success: { icon: CheckCircle2, border: 'border-landing-sage-ink', iconColor: 'text-landing-sage-ink' },
} as const;

export function AuthAlert({ tone, children }: { tone: keyof typeof ALERT_TONES; children: React.ReactNode }) {
  const { icon: Icon, border, iconColor } = ALERT_TONES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('mb-6 flex items-start gap-3 border-l-2 bg-landing-ivory px-4 py-3 text-sm leading-relaxed text-landing-obsidian animate-in fade-in-0', border)}
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconColor)} strokeWidth={1.75} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function AuthSubmitButton({ isLoading, loadingLabel, children }: { isLoading: boolean; loadingLabel: string; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={cn(
        'group inline-flex h-12 w-full items-center justify-center gap-2 rounded-[2px] bg-landing-oxblood text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-paper transition-colors hover:bg-landing-obsidian disabled:cursor-wait disabled:opacity-60',
        focusRing,
      )}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : null}
      {isLoading ? loadingLabel : children}
      {isLoading ? null : (
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
      )}
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-4" aria-hidden="true">
      <span className="h-px flex-1 bg-landing-line" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-landing-muted">hoặc</span>
      <span className="h-px flex-1 bg-landing-line" />
    </div>
  );
}

type AuthCheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> & {
  children: React.ReactNode;
};

export function AuthCheckbox({ children, ...inputProps }: AuthCheckboxProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-landing-obsidian/80">
      <span className="relative mt-[3px] flex h-4 w-4 shrink-0">
        {/* Input phủ lên ô vuông để bong bóng "required" của trình duyệt bám đúng vị trí. */}
        <input {...inputProps} type="checkbox" className="peer absolute inset-0 cursor-pointer opacity-0" />
        <span
          aria-hidden="true"
          className="h-4 w-4 rounded-[2px] border border-landing-obsidian/40 transition-colors peer-checked:border-landing-oxblood peer-checked:bg-landing-oxblood peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-landing-oxblood"
        />
        <Check
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-landing-paper opacity-0 transition-opacity peer-checked:opacity-100"
          strokeWidth={2.5}
        />
      </span>
      <span>{children}</span>
    </label>
  );
}

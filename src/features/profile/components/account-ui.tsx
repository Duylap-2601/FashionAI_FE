'use client';

import { cn } from '@/lib/utils';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import type React from 'react';

// Primitive dùng chung cho các trang tài khoản (hồ sơ, số đo, đơn hàng, đánh giá, thông báo).

export const accountFocusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';

export const accountInputClassName = cn(
  'h-11 w-full rounded-[2px] border border-landing-line bg-landing-ivory/80 px-3 text-sm text-landing-obsidian',
  'placeholder:text-landing-muted/70 transition-colors hover:border-landing-brass disabled:cursor-not-allowed disabled:opacity-50',
  accountFocusRing,
);

export const accountLabelClassName = 'text-[11px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink';

type AccountButtonVariant = 'primary' | 'outline' | 'danger' | 'quiet';

const BUTTON_VARIANTS: Record<AccountButtonVariant, string> = {
  primary: 'bg-landing-oxblood text-landing-paper hover:bg-landing-obsidian',
  outline: 'border border-landing-line text-landing-obsidian hover:border-landing-oxblood hover:text-landing-oxblood',
  danger: 'border border-destructive/40 text-destructive hover:bg-destructive hover:text-white',
  quiet: 'text-landing-muted hover:text-landing-oxblood',
};

export function accountButtonClassName(variant: AccountButtonVariant = 'primary', size: 'md' | 'sm' = 'md') {
  return cn(
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[2px] font-semibold uppercase transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-50',
    size === 'md' ? 'h-11 px-5 text-[11px] tracking-[0.16em]' : 'h-9 px-3.5 text-[10.5px] tracking-[0.14em]',
    variant === 'quiet' && 'px-0',
    BUTTON_VARIANTS[variant],
    accountFocusRing,
  );
}

export function AccountSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('border-t border-landing-line pt-6', className)}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h2 className="font-display text-[1.375rem] leading-tight text-landing-obsidian">{title}</h2>
          {description ? <p className="mt-1 text-sm text-landing-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Khối trạng thái rỗng / lỗi: tiêu đề display, một câu giải thích và tối đa một hành động. */
export function AccountStatePanel({
  title,
  description,
  action,
  tone = 'default',
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  tone?: 'default' | 'error';
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className="flex flex-col items-center border border-landing-line bg-landing-ivory/60 px-6 py-14 text-center"
    >
      <p className={cn('font-display text-2xl leading-tight', tone === 'error' ? 'text-destructive' : 'text-landing-obsidian')}>
        {title}
      </p>
      {description ? <p className="mt-2 max-w-sm text-sm leading-relaxed text-landing-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function AccountPagination({
  page,
  totalPages,
  onPageChange,
  summary,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  summary?: React.ReactNode;
}) {
  if (totalPages <= 1) return null;
  const arrowClassName = cn(
    'flex h-10 w-10 items-center justify-center rounded-[2px] border border-landing-line text-landing-obsidian transition-colors',
    'hover:border-landing-oxblood hover:text-landing-oxblood disabled:cursor-not-allowed disabled:opacity-40',
    accountFocusRing,
  );

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-between gap-4 pt-6">
      <p className="text-xs text-landing-muted">{summary}</p>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Trang trước" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className={arrowClassName}>
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <span className="min-w-[64px] text-center font-mono text-xs text-landing-obsidian" aria-live="polite">
          {page} / {totalPages}
        </span>
        <button type="button" aria-label="Trang sau" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className={arrowClassName}>
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </nav>
  );
}

/** Hộp thoại giấy (Radix Dialog) dùng chung: nằm trên thanh tab dưới (z-[90]) của mobile. */
export function AccountDialog({
  open,
  onOpenChange,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-landing-obsidian/45 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-[101] flex max-h-[90svh] flex-col overflow-hidden border-t border-landing-line bg-landing-paper text-landing-obsidian',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
            'sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85vh] sm:w-[calc(100%-2rem)] sm:max-w-[460px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border',
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-landing-line/70 px-5 pb-4 pt-5">
            <div className="min-w-0">
              {eyebrow ? <p className={accountLabelClassName}>{eyebrow}</p> : null}
              <Dialog.Title className={cn('font-display text-2xl leading-tight', eyebrow && 'mt-1.5')}>{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-landing-muted">{description}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Đóng"
              className={cn('-mr-2 flex h-11 w-11 shrink-0 items-center justify-center text-landing-muted transition-colors hover:text-landing-oxblood', accountFocusRing)}
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </Dialog.Close>
          </div>
          <div className="no-scrollbar overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function AccountConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  isPending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  isPending?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AccountDialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => onOpenChange(false)} disabled={isPending} className={accountButtonClassName('outline')}>
          Giữ lại
        </button>
        <button type="button" onClick={onConfirm} disabled={isPending} className={accountButtonClassName('danger')}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : null}
          {confirmLabel}
        </button>
      </div>
    </AccountDialog>
  );
}

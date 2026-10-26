'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/features/auth/store/authStore';
import { MEASUREMENT_CATEGORY_LABELS } from '@/features/measurements/constants/profile-measurements-page';
import { useMeasurementsCompleteness } from '@/features/measurements/hooks/useMeasurementsCompleteness';
import { OrderStatusLabel } from '@/features/orders/components/order-status-label';
import { useInfiniteOrders } from '@/features/orders/hooks/useOrders';
import { formatOrderDate, formatVnd, getOrderCode, getOrderTotal } from '@/features/orders/services/order-display';
import { AccountShell } from '@/features/profile/components/account-shell';
import {
  AccountSection,
  accountButtonClassName,
  accountFocusRing,
  accountInputClassName,
  accountLabelClassName,
} from '@/features/profile/components/account-ui';
import { ChangePasswordDialog } from '@/features/profile/components/change-password-dialog';
import { ACCOUNT_TIER_LABELS } from '@/features/profile/constants/account-nav';
import { useUserProfile } from '@/features/profile/hooks/use-profile';
import { useQuota } from '@/features/subscription/hooks/useQuota';
import type { UserQuota } from '@/features/subscription/types/quota';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { ArrowRight, Check, LogOut } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

const NAME_MAX_LENGTH = 100;

function formatDate(iso?: string | null) {
  return iso ? new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null;
}

function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn('inline-flex min-h-9 items-center gap-1.5 text-sm text-landing-oxblood underline-offset-4 hover:underline', accountFocusRing)}>
      {children}
      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
    </Link>
  );
}

function InfoRow({ label, children, action }: { label: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="grid gap-x-6 gap-y-1.5 py-4 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-center">
      <dt className="text-sm text-landing-muted">{label}</dt>
      <dd className="min-w-0 text-landing-obsidian">{children}</dd>
      {action ? <dd className="sm:justify-self-end">{action}</dd> : null}
    </div>
  );
}

function NameRow({ name }: { name: string }) {
  const { updateProfile, isUpdating } = useUserProfile();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    setDraft(name);
    setError(null);
    setEditing(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      setError('Nhập họ và tên.');
      return;
    }
    updateProfile(
      { name: trimmed },
      {
        onSuccess: () => {
          setEditing(false);
          toast.success('Đã lưu họ và tên');
        },
        onError: (err: unknown) => {
          const message = getErrorMessage(err, 'Không lưu được họ và tên. Vui lòng thử lại.');
          setError(Array.isArray(message) ? message[0] : message);
        },
      },
    );
  };

  if (editing) {
    return (
      <div className="py-4">
        <dt className="sr-only">Họ và tên</dt>
        <dd>
          <form onSubmit={handleSubmit} className="grid gap-x-6 gap-y-2 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-start">
            <label htmlFor="account-name" className="pt-3 text-sm text-landing-muted">
              Họ và tên
            </label>
            <div className="min-w-0">
              <input
                id="account-name"
                value={draft}
                maxLength={NAME_MAX_LENGTH}
                autoComplete="name"
                autoFocus
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'account-name-error' : undefined}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setError(null);
                }}
                disabled={isUpdating}
                className={cn(accountInputClassName, 'max-w-md', error && 'border-destructive')}
              />
              {error ? (
                <p id="account-name-error" role="alert" className="mt-1.5 text-xs text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="mt-3 flex gap-2">
                <button type="submit" disabled={isUpdating} className={accountButtonClassName('primary', 'sm')}>
                  {isUpdating ? 'Đang lưu' : 'Lưu'}
                </button>
                <button type="button" onClick={() => setEditing(false)} disabled={isUpdating} className={accountButtonClassName('outline', 'sm')}>
                  Hủy
                </button>
              </div>
            </div>
          </form>
        </dd>
      </div>
    );
  }

  return (
    <InfoRow
      label="Họ và tên"
      action={
        <button type="button" onClick={startEditing} className={accountButtonClassName('outline', 'sm')}>
          Sửa
        </button>
      }
    >
      {name || <span className="text-landing-muted">Chưa có</span>}
    </InfoRow>
  );
}

function QuotaMeter({ label, quota }: { label: string; quota?: UserQuota }) {
  if (!quota) {
    return (
      <div className="py-3">
        <div className="h-4 w-40 animate-pulse bg-landing-taupe/40" />
      </div>
    );
  }
  const unlimited = quota.unlimited || quota.limit === null;
  const limit = quota.limit ?? 0;
  const notIncluded = !unlimited && limit === 0;
  const percent = unlimited || notIncluded ? 0 : Math.min(100, Math.round((quota.used / limit) * 100));
  const valueText = unlimited ? 'Không giới hạn' : notIncluded ? 'Không có trong gói' : `${quota.used} / ${limit}`;

  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-landing-obsidian">{label}</span>
        <span className={cn('font-mono text-xs', notIncluded ? 'text-landing-muted' : 'text-landing-obsidian')}>{valueText}</span>
      </div>
      {!unlimited && !notIncluded ? (
        <div
          role="meter"
          aria-label={`${label}: đã dùng ${quota.used} trên ${limit} lượt`}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={quota.used}
          className="mt-2 h-[3px] bg-landing-taupe/45"
        >
          <div className="h-full bg-landing-oxblood transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </div>
      ) : null}
    </div>
  );
}

function MeasurementReadiness() {
  const { byCategory, hasMeasurement, isLoading, isError } = useMeasurementsCompleteness();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((key) => (
          <div key={key} className="h-5 w-2/3 animate-pulse bg-landing-taupe/40" />
        ))}
      </div>
    );
  }
  if (isError) {
    return <p className="text-sm text-landing-muted">Chưa tải được tình trạng số đo.</p>;
  }
  if (!hasMeasurement) {
    return (
      <p className="border-l-2 border-landing-brass bg-landing-ivory px-4 py-3 text-sm text-landing-obsidian">
        Bạn chưa nhập số đo. Đơn may đo cần số đo trước khi đặt.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-landing-line/70">
      {byCategory.map((category) => (
        <li key={category.category} className="grid gap-x-6 gap-y-1 py-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-baseline">
          <span className="text-sm text-landing-obsidian">{MEASUREMENT_CATEGORY_LABELS[category.category] ?? category.category}</span>
          {category.complete ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-landing-sage-ink">
              <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" /> Đủ số đo để đặt may
            </span>
          ) : (
            <span className="text-sm text-landing-brass-ink">
              Thiếu {category.missing.map((field) => field.label.toLowerCase()).join(', ')}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function RecentOrders() {
  const { orders, isLoading, isError } = useInfiniteOrders({ limit: 3 });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[0, 1].map((key) => (
          <div key={key} className="h-12 animate-pulse bg-landing-taupe/30" />
        ))}
      </div>
    );
  }
  if (isError) return <p className="text-sm text-landing-muted">Chưa tải được đơn hàng.</p>;
  if (orders.length === 0) {
    return (
      <p className="text-sm text-landing-muted">
        Bạn chưa có đơn hàng nào.{' '}
        <Link href="/products" className={cn('text-landing-oxblood underline-offset-4 hover:underline', accountFocusRing)}>
          Xem sản phẩm
        </Link>
      </p>
    );
  }

  return (
    <ul className="divide-y divide-landing-line/70 border-b border-landing-line/70">
      {orders.slice(0, 3).map((order) => (
        <li key={order.id}>
          <Link href={`/orders/${order.id}`} className={cn('group block py-4', accountFocusRing)}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-mono text-sm text-landing-obsidian transition-colors group-hover:text-landing-oxblood">
                {getOrderCode(order)}
              </span>
              <span className="font-mono text-sm text-landing-oxblood">{formatVnd(getOrderTotal(order))}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <OrderStatusLabel status={order.status} />
              <span className="text-xs text-landing-muted">
                {formatOrderDate(order.createdAt)} · {order.items.length} món
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function ProfilePage() {
  const { logout } = useAuth();
  const authUser = useAuthStore((state) => state.user);
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const { quota: tryOnQuota } = useQuota('TRY_ON');
  const { quota: stylistQuota } = useQuota('STYLIST');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const name = profile?.name || authUser?.name || '';
  const email = profile?.email || authUser?.email || '';
  const tier = String(profile?.tier || authUser?.tier || 'FREE').toUpperCase();
  const tierLabel = ACCOUNT_TIER_LABELS[tier] ?? ACCOUNT_TIER_LABELS.FREE;
  const expiresAt = formatDate(profile?.tierExpiresAt ?? authUser?.tierExpiresAt);
  const joinedAt = formatDate(profile?.createdAt);
  const resetAt = tryOnQuota?.resetAt ?? tryOnQuota?.resetsAt;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await logout();
  };

  return (
    <AccountShell title="Hồ sơ của tôi" description="Thông tin tài khoản, gói thành viên và mức sẵn sàng của số đo cho đơn may.">
      <ChangePasswordDialog open={showChangePassword} onOpenChange={setShowChangePassword} />

      <div className="flex flex-col gap-12">
        <AccountSection title="Thông tin tài khoản">
          {isProfileLoading && !name ? (
            <div className="h-24 animate-pulse bg-landing-taupe/30" />
          ) : (
            <dl className="divide-y divide-landing-line/70 border-b border-landing-line/70">
              <NameRow key={name} name={name} />
              <InfoRow label="Email">
                <span className="break-all">{email}</span>
                {profile?.isVerified !== undefined ? (
                  <span className={cn('ml-3 text-xs', profile.isVerified ? 'text-landing-sage-ink' : 'text-landing-brass-ink')}>
                    {profile.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                  </span>
                ) : null}
              </InfoRow>
              <InfoRow
                label="Mật khẩu"
                action={
                  <button type="button" onClick={() => setShowChangePassword(true)} className={accountButtonClassName('outline', 'sm')}>
                    Đổi mật khẩu
                  </button>
                }
              >
                <span className="sr-only">Đã ẩn</span>
                <span aria-hidden="true" className="font-mono tracking-[0.2em] text-landing-muted">
                  ••••••••
                </span>
              </InfoRow>
              {joinedAt ? (
                <InfoRow label="Ngày tham gia">
                  <span className="font-mono text-sm">{joinedAt}</span>
                </InfoRow>
              ) : null}
            </dl>
          )}
          <p className="mt-3 text-xs text-landing-muted">
            Số điện thoại và địa chỉ giao hàng nằm trong{' '}
            <Link href="/profile/addresses" className={cn('text-landing-oxblood underline-offset-4 hover:underline', accountFocusRing)}>
              Sổ địa chỉ
            </Link>
            .
          </p>
        </AccountSection>

        <AccountSection title="Gói thành viên" action={<SectionLink href="/subscription">Xem các gói</SectionLink>}>
          <div className="grid gap-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-12">
            <div>
              <p className={accountLabelClassName}>Gói hiện tại</p>
              <p className="mt-3 font-display text-5xl leading-none text-landing-oxblood">{tierLabel}</p>
              <p className="mt-3 text-sm text-landing-muted">
                {tier === 'FREE' ? 'Gói miễn phí, không có hạn dùng.' : expiresAt ? `Hiệu lực đến ${expiresAt}.` : 'Đang hoạt động.'}
              </p>
            </div>
            <div>
              <p className={accountLabelClassName}>Lượt dùng hôm nay</p>
              <div className="mt-1 divide-y divide-landing-line/60">
                <QuotaMeter label="Thử đồ AI" quota={tryOnQuota} />
                <QuotaMeter label="AI Stylist" quota={stylistQuota} />
              </div>
              {resetAt ? (
                <p className="mt-2 text-xs text-landing-muted">
                  Làm mới lúc{' '}
                  <span className="font-mono">
                    {new Date(resetAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                  </span>
                  .
                </p>
              ) : null}
            </div>
          </div>
        </AccountSection>

        <AccountSection
          title="Số đo may đo"
          description="Mỗi nhóm trang phục cần một bộ số đo riêng trước khi đặt may."
          action={<SectionLink href="/profile/measurements">Cập nhật số đo</SectionLink>}
        >
          <MeasurementReadiness />
        </AccountSection>

        <AccountSection title="Đơn gần đây" action={<SectionLink href="/profile/orders">Tất cả đơn hàng</SectionLink>}>
          <RecentOrders />
        </AccountSection>

        <button type="button" onClick={handleLogout} disabled={isLoggingOut} className={cn(accountButtonClassName('outline'), 'w-full lg:hidden')}>
          <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          {isLoggingOut ? 'Đang đăng xuất' : 'Đăng xuất'}
        </button>
      </div>
    </AccountShell>
  );
}

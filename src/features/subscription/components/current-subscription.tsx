'use client';

import type { TargetTier } from '@/features/payments/types/payments';
import { accountButtonClassName, accountLabelClassName } from '@/features/profile/components/account-ui';
import type { CurrentSubscriptionProps } from '@/features/subscription/types/current-subscription';
import type React from 'react';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-baseline sm:gap-6">
      <dt className="text-sm text-landing-muted">{label}</dt>
      <dd className="text-landing-obsidian">{children}</dd>
    </div>
  );
}

export function CurrentSubscription({ tier, current, getStatusBadge, setActiveTab, handleInitiateUpgrade, formatDate, rawExpiresAt, expirationInfo, scheduled, handleToggleAutoRenew, isCancelling, isResuming, handleCancelScheduled, isCancellingScheduled }: CurrentSubscriptionProps) {
  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <section>
        <div className="flex flex-col gap-5 border-b border-landing-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={accountLabelClassName}>Gói hiện tại</p>
            <p className="mt-3 flex flex-wrap items-baseline gap-4">
              <span className="font-display text-5xl leading-none text-landing-oxblood">{tier === 'FREE' ? 'Miễn phí' : tier}</span>
              {current ? getStatusBadge(current.status) : null}
            </p>
          </div>
          {tier === 'FREE' ? (
            <button type="button" onClick={() => setActiveTab('plans')} className={accountButtonClassName('primary')}>
              Xem các gói
            </button>
          ) : (
            // Gia hạn đúng gói đang dùng; 30 ngày mới nối tiếp ngày hết hạn hiện tại.
            <button type="button" onClick={() => handleInitiateUpgrade(tier as TargetTier)} className={accountButtonClassName('primary')}>
              Gia hạn thêm 30 ngày
            </button>
          )}
        </div>

        <dl className="divide-y divide-landing-line/70 border-b border-landing-line/70">
          <Row label="Hiệu lực đến">{rawExpiresAt ? <span className="font-mono text-sm">{formatDate(rawExpiresAt)}</span> : <span className="text-landing-muted">Không thời hạn</span>}</Row>
          <Row label="Còn lại">
            {expirationInfo ? (
              <span className={expirationInfo.isExpired ? 'text-destructive' : expirationInfo.isExpiringSoon ? 'text-landing-brass-ink' : undefined}>
                <span className="font-mono">{expirationInfo.daysRemaining}</span> ngày{expirationInfo.isExpiringSoon ? ', sắp hết hạn' : ''}
              </span>
            ) : (
              'Không thời hạn'
            )}
          </Row>
          <Row label="Đã thanh toán">
            {current?.price != null && current.price > 0 ? <span className="font-mono text-sm">{current.price.toLocaleString('vi-VN')}đ</span> : <span className="text-landing-muted">Chưa có</span>}
          </Row>
          <Row label="Nhắc gia hạn">{current ? (current.autoRenew ? 'Đang bật' : 'Đã tắt') : <span className="text-landing-muted">Chưa có</span>}</Row>
        </dl>
      </section>

      {scheduled ? (
        <section className="flex flex-col gap-4 border-l-2 border-landing-brass bg-landing-ivory px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-landing-obsidian">Gói {scheduled.tier} đã lên lịch</p>
            <p className="mt-1 text-sm text-landing-muted">
              Bắt đầu từ <span className="font-mono">{formatDate(scheduled.startsAt)}</span>, sau khi gói hiện tại hết hạn.
            </p>
          </div>
          {handleCancelScheduled ? (
            <button type="button" onClick={handleCancelScheduled} disabled={isCancellingScheduled} className={accountButtonClassName('danger', 'sm')}>
              {isCancellingScheduled ? 'Đang huỷ' : 'Huỷ lịch chuyển gói'}
            </button>
          ) : null}
        </section>
      ) : null}

      {current ? (
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md">
            <h2 className="font-display text-[1.375rem] leading-tight text-landing-obsidian">Nhắc gia hạn</h2>
            <p className="mt-1 text-sm leading-relaxed text-landing-muted">
              {current.autoRenew
                ? 'Bạn sẽ nhận email nhắc trước 3 ngày khi gói sắp hết hạn.'
                : 'Đã tắt nhắc. Khi hết hạn, tài khoản tự về gói miễn phí.'}
            </p>
          </div>
          <button type="button" onClick={handleToggleAutoRenew} disabled={isCancelling || isResuming} className={accountButtonClassName('outline')}>
            {isCancelling || isResuming ? 'Đang xử lý' : current.autoRenew ? 'Tắt nhắc gia hạn' : 'Bật nhắc gia hạn'}
          </button>
        </section>
      ) : null}

      <p className="text-xs leading-relaxed text-landing-muted">
        Mỗi lần mua hoặc gia hạn là một lần thanh toán riêng. StAie. không tự động trừ tiền.
      </p>
    </div>
  );
}

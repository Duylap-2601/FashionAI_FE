'use client';

import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { ToneLabel } from '@/features/orders/components/order-status-label';
import { ORDER_IMAGE_FALLBACK, type OrderStatusTone } from '@/features/orders/constants/profile-orders-page';
import { useOrderIssues } from '@/features/orders/hooks/useOrderIssues';
import { formatOrderDateTime } from '@/features/orders/services/order-display';
import type { OrderIssue, OrderIssueDesiredResolution, OrderIssueReason, OrderIssueStatus } from '@/features/orders/types/orders';
import { AccountSection, accountFocusRing, accountLabelClassName } from '@/features/profile/components/account-ui';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type React from 'react';
import { useState } from 'react';

interface OrderIssuesListProps {
  orderId: string;
}

const REASON_LABELS: Record<OrderIssueReason, string> = {
  WRONG_SIZE: 'Sai kích thước / số đo',
  WRONG_COLOR: 'Sai màu / sai mẫu',
  QUALITY_MISMATCH: 'Lỗi đường may / chất lượng vải',
  OTHER: 'Lý do khác',
  REFUND_NOT_RECEIVED: 'Chưa nhận được tiền hoàn',
};

const RESOLUTION_LABELS: Record<OrderIssueDesiredResolution, string> = {
  REFUND: 'Hoàn tiền',
};

const ISSUE_STATUS: Record<OrderIssueStatus, { label: string; tone: OrderStatusTone }> = {
  PENDING: { label: 'Chờ xem xét', tone: 'attention' },
  APPROVED: { label: 'Đã duyệt', tone: 'active' },
  RESOLVED: { label: 'Đã xử lý', tone: 'done' },
  REJECTED: { label: 'Đã từ chối', tone: 'error' },
};

function IssueField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-landing-muted">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-landing-obsidian">{children}</dd>
    </div>
  );
}

function IssueCard({ issue, onZoom }: { issue: OrderIssue; onZoom: (src: string, index: number, total: number) => void }) {
  const status = ISSUE_STATUS[issue.status] ?? { label: issue.status, tone: 'closed' as const };
  const item = issue.orderItem;
  const itemName = item?.productNameSnapshot || `Sản phẩm #${issue.orderItemId.slice(0, 8)}`;
  const isRefund = issue.approvedResolution === 'REFUND' || issue.desiredResolution === 'REFUND';

  return (
    <article className="rounded-[2px] border border-landing-line bg-landing-ivory">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-landing-line/70 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <ToneLabel tone={status.tone} label={status.label} />
          <span className="font-mono text-xs text-landing-muted">#{issue.id.slice(0, 8)}</span>
        </div>
        <span className="font-mono text-xs text-landing-muted">{formatOrderDateTime(issue.createdAt)}</span>
      </header>

      <div className="space-y-5 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="relative block h-14 w-11 shrink-0 overflow-hidden rounded-[2px] bg-landing-paper">
            <Image src={item?.productImageSnapshot || ORDER_IMAGE_FALLBACK} alt={itemName} fill sizes="44px" className="object-cover" />
          </span>
          <div className="min-w-0">
            <p className="product-name-line line-clamp-1 text-landing-obsidian">{itemName}</p>
            <p className="mt-0.5 text-xs text-landing-muted">
              Màu: {item?.color || 'Mặc định'} · SL <span className="font-mono">{item?.quantity || 1}</span>
            </p>
          </div>
        </div>

        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <IssueField label="Lý do">{REASON_LABELS[issue.reason] || issue.reason}</IssueField>
          <IssueField label="Hướng xử lý">
            {RESOLUTION_LABELS[issue.desiredResolution] || issue.desiredResolution}
            {issue.approvedResolution && issue.approvedResolution !== issue.desiredResolution ? (
              <span className="text-landing-muted"> (shop duyệt: {RESOLUTION_LABELS[issue.approvedResolution]})</span>
            ) : null}
          </IssueField>
          <IssueField label="Mô tả của bạn" className="sm:col-span-2">
            <span className="whitespace-pre-wrap">{issue.description}</span>
          </IssueField>
          {issue.accountNumber ? (
            <IssueField label="Tài khoản nhận hoàn" className="sm:col-span-2">
              {issue.bankName || 'Ngân hàng'} · <span className="font-mono">{issue.accountNumber}</span>
              {issue.accountHolder ? ` · ${issue.accountHolder}` : ''}
            </IssueField>
          ) : null}
        </dl>

        {issue.evidenceImages?.length > 0 ? (
          <div>
            <p className={accountLabelClassName}>
              Ảnh minh chứng <span className="font-mono">({issue.evidenceImages.length})</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {issue.evidenceImages.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => onZoom(url, index, issue.evidenceImages.length)}
                  title={`Xem ảnh ${index + 1}`}
                  className={cn('relative h-14 w-14 cursor-zoom-in overflow-hidden rounded-[2px] border border-landing-line bg-landing-paper transition-opacity hover:opacity-80', accountFocusRing)}
                >
                  <Image src={url} alt={`Minh chứng ${index + 1}`} fill sizes="56px" className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {issue.adminNote ? (
          <div className={cn('border-l-2 bg-landing-paper px-3 py-2.5', issue.status === 'REJECTED' ? 'border-destructive' : 'border-landing-brass')}>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-landing-muted">Phản hồi của shop</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-landing-obsidian">{issue.adminNote}</p>
          </div>
        ) : null}

        {issue.status === 'RESOLVED' && isRefund ? (
          <p className="text-sm text-landing-sage-ink">
            Shop đã duyệt hoàn tiền. Theo dõi khoản hoàn và chứng từ chuyển khoản ở mục Hoàn tiền bên dưới.
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function OrderIssuesList({ orderId }: OrderIssuesListProps) {
  const { issues, isLoading } = useOrderIssues(orderId);
  const [zoomed, setZoomed] = useState<{ src: string; caption: string } | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <AtelierLoader size="sm" label="Đang tải yêu cầu báo lỗi" />
      </div>
    );
  }

  if (!issues || issues.length === 0) return null;

  return (
    <AccountSection
      title="Báo lỗi và hoàn trả"
      description={`${issues.length} yêu cầu cho sản phẩm trong đơn này.`}
      className="border-t-0 pt-0"
    >
      <div id="order-issues" className="flex scroll-mt-28 flex-col gap-4">
        {issues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onZoom={(src, index, total) => setZoomed({ src, caption: `Ảnh minh chứng ${index + 1}/${total}` })}
          />
        ))}
      </div>
      <ImageLightbox
        image={zoomed ? { src: zoomed.src, alt: zoomed.caption, caption: zoomed.caption } : null}
        onClose={() => setZoomed(null)}
      />
    </AccountSection>
  );
}

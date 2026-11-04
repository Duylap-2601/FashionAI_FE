'use client';

import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { ISSUE_STATUS } from '@/features/orders/components/order-issues-list';
import { OrderStatusLabel, ToneLabel } from '@/features/orders/components/order-status-label';
import { useMyReturns } from '@/features/orders/hooks/useOrderIssues';
import { formatOrderDateTime, formatVnd } from '@/features/orders/services/order-display';
import { RETURN_FLOW_STATUSES, orderReturnsHref } from '@/features/orders/services/order-returns';
import type { MyReturnOrder } from '@/features/orders/types/orders';
import { AccountShell } from '@/features/profile/components/account-shell';
import {
  AccountPagination,
  AccountSection,
  AccountStatePanel,
  accountButtonClassName,
  accountFocusRing,
} from '@/features/profile/components/account-ui';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';

const PAGE_SIZE = 10;

function ReturnRow({ order }: { order: MyReturnOrder }) {
  const latest = order.issues[0];
  const latestStatus = latest ? ISSUE_STATUS[latest.status] : null;
  const itemNames = [...new Set(order.issues.map((issue) => issue.orderItem?.productNameSnapshot).filter(Boolean))];

  return (
    <li className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link
            href={orderReturnsHref(order.id)}
            className={cn('font-mono text-sm text-landing-obsidian transition-colors hover:text-landing-oxblood', accountFocusRing)}
          >
            ORD-{order.orderCode}
          </Link>
          {/* Đơn đang trong luồng trả hàng thì theo trạng thái đơn, còn lại theo yêu cầu mới nhất. */}
          {RETURN_FLOW_STATUSES.includes(order.status) ? (
            <OrderStatusLabel status={order.status} />
          ) : latestStatus ? (
            <ToneLabel tone={latestStatus.tone} label={latestStatus.label} />
          ) : null}
        </div>
        {itemNames.length > 0 ? <p className="line-clamp-1 text-sm text-landing-obsidian">{itemNames.join(', ')}</p> : null}
        <p className="text-xs text-landing-muted">
          <span className="font-mono">{order.issues.length}</span> yêu cầu · Cập nhật{' '}
          <span className="font-mono">{formatOrderDateTime(order.updatedAt)}</span>
          {order.amountRefundedVnd > 0 ? (
            <>
              {' '}· Đã hoàn <span className="font-mono text-landing-obsidian">{formatVnd(order.amountRefundedVnd)}</span>
            </>
          ) : null}
        </p>
      </div>
      <Link href={orderReturnsHref(order.id)} className={accountButtonClassName('outline', 'sm')}>
        Xem chi tiết
      </Link>
    </li>
  );
}

/** Mọi đơn có yêu cầu báo lỗi, trả hàng hoặc hoàn tiền; mỗi dòng dẫn vào trang đổi trả của đơn. */
export default function ProfileReturnsPage() {
  const [page, setPage] = useState(1);
  const { orders, meta, isLoading, isError, refetch } = useMyReturns({ page, limit: PAGE_SIZE });

  return (
    <AccountShell
      title="Đổi trả & hoàn tiền"
      activeHref="/profile/returns"
      description="Các đơn có yêu cầu báo lỗi, trả hàng hoặc hoàn tiền."
    >
      {isLoading ? (
        <div className="flex justify-center border-t border-landing-line py-16">
          <AtelierLoader size="md" label="Đang tải đổi trả" />
        </div>
      ) : isError ? (
        <AccountStatePanel
          tone="error"
          title="Chưa tải được danh sách đổi trả"
          description="Vui lòng thử lại sau ít phút."
          action={
            <button type="button" onClick={() => void refetch()} className={accountButtonClassName('outline')}>
              Thử lại
            </button>
          }
        />
      ) : orders.length === 0 ? (
        <AccountStatePanel
          title="Chưa có yêu cầu đổi trả"
          description="Nếu sản phẩm may sai số đo, sai màu / sai mẫu hoặc có lỗi, bạn có 7 ngày kể từ khi đơn hoàn tất để báo lỗi ở trang đơn hàng."
          action={
            <Link href="/profile/orders" className={accountButtonClassName('outline')}>
              Xem đơn hàng
            </Link>
          }
        />
      ) : (
        <AccountSection
          variant="panel"
          title="Đơn có đổi trả"
          description={`${meta?.total ?? orders.length} đơn, mới cập nhật trước.`}
        >
          <ol className="divide-y divide-landing-line/60">
            {orders.map((order) => (
              <ReturnRow key={order.id} order={order} />
            ))}
          </ol>
          <AccountPagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
        </AccountSection>
      )}
    </AccountShell>
  );
}

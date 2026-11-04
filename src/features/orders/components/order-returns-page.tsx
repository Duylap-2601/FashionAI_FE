'use client';

import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { OrderIssuesList } from '@/features/orders/components/order-issues-list';
import {
  OrderHistoryTimeline,
  OrderNotice,
  OrderRefundLines,
  RETURN_FLOW_TITLES,
  RefundAccount,
} from '@/features/orders/components/order-return-parts';
import { SummaryRow } from '@/features/orders/components/order-ui';
import { ReportIssueModal } from '@/features/orders/components/report-issue-modal';
import { useOrder } from '@/features/orders/hooks/useOrders';
import { useOrderIssues } from '@/features/orders/hooks/useOrderIssues';
import { formatOrderDateTime, formatVnd, getOrderCode } from '@/features/orders/services/order-display';
import { isReturnHistoryEvent } from '@/features/orders/services/order-returns';
import { AccountShell } from '@/features/profile/components/account-shell';
import { AccountSection, AccountStatePanel, accountButtonClassName } from '@/features/profile/components/account-ui';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const ISSUE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Đổi trả & hoàn tiền của một đơn: hướng dẫn gửi hàng về, các yêu cầu báo lỗi, các khoản
 * hoàn (tiền hàng, phí ship) kèm chứng từ, báo chưa nhận được tiền và lịch sử đổi trả.
 * Trang đơn hàng chỉ giữ thẻ tóm tắt dẫn sang đây.
 */
export default function OrderReturnsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { order, isLoading, isError } = useOrder(id);
  const { issues } = useOrderIssues(id);
  const [reportingNotReceived, setReportingNotReceived] = useState(false);

  if (isLoading) {
    return (
      <AccountShell title="Đổi trả & hoàn tiền" activeHref="/profile/returns">
        <div className="flex justify-center border-t border-landing-line py-16">
          <AtelierLoader size="md" label="Đang tải đổi trả" />
        </div>
      </AccountShell>
    );
  }

  if (isError || !order) {
    return (
      <AccountShell title="Đổi trả & hoàn tiền" activeHref="/profile/returns">
        <AccountStatePanel
          tone="error"
          title="Không tìm thấy đơn hàng"
          description="Đơn này không tồn tại hoặc không thuộc tài khoản của bạn."
          action={
            <Link href="/profile/returns" className={accountButtonClassName('outline')}>
              Xem đổi trả của tôi
            </Link>
          }
        />
      </AccountShell>
    );
  }

  const status = order.status || 'CREATED';
  const orderCode = getOrderCode(order);
  const refunds = order.refunds ?? [];
  const hasReturns = issues.length > 0 || refunds.length > 0;
  const isInReturnFlow = ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNING'].includes(status);
  const hasPendingRefundNotReceived = issues.some(
    (issue) => issue.reason === 'REFUND_NOT_RECEIVED' && (issue.status === 'PENDING' || issue.status === 'APPROVED'),
  );
  // Báo "chưa nhận được tiền": chỉ khi shop đã chốt hoàn tiền và còn trong 7 ngày
  // kể từ lần hoàn gần nhất (khớp điều kiện BE).
  const lastCompletedRefund = refunds
    .filter((r) => r.status === 'COMPLETED')
    .sort((a, b) => new Date(b.processedAt ?? b.requestedAt).getTime() - new Date(a.processedAt ?? a.requestedAt).getTime())[0];
  const refundedAt = lastCompletedRefund?.processedAt ?? lastCompletedRefund?.requestedAt;
  const canReportNotReceived =
    order.refundStatus === 'COMPLETED' && refundedAt != null && Date.now() - new Date(refundedAt).getTime() <= ISSUE_WINDOW_MS;
  const paidVnd = order.amountPaidVnd ?? 0;
  const refundedVnd = order.amountRefundedVnd ?? 0;

  const openNotReceived = () => {
    if (hasPendingRefundNotReceived) {
      toast.info('Bạn đã gửi báo cáo chưa nhận được tiền, vui lòng chờ shop xử lý.');
      return;
    }
    setReportingNotReceived(true);
  };

  return (
    <AccountShell
      title="Đổi trả & hoàn tiền"
      activeHref="/profile/returns"
      description={
        <>
          Đơn <span className="font-mono text-landing-obsidian">{orderCode}</span> · Đặt lúc{' '}
          <span className="font-mono">{formatOrderDateTime(order.createdAt)}</span>
        </>
      }
      actions={
        <Link href={`/orders/${order.id}`} className={accountButtonClassName('outline')}>
          Xem đơn hàng
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        <Link href="/profile/returns" className={cn(accountButtonClassName('quiet', 'sm'), 'h-auto w-fit')}>
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          Tất cả đổi trả
        </Link>

        {isInReturnFlow ? (
          <OrderNotice title={RETURN_FLOW_TITLES[status]}>
            <p>Vui lòng gửi hàng về cửa hàng. Sau khi nhận và kiểm tra, shop sẽ chuyển khoản hoàn tiền vào tài khoản bạn đã cung cấp.</p>
            <RefundAccount order={order} />
          </OrderNotice>
        ) : null}

        {status === 'RETURNED' ? (
          <OrderNotice tone={order.refundStatus === 'COMPLETED' ? 'done' : 'attention'} title="Đơn hàng đã được hoàn trả">
            <p>
              {order.refundStatus === 'COMPLETED'
                ? 'Shop đã chuyển khoản hoàn tiền cho bạn. Chứng từ chuyển khoản nằm ở mục Hoàn tiền.'
                : 'Shop đang xử lý hoàn tiền cho đơn này. Kiểm tra tài khoản hoặc liên hệ hỗ trợ nếu cần.'}
            </p>
            <RefundAccount order={order} />
            {canReportNotReceived ? (
              hasPendingRefundNotReceived ? (
                <p className="text-xs leading-relaxed text-landing-muted">
                  Bạn đã báo chưa nhận được tiền.{' '}
                  <a href="#order-issues" className="text-landing-oxblood underline underline-offset-2">
                    Xem trạng thái xử lý
                  </a>
                  .
                </p>
              ) : (
                <button type="button" onClick={openNotReceived} className={accountButtonClassName('outline', 'sm')}>
                  Chưa nhận được tiền hoàn
                </button>
              )
            ) : null}
          </OrderNotice>
        ) : null}

        {!hasReturns ? (
          <AccountStatePanel
            title="Đơn này chưa có yêu cầu đổi trả"
            description="Nếu sản phẩm may sai số đo, sai màu / sai mẫu hoặc có lỗi, bạn có 7 ngày kể từ khi đơn hoàn tất để báo lỗi ở trang đơn hàng."
            action={
              <Link href={`/orders/${order.id}`} className={accountButtonClassName('outline')}>
                Xem đơn hàng
              </Link>
            }
          />
        ) : (
          // Màn rộng: yêu cầu và lịch sử ở cột chính, hoàn tiền ở cột phụ cố định khi cuộn.
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:grid-rows-[auto_1fr] xl:items-start">
            <div className="min-w-0 empty:hidden xl:col-start-1 xl:row-start-1">
              <OrderIssuesList orderId={order.id} />
            </div>

            <aside aria-label="Hoàn tiền" className="flex flex-col gap-6 xl:sticky xl:top-24 xl:col-start-2 xl:row-span-2 xl:row-start-1">
              <AccountSection variant="panel" title="Hoàn tiền" description="Các khoản shop chuyển khoản hoàn cho đơn này.">
                {refunds.length > 0 ? (
                  <OrderRefundLines order={order} />
                ) : (
                  <p className="text-sm text-landing-muted">Shop chưa ghi nhận khoản hoàn nào. Khoản hoàn hiện ở đây khi yêu cầu được duyệt.</p>
                )}
                <dl className="mt-5 border-t border-landing-line/60 pt-4">
                  <SummaryRow label="Đã thanh toán">
                    <span className="font-mono">{formatVnd(paidVnd)}</span>
                  </SummaryRow>
                  <SummaryRow label="Đã hoàn" strong>
                    {formatVnd(refundedVnd)}
                  </SummaryRow>
                </dl>
              </AccountSection>
            </aside>

            <AccountSection variant="panel" title="Lịch sử đổi trả" className="min-w-0 xl:col-start-1 xl:row-start-2">
              <OrderHistoryTimeline
                events={(order.history ?? []).filter(isReturnHistoryEvent)}
                issueHref="#order-issues"
                emptyText="Chưa có cập nhật đổi trả."
              />
            </AccountSection>
          </div>
        )}
      </div>

      <ReportIssueModal
        isOpen={reportingNotReceived}
        onClose={() => setReportingNotReceived(false)}
        orderId={order.id}
        orderItem={reportingNotReceived ? order.items[0] ?? null : null}
        mode="REFUND_NOT_RECEIVED"
        defaultBank={{
          bankName: order.refundBankName,
          accountNumber: order.refundAccountNumber,
          accountHolder: order.refundAccountHolder,
        }}
      />
    </AccountShell>
  );
}

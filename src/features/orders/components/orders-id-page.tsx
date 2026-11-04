'use client';

import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { useCart } from '@/features/cart/hooks/use-cart';
import { ConfirmDeliveryDialog } from '@/features/orders/components/confirm-delivery-dialog';
import { OrderIssuesList } from '@/features/orders/components/order-issues-list';
import { OrderPaymentAction } from '@/features/orders/components/order-payment-action';
import { OrderStatusLabel, ToneLabel } from '@/features/orders/components/order-status-label';
import { OrderProgress, OrderThumb, SummaryRow } from '@/features/orders/components/order-ui';
import { RefundReceiptImages } from '@/features/orders/components/refund-receipt-images';
import { ReportIssueModal } from '@/features/orders/components/report-issue-modal';
import { ORDER_STATUS_DESCRIPTIONS } from '@/features/orders/constants/orders-id-page';
import {
  PAYMENT_STATUS_LABELS,
  REFUND_KIND_LABELS,
  STATUS_CONFIG,
  type OrderStatusTone,
} from '@/features/orders/constants/profile-orders-page';
import { useCancelOrder, useConfirmDelivery, useOrder } from '@/features/orders/hooks/useOrders';
import { useOrderIssues } from '@/features/orders/hooks/useOrderIssues';
import {
  formatOrderDateTime,
  formatVnd,
  getOrderCode,
  getOrderItemImage,
  getOrderItemName,
  getOrderTotal,
  getPaymentMethodLabel,
  shipmentStatusLabel,
} from '@/features/orders/services/order-display';
import type { Order, OrderItem, OrderRefundStatus } from '@/features/orders/types/orders';
import { AccountShell } from '@/features/profile/components/account-shell';
import {
  AccountConfirmDialog,
  AccountSection,
  AccountStatePanel,
  accountButtonClassName,
  accountFocusRing,
  accountLabelClassName,
} from '@/features/profile/components/account-ui';
import { cn, formatRefundEvidence } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

const ISSUE_EVENT_TONE: Record<string, string> = {
  ORDER_ISSUE_REJECTED: 'text-destructive',
  ORDER_ISSUE_REFUND_APPROVED: 'text-landing-sage-ink',
};

const REFUND_STATUS: Record<OrderRefundStatus, { label: string; tone: OrderStatusTone }> = {
  PENDING: { label: 'Đang xử lý', tone: 'attention' },
  REQUIRED: { label: 'Chờ chuyển tiền', tone: 'attention' },
  PROCESSING: { label: 'Đang xử lý', tone: 'attention' },
  COMPLETED: { label: 'Đã hoàn', tone: 'done' },
  FAILED: { label: 'Chưa thành công', tone: 'error' },
  CANCELLED: { label: 'Đã hủy', tone: 'closed' },
};

const RETURN_FLOW_TITLES: Record<string, string> = {
  RETURN_REQUESTED: 'Yêu cầu hoàn trả đã được ghi nhận',
  RETURN_APPROVED: 'Yêu cầu hoàn trả đã được duyệt',
  RETURNING: 'Hàng đang trên đường gửi về cửa hàng',
};

const ISSUE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** Ghi chú có vạch trái: brass cho việc đang chờ, sage cho việc đã xong. */
const HISTORY_PREVIEW = 5;

function OrderNotice({ tone = 'attention', title, children }: { tone?: 'attention' | 'done'; title: string; children?: React.ReactNode }) {
  return (
    <div className={cn('border-l-2 bg-landing-ivory/70 px-4 py-3', tone === 'done' ? 'border-landing-sage' : 'border-landing-brass')}>
      <p className={cn('text-sm font-medium', tone === 'done' ? 'text-landing-sage-ink' : 'text-landing-obsidian')}>{title}</p>
      {children ? <div className="mt-1.5 space-y-2.5 text-sm leading-relaxed text-landing-muted">{children}</div> : null}
    </div>
  );
}

function SummaryTile({ label, value, sub }: { label: string; value: React.ReactNode; sub: React.ReactNode }) {
  return (
    <div className="min-w-0 sm:px-5 sm:first:pl-0 sm:last:pr-0">
      <dt className={accountLabelClassName}>{label}</dt>
      <dd className="mt-2 truncate text-sm font-medium text-landing-obsidian">{value}</dd>
      <dd className="mt-0.5 truncate text-xs text-landing-muted">{sub}</dd>
    </div>
  );
}

function RefundAccount({ order }: { order: Order }) {
  if (!order.refundAccountNumber) return null;
  return (
    <p>
      Tài khoản nhận hoàn: <span className="text-landing-obsidian">{order.refundBankName || 'Ngân hàng'}</span> ·{' '}
      <span className="font-mono text-landing-obsidian">{order.refundAccountNumber}</span>
      {order.refundAccountHolder ? <span className="text-landing-obsidian"> · {order.refundAccountHolder}</span> : null}
    </p>
  );
}

function ItemMeasurements({ item }: { item: OrderItem }) {
  if (item.measurementDisplay && item.measurementDisplay.length === 0) {
    return (
      <p className="border-l-2 border-landing-brass pl-3 text-xs text-landing-brass-ink">Chưa đủ dữ liệu số đo bắt buộc cho món này.</p>
    );
  }

  const snapshot = item.measurementSnapshot;
  const rows = item.measurementDisplay?.length
    ? item.measurementDisplay.map((m) => ({ key: m.field, label: m.label, value: `${m.value}${m.unit}` }))
    : snapshot
      ? [
          ['height', 'Chiều cao'],
          ['chest', 'Ngực'],
          ['waist', 'Eo'],
          ['hip', 'Hông'],
          ['shoulder', 'Vai'],
        ]
          .filter(([key]) => snapshot[key as keyof typeof snapshot])
          .map(([key, label]) => ({ key, label, value: `${snapshot[key as keyof typeof snapshot]}cm` }))
      : [];
  if (rows.length === 0) return null;

  return (
    <div className="border-l-2 border-landing-taupe bg-landing-paper/70 px-3 py-2.5">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">
        {item.measurementDisplay?.length ? 'Số đo may riêng' : 'Số đo đã chốt'}
      </p>
      <dl className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {rows.map((row) => (
          <div key={row.key} className="flex gap-1.5">
            <dt className="text-landing-muted">{row.label}</dt>
            <dd className="font-mono text-landing-obsidian">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { order, isLoading, isError } = useOrder(id);
  const { issues } = useOrderIssues(id);
  const { cancelOrder, isCancelling } = useCancelOrder();
  const { confirmDelivery, isConfirmingDelivery } = useConfirmDelivery();
  const { addToCart, setIsCartOpen } = useCart();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showDeliveryConfirm, setShowDeliveryConfirm] = useState(false);
  const [reportingItem, setReportingItem] = useState<OrderItem | null>(null);
  const [reportMode, setReportMode] = useState<'PRODUCT' | 'REFUND_NOT_RECEIVED'>('PRODUCT');

  // Item đã có yêu cầu đang xử lý hoặc đã xử lý xong thì không cho báo lỗi lại
  // (khớp điều kiện chặn ở BE). Báo "chưa nhận được tiền" có luồng riêng.
  const blockedReportItemIds = new Set(
    issues
      .filter(
        (issue) =>
          issue.status === 'PENDING' ||
          issue.status === 'APPROVED' ||
          issue.status === 'RESOLVED',
      )
      .map((issue) => issue.orderItemId),
  );
  const hasPendingRefundNotReceived = issues.some(
    (issue) =>
      issue.reason === 'REFUND_NOT_RECEIVED' &&
      (issue.status === 'PENDING' || issue.status === 'APPROVED'),
  );

  if (isLoading) {
    return (
      <AccountShell title="Chi tiết đơn hàng" activeHref="/profile/orders">
        <div className="flex justify-center border-t border-landing-line py-16">
          <AtelierLoader size="md" label="Đang may đơn hàng" />
        </div>
      </AccountShell>
    );
  }

  if (isError || !order) {
    return (
      <AccountShell title="Chi tiết đơn hàng" activeHref="/profile/orders">
        <AccountStatePanel
          tone="error"
          title="Không tìm thấy đơn hàng"
          description="Đơn này không tồn tại hoặc không thuộc tài khoản của bạn."
          action={
            <Link href="/profile/orders" className={accountButtonClassName('outline')}>
              Xem đơn của tôi
            </Link>
          }
        />
      </AccountShell>
    );
  }

  const status = order.status || 'CREATED';
  const step = (STATUS_CONFIG[status] ?? STATUS_CONFIG.CREATED).step;
  const orderCode = getOrderCode(order);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const isInReturnFlow = ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNING'].includes(status);
  const isAwaitingPayment = status === 'CREATED' && order.paymentStatus === 'PENDING';

  const completedEvent = order.history
    ?.filter((e) => e.toStatus === 'COMPLETED' || e.type?.includes('COMPLETED'))
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];
  const completedAt = completedEvent?.occurredAt || order.updatedAt || order.createdAt;
  const isIssueWindowOver = completedAt ? Date.now() - new Date(completedAt).getTime() > ISSUE_WINDOW_MS : false;
  const canReportIssue = (status === 'COMPLETED' || isInReturnFlow) && !isIssueWindowOver;
  const allItemsBlocked = order.items.length > 0 && order.items.every((item) => blockedReportItemIds.has(item.id));

  // Báo "chưa nhận được tiền": chỉ khi shop đã chốt hoàn tiền và còn trong 7 ngày
  // kể từ lần hoàn gần nhất (khớp điều kiện BE).
  const lastCompletedRefund = (order.refunds ?? [])
    .filter((r) => r.status === 'COMPLETED')
    .sort((a, b) => new Date(b.processedAt ?? b.requestedAt).getTime() - new Date(a.processedAt ?? a.requestedAt).getTime())[0];
  const refundedAt = lastCompletedRefund?.processedAt ?? lastCompletedRefund?.requestedAt;
  const canReportNotReceived =
    order.refundStatus === 'COMPLETED' && refundedAt != null && Date.now() - new Date(refundedAt).getTime() <= ISSUE_WINDOW_MS;
  const refundEvidenceText = formatRefundEvidence(order.refundEvidence);

  const paymentLabel = (order.paymentStatus && PAYMENT_STATUS_LABELS[order.paymentStatus]) || 'Chờ thanh toán';
  const paymentMethodLabel = getPaymentMethodLabel(order);
  const shippingLabel =
    order.displayStatus && order.displayStatus.source !== 'ORDER'
      ? order.displayStatus.label
      : order.currentShipment
        ? shipmentStatusLabel(order.currentShipment.status, order.currentShipment.rawStatus)
        : 'Chưa tạo vận đơn';
  const paidVnd = order.amountPaidVnd ?? 0;
  const refundedVnd = order.amountRefundedVnd ?? 0;
  const discount = order.discountVnd ?? order.discountAmount;

  const openReport = (item: OrderItem | null, mode: 'PRODUCT' | 'REFUND_NOT_RECEIVED' = 'PRODUCT') => {
    if (!item) return;
    if (mode === 'PRODUCT' && blockedReportItemIds.has(item.id)) {
      toast.info('Sản phẩm này đã có yêu cầu xử lý, vui lòng chờ shop phản hồi.');
      return;
    }
    if (mode === 'REFUND_NOT_RECEIVED' && hasPendingRefundNotReceived) {
      toast.info('Bạn đã gửi báo cáo chưa nhận được tiền, vui lòng chờ shop xử lý.');
      return;
    }
    setReportMode(mode);
    setReportingItem(item);
  };

  const handleCancel = () => {
    cancelOrder(order.id, {
      onSuccess: () => {
        toast.success('Đã hủy đơn hàng');
        setShowCancelConfirm(false);
      },
      onError: () => toast.error('Không thể hủy đơn hàng lúc này.'),
    });
  };

  const handleConfirmDelivery = () => {
    confirmDelivery({ id: order.id }, {
      onSuccess: () => {
        toast.success('Cảm ơn bạn đã xác nhận nhận hàng');
        setShowDeliveryConfirm(false);
      },
      onError: () => toast.error('Không thể xác nhận nhận hàng lúc này.'),
    });
  };

  const handleReorder = () => {
    if (order.items.length === 0) return;
    order.items.forEach((item) => {
      addToCart({
        productId: item.productId,
        name: getOrderItemName(item),
        price: item.price,
        quantity: item.quantity,
        color: item.color || undefined,
        type: item.comboType,
        image: getOrderItemImage(item),
        variant: `Màu: ${item.color || 'Mặc định'} · May đo`,
      });
    });
    toast.success('Đã thêm các sản phẩm vào giỏ hàng');
    setIsCartOpen(true);
  };

  const actions = (
    <>
      {isAwaitingPayment ? <OrderPaymentAction order={order} /> : null}
      {order.allowedActions?.confirmDelivery ? (
        <button type="button" onClick={() => setShowDeliveryConfirm(true)} disabled={isConfirmingDelivery} className={accountButtonClassName('primary')}>
          {isConfirmingDelivery ? 'Đang xác nhận' : 'Tôi đã nhận hàng'}
        </button>
      ) : null}
      {canReportIssue && !allItemsBlocked ? (
        <button
          type="button"
          onClick={() => {
            if (order.items.length === 1) openReport(order.items[0]);
            else document.getElementById('order-items')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={accountButtonClassName('outline')}
        >
          Báo lỗi sản phẩm
        </button>
      ) : null}
      {order.allowedActions?.cancel ? (
        <button type="button" onClick={() => setShowCancelConfirm(true)} className={accountButtonClassName('danger')}>
          Hủy đơn
        </button>
      ) : null}
      <button type="button" onClick={handleReorder} className={accountButtonClassName('outline')}>
        Mua lại
      </button>
    </>
  );

  // Lịch sử dài (đổi trả, hoàn tiền) đẩy trang rất dài: mặc định chỉ hiện các cập nhật mới nhất.
  const history = order.history ?? [];
  const visibleHistory = showAllHistory ? history : history.slice(-HISTORY_PREVIEW);

  return (
    <AccountShell
      title="Chi tiết đơn hàng"
      activeHref="/profile/orders"
      description={
        <>
          <span className="font-mono text-landing-obsidian">{orderCode}</span> · Đặt lúc{' '}
          <span className="font-mono">{formatOrderDateTime(order.createdAt)}</span>
        </>
      }
      actions={actions}
    >
      <div className="flex flex-col gap-6">
        <Link href="/profile/orders" className={cn(accountButtonClassName('quiet', 'sm'), 'h-auto w-fit')}>
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          Tất cả đơn hàng
        </Link>

        {isAwaitingPayment ? (
          <OrderNotice title="Đơn đang chờ thanh toán">
            <p>Shop bắt đầu may sau khi nhận được tiền. Bấm Thanh toán để mở lại QR ZaloPay hoặc cổng chuyển khoản.</p>
            {order.paymentDueAt ? (
              <p>
                Thanh toán trước <span className="font-mono text-landing-obsidian">{formatOrderDateTime(order.paymentDueAt)}</span>, quá hạn đơn sẽ tự hủy.
              </p>
            ) : null}
            <p>
              Nội dung chuyển khoản: <span className="font-mono text-base text-landing-oxblood">FAI{order.orderCode}</span>
            </p>
            <p className="text-xs">Nếu đã chuyển khoản mà đơn chưa cập nhật, hãy kiểm tra nội dung chuyển khoản đã ghi đúng mã này.</p>
          </OrderNotice>
        ) : null}

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
                <button
                  type="button"
                  onClick={() => openReport(order.items[0] ?? null, 'REFUND_NOT_RECEIVED')}
                  className={accountButtonClassName('outline', 'sm')}
                >
                  Chưa nhận được tiền hoàn
                </button>
              )
            ) : null}
          </OrderNotice>
        ) : null}

        <section className="rounded-[2px] border border-landing-line bg-landing-ivory">
          <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-landing-line/70 px-4 py-3 sm:px-5">
            <OrderStatusLabel status={status} />
            {ORDER_STATUS_DESCRIPTIONS[status] ? <p className="text-xs text-landing-muted">{ORDER_STATUS_DESCRIPTIONS[status]}</p> : null}
          </header>
          <div className="flex flex-col gap-6 px-4 py-5 sm:px-5">
            {step >= 0 ? <OrderProgress step={step} /> : null}
            <dl className="grid gap-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-landing-line/70">
              <SummaryTile label="Thanh toán" value={paymentLabel} sub={paymentMethodLabel} />
              <SummaryTile
                label="Vận chuyển"
                value={shippingLabel}
                sub={
                  order.currentShipment?.providerOrderCode ? (
                    <>
                      Mã vận đơn <span className="font-mono text-landing-obsidian">{order.currentShipment.providerOrderCode}</span>
                    </>
                  ) : (
                    'Chờ bàn giao hãng vận chuyển'
                  )
                }
              />
              <SummaryTile
                label="Cập nhật"
                value={<span className="font-mono">{formatOrderDateTime(order.updatedAt)}</span>}
                sub={order.history?.[order.history.length - 1]?.publicMessage ?? 'Chưa có cập nhật'}
              />
            </dl>
          </div>
        </section>

        {/* Màn rộng: cột chính (sản phẩm, báo lỗi, lịch sử) và cột phụ (tiền, giao hàng) cố
            định khi cuộn. Màn hẹp: sản phẩm, báo lỗi, tiền và giao hàng, lịch sử cuối cùng. */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:grid-rows-[auto_auto_1fr] xl:items-start">
        <AccountSection
          variant="panel"
          title="Sản phẩm"
          description={`${itemCount} sản phẩm may đo theo số đo của bạn.`}
          className="min-w-0 xl:col-start-1 xl:row-start-1"
        >
          <ul id="order-items" className="scroll-mt-28 divide-y divide-landing-line/60">
            {order.items.map((item) => {
              const unitPrice = item.unitPriceVnd ?? item.price;
              const lineTotal = item.lineTotalVnd ?? item.price * item.quantity;
              const listUnitPrice = item.listUnitPriceVnd && item.listUnitPriceVnd > unitPrice ? item.listUnitPriceVnd : null;
              return (
                <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <OrderThumb item={item} className="h-[88px] w-[68px]" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.productId}`}
                          className={cn('product-name-line line-clamp-2 text-landing-obsidian transition-colors hover:text-landing-oxblood', accountFocusRing)}
                        >
                          {getOrderItemName(item)}
                        </Link>
                        <p className="mt-1 text-xs text-landing-muted">
                          Màu: {item.color || 'Mặc định'} · Vải: {item.fabricSnapshot || 'theo sản phẩm'} · SL{' '}
                          <span className="font-mono">{item.quantity}</span>
                          {item.productSkuSnapshot ? (
                            <>
                              {' '}· SKU <span className="font-mono">{item.productSkuSnapshot}</span>
                            </>
                          ) : null}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        {listUnitPrice ? (
                          <p className="font-mono text-[11px] text-landing-muted line-through">{formatVnd(listUnitPrice * item.quantity)}</p>
                        ) : null}
                        <p className="font-mono text-sm text-landing-obsidian">{formatVnd(lineTotal)}</p>
                        {item.quantity > 1 ? <p className="font-mono text-[11px] text-landing-muted">{formatVnd(unitPrice)} / cái</p> : null}
                      </div>
                    </div>
                    <ItemMeasurements item={item} />
                    {canReportIssue ? (
                      blockedReportItemIds.has(item.id) ? (
                        <a
                          href="#order-issues"
                          className="inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-landing-muted underline-offset-4 hover:text-landing-oxblood hover:underline"
                        >
                          Đã gửi yêu cầu · xem trạng thái
                        </a>
                      ) : (
                        <button type="button" onClick={() => openReport(item)} className={accountButtonClassName('outline', 'sm')}>
                          Báo lỗi sản phẩm này
                        </button>
                      )
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </AccountSection>

        <div className="min-w-0 empty:hidden xl:col-start-1 xl:row-start-2">
          <OrderIssuesList orderId={order.id} />
        </div>

        <aside aria-label="Thanh toán và giao hàng" className="flex flex-col gap-6 xl:sticky xl:top-24 xl:col-start-2 xl:row-span-3 xl:row-start-1">
          <AccountSection variant="panel" title="Thanh toán">
            <dl>
              <SummaryRow label="Phương thức">{paymentMethodLabel}</SummaryRow>
              <SummaryRow label="Trạng thái">{paymentLabel}</SummaryRow>
              <SummaryRow label="Tạm tính">
                <span className="font-mono">{formatVnd(order.itemsSubtotalVnd ?? order.itemsTotal)}</span>
              </SummaryRow>
              <SummaryRow label="Phí giao hàng">
                <span className="font-mono">{formatVnd(order.shippingFeeVnd ?? order.shippingFee)}</span>
              </SummaryRow>
              {discount > 0 ? (
                <SummaryRow label="Giảm giá">
                  <span className="font-mono">-{formatVnd(discount)}</span>
                </SummaryRow>
              ) : null}
              <SummaryRow label="Tổng cộng" strong>
                {formatVnd(getOrderTotal(order))}
              </SummaryRow>
              {order.amountPaidVnd !== undefined ? (
                <SummaryRow label="Đã thanh toán">
                  <span className="font-mono">{formatVnd(paidVnd)}</span>
                </SummaryRow>
              ) : null}
              {refundedVnd > 0 ? (
                <SummaryRow label={paidVnd > 0 && refundedVnd < paidVnd ? 'Đã hoàn một phần' : 'Đã hoàn tiền'}>
                  <span className="font-mono">{formatVnd(refundedVnd)}</span>
                </SummaryRow>
              ) : null}
            </dl>
          </AccountSection>

        {order.refunds && order.refunds.length > 0 ? (
          <AccountSection variant="panel" title="Hoàn tiền" description="Các lần shop chuyển khoản hoàn tiền cho đơn này.">
            <ol className="divide-y divide-landing-line/60">
              {order.refunds.map((refund) => {
                const refundStatus = REFUND_STATUS[refund.status] ?? { label: refund.status, tone: 'closed' as const };
                return (
                  <li key={refund.id} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium text-landing-obsidian">{REFUND_KIND_LABELS[refund.kind ?? 'GOODS']}</p>
                      <ToneLabel tone={refundStatus.tone} label={refundStatus.label} />
                      {refund.status === 'FAILED' ? (
                        <p className="text-xs text-destructive">Lần chuyển trước chưa thành công, shop đang chuyển lại.</p>
                      ) : null}
                      <p className="text-xs text-landing-muted">
                        Yêu cầu <span className="font-mono">{formatOrderDateTime(refund.requestedAt)}</span>
                        {refund.processedAt ? (
                          <>
                            {' '}· Hoàn tất <span className="font-mono">{formatOrderDateTime(refund.processedAt)}</span>
                          </>
                        ) : null}
                      </p>
                    </div>
                    <p className="font-mono text-base text-landing-oxblood">{formatVnd(refund.amountVnd)}</p>
                  </li>
                );
              })}
            </ol>
            {refundEvidenceText || order.refundEvidence ? (
              <div className="mt-5 space-y-4 border-t border-landing-line/60 pt-5">
                {refundEvidenceText ? (
                  /^https?:\/\//i.test(refundEvidenceText) ? (
                    <a
                      href={refundEvidenceText}
                      target="_blank"
                      rel="noreferrer"
                      className={cn('text-sm text-landing-oxblood underline underline-offset-4', accountFocusRing)}
                    >
                      Xem chứng từ hoàn tiền
                    </a>
                  ) : (
                    <p className="text-sm text-landing-muted">
                      Mã giao dịch: <span className="font-mono text-landing-obsidian">{refundEvidenceText}</span>
                    </p>
                  )
                ) : null}
                <RefundReceiptImages evidence={order.refundEvidence} label="Ảnh chứng từ chuyển khoản" />
              </div>
            ) : null}
          </AccountSection>
        ) : null}

          <AccountSection variant="panel" title="Giao đến">
            <div className="space-y-1 text-sm text-landing-obsidian">
              <p className="font-medium">{order.shippingInfo?.name || 'Khách hàng'}</p>
              {order.shippingInfo?.phone ? <p className="font-mono text-xs">{order.shippingInfo.phone}</p> : null}
              <p className="leading-relaxed text-landing-muted">{order.shippingInfo?.address || 'Chưa có địa chỉ'}</p>
            </div>
            {order.shippingInfo?.notes ? (
              <p className="mt-4 text-xs leading-relaxed text-landing-muted">
                Ghi chú: <span className="text-landing-obsidian">{order.shippingInfo.notes}</span>
              </p>
            ) : null}
          </AccountSection>
        </aside>

        <AccountSection variant="panel" title="Lịch sử đơn hàng" className="min-w-0 xl:col-start-1 xl:row-start-3">
          {history.length > 0 ? (
            <>
            {history.length > HISTORY_PREVIEW ? (
              <button
                type="button"
                onClick={() => setShowAllHistory((value) => !value)}
                className={cn(accountButtonClassName('quiet', 'sm'), 'mb-4 h-auto')}
              >
                {showAllHistory ? 'Chỉ xem các cập nhật mới nhất' : `Xem toàn bộ ${history.length} cập nhật`}
              </button>
            ) : null}
            <ol className="border-l border-landing-line pl-5">
              {visibleHistory.map((event, index) => {
                const isLatest = index === visibleHistory.length - 1;
                const issueId = (event.metadata as { issueId?: string } | undefined)?.issueId;
                return (
                  <li key={event.id} className="relative pb-5 last:pb-0">
                    <span
                      aria-hidden="true"
                      className={cn('absolute -left-[24.5px] top-1.5 h-2 w-2 rounded-full', isLatest ? 'bg-landing-oxblood' : 'bg-landing-taupe')}
                    />
                    <p className={cn('text-sm leading-relaxed', ISSUE_EVENT_TONE[event.type] ?? 'text-landing-obsidian', isLatest && 'font-medium')}>
                      {event.publicMessage || event.toStatus || event.type}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-landing-muted">
                      <span className="font-mono">{formatOrderDateTime(event.occurredAt)}</span>
                      {issueId ? (
                        <a href="#order-issues" className={cn('text-landing-oxblood underline-offset-4 hover:underline', accountFocusRing)}>
                          Xem báo lỗi
                        </a>
                      ) : null}
                    </p>
                  </li>
                );
              })}
            </ol>
            </>
          ) : (
            <p className="text-sm text-landing-muted">Chưa có lịch sử chi tiết.</p>
          )}
        </AccountSection>
        </div>
      </div>

      <AccountConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="Hủy đơn hàng?"
        description={
          <>
            Đơn <span className="font-mono">{orderCode}</span> sẽ bị hủy và không thể hoàn tác.
          </>
        }
        confirmLabel="Hủy đơn"
        isPending={isCancelling}
        onConfirm={handleCancel}
      />

      <ConfirmDeliveryDialog
        open={showDeliveryConfirm}
        onOpenChange={setShowDeliveryConfirm}
        orderCode={orderCode}
        isPending={isConfirmingDelivery}
        onConfirm={handleConfirmDelivery}
      />

      <ReportIssueModal
        isOpen={Boolean(reportingItem)}
        onClose={() => {
          setReportingItem(null);
          setReportMode('PRODUCT');
        }}
        orderId={order.id}
        orderItem={reportingItem}
        mode={reportMode}
        defaultBank={{
          bankName: order.refundBankName,
          accountNumber: order.refundAccountNumber,
          accountHolder: order.refundAccountHolder,
        }}
      />
    </AccountShell>
  );
}

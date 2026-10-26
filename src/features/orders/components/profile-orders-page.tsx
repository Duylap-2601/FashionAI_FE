'use client';

import { useCart } from '@/features/cart/hooks/use-cart';
import { OrderStatusLabel } from '@/features/orders/components/order-status-label';
import {
  FILTER_TABS,
  ORDER_IMAGE_FALLBACK,
  ORDER_STEPS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  STATUS_CONFIG,
} from '@/features/orders/constants/profile-orders-page';
import { useCancelOrder, useConfirmDelivery, useInfiniteOrders } from '@/features/orders/hooks/useOrders';
import {
  formatOrderDate,
  formatVnd,
  getOrderCode,
  getOrderItemImage,
  getOrderItemName,
  getOrderTotal,
} from '@/features/orders/services/order-display';
import type { Order, OrderItem } from '@/features/orders/types/orders';
import { AccountShell } from '@/features/profile/components/account-shell';
import {
  AccountConfirmDialog,
  AccountStatePanel,
  accountButtonClassName,
  accountFocusRing,
  accountInputClassName,
  accountLabelClassName,
} from '@/features/profile/components/account-ui';
import { WriteReviewModal } from '@/features/reviews/components/WriteReviewModal';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Copy, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

function OrderThumb({ item, className }: { item: OrderItem; className?: string }) {
  const [src, setSrc] = useState(() => getOrderItemImage(item));
  return (
    <span className={cn('relative block shrink-0 overflow-hidden rounded-[2px] bg-landing-paper', className)}>
      <Image src={src} alt={getOrderItemName(item)} fill sizes="64px" className="object-cover" onError={() => setSrc(ORDER_IMAGE_FALLBACK)} />
    </span>
  );
}

function OrderProgress({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-5 gap-1.5" aria-label="Tiến độ đơn hàng">
      {ORDER_STEPS.map((label, index) => {
        const done = index <= step;
        const current = index === step;
        return (
          <li key={label} aria-current={current ? 'step' : undefined}>
            <span aria-hidden="true" className={cn('block h-0.5', done ? 'bg-landing-oxblood' : 'bg-landing-taupe/60')} />
            <span
              className={cn(
                'mt-2 block text-[11px] leading-snug',
                current ? 'font-medium text-landing-oxblood' : done ? 'text-landing-obsidian/80' : 'text-landing-muted',
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function SummaryRow({ label, children, strong = false }: { label: string; children: React.ReactNode; strong?: boolean }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4 py-1.5', strong && 'mt-1 border-t border-landing-line/70 pt-3')}>
      <dt className={cn('text-sm', strong ? 'font-medium text-landing-obsidian' : 'text-landing-muted')}>{label}</dt>
      <dd className={cn('text-right text-sm', strong ? 'font-mono text-base text-landing-oxblood' : 'text-landing-obsidian')}>{children}</dd>
    </div>
  );
}

function OrderCard({
  order,
  onReviewItem,
  onRequestCancel,
}: {
  order: Order;
  onReviewItem: (item: OrderItem, orderId: string) => void;
  onRequestCancel: (order: Order) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { confirmDelivery, isConfirmingDelivery } = useConfirmDelivery();
  const { addToCart, setIsCartOpen } = useCart();

  const status = order.status || 'CREATED';
  const step = (STATUS_CONFIG[status] ?? STATUS_CONFIG.CREATED).step;
  const orderCode = getOrderCode(order);
  const carrierLabel = order.displayStatus && order.displayStatus.source !== 'ORDER' ? order.displayStatus.label : null;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const detailId = `order-${order.id}-detail`;
  const shippingFee = order.shippingFeeVnd ?? order.shippingFee;
  const discount = order.discountVnd ?? order.discountAmount;
  const latestEvent = order.history?.[order.history.length - 1];
  const shippingAddress = [order.shippingInfo?.address, order.shippingInfo?.wardName, order.shippingInfo?.provinceName].filter(Boolean).join(', ');

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(orderCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Không sao chép được mã đơn.');
    }
  };

  const handleConfirmDelivery = () => {
    confirmDelivery({ id: order.id }, {
      onSuccess: () => toast.success('Cảm ơn bạn đã xác nhận nhận hàng'),
      onError: () => toast.error('Không thể xác nhận nhận hàng lúc này.'),
    });
  };

  const handleReorder = () => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach(item => {
      addToCart({
        productId: item.productId,
        name: getOrderItemName(item),
        price: item.price,
        quantity: item.quantity,
        color: item.color || undefined,
        type: item.comboType,
        image: getOrderItemImage(item),
        variant: `Màu: ${item.color || 'Mặc định'} · May đo`
      });
    });
    setIsCartOpen(true);
  };

  return (
    <article className="border border-landing-line bg-landing-ivory/50">
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 border-b border-landing-line/70 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center">
            <Link href={`/orders/${order.id}`} className={cn('font-mono text-sm text-landing-obsidian transition-colors hover:text-landing-oxblood', accountFocusRing)}>
              {orderCode}
            </Link>
            <button
              type="button"
              onClick={copyCode}
              aria-label={copied ? 'Đã sao chép mã đơn' : `Sao chép mã ${orderCode}`}
              className={cn('flex h-8 w-8 items-center justify-center text-landing-muted transition-colors hover:text-landing-oxblood', accountFocusRing)}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-landing-sage-ink" strokeWidth={2} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />}
            </button>
          </span>
          <span className="text-xs text-landing-muted">Đặt ngày {formatOrderDate(order.createdAt)}</span>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <OrderStatusLabel status={status} />
          {carrierLabel ? <span className="text-xs text-landing-muted">Vận chuyển: {carrierLabel}</span> : null}
        </div>
      </header>

      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex shrink-0 -space-x-3">
            {order.items.slice(0, 3).map(item => (
              <OrderThumb key={item.id} item={item} className="h-[60px] w-12 border-2 border-landing-paper" />
            ))}
            {order.items.length > 3 ? (
              <span className="flex h-[60px] w-12 items-center justify-center border-2 border-landing-paper bg-landing-taupe/40 font-mono text-xs text-landing-obsidian">
                +{order.items.length - 3}
              </span>
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="product-name-line line-clamp-1 text-landing-obsidian">{order.items[0] ? getOrderItemName(order.items[0]) : 'Đơn may đo'}</p>
            <p className="mt-0.5 text-xs text-landing-muted">
              {order.items.length > 1 ? `và ${order.items.length - 1} món khác · ` : ''}
              {itemCount} sản phẩm
            </p>
          </div>
        </div>
        <p className="font-mono text-base text-landing-oxblood">{formatVnd(getOrderTotal(order))}</p>
      </div>

      {order.allowedActions?.updateMeasurement ? (
        <p className="mx-4 mb-4 border-l-2 border-landing-brass bg-landing-paper px-3 py-2 text-sm text-landing-obsidian sm:mx-5">
          Shop cần bạn xem lại số đo cho đơn này.{' '}
          <Link href={`/orders/${order.id}`} className={cn('text-landing-oxblood underline underline-offset-4', accountFocusRing)}>
            Mở đơn
          </Link>
        </p>
      ) : null}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-landing-line/70 px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          aria-controls={detailId}
          className={cn('inline-flex min-h-9 items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-muted transition-colors hover:text-landing-oxblood', accountFocusRing)}
        >
          {expanded ? 'Thu gọn' : 'Chi tiết'}
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <div className="flex flex-wrap gap-2">
          {order.allowedActions?.cancel ? (
            <button type="button" onClick={() => onRequestCancel(order)} className={accountButtonClassName('danger', 'sm')}>
              Hủy đơn
            </button>
          ) : null}
          {order.allowedActions?.confirmDelivery ? (
            <button type="button" onClick={handleConfirmDelivery} disabled={isConfirmingDelivery} className={accountButtonClassName('primary', 'sm')}>
              {isConfirmingDelivery ? 'Đang xác nhận' : 'Đã nhận hàng'}
            </button>
          ) : null}
          <button type="button" onClick={handleReorder} className={accountButtonClassName('outline', 'sm')}>
            Mua lại
          </button>
          <Link href={`/orders/${order.id}`} className={accountButtonClassName('outline', 'sm')}>
            Xem đơn
          </Link>
        </div>
      </footer>

      {expanded ? (
        <div id={detailId} className="flex flex-col gap-7 border-t border-landing-line/70 px-4 py-5 sm:px-5">
          {step >= 0 ? <OrderProgress step={step} /> : null}

          <div>
            <p className={accountLabelClassName}>Sản phẩm</p>
            <ul className="mt-3 divide-y divide-landing-line/60">
              {order.items.map(item => (
                <li key={item.id} className="flex items-center gap-4 py-3">
                  <OrderThumb item={item} className="h-[72px] w-14" />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.productId}`}
                      className={cn('product-name-line line-clamp-2 text-landing-obsidian transition-colors hover:text-landing-oxblood', accountFocusRing)}
                    >
                      {getOrderItemName(item)}
                    </Link>
                    <p className="mt-1 text-xs text-landing-muted">
                      Màu: {item.color || 'Mặc định'} · May đo · SL {item.quantity}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="font-mono text-sm text-landing-obsidian">{formatVnd(item.lineTotalVnd ?? item.price * item.quantity)}</span>
                    {status === 'COMPLETED' ? (
                      <button type="button" onClick={() => onReviewItem(item, order.id)} className={accountButtonClassName('outline', 'sm')}>
                        Đánh giá
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-7 sm:grid-cols-2 sm:gap-10">
            <div>
              <p className={accountLabelClassName}>Giao đến</p>
              <div className="mt-3 space-y-1 text-sm text-landing-obsidian">
                {order.shippingInfo?.name ? <p className="font-medium">{order.shippingInfo.name}</p> : null}
                {order.shippingInfo?.phone ? <p className="font-mono text-xs">{order.shippingInfo.phone}</p> : null}
                <p className="leading-relaxed text-landing-muted">{shippingAddress || 'Chưa có địa chỉ'}</p>
              </div>
              {latestEvent?.publicMessage ? (
                <p className="mt-4 text-xs leading-relaxed text-landing-muted">
                  Cập nhật mới nhất: <span className="text-landing-obsidian">{latestEvent.publicMessage}</span>
                </p>
              ) : null}
            </div>
            <div>
              <p className={accountLabelClassName}>Thanh toán</p>
              <dl className="mt-2">
                <SummaryRow label="Phương thức">{PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</SummaryRow>
                <SummaryRow label="Trạng thái">
                  {order.paymentStatus ? PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus : 'Chưa xác định'}
                </SummaryRow>
                <SummaryRow label="Phí giao hàng">
                  <span className="font-mono">{formatVnd(shippingFee)}</span>
                </SummaryRow>
                {discount > 0 ? (
                  <SummaryRow label="Giảm giá">
                    <span className="font-mono">-{formatVnd(discount)}</span>
                  </SummaryRow>
                ) : null}
                <SummaryRow label="Tổng cộng" strong>
                  {formatVnd(getOrderTotal(order))}
                </SummaryRow>
              </dl>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function OrdersSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      {[0, 1, 2].map((key) => (
        <div key={key} className="border border-landing-line">
          <div className="h-12 border-b border-landing-line/70 bg-landing-ivory/50" />
          <div className="flex items-center gap-4 p-5">
            <div className="h-[60px] w-12 animate-pulse bg-landing-taupe/40" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 animate-pulse bg-landing-taupe/40" />
              <div className="h-3 w-1/4 animate-pulse bg-landing-taupe/30" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [reviewModalItem, setReviewModalItem] = useState<{ item: OrderItem; orderId: string } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { cancelOrder, isCancelling } = useCancelOrder();

  const activeTab = FILTER_TABS.find((tab) => tab.id === activeFilter) ?? FILTER_TABS[0];
  const trimmedSearch = search.trim();
  const { orders, meta, isLoading, isError, refetch, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteOrders({
    limit: 20,
    status: activeTab.status,
    search: trimmedSearch || undefined,
  });

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '360px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const confirmCancel = () => {
    if (!cancelTarget) return;
    cancelOrder(cancelTarget.id, {
      onSuccess: () => {
        toast.success(`Đã hủy đơn ${getOrderCode(cancelTarget)}`);
        setCancelTarget(null);
      },
      onError: () => toast.error('Không hủy được đơn lúc này. Vui lòng thử lại.'),
    });
  };

  const isFiltered = activeTab.status !== undefined || trimmedSearch.length > 0;

  return (
    <AccountShell
      title="Đơn hàng"
      description="Theo dõi đơn may đo từ lúc đặt, duyệt số đo, may cho tới khi giao."
      actions={
        <div className="relative w-full md:w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-muted" strokeWidth={1.75} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Tìm đơn hàng"
            placeholder="Tìm mã đơn, sản phẩm…"
            className={cn(accountInputClassName, 'pl-9 [&::-webkit-search-cancel-button]:appearance-none')}
          />
        </div>
      }
    >
      <div className="relative mb-6">
        <div role="tablist" aria-label="Lọc theo trạng thái" className="no-scrollbar flex gap-6 overflow-x-auto border-b border-landing-line pr-8">
          {FILTER_TABS.map(tab => {
            const selected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveFilter(tab.id)}
                className={cn(
                  'relative h-11 shrink-0 whitespace-nowrap text-sm transition-colors',
                  selected
                    ? 'font-medium text-landing-oxblood after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-landing-oxblood'
                    : 'text-landing-obsidian/70 hover:text-landing-oxblood',
                  accountFocusRing,
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-landing-paper to-transparent" />
      </div>

      {!isLoading && !isError && orders.length > 0 ? (
        <p className="mb-4 text-xs text-landing-muted" aria-live="polite">
          <span className="font-mono text-landing-obsidian">{meta.total}</span> đơn
          {activeTab.status ? ` ${activeTab.label.toLowerCase()}` : ''}
          {trimmedSearch ? ` khớp “${trimmedSearch}”` : ''}
        </p>
      ) : null}

      {isLoading ? (
        <OrdersSkeleton />
      ) : isError ? (
        <AccountStatePanel
          tone="error"
          title="Không tải được đơn hàng"
          description="Kiểm tra kết nối rồi thử lại."
          action={
            <button type="button" onClick={() => refetch()} className={accountButtonClassName('outline')}>
              Thử lại
            </button>
          }
        />
      ) : orders.length === 0 ? (
        isFiltered ? (
          <AccountStatePanel
            title="Không có đơn phù hợp"
            description={trimmedSearch ? 'Thử mã đơn khác hoặc bỏ bớt từ khóa.' : 'Chưa có đơn nào ở trạng thái này.'}
            action={
              <button type="button" onClick={() => { setActiveFilter('all'); setSearch(''); }} className={accountButtonClassName('outline')}>
                Xem tất cả đơn
              </button>
            }
          />
        ) : (
          <AccountStatePanel
            title="Chưa có đơn hàng nào"
            description="Chọn một thiết kế, lưu số đo và đặt đơn may đo đầu tiên."
            action={
              <Link href="/products" className={accountButtonClassName('primary')}>
                Xem sản phẩm
              </Link>
            }
          />
        )
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onReviewItem={(item, orderId) => setReviewModalItem({ item, orderId })}
                onRequestCancel={setCancelTarget}
              />
            ))}
          </div>
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {isFetchingNextPage ? (
              <p className="text-xs text-landing-muted">Đang tải thêm đơn…</p>
            ) : hasNextPage ? (
              <button type="button" onClick={() => fetchNextPage()} className={accountButtonClassName('outline')}>
                Tải thêm đơn hàng
              </button>
            ) : null}
          </div>
        </>
      )}

      <AccountConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => { if (!open) setCancelTarget(null); }}
        title="Hủy đơn hàng?"
        description={
          cancelTarget
            ? `Đơn ${getOrderCode(cancelTarget)} chưa thanh toán sẽ bị hủy và không khôi phục được.`
            : ''
        }
        confirmLabel="Hủy đơn"
        isPending={isCancelling}
        onConfirm={confirmCancel}
      />

      {/* Modal viết review khi click từ đơn hàng đã nhận */}
      {reviewModalItem ? (
        <WriteReviewModal
          isOpen
          onClose={() => setReviewModalItem(null)}
          productId={reviewModalItem.item.productId}
          productName={getOrderItemName(reviewModalItem.item)}
          productImage={getOrderItemImage(reviewModalItem.item)}
          orderId={reviewModalItem.orderId}
        />
      ) : null}
    </AccountShell>
  );
}

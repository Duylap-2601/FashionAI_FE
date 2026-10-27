'use client';

import { useCommerceViewTracking } from '@/features/analytics/hooks/use-commerce-view-tracking';
import { CartLine, cartFocusRing, formatCartPrice } from '@/features/cart/components/cart-line';
import { useCart } from '@/features/cart/hooks/use-cart';
import { AccountConfirmDialog } from '@/features/profile/components/account-ui';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';

const labelClass = 'text-[11px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink';
const primaryButton = cn(
  'flex h-12 w-full items-center justify-center gap-2 rounded-[2px] bg-landing-oxblood px-6 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-landing-paper transition-colors hover:bg-landing-obsidian',
  cartFocusRing,
);
const outlineButton = cn(
  'inline-flex h-11 items-center justify-center rounded-[2px] border border-landing-line px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood',
  cartFocusRing,
);

/** Những điều thật về đơn may đo, kèm link tới trang liên quan. */
const ASSURANCES: { title: string; body: string; href?: string; link?: string }[] = [
  { title: 'May theo số đo của bạn', body: 'Mỗi đơn chụp lại số đo đã lưu trong hồ sơ lúc đặt.', href: '/profile/measurements', link: 'Xem số đo' },
  { title: '7 ngày để báo lỗi', body: 'Tính từ khi đơn hoàn tất, nếu sai số đo, sai màu hoặc có lỗi may.', href: '/return-policy', link: 'Chính sách đổi trả' },
  { title: 'Thanh toán qua ZaloPay', body: 'Quét QR hoặc mở ứng dụng ZaloPay ở bước đặt hàng.' },
];

function CartFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-paper-texture">
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-6 md:px-8 md:pt-10">{children}</div>
    </div>
  );
}

export default function CartPage() {
  const {
    cartItems: items,
    purchasableItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalPrice: total,
    isLoading,
    isError,
    refetch,
  } = useCart();
  const [confirmClear, setConfirmClear] = useState(false);

  const totalQuantity = purchasableItems.reduce((acc, item) => acc + item.quantity, 0);
  useCommerceViewTracking('view_cart', purchasableItems, !isLoading);

  if (isLoading) {
    return (
      <CartFrame>
        <div className="flex min-h-[50vh] items-center justify-center" role="status">
          <Loader2 className="h-7 w-7 animate-spin text-landing-oxblood" strokeWidth={1.5} aria-label="Đang tải giỏ hàng" />
        </div>
      </CartFrame>
    );
  }

  if (isError || items.length === 0) {
    return (
      <CartFrame>
        <div className="mx-auto flex max-w-[560px] flex-col items-center border border-landing-line bg-landing-ivory/60 px-6 py-16 text-center">
          <p className={labelClass}>Giỏ hàng</p>
          <h1 className={cn('mt-3 font-display text-3xl leading-tight', isError ? 'text-destructive' : 'text-landing-obsidian')}>
            {isError ? 'Không tải được giỏ hàng' : 'Giỏ hàng đang trống'}
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-landing-muted">
            {isError ? 'Kiểm tra kết nối mạng rồi thử lại.' : 'Chọn một thiết kế, thử trên bạn bằng Thử đồ AI rồi thêm vào giỏ.'}
          </p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            {isError ? (
              <button type="button" onClick={() => refetch()} className={cn(primaryButton, 'w-auto')}>
                Thử lại
              </button>
            ) : (
              <Link href="/products" className={cn(primaryButton, 'w-auto')}>
                Xem sản phẩm <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              </Link>
            )}
            <Link href="/profile/orders" className={outlineButton}>
              Đơn hàng của tôi
            </Link>
          </div>
        </div>
      </CartFrame>
    );
  }

  return (
    <CartFrame>
      <header className="mb-8 flex flex-col gap-5 border-b border-landing-line pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className={labelClass}>Giỏ hàng</p>
          <h1 className="mt-3 font-display text-landing-h2 text-landing-obsidian">Túi của bạn</h1>
          <p className="mt-3 text-landing-body text-landing-muted">
            <span className="font-mono text-landing-obsidian">{totalQuantity}</span> sản phẩm sẵn sàng đặt may.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/products" className={cn('text-sm text-landing-obsidian underline-offset-4 hover:text-landing-oxblood hover:underline', cartFocusRing)}>
            Tiếp tục mua sắm
          </Link>
          <button type="button" onClick={() => setConfirmClear(true)} className={cn('text-sm text-landing-muted transition-colors hover:text-destructive', cartFocusRing)}>
            Xoá tất cả
          </button>
        </div>
      </header>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <section aria-label="Sản phẩm trong giỏ" className="divide-y divide-landing-line/70 border-y border-landing-line/70">
          {items.map((item) => (
            <CartLine key={item.id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />
          ))}
        </section>

        <aside className="flex flex-col gap-8 lg:sticky lg:top-[97px]">
          <div className="border border-landing-line bg-landing-ivory/60 p-5">
            <h2 className="font-display text-[1.375rem] leading-tight">Tóm tắt</h2>
            <dl className="mt-4 space-y-2.5 border-b border-landing-line/70 pb-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-landing-muted">Sản phẩm</dt>
                <dd className="font-mono text-landing-obsidian">{totalQuantity}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-landing-muted">Phí giao hàng</dt>
                <dd className="text-landing-obsidian">Tính ở bước đặt hàng</dd>
              </div>
            </dl>
            <div className="flex items-baseline justify-between gap-4 py-4">
              <span className="font-medium text-landing-obsidian">Tạm tính</span>
              <span className="font-mono text-2xl text-landing-oxblood">{formatCartPrice(total)}</span>
            </div>
            <Link href="/checkout" className={primaryButton}>
              Tiến hành đặt hàng <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>

          <ul className="space-y-4">
            {ASSURANCES.map((item) => (
              <li key={item.title} className="border-l-2 border-landing-brass pl-4">
                <p className="text-sm font-medium text-landing-obsidian">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-landing-muted">{item.body}</p>
                {item.href ? (
                  <Link href={item.href} className={cn('mt-1 inline-block text-xs text-landing-oxblood underline-offset-4 hover:underline', cartFocusRing)}>
                    {item.link}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <AccountConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Xoá cả giỏ hàng?"
        description={`${items.length} sản phẩm sẽ bị bỏ khỏi giỏ. Bạn có thể thêm lại từ trang sản phẩm.`}
        confirmLabel="Xoá tất cả"
        onConfirm={() => {
          clearCart();
          setConfirmClear(false);
        }}
      />
    </CartFrame>
  );
}

import { useCommerceViewTracking } from '@/features/analytics/hooks/use-commerce-view-tracking';
import { CartLine, cartFocusRing, formatCartPrice } from '@/features/cart/components/cart-line';
import { useCart } from '@/features/cart/hooks/use-cart';
import type { CartSlideOverProps } from '@/features/cart/types/cart-slide-over';
import { cn } from '@/lib/utils';
import * as Dialog from '@radix-ui/react-dialog';
import { Loader2, X } from 'lucide-react';
import Link from 'next/link';

const primaryButton = cn(
  'flex h-12 w-full items-center justify-center rounded-[2px] bg-landing-oxblood text-[11.5px] font-semibold uppercase tracking-[0.16em] text-landing-paper transition-colors hover:bg-landing-obsidian',
  cartFocusRing,
);

export function CartSlideOver({ isOpen, onClose }: CartSlideOverProps) {
  const {
    cartItems: items,
    purchasableItems,
    updateQuantity,
    removeFromCart,
    totalPrice: total,
    isLoading,
    isError,
    refetch,
  } = useCart();
  useCommerceViewTracking('view_cart', purchasableItems, isOpen && !isLoading);

  const purchasableQuantity = purchasableItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-landing-obsidian/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-[101] flex w-full flex-col border-l border-landing-line bg-landing-paper text-landing-obsidian data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right md:w-[420px]">
          <div className="flex items-start justify-between gap-4 border-b border-landing-line/70 px-5 pb-4 pt-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink">Giỏ hàng</p>
              <Dialog.Title className="mt-1.5 font-display text-2xl leading-tight">
                Túi của bạn <span className="font-mono text-sm text-landing-muted">({items.length})</span>
              </Dialog.Title>
              <Dialog.Description className="sr-only">Sản phẩm đã thêm vào giỏ hàng</Dialog.Description>
            </div>
            <Dialog.Close aria-label="Đóng giỏ hàng" className={cn('-mr-2 flex h-11 w-11 items-center justify-center text-landing-muted transition-colors hover:text-landing-oxblood', cartFocusRing)}>
              <X className="h-5 w-5" strokeWidth={1.75} />
            </Dialog.Close>
          </div>

          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5">
            {isLoading ? (
              <div className="flex h-full items-center justify-center" role="status">
                <Loader2 className="h-6 w-6 animate-spin text-landing-oxblood" strokeWidth={1.5} aria-label="Đang tải giỏ hàng" />
              </div>
            ) : isError ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="font-display text-2xl leading-tight">Không tải được giỏ hàng</p>
                <p className="mt-2 text-sm text-landing-muted">Kiểm tra kết nối rồi thử lại.</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className={cn('mt-6 inline-flex h-11 items-center rounded-[2px] border border-landing-line px-5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors hover:border-landing-oxblood hover:text-landing-oxblood', cartFocusRing)}
                >
                  Thử lại
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="font-display text-2xl leading-tight">Giỏ hàng đang trống</p>
                <p className="mt-2 max-w-[260px] text-sm text-landing-muted">Chọn một thiết kế, thử trên bạn rồi thêm vào đây.</p>
                <Link href="/products" onClick={onClose} className={cn(primaryButton, 'mt-6 w-auto px-6')}>
                  Xem sản phẩm
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-landing-line/70">
                {items.map((item) => (
                  <CartLine key={item.id} item={item} size="sm" onNavigate={onClose} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />
                ))}
              </div>
            )}
          </div>

          {!isLoading && !isError && items.length > 0 ? (
            <div className="border-t border-landing-line px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm text-landing-muted">
                  Tạm tính · <span className="font-mono">{purchasableQuantity}</span> sản phẩm
                </span>
                <span className="font-mono text-lg text-landing-oxblood">{formatCartPrice(total)}</span>
              </div>
              <p className="mt-1 text-xs text-landing-muted">Phí giao hàng tính ở bước đặt hàng.</p>
              <Link href="/checkout" onClick={onClose} className={cn(primaryButton, 'mt-4')}>
                Đặt hàng
              </Link>
              <div className="mt-3 flex items-center justify-between">
                <Link href="/cart" onClick={onClose} className={cn('text-xs text-landing-obsidian underline-offset-4 hover:text-landing-oxblood hover:underline', cartFocusRing)}>
                  Xem trang giỏ hàng
                </Link>
                <Link href="/profile/orders" onClick={onClose} className={cn('text-xs text-landing-muted underline-offset-4 hover:text-landing-oxblood hover:underline', cartFocusRing)}>
                  Đơn hàng của tôi
                </Link>
              </div>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

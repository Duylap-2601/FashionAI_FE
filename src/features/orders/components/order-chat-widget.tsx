'use client';

import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { useAuthStore } from '@/features/auth/store/authStore';
import { OrderChatPanel } from '@/features/orders/components/order-chat-panel';
import { useMyOrderChats } from '@/features/orders/hooks/useOrderChat';
import { cn } from '@/lib/utils';
import { ChevronDown, MessageCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

const ACTIVE_ORDER_KEY = 'order_chat_active_order';

type ChatOption = {
  orderId: string;
  orderCode: number;
  preview: string | null;
  unread: number;
  hasThread: boolean;
};

export function OrderChatWidget() {
  const status = useAuthStore((state) => state.status);
  const { threads, orders, isLoading, isError, refetch } = useMyOrderChats();
  const [open, setOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const options = useMemo<ChatOption[]>(() => {
    const threadIds = new Set(threads.map((thread) => thread.orderId));
    return [
      ...threads.map((thread) => ({
        orderId: thread.orderId,
        orderCode: thread.orderCode,
        preview: thread.lastMessagePreview,
        unread: thread.unread,
        hasThread: true,
      })),
      ...orders
        .filter((order) => !threadIds.has(order.orderId))
        .map((order) => ({
          orderId: order.orderId,
          orderCode: order.orderCode,
          preview: null,
          unread: 0,
          hasThread: false,
        })),
    ];
  }, [threads, orders]);

  const active = options.find((option) => option.orderId === activeOrderId) ?? options[0] ?? null;
  const totalUnread = threads.reduce((sum, thread) => sum + thread.unread, 0);

  useEffect(() => {
    if (activeOrderId && options.some((option) => option.orderId === activeOrderId)) return;
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(ACTIVE_ORDER_KEY) : null;
    const preferred = options.find((option) => option.orderId === saved) ?? options[0];
    if (preferred) setActiveOrderId(preferred.orderId);
  }, [options, activeOrderId]);

  useEffect(() => {
    if (activeOrderId && typeof window !== 'undefined') {
      window.localStorage.setItem(ACTIVE_ORDER_KEY, activeOrderId);
    }
  }, [activeOrderId]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSwitcherOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  if (status !== 'authenticated') return null;

  return (
    <div ref={containerRef} className="fixed bottom-[88px] right-4 z-[60] flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-label="Trao đổi với shop"
            className="relative flex w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[2px] border border-landing-line bg-landing-paper text-landing-obsidian shadow-[0_24px_48px_-24px_rgba(17,16,15,0.4)] sm:w-[400px]"
            style={{ height: 'min(620px, calc(100dvh - 140px))' }}
          >
            <div className="flex shrink-0 items-center gap-2 bg-landing-oxblood px-3 py-2.5 text-landing-paper">
              <MessageCircle className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <button
                type="button"
                onClick={() => setSwitcherOpen((current) => !current)}
                aria-expanded={switcherOpen}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block text-sm font-semibold">Trao đổi với shop</span>
                <span className="mt-0.5 flex items-center gap-1 text-[11px] text-landing-paper/75">
                  {active ? `Đơn #${active.orderCode}` : 'Chọn đơn hàng'}
                  <ChevronDown className={cn('h-3 w-3 transition-transform', switcherOpen && 'rotate-180')} strokeWidth={2} />
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setSwitcherOpen(false);
                }}
                aria-label="Đóng trao đổi"
                className="flex h-8 w-8 items-center justify-center rounded-[2px] text-landing-paper/70 transition-colors hover:text-landing-paper"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            {switcherOpen ? (
              <div className="absolute inset-x-0 top-[58px] z-20 max-h-[60%] overflow-y-auto border-b border-landing-line bg-landing-ivory shadow-lg">
                {options.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-landing-muted">Bạn chưa có đơn hàng nào để trao đổi.</p>
                ) : (
                  options.map((option) => (
                    <button
                      key={option.orderId}
                      type="button"
                      onClick={() => {
                        setActiveOrderId(option.orderId);
                        setSwitcherOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-start gap-3 border-b border-landing-line/60 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-landing-paper',
                        option.orderId === active?.orderId && 'bg-landing-paper',
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-landing-oxblood">#{option.orderCode}</span>
                          {option.hasThread ? null : (
                            <span className="text-[10px] uppercase tracking-[0.12em] text-landing-muted">Chưa có tin</span>
                          )}
                        </span>
                        <span className="mt-1 block truncate text-xs text-landing-muted">
                          {option.preview || 'Bắt đầu trao đổi với shop'}
                        </span>
                      </span>
                      {option.unread > 0 ? (
                        <span className="mt-0.5 flex h-5 min-w-5 items-center justify-center rounded-[2px] bg-landing-oxblood px-1 font-mono text-[10px] font-semibold text-landing-paper">
                          {option.unread}
                        </span>
                      ) : null}
                    </button>
                  ))
                )}
              </div>
            ) : null}

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3">
              {isLoading ? (
                <div className="flex flex-1 items-center justify-center py-10">
                  <AtelierLoader size="sm" label="Đang tải hội thoại" />
                </div>
              ) : isError ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-xs text-destructive">
                  Không tải được hội thoại.
                  <button type="button" onClick={() => refetch()} className="text-landing-oxblood underline underline-offset-4">
                    Thử lại
                  </button>
                </div>
              ) : !active ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-xs text-landing-muted">
                  <p>Bạn chưa có đơn hàng nào để trao đổi với shop.</p>
                  <Link href="/profile/orders" onClick={() => setOpen(false)} className="text-landing-oxblood underline underline-offset-4">
                    Xem đơn của tôi
                  </Link>
                </div>
              ) : (
                <OrderChatPanel
                  key={active.orderId}
                  orderId={active.orderId}
                  orderCode={`#${active.orderCode}`}
                  hideHeader
                />
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-landing-line/70 px-3 py-2 text-[11px]">
              <span className="text-landing-muted">Shop phản hồi trong giờ làm việc.</span>
              {active ? (
                <Link href={`/orders/${active.orderId}`} onClick={() => setOpen(false)} className="text-landing-oxblood underline-offset-4 hover:underline">
                  Mở trang đơn
                </Link>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((current) => !current)}
        whileTap={{ scale: 0.97 }}
        aria-label={open ? 'Đóng trao đổi với shop' : 'Mở trao đổi với shop'}
        aria-expanded={open}
        className="relative flex h-14 w-14 items-center justify-center rounded-[2px] bg-landing-oxblood shadow-[0_12px_28px_-12px_rgba(17,16,15,0.5)] transition-colors hover:bg-landing-oxblood/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-5 w-5 text-landing-paper" strokeWidth={1.75} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="h-5 w-5 text-landing-paper" strokeWidth={1.75} />
            </motion.div>
          )}
        </AnimatePresence>

        {totalUnread > 0 && !open ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-[2px] border border-landing-oxblood bg-landing-paper px-1 font-mono text-[10px] font-semibold text-landing-oxblood"
            aria-label={`${totalUnread} tin nhắn chưa đọc`}
          >
            {totalUnread}
          </motion.span>
        ) : null}
      </motion.button>
    </div>
  );
}

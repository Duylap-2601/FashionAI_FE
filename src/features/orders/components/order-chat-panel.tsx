'use client';

import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { ImageFilePreviews } from '@/components/ui/image-file-previews';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { useOrderChat } from '@/features/orders/hooks/useOrderChat';
import type { OrderChatMessage } from '@/features/orders/types/order-chat';
import {
  accountButtonClassName,
  accountFocusRing,
  accountLabelClassName,
} from '@/features/profile/components/account-ui';
import { describeImageFileRejection, useImageFileSelection } from '@/hooks/use-image-file-selection';
import { getErrorMessage } from '@/lib/errors';
import { getRealtimeSocket } from '@/lib/realtimeSocket';
import { cn } from '@/lib/utils';
import { ImagePlus, Send } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

function formatTime(value: string) {
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
}

function ChatMessageBubble({
  message,
  isOwn,
  onZoom,
}: {
  message: OrderChatMessage;
  isOwn: boolean;
  onZoom: (image: { src: string; alt: string }) => void;
}) {
  return (
    <li className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-[2px] border px-3 py-2 text-sm leading-relaxed',
          isOwn
            ? 'border-landing-oxblood/20 bg-landing-oxblood/10 text-landing-obsidian'
            : 'border-landing-line bg-landing-ivory text-landing-obsidian',
        )}
      >
        {message.senderName && !isOwn ? (
          <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-landing-muted">
            {message.senderName}
          </p>
        ) : null}
        {message.content ? <p className="whitespace-pre-wrap break-words">{message.content}</p> : null}
        {message.attachments.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((url, index) => (
              <li key={`${message.id}-${index}`}>
                <button
                  type="button"
                  onClick={() => onZoom({ src: url, alt: `Ảnh ${index + 1} trong tin nhắn` })}
                  className={cn('relative block size-24 overflow-hidden rounded-[2px] border border-landing-line', accountFocusRing)}
                  title="Xem ảnh"
                >
                  <Image src={url} alt={`Ảnh ${index + 1}`} fill sizes="96px" className="object-cover" unoptimized />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <time dateTime={message.createdAt} className="font-mono text-[10px] text-landing-muted">
        {formatTime(message.createdAt)}
      </time>
    </li>
  );
}

export function OrderChatPanel({
  orderId,
  orderCode,
  isAdmin = false,
  hideHeader = false,
}: {
  orderId: string;
  orderCode: string;
  isAdmin?: boolean;
  hideHeader?: boolean;
}) {
  const {
    messages,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    unread,
    isLocked,
    sendMessage,
    isSending,
    markRead,
  } = useOrderChat(orderId, isAdmin);

  const [text, setText] = useState('');
  const [zoomed, setZoomed] = useState<{ src: string; alt: string } | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const images = useImageFileSelection({
    maxFiles: 3,
    onReject: (rejection) => toast.error(describeImageFileRejection(rejection)),
  });

  const latestMessageId = messages.length > 0 ? messages[messages.length - 1].id : undefined;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  useEffect(() => {
    const node = panelRef.current;
    if (!node) return;
    const tryMarkRead = () => {
      if (document.visibilityState === 'visible' && unread > 0) {
        markRead(latestMessageId);
      }
    };
    tryMarkRead();
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) tryMarkRead();
    }, { threshold: 0.35 });
    observer.observe(node);
    document.addEventListener('visibilitychange', tryMarkRead);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', tryMarkRead);
    };
  }, [markRead, unread, latestMessageId]);

  // RealtimeProvider đã invalidate theo orderId, nhưng socket là singleton khởi tạo
  // async nên có thể chưa sẵn sàng khi panel mount. Subscribe trực tiếp + chờ socket
  // xuất hiện để tin của shop hiện ngay, không phụ thuộc thứ tự mount.
  useEffect(() => {
    const handleMessage = (payload: { orderId?: string }) => {
      if (payload?.orderId === orderId) void refetch();
    };
    let attachedSocket: ReturnType<typeof getRealtimeSocket> = null;
    let waitTimer: ReturnType<typeof setInterval> | null = null;

    const attach = () => {
      const socket = getRealtimeSocket();
      if (!socket) return false;
      if (attachedSocket !== socket) {
        attachedSocket?.off('order_chat:message', handleMessage);
        socket.on('order_chat:message', handleMessage);
        attachedSocket = socket;
      }
      return true;
    };

    if (!attach()) {
      waitTimer = setInterval(() => {
        if (attach() && waitTimer) {
          clearInterval(waitTimer);
          waitTimer = null;
        }
      }, 500);
    }

    return () => {
      if (waitTimer) clearInterval(waitTimer);
      attachedSocket?.off('order_chat:message', handleMessage);
    };
  }, [orderId, refetch]);

  const canSend = useMemo(
    () => (text.trim().length > 0 || images.files.length > 0) && !isSending,
    [text, images.files.length, isSending],
  );

  const handleSend = () => {
    if (!canSend) return;
    const clientMessageId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sendMessage(
      {
        orderId,
        content: text.trim() || undefined,
        images: images.files,
        clientMessageId,
      },
      {
        onSuccess: () => {
          setText('');
          images.clear();
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Không gửi được tin nhắn.')),
      },
    );
  };

  return (
    <section
      ref={panelRef}
      aria-labelledby={hideHeader ? undefined : `order-chat-title-${orderId}`}
      aria-label={hideHeader ? `Trao đổi với shop đơn ${orderCode}` : undefined}
      className="min-w-0"
    >
      {hideHeader ? null : (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p id={`order-chat-title-${orderId}`} className={accountLabelClassName}>
            Trao đổi với shop
          </p>
          <span className="font-mono text-[10.5px] text-landing-muted">{orderCode}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center border border-landing-line bg-landing-ivory py-10">
          <AtelierLoader size="sm" label="Đang tải hội thoại" />
        </div>
      ) : isError ? (
        <div className="border border-destructive/30 bg-destructive/5 px-4 py-6 text-center text-sm text-destructive">
          Không tải được hội thoại.
          <button type="button" onClick={() => refetch()} className={cn(accountButtonClassName('outline', 'sm'), 'ml-3')}>
            Thử lại
          </button>
        </div>
      ) : (
        <div className="rounded-[2px] border border-landing-line bg-landing-paper/40">
          <div className="flex max-h-[420px] min-h-[180px] flex-col gap-3 overflow-y-auto px-3 py-4">
            {hasNextPage ? (
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="mx-auto text-xs font-semibold text-landing-oxblood underline-offset-4 hover:underline disabled:opacity-60"
              >
                {isFetchingNextPage ? 'Đang tải thêm…' : 'Tải tin nhắn cũ hơn'}
              </button>
            ) : null}
            {messages.length === 0 ? (
              <p className="m-auto max-w-xs text-center text-xs leading-relaxed text-landing-muted">
                Chưa có trao đổi nào. Bạn có thể hỏi shop về số đo hoặc đơn hàng tại đây.
              </p>
            ) : (
              <ul role="log" aria-live="polite" className="flex flex-col gap-3">
                {messages.map((message) => (
                  <ChatMessageBubble
                    key={message.id}
                    message={message}
                    isOwn={isAdmin ? message.senderRole === 'ADMIN' : message.senderRole === 'CUSTOMER'}
                    onZoom={setZoomed}
                  />
                ))}
              </ul>
            )}
            <div ref={endRef} />
          </div>

          {isLocked ? (
            <div className="border-t border-landing-line bg-landing-ivory px-3 py-3 text-center text-xs leading-relaxed text-landing-muted">
              Hội thoại đã đóng sau khi hoàn tiền. Lịch sử tin nhắn vẫn được lưu.
            </div>
          ) : (
          <div className="border-t border-landing-line bg-landing-ivory px-3 py-3">
            <ImageFilePreviews
              items={images.items}
              onRemove={images.remove}
              onAdd={images.canAddMore ? () => document.getElementById(`order-chat-images-${orderId}`)?.click() : undefined}
              disabled={isSending}
            />
            <div className="mt-2 flex items-end gap-2">
              <input
                id={`order-chat-images-${orderId}`}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(event) => {
                  images.add(event.target.files);
                  event.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => document.getElementById(`order-chat-images-${orderId}`)?.click()}
                disabled={!images.canAddMore || isSending}
                aria-label="Đính kèm ảnh"
                className={cn('flex h-10 w-10 shrink-0 items-center justify-center text-landing-muted transition-colors hover:text-landing-oxblood disabled:opacity-50', accountFocusRing)}
              >
                <ImagePlus className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                maxLength={2000}
                placeholder="Nhập tin nhắn…"
                aria-label="Nội dung tin nhắn"
                className="max-h-28 min-h-10 flex-1 resize-none rounded-[2px] border border-landing-line bg-landing-paper px-3 py-2 text-sm text-landing-obsidian focus:border-landing-oxblood focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                aria-label="Gửi tin nhắn"
                className={cn(accountButtonClassName('primary', 'sm'), 'h-10 shrink-0 px-3')}
              >
                <Send className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
          )}
        </div>
      )}

      <ImageLightbox image={zoomed} onClose={() => setZoomed(null)} />
    </section>
  );
}

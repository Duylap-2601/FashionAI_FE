'use client';

import { GA_ITEM_LISTS } from '@/features/analytics/constants/ga-item-lists';
import type { ChatMessageProps } from '@/features/chat/types/chat-message';
import { AssistantMark } from '@/features/chat/components/assistant-mark';
import { OutfitSuggestionList } from '@/features/stylist/components/outfit-suggestion-list';
import { ChatSuggestionsSkeleton } from './ChatSuggestionsSkeleton';
import { Check, Copy, ExternalLink, Package, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { FormattedChatText } from './FormattedChatText';

export function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  // Thẻ có thể tới trước khi stream kết thúc hẳn (BE gửi trước bước lưu DB).
  const suggestions = !isUser ? message.suggestions : null;
  const suggestionsPending = !isUser && Boolean(message.suggestionsPending) && !suggestions;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Đã sao chép nội dung');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép');
    }
  };

  const formattedTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
    : '';

  return (
    <div
      className={`group flex w-full items-start gap-3 duration-300 animate-in fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none ${isUser ? 'justify-end' : 'justify-start'
        }`}
    >
      {/* Assistant Avatar */}
      {!isUser && <AssistantMark className="mt-0.5" />}

      {/* Message Content Container */}
      <div className={`flex flex-col gap-1.5 max-w-[85%] sm:max-w-[78%] md:max-w-[70%] ${isUser ? 'items-end' : 'items-start'} ${suggestions || suggestionsPending ? 'w-full' : ''}`}>

        {/* Attached Product Preview Card if present */}
        {message.product && (
          <Link
            href={`/products/${message.product.id}`}
            className="group/prod mb-1 flex items-center gap-2.5 rounded-[2px] border border-landing-line bg-landing-ivory p-2 transition-colors hover:border-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
          >
            {message.product.image ? (
              <Image
                src={message.product.image}
                alt={message.product.name}
                width={36}
                height={44}
                unoptimized
                className="h-11 w-9 shrink-0 rounded-[2px] bg-landing-paper object-contain"
              />
            ) : (
              <div className="flex h-11 w-9 shrink-0 items-center justify-center rounded-[2px] bg-landing-paper">
                <Package className="h-4 w-4 text-landing-muted" strokeWidth={1.75} />
              </div>
            )}
            <div className="min-w-0 pr-1 text-left">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-landing-brass-ink">
                Sản phẩm đính kèm
              </span>
              <span className="product-name-line block truncate text-landing-obsidian group-hover/prod:text-landing-oxblood">
                {message.product.name}
              </span>
              {message.product.price && (
                <span className="font-mono text-[12px] text-landing-oxblood">
                  {typeof message.product.price === 'number'
                    ? `${message.product.price.toLocaleString('vi-VN')} ₫`
                    : message.product.price}
                </span>
              )}
            </div>
            <ExternalLink className="ml-auto mr-1 h-3.5 w-3.5 text-landing-muted group-hover/prod:text-landing-oxblood" strokeWidth={1.75} />
          </Link>
        )}

        {/* Message Bubble */}
        <div
          className={`relative rounded-[2px] px-4 py-3.5 text-sm leading-relaxed ${isUser
              ? 'bg-landing-oxblood text-landing-paper selection:bg-landing-paper selection:text-landing-oxblood'
              : message.isError
                ? 'border border-landing-line border-l-2 border-l-destructive bg-landing-ivory text-landing-obsidian'
                : 'border border-landing-line bg-landing-ivory text-landing-obsidian'
            }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="min-w-0 break-words">
              {message.content ? (
                <FormattedChatText text={message.content} isStreaming={message.streaming} />
              ) : message.streaming ? (
                <div className="flex items-center gap-2 py-1 text-landing-muted" role="status">
                  <span className="text-sm">Đang suy nghĩ</span>
                  <span className="inline-flex items-center gap-1" aria-hidden="true">
                    <span className="h-1.5 w-1.5 rounded-full bg-landing-brass motion-safe:animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-landing-brass motion-safe:animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-landing-brass motion-safe:animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              ) : null}

              {/* Streaming cursor */}
              {message.streaming && message.content && (
                <span className="ml-1 inline-block h-4 w-0.5 bg-landing-brass align-middle motion-safe:animate-pulse" aria-hidden="true" />
              )}
            </div>
          )}
        </div>

        {/* Bộ phối / sản phẩm AI gợi ý từ catalog */}
        {suggestionsPending && <ChatSuggestionsSkeleton />}
        {suggestions && (
          <OutfitSuggestionList
            viewKey={message.messageId ?? message.id}
            list={GA_ITEM_LISTS.aiChat}
            variant="carousel"
            outfits={suggestions.outfits}
            products={suggestions.products}
          />
        )}

        {/* Footer info & message actions */}
        <div className="flex items-center gap-2 px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-landing-muted">
          {formattedTime && <span>{formattedTime}</span>}

          {!isUser && !message.streaming && message.content && (
            <div className={`flex items-center gap-1 transition-opacity ${message.isError ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100'}`}>
              <button
                type="button"
                onClick={handleCopy}
                title="Sao chép câu trả lời"
                aria-label="Sao chép câu trả lời"
                className="flex h-8 w-8 items-center justify-center rounded-[2px] transition-colors hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-landing-sage-ink" strokeWidth={2} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />}
              </button>

              {message.isError && onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(message)}
                  className="flex h-8 items-center gap-1 rounded-[2px] px-1.5 font-sans text-[11px] font-semibold normal-case tracking-normal text-destructive transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>Thử lại</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { GA_ITEM_LISTS } from '@/features/analytics/constants/ga-item-lists';
import { QUICK_REPLIES } from '@/features/chat/constants/floating-chat';
import { useChat } from '@/features/chat/hooks/useChat';
import { OutfitSuggestionList } from '@/features/stylist/components/outfit-suggestion-list';
import { ChatSuggestionsSkeleton } from '@/features/chat/components/ChatSuggestionsSkeleton';
import { AssistantMark } from '@/features/chat/components/assistant-mark';
import { Check, ChevronDown, Copy, Loader2, MessageCircle, RotateCcw, Send, Square, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedChatText } from './FormattedChatText';

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isStreaming,
    isLoadingSession,
    sendMessage,
    stopStreaming,
    createSession,
    error,
  } = useChat();

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // Click outside to collapse chat window & Escape key handler
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDownEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDownEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDownEsc);
    };
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = useCallback((text: string) => {
    if (!text.trim() || isStreaming) return;
    sendMessage(text.trim());
    // Ô nhập không điều khiển bằng state nên phải tự xoá sau khi gửi.
    if (inputRef.current) inputRef.current.value = '';
  }, [sendMessage, isStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputRef.current?.value || '');
    }
  };

  const handleReset = useCallback(() => {
    createSession();
  }, [createSession]);

  const handleCopy = useCallback(async (msgId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.warn('Failed to copy', err);
    }
  }, []);

  return (
    <div ref={containerRef} className="fixed bottom-[88px] md:bottom-6 right-4 md:right-6 z-[60] flex flex-col items-end gap-3">

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-label="Trợ lý thời trang StAie."
            className="flex w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[2px] border border-landing-line bg-landing-paper text-landing-obsidian shadow-[0_24px_48px_-24px_rgba(17,16,15,0.4)] sm:w-[410px]"
            style={{ height: 'min(550px, calc(100dvh - 140px))' }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 bg-landing-oxblood px-4 py-3.5">
              <AssistantMark inverse className="h-9 w-9 text-base" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-landing-paper">StAie. Assistant</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-landing-sage" aria-hidden="true" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-landing-paper/70">Trợ lý AI thời trang</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  title="Bắt đầu lại"
                  aria-label="Bắt đầu lại"
                  className="flex h-9 w-9 items-center justify-center rounded-[2px] text-landing-paper/60 transition-colors hover:text-landing-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-brass"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Thu gọn trợ lý"
                  className="flex h-9 w-9 items-center justify-center rounded-[2px] text-landing-paper/60 transition-colors hover:text-landing-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-brass"
                >
                  <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="custom-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
              {isLoadingSession ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-landing-muted" role="status">
                  <Loader2 className="h-6 w-6 animate-spin text-landing-oxblood" strokeWidth={1.75} />
                  <span className="text-sm">Đang tải cuộc trò chuyện…</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="my-auto flex h-full flex-col items-center justify-center gap-4 py-6">
                  <AssistantMark className="h-12 w-12 text-xl" />
                  <div className="max-w-xs space-y-1.5 px-4 text-center">
                    <p className="font-display text-xl text-landing-obsidian">
                      Xin chào, tôi là StAie. Assistant
                    </p>
                    <p className="text-xs leading-relaxed text-landing-muted">
                      Tôi có thể giúp bạn thử đồ ảo, tư vấn chọn size vừa vặn, gợi ý phối đồ và giải đáp đơn hàng.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  const suggestions = !isUser ? msg.suggestions : null;
                  const suggestionsPending = !isUser && Boolean(msg.suggestionsPending) && !suggestions;
                  return (
                    <div
                      key={msg.id}
                      className={`group flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <AssistantMark className="mt-0.5 h-7 w-7 text-[13px]" />
                      )}
                      <div
                        className={`flex flex-col gap-1 ${
                          isUser ? 'max-w-[85%] items-end' : 'max-w-[88%] items-start'
                        } ${suggestions || suggestionsPending ? 'w-full' : ''}`}
                      >
                        <div
                          className={`rounded-[2px] px-3.5 py-2.5 text-sm sm:px-4 sm:py-3 ${
                            isUser
                              ? 'bg-landing-oxblood text-landing-paper'
                              : 'border border-landing-line bg-landing-ivory text-landing-obsidian'
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                          ) : (
                            <div className="min-w-0">
                              {msg.content ? (
                                <FormattedChatText text={msg.content} isStreaming={msg.streaming} />
                              ) : msg.streaming ? (
                                <div className="flex items-center gap-2 py-1 text-landing-muted" role="status">
                                  <span className="text-sm">Đang suy nghĩ</span>
                                  <span className="inline-flex items-center gap-1" aria-hidden="true">
                                    <span className="h-1.5 w-1.5 rounded-full bg-landing-brass motion-safe:animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="h-1.5 w-1.5 rounded-full bg-landing-brass motion-safe:animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="h-1.5 w-1.5 rounded-full bg-landing-brass motion-safe:animate-bounce" style={{ animationDelay: '300ms' }} />
                                  </span>
                                </div>
                              ) : null}

                              {msg.streaming && msg.content && (
                                <span className="ml-1 inline-block h-3.5 w-0.5 bg-landing-brass align-middle motion-safe:animate-pulse" aria-hidden="true" />
                              )}
                            </div>
                          )}
                        </div>
                        {suggestionsPending && <ChatSuggestionsSkeleton />}
                        {suggestions && (
                          <OutfitSuggestionList
                            viewKey={msg.messageId ?? msg.id}
                            list={GA_ITEM_LISTS.aiChat}
                            variant="carousel"
                            outfits={suggestions.outfits}
                            products={suggestions.products}
                          />
                        )}
                        <div className="flex items-center gap-2 px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-landing-muted">
                          {msg.createdAt && (
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {!isUser && !msg.streaming && msg.content && (
                            <button
                              type="button"
                              onClick={() => handleCopy(msg.id, msg.content)}
                              title="Sao chép"
                              aria-label="Sao chép câu trả lời"
                              className="flex h-7 w-7 items-center justify-center rounded-[2px] opacity-0 transition-opacity hover:text-landing-oxblood group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
                            >
                              {copiedId === msg.id ? (
                                <Check className="h-3 w-3 text-landing-sage-ink" strokeWidth={2} />
                              ) : (
                                <Copy className="h-3 w-3" strokeWidth={1.75} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {error && (
                <div role="alert" className="flex items-center gap-2 border-l-2 border-destructive bg-landing-ivory px-4 py-2 text-sm text-landing-obsidian">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies - only show when no messages or only welcome */}
            {messages.length <= 1 && !isStreaming && !isLoadingSession && (
              <div className="flex shrink-0 flex-wrap gap-2 border-t border-landing-line/70 px-4 py-2.5">
                {QUICK_REPLIES.map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="h-8 whitespace-nowrap rounded-[2px] border border-landing-line bg-landing-ivory px-3 text-xs text-landing-obsidian/80 transition-colors hover:border-landing-oxblood hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex shrink-0 items-center gap-2 border-t border-landing-line/70 px-3 py-3">
              <input
                ref={inputRef}
                type="text"
                onKeyDown={handleKeyDown}
                placeholder="Nhắn tin…"
                aria-label="Tin nhắn cho trợ lý"
                className="h-10 flex-1 rounded-[2px] border border-landing-line bg-landing-ivory px-3.5 text-sm text-landing-obsidian placeholder:text-landing-muted/70 transition-colors hover:border-landing-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopStreaming}
                  title="Dừng phản hồi"
                  aria-label="Dừng phản hồi"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] bg-landing-oxblood text-landing-paper transition-colors hover:bg-landing-oxblood/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
                >
                  <Square className="h-3.5 w-3.5 fill-current" strokeWidth={1.75} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSend(inputRef.current?.value || '')}
                  disabled={!inputRef.current?.value?.trim()}
                  aria-label="Gửi tin nhắn"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] bg-landing-oxblood text-landing-paper transition-colors hover:bg-landing-oxblood/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
                >
                  <Send className="h-4 w-4" strokeWidth={1.75} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        type="button"
        onClick={() => setOpen(v => !v)}
        whileTap={{ scale: 0.97 }}
        aria-label={open ? 'Đóng trợ lý thời trang' : 'Mở trợ lý thời trang'}
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

        {/* Unread badge */}
        {unread > 0 && !open && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-[2px] border border-landing-oxblood bg-landing-paper px-1 font-mono text-[10px] font-semibold text-landing-oxblood"
            aria-label={`${unread} tin nhắn chưa đọc`}
          >
            {unread}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}

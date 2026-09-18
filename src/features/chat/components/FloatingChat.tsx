'use client';

import { QUICK_REPLIES } from '@/features/chat/constants/floating-chat';
import { useChat } from '@/features/chat/hooks/useChat';
import { Check, ChevronDown, Copy, MessageCircle, RotateCcw, Send, Sparkles, Square, X } from 'lucide-react';
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
            className="w-[calc(100vw-32px)] sm:w-[410px] bg-white rounded-2xl shadow-2xl border border-neutral-200/90 flex flex-col overflow-hidden"
            style={{ height: 'min(550px, calc(100dvh - 140px))' }}
          >
            {/* Header */}
            <div className="bg-brand-navy px-4 py-3.5 flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                <Sparkles className="w-4.5 h-4.5 text-brand-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-body-sm">StAle. Assistant</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-white/60 text-label-sm">Trực tuyến · Phản hồi ngay</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  title="Bắt đầu lại"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3.5 bg-neutral-50/70 custom-scrollbar">
              {isLoadingSession ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
                  <div className="w-6 h-6 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
                  <span className="text-body-sm font-medium">Đang tải cuộc trò chuyện...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400 py-6 my-auto">
                  <div className="w-12 h-12 bg-brand-navy/10 rounded-2xl flex items-center justify-center shadow-xs">
                    <Sparkles className="w-6 h-6 text-brand-navy" />
                  </div>
                  <div className="text-center px-4 space-y-1.5 max-w-xs">
                    <p className="text-body-sm font-semibold text-neutral-900">
                      Xin chào! Tôi là <span className="text-brand-navy font-bold">StAle. Assistant</span> 👋
                    </p>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Tôi có thể giúp bạn thử đồ ảo, tư vấn chọn size vừa vặn, gợi ý phối đồ và giải đáp đơn hàng.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`group flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-full bg-brand-navy flex items-center justify-center shrink-0 mt-0.5 shadow-xs ring-1 ring-brand-gold/30">
                          <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                        </div>
                      )}
                      <div
                        className={`flex flex-col gap-1 ${
                          isUser ? 'max-w-[85%] items-end' : 'max-w-[88%] items-start'
                        }`}
                      >
                        <div
                          className={`px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-body-sm shadow-xs transition-all ${
                            isUser
                              ? 'bg-brand-navy text-white rounded-tr-xs font-normal'
                              : 'bg-white border border-neutral-200/85 text-neutral-800 rounded-tl-xs'
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                          ) : (
                            <div className="min-w-0">
                              {msg.content ? (
                                <FormattedChatText text={msg.content} isStreaming={msg.streaming} />
                              ) : msg.streaming ? (
                                <div className="flex items-center gap-1.5 py-1 text-neutral-500">
                                  <span className="text-body-sm font-medium">Đang suy nghĩ</span>
                                  <span className="inline-flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                                  </span>
                                </div>
                              ) : null}

                              {msg.streaming && msg.content && (
                                <span className="inline-block w-1.5 h-3.5 ml-1 bg-brand-gold animate-pulse rounded-full align-middle" />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 px-1 text-[10px] text-neutral-400 font-medium">
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
                              className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-brand-navy transition-opacity cursor-pointer"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-neutral-400 hover:text-neutral-600" />
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
                <div className="flex items-center gap-2 text-red-600 text-sm px-4 py-2 bg-red-50 rounded-xl">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies - only show when no messages or only welcome */}
            {messages.length <= 1 && !isStreaming && !isLoadingSession && (
              <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-neutral-100 bg-white shrink-0">
                {QUICK_REPLIES.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="px-3 py-1.5 rounded-full border border-brand-navy/20 text-label-sm text-brand-navy font-medium hover:bg-brand-navy hover:text-white transition-colors whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 border-t border-neutral-100 bg-white shrink-0 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                onKeyDown={handleKeyDown}
                placeholder="Nhắn tin..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15 focus:outline-none text-body-sm bg-neutral-50 transition-colors"
              />
              {isStreaming ? (
                <button
                  onClick={stopStreaming}
                  title="Dừng phản hồi"
                  className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shrink-0 hover:bg-red-700 transition-colors"
                >
                  <Square className="w-4 h-4 text-white fill-current" />
                </button>
              ) : (
                <button
                  onClick={() => handleSend(inputRef.current?.value || '')}
                  disabled={!inputRef.current?.value?.trim()}
                  className="w-9 h-9 rounded-xl bg-brand-navy flex items-center justify-center shrink-0 hover:bg-brand-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-brand-navy rounded-full shadow-lg flex items-center justify-center relative hover:bg-brand-navy/90 transition-colors"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {unread > 0 && !open && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-brand-gold rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white"
          >
            {unread}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, RotateCcw, ChevronDown, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from '@/types/chat';

const QUICK_REPLIES = [
  'Cách thử đồ ảo?',
  'Làm sao chọn đúng size?',
  'Chính sách đổi trả?',
  'Nâng cấp tài khoản',
];

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(1);
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

  return (
    <div className="fixed bottom-[88px] md:bottom-6 right-4 md:right-6 z-[60] flex flex-col items-end gap-3">

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-[calc(100vw-32px)] sm:w-[380px] bg-white rounded-2xl shadow-xl border border-neutral-200 flex flex-col overflow-hidden"
            style={{ height: 'min(520px, calc(100dvh - 180px))' }}
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
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-neutral-50">
              {isLoadingSession ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
                  <div className="w-6 h-6 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
                  <span className="text-body-sm font-medium">Đang tải cuộc trò chuyện...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
                  <div className="w-10 h-10 bg-brand-navy/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-brand-gold" />
                  </div>
                  <p className="text-body-sm text-center text-neutral-500 px-4">
                    Xin chào! Tôi là **StAle. Assistant** 👋\nTôi có thể giúp bạn về thử đồ ảo, chọn size, đơn hàng và nhiều hơn nữa. Bạn cần hỗ trợ gì?
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-brand-navy flex items-center justify-center shrink-0 mb-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                      </div>
                    )}
                    <div
                      className={`flex flex-col gap-1 max-w-[78%] ${
                        msg.role === 'user' ? 'items-end' : ''
                      }`}
                    >
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-body-sm shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-brand-navy text-white rounded-br-sm'
                            : 'bg-white border border-neutral-200 rounded-bl-sm'
                        } ${msg.streaming ? 'relative' : ''}`}
                      >
                        {msg.content || (msg.streaming && '...')}
                        {msg.streaming && (
                          <span className="animate-pulse">▌</span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 ml-1 mr-1">
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-brand-navy/10 flex items-center justify-center shrink-0 mb-0.5" />
                    )}
                  </div>
                ))
              )}

              {/* Typing indicator for streaming */}
              {isStreaming && messages.length > 0 && messages[messages.length - 1]?.streaming && (
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-navy flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                  </div>
                  <div className="px-3.5 py-3 bg-white border border-neutral-200 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
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

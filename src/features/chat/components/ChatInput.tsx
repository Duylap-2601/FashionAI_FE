'use client';

import type { ChatInputProps } from '@/features/chat/types/chat-input';
import { CornerDownLeft, Package, Send, Square, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export function ChatInput({
  onSend,
  isStreaming,
  onStop,
  attachedProduct,
  onRemoveProduct,
  disabled = false,
  placeholder = 'Nhập câu hỏi cho trợ lý thời trang...',
  initialValue = '',
}: ChatInputProps) {
  const [text, setText] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initialValue when it changes
  useEffect(() => {
    if (initialValue) {
      setText(initialValue);
      setTimeout(() => {
        adjustTextareaHeight();
        textareaRef.current?.focus();
      }, 50);
    }
  }, [initialValue]);

  // Adjust textarea height dynamically
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const nextHeight = Math.min(textarea.scrollHeight, 140);
    textarea.style.height = `${Math.max(nextHeight, 44)}px`;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isStreaming) {
      onStop();
      return;
    }

    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setText('');

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
  };

  return (
    <div className="w-full rounded-[2px] border border-landing-line bg-landing-ivory p-2.5 transition-colors focus-within:border-landing-oxblood">

      {/* Attached Product Badge */}
      {attachedProduct && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-[2px] border border-landing-line bg-landing-paper px-3 py-1.5 text-landing-obsidian animate-in fade-in-0 duration-200">
          <div className="flex items-center gap-2 min-w-0">
            {attachedProduct.image ? (
              <img
                src={attachedProduct.image}
                alt={attachedProduct.name}
                className="h-7 w-6 shrink-0 rounded-[2px] bg-landing-ivory object-contain"
              />
            ) : (
              <Package className="h-4 w-4 shrink-0 text-landing-oxblood" strokeWidth={1.75} />
            )}
            <span className="truncate text-xs">
              Đang tư vấn: <strong className="font-semibold text-landing-oxblood">{attachedProduct.name}</strong>
            </span>
          </div>

          {onRemoveProduct && (
            <button
              type="button"
              onClick={onRemoveProduct}
              title="Bỏ đính kèm sản phẩm"
              aria-label="Bỏ đính kèm sản phẩm"
              className="flex h-8 w-8 items-center justify-center rounded-[2px] text-landing-muted transition-colors hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          )}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Tin nhắn cho trợ lý"
          rows={1}
          className="max-h-[140px] flex-1 resize-none bg-transparent px-2.5 py-2 text-[15px] leading-relaxed text-landing-obsidian placeholder:text-landing-muted/70 focus:outline-none disabled:opacity-50"
        />

        {/* Action Button: Send or Stop */}
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            title="Dừng phản hồi"
            aria-label="Dừng phản hồi"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] bg-landing-oxblood text-landing-paper transition-colors hover:bg-landing-oxblood/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
          >
            <Square className="h-3.5 w-3.5 fill-current" strokeWidth={1.75} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            title="Gửi tin nhắn (Enter)"
            aria-label="Gửi tin nhắn"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] bg-landing-oxblood text-landing-paper transition-colors hover:bg-landing-oxblood/90 disabled:cursor-not-allowed disabled:bg-landing-taupe disabled:text-landing-obsidian/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
          >
            <Send className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between border-t border-landing-line/60 px-2 pt-2 text-[11px] text-landing-muted">
        <span className="hidden items-center gap-1 sm:inline-flex">
          <span>StAle. AI có thể giải đáp về size, số đo và cách phối đồ</span>
        </span>
        <span className="ml-auto hidden items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] sm:inline-flex">
          <span>Enter</span>
          <CornerDownLeft className="h-2.5 w-2.5" strokeWidth={1.75} />
          <span>để gửi</span>
        </span>
      </div>
    </div>
  );
}

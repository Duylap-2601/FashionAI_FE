'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Sparkles, X, Package, CornerDownLeft } from 'lucide-react';
import { ChatProductContext } from '@/types/chat';

interface ChatInputProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  onStop: () => void;
  attachedProduct?: ChatProductContext | null;
  onRemoveProduct?: () => void;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
}

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
    <div className="w-full bg-white/80 backdrop-blur-md border border-neutral-200/80 rounded-2xl shadow-md p-2.5 transition-all focus-within:border-brand-navy/60 focus-within:ring-2 focus-within:ring-brand-navy/10">
      
      {/* Attached Product Badge */}
      {attachedProduct && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 mb-2 bg-[#FDFBF7] border border-[#E5DFD5] rounded-xl text-neutral-800 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2 min-w-0">
            {attachedProduct.image ? (
              <img
                src={attachedProduct.image}
                alt={attachedProduct.name}
                className="w-6 h-6 object-cover rounded-md shrink-0 border border-neutral-200"
              />
            ) : (
              <Package className="w-4 h-4 text-brand-navy shrink-0" />
            )}
            <span className="text-[12px] font-semibold truncate">
              Đang tư vấn: <strong className="text-brand-navy">{attachedProduct.name}</strong>
            </span>
          </div>

          {onRemoveProduct && (
            <button
              type="button"
              onClick={onRemoveProduct}
              title="Bỏ đính kèm sản phẩm"
              className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
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
          rows={1}
          className="flex-1 max-h-[140px] resize-none bg-transparent px-2.5 py-2 text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none leading-relaxed disabled:opacity-50"
        />

        {/* Action Button: Send or Stop */}
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            title="Dừng phản hồi"
            className="w-10 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shrink-0 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            title="Gửi tin nhắn (Enter)"
            className="w-10 h-10 rounded-xl bg-brand-navy hover:bg-brand-navy/90 disabled:opacity-40 disabled:hover:bg-brand-navy disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-neutral-400">
        <span className="hidden sm:inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-gold" />
          <span>StAle. AI có thể giải đáp về size, số đo & mix match</span>
        </span>
        <span className="ml-auto hidden sm:inline-flex items-center gap-0.5 font-medium text-neutral-400">
          <span>Nhấn Enter</span>
          <CornerDownLeft className="w-2.5 h-2.5" />
          <span>để gửi</span>
        </span>
      </div>
    </div>
  );
}

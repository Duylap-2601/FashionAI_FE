'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Copy, Check, RotateCcw, AlertTriangle, ExternalLink, Package } from 'lucide-react';
import { toast } from 'sonner';
import { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: (message: ChatMessageType) => void;
}

export function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

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
      className={`group flex items-start gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center shrink-0 mt-0.5 shadow-sm ring-2 ring-brand-gold/30">
          <Sparkles className="w-4 h-4 text-brand-gold" />
        </div>
      )}

      {/* Message Content Container */}
      <div className={`flex flex-col gap-1.5 max-w-[85%] sm:max-w-[78%] md:max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Attached Product Preview Card if present */}
        {message.product && (
          <Link
            href={`/products/${message.product.id}`}
            className="flex items-center gap-2.5 p-2 bg-white/80 hover:bg-white border border-neutral-200 rounded-xl transition-all shadow-xs group/prod mb-1"
          >
            {message.product.image ? (
              <img
                src={message.product.image}
                alt={message.product.name}
                className="w-9 h-11 object-cover rounded-lg shrink-0 border border-neutral-100"
              />
            ) : (
              <div className="w-9 h-11 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-neutral-400" />
              </div>
            )}
            <div className="text-left min-w-0 pr-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Sản phẩm đính kèm
              </span>
              <span className="text-body-sm font-semibold text-neutral-900 block truncate group-hover/prod:text-brand-navy">
                {message.product.name}
              </span>
              {message.product.price && (
                <span className="text-label-sm font-bold text-[#5D1C34]">
                  {typeof message.product.price === 'number'
                    ? `${message.product.price.toLocaleString('vi-VN')} ₫`
                    : message.product.price}
                </span>
              )}
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400 ml-auto mr-1 group-hover/prod:text-brand-navy" />
          </Link>
        )}

        {/* Message Bubble */}
        <div
          className={`relative px-4 py-3.5 text-body-sm leading-relaxed transition-all ${
            isUser
              ? 'bg-brand-navy text-white rounded-2xl rounded-tr-xs shadow-sm font-medium selection:bg-brand-gold selection:text-brand-navy'
              : message.isError
              ? 'bg-red-50 border border-red-200 text-red-900 rounded-2xl rounded-tl-xs shadow-xs'
              : 'bg-white border border-neutral-200/90 text-neutral-800 rounded-2xl rounded-tl-xs shadow-sm'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose-sm max-w-none break-words">
              {message.content ? (
                <FormattedChatText text={message.content} />
              ) : message.streaming ? (
                <div className="flex items-center gap-1.5 py-1 text-neutral-500">
                  <span className="text-body-sm">Đang suy nghĩ</span>
                  <span className="inline-flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              ) : null}

              {/* Streaming cursor */}
              {message.streaming && message.content && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-brand-gold animate-pulse align-middle rounded-full" />
              )}
            </div>
          )}
        </div>

        {/* Footer info & message actions */}
        <div className="flex items-center gap-2 px-1 text-[11px] text-neutral-400 font-medium">
          {formattedTime && <span>{formattedTime}</span>}

          {!isUser && !message.streaming && message.content && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleCopy}
                title="Sao chép câu trả lời"
                className="p-1 hover:text-brand-navy hover:bg-neutral-200/60 rounded-md transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {message.isError && onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(message)}
                  title="Thử lại"
                  className="flex items-center gap-1 p-1 text-red-600 hover:bg-red-100 rounded-md transition-colors font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
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

/**
 * Lightweight Markdown / Formatted Text Renderer
 */
function FormattedChatText({ text }: { text: string }) {
  // Split into paragraphs / lines
  const lines = text.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // Bullet list item (- or *)
        if (line.match(/^[\-\*]\s+/)) {
          const content = line.replace(/^[\-\*]\s+/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0 mt-2" />
              <div className="flex-1">
                <InlineFormatter text={content} />
              </div>
            </div>
          );
        }

        // Numbered list (1. 2. 3.)
        const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1">
              <span className="font-bold text-[#5D1C34] shrink-0 text-label-sm">{numMatch[1]}.</span>
              <div className="flex-1">
                <InlineFormatter text={numMatch[2]} />
              </div>
            </div>
          );
        }

        // Quote line (> ...)
        if (line.startsWith('>')) {
          return (
            <div key={lineIdx} className="border-l-2 border-brand-gold pl-3 py-0.5 text-neutral-600 italic bg-amber-50/50 rounded-r-md">
              <InlineFormatter text={line.slice(1).trim()} />
            </div>
          );
        }

        return (
          <p key={lineIdx} className="m-0">
            <InlineFormatter text={line} />
          </p>
        );
      })}
    </div>
  );
}

/**
 * Handles inline formatting: **bold**, *italic*, `code`
 */
function InlineFormatter({ text }: { text: string }) {
  // Regex to split by bold (**), italic (*), code (`)
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // Check bold **...**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Check code `...`
    const codeMatch = remaining.match(/`([^`]+)`/);
    // Check italic *...* (single asterisk)
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);

    // Find closest match
    type MatchCandidate = { type: 'bold' | 'code' | 'italic'; index: number; full: string; inner: string };
    const candidates: MatchCandidate[] = [];

    if (boldMatch && boldMatch.index !== undefined) {
      candidates.push({ type: 'bold', index: boldMatch.index, full: boldMatch[0], inner: boldMatch[1] });
    }
    if (codeMatch && codeMatch.index !== undefined) {
      candidates.push({ type: 'code', index: codeMatch.index, full: codeMatch[0], inner: codeMatch[1] });
    }
    if (italicMatch && italicMatch.index !== undefined) {
      candidates.push({ type: 'italic', index: italicMatch.index, full: italicMatch[0], inner: italicMatch[1] });
    }

    if (candidates.length === 0) {
      parts.push(remaining);
      break;
    }

    // Sort by earliest match
    candidates.sort((a, b) => a.index - b.index);
    const best = candidates[0];

    // Push text before match
    if (best.index > 0) {
      parts.push(remaining.substring(0, best.index));
    }

    // Render formatted component
    if (best.type === 'bold') {
      parts.push(
        <strong key={`b_${keyIdx++}`} className="font-bold text-neutral-950">
          {best.inner}
        </strong>
      );
    } else if (best.type === 'code') {
      parts.push(
        <code key={`c_${keyIdx++}`} className="px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-900 font-mono text-[12px] border border-neutral-200">
          {best.inner}
        </code>
      );
    } else if (best.type === 'italic') {
      parts.push(
        <em key={`i_${keyIdx++}`} className="italic text-neutral-700">
          {best.inner}
        </em>
      );
    }

    remaining = remaining.substring(best.index + best.full.length);
  }

  return <>{parts}</>;
}

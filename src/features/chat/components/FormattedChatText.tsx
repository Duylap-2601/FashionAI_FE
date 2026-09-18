'use client';

import React from 'react';

interface FormattedChatTextProps {
  text: string;
  isStreaming?: boolean;
}

/**
 * Preprocesses raw AI text:
 * - Normalizes Windows/Unix line breaks
 * - Fixes inline lists (e.g. "...các bước sau: 1. **Bước 1** ... 2. **Bước 2**") into proper newlines
 * - Splits step titles from inline sub-bullets (e.g. "1. **Tiêu đề** - Chi tiết 1. - Chi tiết 2.")
 * - Closes dangling markdown tokens during streaming so raw asterisks never flash
 */
export function preprocessText(raw: string, isStreaming?: boolean): string {
  if (!raw) return '';

  let text = raw.replace(/\r\n/g, '\n');

  // Insert double line breaks before inline numbered list items that follow punctuation or colon:
  // e.g. "các bước sau: 1. " -> "các bước sau:\n\n1. "
  // e.g. "camera trực tiếp. 2. " -> "camera trực tiếp.\n\n2. "
  text = text.replace(/([:.;!?])\s+(\d+\.\s+(?:\*\*|[A-ZÀ-Ỹa-z0-9]))/g, '$1\n\n$2');

  // Split numbered step bold titles from sub-bullets:
  // e.g. "1. **Chọn nền tảng** - Các thương hiệu..." -> "1. **Chọn nền tảng**\n- Các thương hiệu..."
  text = text.replace(/(\d+\.\s+\*\*[^*]+\*\*)\s+-\s+([A-ZÀ-Ỹ0-9\*])/g, '$1\n- $2');

  // Insert line breaks before sub-bullets that follow sentence endings or parentheses:
  // e.g. "...app (ví dụ: Zara, Uniqlo). - Ứng dụng..." -> "...app (ví dụ: Zara, Uniqlo).\n- Ứng dụng..."
  text = text.replace(/([.)!?])\s+-\s+([A-ZÀ-Ỹ0-9\*])/g, '$1\n- $2');

  // If streaming and text ends with an unclosed bold tag like "**text", close it so raw asterisks don't flash
  if (isStreaming) {
    const boldMatches = text.match(/\*\*/g);
    if (boldMatches && boldMatches.length % 2 !== 0) {
      text = `${text}**`;
    }
  }

  return text;
}

/**
 * Renders inline formatting:
 * - **bold** or __bold__
 * - *italic*
 * - `code`
 * - [links](url)
 */
export function InlineFormatter({ text }: { text: string }) {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // 1. Bold: **text** or __text__
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const underBoldMatch = remaining.match(/__(.+?)__/);
    // 2. Code: `code`
    const codeMatch = remaining.match(/`([^`]+)`/);
    // 3. Link: [label](url)
    const linkMatch = remaining.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
    // 4. Italic: *text* (avoiding double asterisks)
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);

    type MatchCandidate =
      | { type: 'bold'; index: number; full: string; inner: string }
      | { type: 'code'; index: number; full: string; inner: string }
      | { type: 'link'; index: number; full: string; label: string; url: string }
      | { type: 'italic'; index: number; full: string; inner: string };

    const candidates: MatchCandidate[] = [];

    if (boldMatch && boldMatch.index !== undefined) {
      candidates.push({ type: 'bold', index: boldMatch.index, full: boldMatch[0], inner: boldMatch[1] });
    }
    if (underBoldMatch && underBoldMatch.index !== undefined) {
      candidates.push({ type: 'bold', index: underBoldMatch.index, full: underBoldMatch[0], inner: underBoldMatch[1] });
    }
    if (codeMatch && codeMatch.index !== undefined) {
      candidates.push({ type: 'code', index: codeMatch.index, full: codeMatch[0], inner: codeMatch[1] });
    }
    if (linkMatch && linkMatch.index !== undefined) {
      candidates.push({ type: 'link', index: linkMatch.index, full: linkMatch[0], label: linkMatch[1], url: linkMatch[2] });
    }
    if (italicMatch && italicMatch.index !== undefined) {
      candidates.push({ type: 'italic', index: italicMatch.index, full: italicMatch[0], inner: italicMatch[1] });
    }

    if (candidates.length === 0) {
      parts.push(remaining);
      break;
    }

    // Pick earliest match
    candidates.sort((a, b) => a.index - b.index);
    const best = candidates[0];

    // Push preceding plain text
    if (best.index > 0) {
      parts.push(remaining.substring(0, best.index));
    }

    // Render formatted piece
    if (best.type === 'bold') {
      parts.push(
        <strong key={`b_${keyIdx++}`} className="font-semibold text-neutral-950">
          {best.inner}
        </strong>
      );
    } else if (best.type === 'code') {
      parts.push(
        <code
          key={`c_${keyIdx++}`}
          className="px-1.5 py-0.5 rounded bg-neutral-100 text-[#5D1C34] font-mono text-[12px] font-medium border border-neutral-200/60"
        >
          {best.inner}
        </code>
      );
    } else if (best.type === 'link') {
      parts.push(
        <a
          key={`l_${keyIdx++}`}
          href={best.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#5D1C34] font-medium underline underline-offset-2 hover:text-[#7A2544] transition-colors"
        >
          {best.label}
        </a>
      );
    } else if (best.type === 'italic') {
      parts.push(
        <em key={`i_${keyIdx++}`} className="italic text-neutral-700">
          {best.inner}
        </em>
      );
    }

    if (best.full.length === 0) {
      parts.push(remaining);
      break;
    }

    remaining = remaining.substring(best.index + best.full.length);
  }

  return <>{parts}</>;
}

interface OrderedStep {
  num: string;
  content: string;
  subItems?: string[];
}

/**
 * Premium Chat Formatter
 * Beautifully organizes AI answers with proper line height, spacing, step badges,
 * nested bullets, quotes, headings, and clean bold typography.
 */
export function FormattedChatText({ text, isStreaming }: FormattedChatTextProps) {
  if (!text) return null;

  const processed = preprocessText(text, isStreaming);
  const lines = processed.split('\n');

  // Group lines into logical blocks
  type Block =
    | { type: 'heading'; level: number; content: string }
    | { type: 'codeblock'; language: string; content: string }
    | { type: 'quote'; content: string }
    | { type: 'ordered-list'; items: OrderedStep[] }
    | { type: 'unordered-list'; items: string[] }
    | { type: 'paragraph'; content: string }
    | { type: 'spacer' };

  const blocks: Block[] = [];
  let inCodeBlock = false;
  let codeLang = '';
  let codeBuffer: string[] = [];

  let currentOrdered: OrderedStep[] | null = null;
  let currentUnordered: string[] | null = null;

  const flushLists = () => {
    if (currentOrdered && currentOrdered.length > 0) {
      blocks.push({ type: 'ordered-list', items: currentOrdered });
      currentOrdered = null;
    }
    if (currentUnordered && currentUnordered.length > 0) {
      blocks.push({ type: 'unordered-list', items: currentUnordered });
      currentUnordered = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Code Block Fence
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        blocks.push({ type: 'codeblock', language: codeLang, content: codeBuffer.join('\n') });
        codeBuffer = [];
        codeLang = '';
        inCodeBlock = false;
      } else {
        // Start code block
        flushLists();
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // 2. Empty line
    if (!trimmed) {
      flushLists();
      blocks.push({ type: 'spacer' });
      continue;
    }

    // 3. Headings: ### Heading or ## Heading or # Heading
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushLists();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2],
      });
      continue;
    }

    // 4. Blockquote: > text
    if (trimmed.startsWith('>')) {
      flushLists();
      blocks.push({
        type: 'quote',
        content: trimmed.replace(/^>\s*/, ''),
      });
      continue;
    }

    // 5. Ordered List: 1. Item
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      if (currentUnordered) {
        blocks.push({ type: 'unordered-list', items: currentUnordered });
        currentUnordered = null;
      }
      if (!currentOrdered) {
        currentOrdered = [];
      }
      currentOrdered.push({ num: numMatch[1], content: numMatch[2], subItems: [] });
      continue;
    }

    // 6. Unordered List: - Item or * Item or • Item
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      // If we are currently inside an ordered list, attach bullet as a sub-item of the latest step!
      if (currentOrdered && currentOrdered.length > 0) {
        const lastStep = currentOrdered[currentOrdered.length - 1];
        if (!lastStep.subItems) {
          lastStep.subItems = [];
        }
        lastStep.subItems.push(bulletMatch[1]);
        continue;
      }

      if (!currentUnordered) {
        currentUnordered = [];
      }
      currentUnordered.push(bulletMatch[1]);
      continue;
    }

    // 7. Regular paragraph line
    flushLists();
    blocks.push({ type: 'paragraph', content: trimmed });
  }

  // Final flush
  flushLists();
  if (inCodeBlock && codeBuffer.length > 0) {
    blocks.push({ type: 'codeblock', language: codeLang, content: codeBuffer.join('\n') });
  }

  return (
    <div className="space-y-3 text-[13.5px] sm:text-[14px] leading-[1.7] text-neutral-800 break-words">
      {blocks.map((block, idx) => {
        if (block.type === 'spacer') {
          return <div key={idx} className="h-1.5" />;
        }

        if (block.type === 'heading') {
          if (block.level === 1) {
            return (
              <h3 key={idx} className="text-base font-bold text-neutral-900 mt-2.5 mb-1 text-[#5D1C34]">
                <InlineFormatter text={block.content} />
              </h3>
            );
          }
          if (block.level === 2) {
            return (
              <h4 key={idx} className="text-[14.5px] font-bold text-[#5D1C34] mt-2 mb-0.5">
                <InlineFormatter text={block.content} />
              </h4>
            );
          }
          return (
            <h5 key={idx} className="text-[13.5px] font-semibold text-neutral-900 mt-1.5">
              <InlineFormatter text={block.content} />
            </h5>
          );
        }

        if (block.type === 'quote') {
          return (
            <div
              key={idx}
              className="border-l-2 border-[#5D1C34] bg-amber-50/50 rounded-r-lg px-3 py-2 text-neutral-700 italic text-[13px] my-1"
            >
              <InlineFormatter text={block.content} />
            </div>
          );
        }

        if (block.type === 'codeblock') {
          return (
            <pre
              key={idx}
              className="p-3 bg-neutral-900 text-neutral-100 rounded-xl text-xs overflow-x-auto my-2 font-mono leading-relaxed"
            >
              <code>{block.content}</code>
            </pre>
          );
        }

        if (block.type === 'ordered-list') {
          return (
            <div key={idx} className="space-y-3 my-2">
              {block.items.map((item, itemIdx) => (
                <div key={itemIdx} className="space-y-2">
                  {/* Step header */}
                  <div className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#5D1C34]/10 text-[#5D1C34] text-[11px] font-bold shrink-0 mt-0.5 select-none ring-1 ring-[#5D1C34]/20">
                      {item.num}
                    </span>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <InlineFormatter text={item.content} />
                    </div>
                  </div>

                  {/* Sub-items under this step */}
                  {item.subItems && item.subItems.length > 0 && (
                    <div className="pl-7 space-y-1.5 border-l border-neutral-200/60 ml-2.5">
                      {item.subItems.map((sub, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 text-neutral-700 text-[13px] leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A67D44] shrink-0 mt-2" />
                          <div className="flex-1 min-w-0">
                            <InlineFormatter text={sub} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        }

        if (block.type === 'unordered-list') {
          return (
            <div key={idx} className="space-y-2 my-1.5 pl-1">
              {block.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A67D44] shrink-0 mt-2" />
                  <div className="flex-1 min-w-0">
                    <InlineFormatter text={item} />
                  </div>
                </div>
              ))}
            </div>
          );
        }

        return (
          <p key={idx} className="m-0">
            <InlineFormatter text={block.content} />
          </p>
        );
      })}
    </div>
  );
}

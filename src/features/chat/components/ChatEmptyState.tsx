'use client';

import { QUICK_PROMPTS } from '@/features/chat/constants/chat-empty-state';
import type { ChatEmptyStateProps } from '@/features/chat/types/chat-empty-state';
import { ArrowRight, Check, Ruler } from 'lucide-react';
import Link from 'next/link';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';

export function ChatEmptyState({ onSelectPrompt, userMeasurements, userName }: ChatEmptyStateProps) {
  const hasMeasurements = Boolean(
    userMeasurements && (userMeasurements.height || userMeasurements.weight || userMeasurements.chest)
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center duration-500 animate-in fade-in-0 motion-reduce:animate-none">

      <div className="mb-6 border-b border-landing-line pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-landing-brass-ink">StAle. AI Assistant</p>

        <h2 className="mt-3 font-display text-[2rem] leading-[1.1] tracking-[-0.025em] text-landing-obsidian md:text-[2.5rem]">
          {userName ? `Xin chào, ${userName}` : 'Xin chào bạn'}
        </h2>

        <p className="mt-3 max-w-xl text-landing-body text-landing-muted">
          Tôi là trợ lý AI thời trang của bạn. Tôi có thể tư vấn size, gợi ý phối đồ từ sản phẩm của cửa hàng, và giải đáp thắc mắc về bộ sưu tập StAle.
        </p>

        {/* Measurements Status */}
        <div className="mt-5">
          {hasMeasurements ? (
            <p className="inline-flex flex-wrap items-center gap-2 border-l-2 border-landing-sage-ink bg-landing-ivory px-4 py-2.5 text-sm text-landing-obsidian">
              <Check className="h-4 w-4 shrink-0 text-landing-sage-ink" strokeWidth={2} />
              <span>
                Đã đồng bộ số đo: <span className="font-mono">{userMeasurements?.height || '—'}cm · {userMeasurements?.weight || '—'}kg</span>
              </span>
              <Link href="/profile/measurements" className={`text-xs font-semibold text-landing-oxblood underline-offset-4 hover:underline ${focusRing}`}>
                Chi tiết
              </Link>
            </p>
          ) : (
            <Link
              href="/profile/measurements"
              className={`group inline-flex items-center gap-2 border-l-2 border-landing-brass bg-landing-ivory px-4 py-2.5 text-sm text-landing-obsidian transition-colors hover:text-landing-oxblood ${focusRing}`}
            >
              <Ruler className="h-4 w-4 shrink-0 text-landing-brass-ink" strokeWidth={1.75} />
              <span>Chưa có số đo cơ thể. Nhập ngay để AI tư vấn size chính xác hơn</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
            </Link>
          )}
        </div>
      </div>

      {/* Suggested prompts */}
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink">Bắt đầu với một câu hỏi</p>
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {QUICK_PROMPTS.map((item, idx) => (
          <button
            key={item.title}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            className={`group flex flex-col rounded-[2px] border border-landing-line bg-landing-ivory p-4 text-left transition-colors hover:border-landing-oxblood ${focusRing}`}
          >
            <span className="mb-2 flex items-center justify-between gap-3">
              <span className="flex items-baseline gap-2.5">
                <span className="font-mono text-[11px] text-landing-brass-ink">{String(idx + 1).padStart(2, '0')}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-landing-muted">{item.tag}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-landing-oxblood transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="block font-display text-lg leading-snug text-landing-obsidian transition-colors group-hover:text-landing-oxblood">
              {item.title}
            </span>
            <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-landing-muted">
              {item.prompt}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

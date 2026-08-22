'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Ruler, Shirt, CheckCircle2, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import { UserMeasurements } from '@/hooks/useMeasurements';

interface ChatEmptyStateProps {
  onSelectPrompt: (promptText: string) => void;
  userMeasurements?: UserMeasurements | null;
  userName?: string;
}

const QUICK_PROMPTS = [
  {
    icon: Ruler,
    tag: 'Tư vấn kích thước',
    title: 'Gợi ý chọn size theo số đo',
    prompt: 'Dựa vào số đo trong hồ sơ của tôi, tôi nên chọn size nào cho các mẫu Blazer và Combo Suit?',
    color: 'border-amber-200/60 bg-amber-50/40 hover:bg-amber-50/80',
  },
  {
    icon: Shirt,
    tag: 'Mix & Match',
    title: 'Phối đồ công sở thanh lịch',
    prompt: 'Gợi ý cho tôi set đồ công sở thanh lịch, hiện đại và tôn dáng cho các buổi gặp đối tác?',
    color: 'border-rose-200/60 bg-rose-50/40 hover:bg-rose-50/80',
  },
  {
    icon: Compass,
    tag: 'Phong cách',
    title: 'Trang phục tôn dáng cho sự kiện',
    prompt: 'Tôi muốn tìm trang phục dạ tiệc sang trọng, bạn có thể gợi ý kiểu dáng và màu sắc phù hợp?',
    color: 'border-indigo-200/60 bg-indigo-50/40 hover:bg-indigo-50/80',
  },
  {
    icon: Sparkles,
    tag: 'AI Features',
    title: 'Hướng dẫn sử dụng AI Try-On',
    prompt: 'Làm thế nào để chụp ảnh và trải nghiệm thử đồ ảo (Try-On) đạt kết quả chân thực nhất?',
    color: 'border-emerald-200/60 bg-emerald-50/40 hover:bg-emerald-50/80',
  },
];

export function ChatEmptyState({ onSelectPrompt, userMeasurements, userName }: ChatEmptyStateProps) {
  const hasMeasurements = Boolean(
    userMeasurements && (userMeasurements.height || userMeasurements.weight || userMeasurements.chest)
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 max-w-3xl mx-auto w-full animate-in fade-in zoom-in-95 duration-400">
      
      {/* Brand Badge & Title */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-navy text-white text-[12px] font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
          <span>StAle. AI Fashion Assistant</span>
        </div>

        <h2 className="text-heading-h1 font-bold text-brand-navy tracking-tight">
          {userName ? `Xin chào, ${userName}` : 'Xin chào bạn'}
        </h2>

        <p className="text-body-md text-neutral-600 max-w-lg mx-auto">
          Tôi là trợ lý AI thời trang cá nhân của bạn. Tôi có thể tư vấn size, gợi ý phối đồ, và giải đáp thắc mắc về bộ sưu tập StAle.
        </p>

        {/* Measurements Status Banner */}
        <div className="pt-2">
          {hasMeasurements ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-label-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Đã đồng bộ số đo: <strong>{userMeasurements?.height || '—'}cm</strong> · <strong>{userMeasurements?.weight || '—'}kg</strong>
              </span>
              <Link href="/profile/measurements" className="text-emerald-700 underline hover:text-emerald-950 ml-1">
                Chi tiết
              </Link>
            </div>
          ) : (
            <Link
              href="/profile/measurements"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FDFBF7] border border-[#E5DFD5] text-[#5D1C34] hover:bg-[#F5EFE6] text-label-sm font-semibold transition-colors"
            >
              <Ruler className="w-4 h-4 text-brand-gold shrink-0" />
              <span>Chưa có số đo cơ thể · Nhập ngay để AI tư vấn size chuẩn xác</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Suggested prompts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {QUICK_PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className={`p-4 text-left rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex flex-col justify-between group ${item.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    {item.tag}
                  </span>
                  <Icon className="w-4 h-4 text-brand-navy/70 group-hover:text-brand-navy transition-colors" />
                </div>
                <h3 className="text-body-sm font-bold text-neutral-900 mb-1 group-hover:text-brand-navy transition-colors">
                  {item.title}
                </h3>
                <p className="text-[12px] text-neutral-600 line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-black/5 flex items-center text-[11px] font-bold text-brand-navy opacity-80 group-hover:opacity-100">
                <span>Hỏi câu này</span>
                <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

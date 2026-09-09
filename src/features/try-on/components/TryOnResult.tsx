import { ComparisonSlider } from '@/features/try-on/components/ComparisonSlider';
import { MOCK_USER_PHOTO } from '@/features/try-on/constants/try-on-types';
import type { TryOnResultProps } from '@/features/try-on/types/try-on-result';
import { ArrowRight, Bookmark, CheckCircle2, Download, Share2 } from 'lucide-react';
import Link from 'next/link';

export function TryOnResult({ userPhotoUrl, resultPhotoUrl, shareProductName, onDownload, onReset }: TryOnResultProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Kết quả Try-On từ FashionAI', text: `Thử đồ online bộ ${shareProductName} tại FashionAI!`, url: resultPhotoUrl });
    } else {
      navigator.clipboard.writeText(resultPhotoUrl);
      alert('Đã sao chép link ảnh vào clipboard!');
    }
  };

  return (
    <div className="mt-10 flex flex-col gap-6 animate-[fadeInUp_0.4s_ease-out_forwards]">
      <div className="flex items-center gap-4"><div className="flex-1 h-px bg-neutral-200" /><span className="text-label-sm text-neutral-400 font-medium px-2">Kết quả</span><div className="flex-1 h-px bg-neutral-200" /></div>
      <div className="max-w-[640px] w-full mx-auto flex flex-col gap-4">
        <ComparisonSlider before={userPhotoUrl || MOCK_USER_PHOTO} after={resultPhotoUrl} />

        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={onDownload} type="button" className="flex items-center gap-2 px-5 py-2.5 border border-neutral-300 rounded-xl text-label-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer bg-white">
            <Download className="w-4 h-4 text-brand-navy" /> Tải về
          </button>
          <Link
            href="/profile/history"
            className="flex items-center gap-2 px-5 py-2.5 text-label-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-xl transition-colors bg-white border border-neutral-200"
          >
            <Bookmark className="w-4 h-4 text-brand-navy" /> Xem lịch sử
          </Link>
          <button onClick={handleShare} type="button" className="flex items-center gap-2 px-5 py-2.5 text-label-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer bg-white border border-neutral-200">
            <Share2 className="w-4 h-4 text-brand-navy" /> Chia sẻ
          </button>
          <div className="flex-1" />
          <button onClick={onReset} type="button" className="flex items-center gap-1.5 text-label-sm font-semibold text-brand-navy hover:text-brand-navy/70 transition-colors border-0 bg-transparent cursor-pointer">
            Thử bộ khác <ArrowRight className="w-4 h-4 animate-bounce" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-xl border border-green-100">
          <CheckCircle2 className="w-4 h-4 text-semantic-success shrink-0" />
          <p className="text-body-sm text-green-700">Kết quả đã được lưu vào lịch sử Try-On của bạn</p>
        </div>
      </div>
    </div>
  );
}

import { Sparkles } from 'lucide-react';

export function LoadingOverlay({ progress, isCombo }: { progress: number; isCombo?: boolean }) {
  const stepText = isCombo
    ? progress <= 50 ? 'Bước 1/2: Đang ghép áo...' : 'Bước 2/2: Đang ghép quần/váy hoàn thiện...'
    : 'AI đang ghép trang phục vào ảnh của bạn';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-navy/75 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-10 bg-white rounded-2xl shadow-xl max-w-[360px] w-full mx-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-neutral-100" />
          <div className="absolute inset-0 rounded-full border-4 border-brand-navy border-r-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-6 h-6 text-brand-gold animate-pulse" /></div>
        </div>
        <div className="w-full flex flex-col gap-3 text-center">
          <p className="text-body-md font-semibold text-neutral-900">Đang xử lý ảnh... {progress}%</p>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden"><div className="h-full bg-brand-navy rounded-full transition-all duration-300" style={{ width: `${progress}%` }} /></div>
          <p className="text-body-sm text-neutral-500 font-medium">{stepText}</p>
        </div>
      </div>
    </div>
  );
}

import { Sparkles } from 'lucide-react';

export function GenerateButton({ canGenerate, isSubmitting, isBlocked, quotaCost, onGenerate }: { canGenerate: boolean; isSubmitting: boolean; isBlocked: boolean; quotaCost: number; onGenerate: () => void }) {
  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <button onClick={onGenerate} disabled={!canGenerate} type="button" className={`w-full max-w-[640px] h-[56px] rounded-xl flex items-center justify-center gap-3 font-semibold transition-all border-0 ${canGenerate ? 'bg-brand-navy text-white hover:bg-brand-navy/90 shadow-md hover:shadow-lg cursor-pointer' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}>
        <Sparkles className={`w-5 h-5 ${canGenerate ? 'text-brand-gold' : 'text-neutral-400'}`} />
        {isSubmitting ? 'Đang tạo thử đồ...' : isBlocked ? 'Nâng cấp gói để Thử đồ AI' : `Tạo kết quả Try-On (${quotaCost} lượt quota)`}
      </button>
      <p className="text-body-sm text-neutral-500 text-center">~20 giây xử lý · Lưu kết quả tự động vào lịch sử</p>
    </div>
  );
}

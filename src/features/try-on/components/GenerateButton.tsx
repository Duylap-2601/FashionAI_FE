import { Sparkles } from 'lucide-react';

export function GenerateButton({ canGenerate, isSubmitting, isBlocked, quotaCost, onGenerate }: { canGenerate: boolean; isSubmitting: boolean; isBlocked: boolean; quotaCost: number; onGenerate: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <button onClick={onGenerate} disabled={!canGenerate} type="button" className={`w-full h-[56px] rounded-xl flex items-center justify-center gap-3 font-semibold transition-all border-0 ${canGenerate ? 'bg-[#5D1C34] text-white hover:bg-[#5D1C34]/90 shadow-sm cursor-pointer' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}>
        <Sparkles className={`w-5 h-5 ${canGenerate ? 'text-brand-gold' : 'text-neutral-400'}`} />
        {isSubmitting ? 'Đang thử trang phục...' : isBlocked ? 'Nâng cấp gói để thử trang phục' : 'Thử trang phục'}
      </button>
      <p className="text-body-sm text-neutral-500 text-left">Chi phí: <span className="font-semibold text-[#1A1917]">{quotaCost} lượt thử</span>. Kết quả được lưu tự động vào lịch sử.</p>
    </div>
  );
}

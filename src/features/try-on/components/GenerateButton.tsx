import { tryOnButtonClassName } from '@/features/try-on/components/garment-slot';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function GenerateButton({ canGenerate, isSubmitting, isBlocked, quotaCost, onGenerate }: { canGenerate: boolean; isSubmitting: boolean; isBlocked: boolean; quotaCost: number; onGenerate: () => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      <button onClick={onGenerate} disabled={!canGenerate} type="button" className={cn(tryOnButtonClassName('primary', 'lg'), 'w-full')}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" strokeWidth={1.75} aria-hidden="true" /> : null}
        {isSubmitting ? 'Đang thử trang phục' : isBlocked ? 'Nâng cấp gói để thử' : 'Thử trang phục'}
      </button>
      <p className="text-xs text-landing-muted">
        Dùng <span className="font-mono text-landing-obsidian">{quotaCost}</span> lượt. Kết quả tự lưu vào lịch sử thử đồ.
      </p>
    </div>
  );
}

import { cn } from '@/components/ui/utils';

/**
 * Dấu nhận diện trợ lý: ô vuông đỏ đô với chữ S kiểu Playfair, thay cho avatar tròn trống.
 * `inverse`: dùng trên nền đỏ đô (header khung chat nổi), chỉ còn viền và chữ màu giấy.
 */
export function AssistantMark({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] font-display text-[15px] leading-none text-landing-paper',
        inverse ? 'border border-landing-paper/30' : 'bg-landing-oxblood',
        className,
      )}
    >
      S<span className={inverse ? 'text-landing-paper/60' : 'text-landing-taupe'}>.</span>
    </span>
  );
}

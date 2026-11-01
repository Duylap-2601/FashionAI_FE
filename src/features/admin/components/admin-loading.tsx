import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { cn } from '@/components/ui/utils';

/** Loader chiếm toàn bộ vùng bảng khi chưa có dữ liệu lần đầu. */
export function AdminTableLoading({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn('flex min-h-[200px] w-full flex-col items-center justify-center gap-3 px-6 py-12', className)}>
      <AtelierLoader size="sm" label={label} />
    </div>
  );
}

/** Thanh mảnh hiện phía trên dữ liệu cũ trong lúc tải lại/đổi bộ lọc. */
export function AdminLoadingBar({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center gap-2 border-b border-landing-line bg-landing-paper/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-landing-muted',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-landing-oxblood" aria-hidden="true" />
      {label}
    </div>
  );
}

/** Loader toàn khối cho các trang cấu hình chỉ có một form. */
export function AdminPanelLoading({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-[320px] items-center justify-center rounded-[2px] border border-landing-line bg-landing-ivory p-6',
        className,
      )}
    >
      <AtelierLoader size="md" label={label} />
    </div>
  );
}

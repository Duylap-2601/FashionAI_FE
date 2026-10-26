import { TryOnSegmented, tryOnButtonClassName, tryOnLabelClassName } from '@/features/try-on/components/garment-slot';
import type { UserQuota } from '@/features/subscription/types/quota';
import { cn } from '@/lib/utils';
import { Camera, ImageIcon } from 'lucide-react';
import Link from 'next/link';

export type TryOnMode = 'live' | 'photo';

const MODE_COPY: Record<TryOnMode, string> = {
  live: 'Mặc thử trên chính bạn qua camera. Tạm dừng để đổi món, phiên tính theo thời gian.',
  photo: 'Tải một ảnh toàn thân, AI ghép trang phục lên ảnh và lưu kết quả vào lịch sử.',
};

/** Lượt thử bằng ảnh còn lại hôm nay; ẩn khi chưa tải được quota hoặc gói không có lượt. */
function PhotoQuota({ quota }: { quota?: UserQuota }) {
  if (!quota) return null;
  const unlimited = quota.unlimited || quota.limit === null;
  const limit = quota.limit ?? 0;
  if (!unlimited && limit === 0) return null;
  const remaining = unlimited ? null : Math.max(0, limit - quota.used);

  return (
    <p className={cn('text-xs', remaining === 0 ? 'text-destructive' : 'text-landing-muted')} aria-live="polite">
      {unlimited ? (
        'Không giới hạn lượt'
      ) : remaining === 0 ? (
        'Hết lượt thử bằng ảnh hôm nay'
      ) : (
        <>
          Còn <span className="font-mono text-landing-obsidian">{remaining}/{limit}</span> lượt hôm nay
        </>
      )}
    </p>
  );
}

export function TryOnHeader({
  mode,
  onModeChange,
  modeDisabled,
  quota,
  isBlocked,
}: {
  mode: TryOnMode;
  onModeChange: (mode: TryOnMode) => void;
  modeDisabled: boolean;
  quota?: UserQuota;
  isBlocked: boolean;
}) {
  return (
    <header className="mb-8 flex flex-col gap-6 border-b border-landing-line pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className={tryOnLabelClassName}>Phòng thử</p>
        <h1 className="mt-3 font-display text-landing-h2 text-landing-obsidian">Thử đồ AI</h1>
        <p className="mt-3 max-w-xl text-landing-body text-landing-muted">{MODE_COPY[mode]}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
        <TryOnSegmented
          ariaLabel="Cách thử đồ"
          value={mode}
          onChange={onModeChange}
          disabled={modeDisabled}
          className="w-full sm:w-auto"
          options={[
            { value: 'live', label: 'Trực tiếp', icon: <Camera className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" /> },
            { value: 'photo', label: 'Bằng ảnh', icon: <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" /> },
          ]}
        />
        {mode === 'photo' ? (
          <div className="flex items-center gap-4">
            <PhotoQuota quota={quota} />
            {isBlocked ? (
              <Link href="/subscription" className={tryOnButtonClassName('outline', 'sm')}>
                Nâng cấp gói
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function SubscriptionNotice({ isSubscriptionExpired }: { isSubscriptionExpired: boolean }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-l-2 border-landing-brass bg-landing-ivory px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-display text-xl leading-tight text-landing-obsidian">
          {isSubscriptionExpired ? 'Gói thành viên đã hết hạn' : 'Thử bằng ảnh cần gói Member hoặc VIP'}
        </p>
        <p className="mt-1 text-sm text-landing-muted">
          {isSubscriptionExpired
            ? 'Gia hạn gói để tiếp tục thử bằng ảnh.'
            : 'Gói miễn phí chưa có lượt thử bằng ảnh. Member và VIP có lượt mới mỗi ngày.'}
        </p>
      </div>
      <Link href="/subscription" className={tryOnButtonClassName('primary')}>
        {isSubscriptionExpired ? 'Gia hạn gói' : 'Xem các gói'}
      </Link>
    </div>
  );
}

'use client';

import { AdminPlatformLinkBuilder } from '@/features/admin/components/admin-platform-link-builder';

export function AdminPlatformsPanel() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.08] tracking-[-0.025em] text-landing-obsidian">Tạo link nền tảng</h1>
        <p className="mt-1 text-body-sm text-landing-muted">
          Gắn UTM vào link chia sẻ để GA4 ghi nhận đúng nền tảng khách đến từ.
        </p>
      </div>

      <AdminPlatformLinkBuilder />
    </div>
  );
}

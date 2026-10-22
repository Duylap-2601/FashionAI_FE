'use client';

import { AdminPlatformLinkBuilder } from '@/features/admin/components/admin-platform-link-builder';

export function AdminPlatformsPanel() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-h2 font-bold text-neutral-900">Tạo link nền tảng</h1>
        <p className="mt-1 text-body-sm text-neutral-500">
          Gắn UTM vào link chia sẻ để GA4 ghi nhận đúng nền tảng khách đến từ.
        </p>
      </div>

      <AdminPlatformLinkBuilder />
    </div>
  );
}

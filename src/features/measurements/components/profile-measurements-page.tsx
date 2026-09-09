'use client';

import { SizesTab } from '@/features/measurements/components/sizes-tab';
import { MeasurementsTab } from '@/features/measurements/components/measurements-tab';
import { ProfileTab } from '@/features/measurements/components/profile-tab';
import { Sidebar } from '@/features/measurements/components/profile-sidebar';
import type { Tab } from '@/features/measurements/types/profile-measurements-page';
import { useUserProfile } from '@/features/profile/hooks/use-profile';
import { useState } from 'react';

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Measurements() {
  const [activeTab, setActiveTab] = useState<Tab>('measurements');
  // Lấy name từ API /users/me (đúng UTF-8) thay vì session (bị mojibake)
  const { profile } = useUserProfile();

  const userName = profile?.name || '';
  const userEmail = profile?.email || '';
  const userTier = profile?.tier || 'free';

  return (
    <div className="min-h-screen bg-brand-cream pb-16 md:pb-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-heading-h2 font-bold text-brand-navy">Hồ sơ & Số đo</h1>
          <p className="text-body-sm text-neutral-500 mt-1">Quản lý thông tin cá nhân và số đo cơ thể của bạn</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userName={userName}
            userEmail={userEmail}
            userTier={userTier}
          />

          <main className="flex-1 min-w-0">
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'measurements' && <MeasurementsTab />}
            {activeTab === 'sizes' && <SizesTab />}
          </main>
        </div>
      </div>
    </div>
  );
}

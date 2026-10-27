'use client';

import { MeasurementsTab } from '@/features/measurements/components/measurements-tab';
import { SizesTab } from '@/features/measurements/components/sizes-tab';
import type { Tab } from '@/features/measurements/types/profile-measurements-page';
import { AccountShell } from '@/features/profile/components/account-shell';
import { accountFocusRing } from '@/features/profile/components/account-ui';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const TABS: { id: Tab; label: string }[] = [
  { id: 'measurements', label: 'Số đo cơ thể' },
  { id: 'sizes', label: 'Bảng cỡ tham khảo' },
];

export default function Measurements() {
  const [activeTab, setActiveTab] = useState<Tab>('measurements');

  return (
    <AccountShell
      title="Số đo & chi tiết"
      description="Số đo cơ thể dùng cho đơn may đo. Lưu một lần, mỗi đơn sẽ chụp lại số đo tại thời điểm đặt."
    >
      <div role="tablist" aria-label="Số đo" className="mb-8 flex gap-6 border-b border-landing-line">
        {TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`measurements-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`measurements-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative h-11 text-sm transition-colors',
                selected
                  ? 'font-medium text-landing-oxblood after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-landing-oxblood'
                  : 'text-landing-obsidian/70 hover:text-landing-oxblood',
                accountFocusRing,
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`measurements-panel-${activeTab}`} aria-labelledby={`measurements-tab-${activeTab}`}>
        {activeTab === 'measurements' ? <MeasurementsTab /> : <SizesTab />}
      </div>
    </AccountShell>
  );
}

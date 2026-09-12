import { AppLayout } from '@/components/layout/Layout';
import { AnnouncementBar } from '@/features/home/components/AnnouncementBar';
import { LandingPageClient } from '@/features/home/components/LandingPageClient';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <AppLayout
      variant="landing"
      footerVariant="marketing"
      beforeHeader={<AnnouncementBar />}
    >
      <LandingPageClient />
    </AppLayout>
  );
}

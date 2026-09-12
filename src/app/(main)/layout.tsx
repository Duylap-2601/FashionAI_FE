import { AppLayout } from '@/components/layout/Layout';
import React from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout variant="app" footerVariant="simple">{children}</AppLayout>;
}

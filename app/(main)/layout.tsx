import React from 'react';
import { AppLayout } from '@/components/navigation/Layout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

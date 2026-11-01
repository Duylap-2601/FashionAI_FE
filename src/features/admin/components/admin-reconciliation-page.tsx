'use client';

import { AdminGuard } from '@/features/auth/components/AdminGuard';
import { AdminReconciliationPanel } from '@/features/admin/components/admin-reconciliation-panel';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminReconciliationPage() {
  return (
    <AdminGuard>
      <div className="min-h-dvh bg-landing-paper landing-paper-texture p-4 md:p-8">
        <div className="mx-auto w-full max-w-[1440px]">
          {/* Back to Dashboard */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-muted transition-colors hover:text-landing-oxblood"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Admin Dashboard</span>
            </Link>
          </div>

          <AdminReconciliationPanel />
        </div>
      </div>
    </AdminGuard>
  );
}

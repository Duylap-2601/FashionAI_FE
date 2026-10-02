'use client';

import { AdminGuard } from '@/features/auth/components/AdminGuard';
import { AdminReconciliationPanel } from '@/features/admin/components/admin-reconciliation-panel';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminReconciliationPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-neutral-100 p-4 md:p-8 flex flex-col">
        <div className="max-w-[1500px] w-full mx-auto flex-1 flex flex-col min-h-0">
          {/* Back to Dashboard */}
          <div className="mb-4 flex items-center justify-between shrink-0">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-body-sm font-semibold text-neutral-600 hover:text-brand-navy transition-colors"
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

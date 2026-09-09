'use client';

import { AdminGuard } from '@/features/auth/components/AdminGuard';
import { AdminCollectionManager } from '@/features/collections/components/AdminCollectionManager';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminCollectionsPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Back to Dashboard */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-body-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Admin Dashboard</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="text-body-sm font-semibold text-[#5D1C34] hover:underline"
            >
              Xem Landing Page &rarr;
            </Link>
          </div>

          <AdminCollectionManager />
        </div>
      </div>
    </AdminGuard>
  );
}

'use client';

import React, { useState } from 'react';
import { PageHeader, PageContent } from '@/components/navigation/Layout';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { useNotifications, useMarkAllNotificationsAsRead } from '@/hooks/useNotifications';
import { useNotificationStore } from '@/store/notificationStore';
import { NotificationType } from '@/types/notification';
import {
  Bell, CheckCheck, Loader2, ChevronLeft, ChevronRight, Package, CreditCard, Tag, Info,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const TABS: { id: string; label: string; type?: NotificationType; icon: LucideIcon }[] = [
  { id: 'all', label: 'Tất cả', icon: Bell },
  { id: 'order', label: 'Đơn hàng', type: 'ORDER_STATUS', icon: Package },
  { id: 'payment', label: 'Thanh toán', type: 'PAYMENT', icon: CreditCard },
  { id: 'promotion', label: 'Khuyến mãi', type: 'PROMOTION', icon: Tag },
  { id: 'system', label: 'Hệ thống', type: 'SYSTEM', icon: Info },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 15;

  const currentTabConfig = TABS.find((t) => t.id === activeTab);
  const selectedType = currentTabConfig?.type;

  const { notifications, meta, isLoading, isError, refetch } = useNotifications({
    page,
    limit,
    type: selectedType,
  });

  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setPage(1);
  };

  const totalPages = meta?.totalPages || 1;

  return (
    <div className="min-h-screen bg-[#EFE9E1]">
      <PageHeader
        title="Thông báo"
        subtitle="Cập nhật thông tin đơn hàng, thanh toán và các ưu đãi mới nhất"
        cta={
          unreadCount > 0 ? (
            <button
              onClick={() => markAllAsRead()}
              disabled={isMarkingAll}
              className="px-4 py-2 bg-white hover:bg-neutral-50 text-[#5D1C34] border border-[#5D1C34]/30 rounded-xl text-body-sm font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Đánh dấu tất cả là đã đọc</span>
            </button>
          ) : null
        }
      />

      <PageContent>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Tabs Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-2.5 rounded-full text-body-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#5D1C34] text-white shadow-md'
                      : 'bg-white text-neutral-600 hover:bg-white/80 border border-neutral-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Card List */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-neutral-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#5D1C34]" />
                <span className="text-body-sm">Đang tải danh sách thông báo...</span>
              </div>
            ) : isError ? (
              <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-red-50 text-semantic-error flex items-center justify-center mb-3">
                  <Info className="w-6 h-6" />
                </div>
                <p className="font-semibold text-neutral-900 text-body-md">Không thể tải thông báo</p>
                <p className="text-neutral-500 text-body-sm mt-1 mb-4">Vui lòng thử lại sau.</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-brand-navy text-white rounded-xl text-body-sm font-medium"
                >
                  Tải lại
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                  <Bell className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-body-lg text-neutral-800">Không có thông báo nào</h3>
                <p className="text-body-sm text-neutral-500 max-w-sm mt-1">
                  Khi bạn có đơn hàng, thanh toán hoặc ưu đãi mới, các thông báo sẽ xuất hiện ở đây.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <NotificationItem key={item.id} notification={item} />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-body-xs text-neutral-500">
                Hiển thị trang {page} / {totalPages} (Tổng cộng {meta?.total || 0} thông báo)
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-body-sm font-medium px-3 text-neutral-800">
                  {page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </PageContent>
    </div>
  );
}
